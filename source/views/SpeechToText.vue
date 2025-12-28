<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue"
import {
	WavesIcon,
	MicIcon,
	CircleStopIcon,
	CopyIcon,
	CheckIcon,
	RefreshCwIcon,
} from "lucide-vue-next"
import { toast } from "vue-sonner"

// Dynamically imported for high-accuracy local transcription
let env: any = null

const LANGUAGES = [
	{ code: "en", name: "English" },
	{ code: "es", name: "Español" },
	{ code: "fr", name: "Français" },
	{ code: "de", name: "Deutsch" },
	{ code: "it", name: "Italiano" },
	{ code: "pt", name: "Português" },
	{ code: "zh", name: "中文" },
	{ code: "ja", name: "日本語" },
]

// State
const engine = ref<"native" | "whisper">("native")
const isListening = ref(false)
const transcription = ref("")
const interimResult = ref("")
const selectedLang = ref("en")
const copied = ref(false)

// Whisper Specific State
const isModelLoading = ref(false)
const loadProgress = ref(0)
const audioBlob = ref<Blob | null>(null)
const isTranscribing = ref(false)

// Non-reactive Refs (equivalent to useRef)
const recognitionRef = ref<any>(null)
const mediaRecorderRef = ref<MediaRecorder | null>(null)
const audioChunksRef = ref<Blob[]>([])
const transcriberRef = ref<any>(null)

// Initialize Native Speech Recognition
const initNativeSpeech = () => {
	if (recognitionRef.value) {
		recognitionRef.value.stop()
	}

	const SpeechRecognition =
		(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

	if (SpeechRecognition && engine.value === "native") {
		const recognition = new SpeechRecognition()
		recognition.continuous = true
		recognition.interimResults = true
		recognition.lang = selectedLang.value === "en" ? "en-US" : selectedLang.value

		recognition.onresult = (event: any) => {
			let final = ""
			let interim = ""
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript
				if (event.results[i].isFinal) {
					final += transcript + " "
				} else {
					interim += transcript
				}
			}
			transcription.value += final
			interimResult.value = interim
		}

		recognition.onerror = (event: { error: unknown }) => {
			console.error("Speech Recognition Error:", event.error)
			toast.error("An error occurred during speech recognition.")
			isListening.value = false
		}

		recognition.onend = () => {
			if (isListening.value) recognition.start()
		}

		recognitionRef.value = recognition
	}
}

// Watch for engine/lang changes to re-init native recognition
watch([selectedLang, engine], () => {
	initNativeSpeech()
})

onMounted(() => {
	initNativeSpeech()
})

onUnmounted(() => {
	if (recognitionRef.value) recognitionRef.value.stop()
})

// Load Whisper Model via Transformers.js
const loadWhisper = async () => {
	if (transcriberRef.value) return transcriberRef.value

	isModelLoading.value = true
	loadProgress.value = 0

	try {
		const { pipeline: getPipeline, env: transformersEnv } = await import("@xenova/transformers")
		env = transformersEnv

		env.allowLocalModels = false
		env.useBrowserCache = true

		const transcriber = await getPipeline(
			"automatic-speech-recognition",
			"Xenova/whisper-tiny.en",
			{
				progress_callback: (data: { status: string; progress: number }) => {
					if (data.status === "progress") {
						loadProgress.value = Math.round(data.progress)
					}
				},
			},
		)

		transcriberRef.value = transcriber
		loadProgress.value = 100
		return transcriber
	} catch (err) {
		console.error("Whisper Load Error:", err)
		toast.error("Failed to load Whisper AI.")
		engine.value = "native"
		return null
	} finally {
		isModelLoading.value = false
	}
}

const startNativeListening = () => {
	interimResult.value = ""
	recognitionRef.value?.start()
	isListening.value = true
}

const stopNativeListening = () => {
	recognitionRef.value?.stop()
	isListening.value = false
}

const startWhisperRecording = async () => {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
		const mediaRecorder = new MediaRecorder(stream)
		mediaRecorderRef.value = mediaRecorder
		audioChunksRef.value = []

		mediaRecorder.ondataavailable = (e) => {
			if (e.data.size > 0) audioChunksRef.value.push(e.data)
		}

		mediaRecorder.onstop = () => {
			const blob = new Blob(audioChunksRef.value, { type: "audio/wav" })
			audioBlob.value = blob
			stream.getTracks().forEach((track) => track.stop())
		}

		mediaRecorder.start()
		isListening.value = true
		audioBlob.value = null
	} catch (err) {
		console.error("Mic Access Error:", err)
		toast.error("Microphone access denied.")
	}
}

const stopWhisperRecording = () => {
	if (mediaRecorderRef.value && isListening.value) {
		mediaRecorderRef.value.stop()
		isListening.value = false
	}
}

const runWhisperTranscription = async () => {
	if (!audioBlob.value) return

	isTranscribing.value = true
	interimResult.value = "Analyzing audio..."

	try {
		const transcriber = await loadWhisper()
		if (!transcriber) return

		const audioContext = new AudioContext({ sampleRate: 16000 })
		const arrayBuffer = await audioBlob.value.arrayBuffer()
		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
		const audioData = audioBuffer.getChannelData(0)

		const output = await transcriber(audioData, {
			chunk_length_s: 30,
			stride_length_s: 5,
			language: selectedLang.value,
			task: "transcribe",
		})

		transcription.value =
			(transcription.value ? transcription.value + " " : "") + output.text.trim()
		interimResult.value = ""
		audioBlob.value = null
	} catch (err) {
		console.error("Transcription Error:", err)
		toast.error("Failed to generate transcription.")
		interimResult.value = "Error transcribing audio."
	} finally {
		isTranscribing.value = false
	}
}

const handleToggleListening = () => {
	if (engine.value === "native") {
		if (isListening.value) {
			stopNativeListening()
		} else {
			startNativeListening()
		}
	} else {
		if (isListening.value) {
			stopWhisperRecording()
		} else {
			startWhisperRecording()
		}
	}
}

const handleCopy = () => {
	navigator.clipboard.writeText(transcription.value)
	copied.value = true
	setTimeout(() => (copied.value = false), 2000)
}

const clear = () => {
	transcription.value = ""
	interimResult.value = ""
	audioBlob.value = null
}
</script>

<template>
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
		<div class="flex items-center gap-3">
			<div class="p-2 bg-primary/10 rounded-lg text-primary">
				<WavesIcon class="w-6 h-6" />
			</div>
			<div>
				<h2 class="text-2xl font-bold text-foreground">Speech-to-Text</h2>
				<p class="text-sm text-muted-foreground">
					Live streaming or high-accuracy Whisper AI
				</p>
			</div>
		</div>

		<div class="flex items-center gap-4">
			<div class="flex bg-muted p-1 rounded-xl border border-border">
				<button
					@click="
						() => {
							engine = 'native'
							clear()
						}
					"
					:class="[
						'px-4 py-2 text-xs font-bold rounded-lg transition-all',
						engine === 'native'
							? 'bg-background text-primary shadow-sm'
							: 'text-muted-foreground hover:text-foreground',
					]"
				>
					Native Live
				</button>
				<button
					@click="
						() => {
							engine = 'whisper'
							clear()
							loadWhisper()
						}
					"
					:class="[
						'px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2',
						engine === 'whisper'
							? 'bg-background text-primary shadow-sm'
							: 'text-muted-foreground hover:text-foreground',
					]"
				>
					Whisper AI
					<span
						class="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-bold"
						>WASM</span
					>
				</button>
			</div>

			<select
				v-model="selectedLang"
				class="bg-background border border-input px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none text-foreground"
			>
				<option v-for="l in LANGUAGES" :key="l.code" :value="l.code">
					{{ l.name }}
				</option>
			</select>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
		<!-- Main Interaction Column -->
		<div
			class="lg:col-span-4 flex flex-col items-center gap-8 border-r border-border pr-0 lg:pr-8"
		>
			<div class="relative flex flex-col items-center">
				<button
					@click="handleToggleListening"
					:disabled="isTranscribing || isModelLoading"
					:class="[
						'relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl disabled:opacity-50',
						isListening
							? 'bg-destructive scale-110 shadow-destructive/40 ring-4 ring-destructive/20'
							: 'bg-primary hover:opacity-90 shadow-primary/30',
					]"
				>
					<CircleStopIcon
						v-if="isListening"
						class="w-12 h-12 text-destructive-foreground animate-pulse"
					/>
					<MicIcon v-else class="w-12 h-12 text-primary-foreground" />
				</button>

				<div
					v-if="isListening"
					class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center gap-1 pointer-events-none"
				>
					<div
						v-for="i in 5"
						:key="i"
						class="w-1.5 h-8 bg-primary/30 rounded-full animate-bounce"
						:style="{ animationDelay: `${(i - 1) * 0.1}s` }"
					/>
				</div>

				<div class="mt-6 text-center">
					<p
						:class="[
							'text-lg font-bold',
							isListening ? 'text-destructive' : 'text-foreground',
						]"
					>
						{{
							isListening
								? engine === "native"
									? "Listening..."
									: "Recording..."
								: "Start Mic"
						}}
					</p>
					<p
						class="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold"
					>
						{{
							engine === "native"
								? "Streaming Transcription"
								: "Segment Transcription"
						}}
					</p>
				</div>
			</div>

			<!-- Action for Whisper Recording -->
			<div
				v-if="engine === 'whisper' && audioBlob && !isListening"
				class="w-full animate-in zoom-in duration-300"
			>
				<button
					@click="runWhisperTranscription"
					:disabled="isTranscribing"
					class="w-full bg-primary text-primary-foreground hover:opacity-90 font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
				>
					<RefreshCwIcon v-if="isTranscribing" class="w-5 h-5 animate-spin" />
					<WavesIcon v-else class="w-5 h-5" />
					{{ isTranscribing ? "Transcribing..." : "Transcribe Recording" }}
				</button>
				<p class="text-[10px] text-muted-foreground text-center mt-2">
					Audio ready to process locally
				</p>
			</div>

			<!-- Loading State -->
			<div v-if="isModelLoading" class="w-full space-y-2">
				<div class="flex justify-between text-[10px] font-bold text-primary uppercase">
					<span>Loading Tiny-Whisper</span>
					<span>{{ loadProgress }}%</span>
				</div>
				<div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
					<div
						class="h-full bg-primary transition-all duration-300"
						:style="{ width: `${loadProgress}%` }"
					/>
				</div>
			</div>
		</div>

		<!-- Transcription Display Column -->
		<div class="lg:col-span-8 space-y-4">
			<div class="flex justify-between items-center px-1">
				<label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
					Result Console
				</label>
				<div class="flex gap-4">
					<button
						v-if="transcription"
						@click="handleCopy"
						class="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
					>
						<CheckIcon v-if="copied" class="w-3 h-3" />
						<CopyIcon v-else class="w-3 h-3" />
						{{ copied ? "Copied" : "Copy" }}
					</button>
					<button
						@click="clear"
						class="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-destructive"
					>
						<RefreshCwIcon class="w-3 h-3" /> Reset
					</button>
				</div>
			</div>

			<div
				:class="[
					'w-full min-h-87.5 p-8 bg-muted/30 border border-border rounded-3xl transition-all shadow-inner relative overflow-hidden',
					isListening || isTranscribing ? 'ring-2 ring-ring/20' : '',
				]"
			>
				<div
					v-if="transcription || interimResult"
					class="text-xl leading-relaxed text-foreground"
				>
					<p>{{ transcription }}</p>
					<p
						v-if="interimResult"
						class="text-primary font-medium transition-all animate-pulse mt-2"
					>
						{{ interimResult }}
					</p>
				</div>

				<div
					v-else
					class="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4"
				>
					<WavesIcon class="w-12 h-12" />
					<p class="font-medium italic text-center px-8">
						{{
							engine === "native"
								? "Speak to see live text output..."
								: "Record a clip, then use Whisper for high accuracy..."
						}}
					</p>
				</div>
			</div>

			<div class="flex items-start gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
				<div class="p-2 bg-background rounded-lg shadow-sm border border-border">
					<CheckIcon class="w-4 h-4 text-primary" />
				</div>
				<div
					class="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-wide"
				>
					<span class="font-bold text-foreground">Engine Details:</span><br />
					<b class="text-foreground">{{
						engine === "native" ? "Web Speech API" : "Whisper-Tiny (WASM)"
					}}</b
					>.
					{{
						engine === "native"
							? " Fastest response, requires browser support, cloud-dependent for some OS."
							: " Highest accuracy, 100% offline private processing, requires ~40MB model download."
					}}
				</div>
			</div>
		</div>
	</div>
</template>
