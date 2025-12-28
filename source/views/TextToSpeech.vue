<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from "vue"
import { Volume2Icon, PlayIcon, RefreshCwIcon, CircleStopIcon } from "lucide-vue-next"
import { Textarea } from "@/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { toast } from "vue-sonner"
import type { KokoroTTS, GenerateOptions } from "kokoro-js"

type AIVoices = {
	voice: Exclude<GenerateOptions["voice"], undefined>
	name: string
	accent: string
}

// State
const text = ref("Welcome to iLoveMedia. Your privacy-first workspace.")
const engine = ref<"native" | "kokoro">("native")
const nativeVoices = ref<SpeechSynthesisVoice[]>([])
const kokoroVoices = ref<AIVoices[]>([])
const selectedNativeVoice = ref("")
const selectedKokoroVoice = ref<GenerateOptions["voice"]>("af_bella")

// Settings
const pitch = ref(1)
const rate = ref(1)
const volume = ref(1)

const isSpeaking = ref(false)
const isModelLoading = ref(false)
const loadProgress = ref(0)

// Refs for logic
const kokoroRef = ref<KokoroTTS | null>(null)
const currentAudioRef = ref<HTMLAudioElement | null>(null)
const currentAudioBlob = ref<Blob | null>(null)

watchEffect((onCleanup) => {
	if (currentAudioBlob.value) {
		const audioURL = URL.createObjectURL(currentAudioBlob.value)
		const audio = new Audio(audioURL)
		currentAudioRef.value = audio
		audio.play()
		audio.onended = () => {
			isSpeaking.value = false
			currentAudioRef.value = null
		}
		return onCleanup(() => {
			URL.revokeObjectURL(audioURL)
		})
	} else {
		currentAudioRef.value = null
	}
})

// Initialize Native Voices
const loadNativeVoices = () => {
	if (typeof window === "undefined" || !window.speechSynthesis) return

	const voices = window.speechSynthesis.getVoices()
	nativeVoices.value = voices

	if (voices.length > 0 && !selectedNativeVoice.value) {
		const defaultVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0]
		selectedNativeVoice.value = defaultVoice!.voiceURI
	}
}

onMounted(() => {
	loadNativeVoices()
	if (typeof window !== "undefined" && window.speechSynthesis) {
		window.speechSynthesis.onvoiceschanged = loadNativeVoices
	}
})

onUnmounted(() => {
	if (window.speechSynthesis) {
		window.speechSynthesis.onvoiceschanged = null
	}
	handleStop() // Cleanup audio on component destroy
})

const loadKokoro = async () => {
	if (kokoroRef.value) return kokoroRef.value

	isModelLoading.value = true
	loadProgress.value = 10

	try {
		const { KokoroTTS } = await import("kokoro-js")

		loadProgress.value = 40

		if (!KokoroTTS) {
			toast.error("Kokoro engine initialization failed. Falling back to system voices.")
			throw new Error("Kokoro engine initialization failed: module not found.")
		}

		const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
			dtype: "q4f16",
			// device: "wasm",
		})

		loadProgress.value = 100
		kokoroRef.value = tts
		kokoroVoices.value = (Object.keys(tts.voices) as GenerateOptions["voice"][])
			.filter((v) => !!v)
			.map((voice) => {
				const [accent = "", name = ""] = voice.split("_")
				const [origin, gender] = accent.split("")
				const ORIGINS = {
					a: "American",
					b: "British",
				}
				const GENDER = {
					f: "Female",
					m: "Male",
				}
				return {
					voice,
					name: name[0]?.toUpperCase() + name?.slice(1),
					accent: ORIGINS[origin] + " " + GENDER[gender],
				}
			})

		isModelLoading.value = false

		return tts
	} catch (err) {
		console.error("Failed to load Kokoro:", err)
		toast.error(`AI Engine Load Error. Switching back to system voices.`)
		engine.value = "native"
		isModelLoading.value = false
		return null
	}
}

const handleSpeak = async () => {
	if (!text.value.trim()) return

	if (engine.value === "native") {
		window.speechSynthesis.cancel()
		const utterance = new SpeechSynthesisUtterance(text.value)
		const voice = nativeVoices.value.find((v) => v.voiceURI === selectedNativeVoice.value)

		if (voice) utterance.voice = voice
		utterance.pitch = pitch.value
		utterance.rate = rate.value
		utterance.volume = volume.value

		utterance.onstart = () => (isSpeaking.value = true)
		utterance.onend = () => (isSpeaking.value = false)
		utterance.onerror = () => (isSpeaking.value = false)

		window.speechSynthesis.speak(utterance)
	} else {
		isSpeaking.value = true
		try {
			const tts = await loadKokoro()
			if (!tts) {
				isSpeaking.value = false
				return
			}

			const audio = await tts.generate(text.value, {
				voice: selectedKokoroVoice.value,
				speed: rate.value,
			})

			if (audio && typeof audio?.toBlob === "function") {
				currentAudioBlob.value = audio.toBlob()
			} else {
				isSpeaking.value = false
				console.error("Generated audio invalid:", audio)
				toast.error("Audio generation error. Check the console for details.")
			}
		} catch (err) {
			console.error("Kokoro generation error:", err)
			toast.error("Failed to generate speech with Kokoro AI.")
			isSpeaking.value = false
		}
	}
}

const handleStop = () => {
	if (engine.value === "native") {
		window.speechSynthesis.cancel()
	} else if (currentAudioRef.value) {
		currentAudioRef.value.pause()
		currentAudioBlob.value = null
	}
	isSpeaking.value = false
}

const toggleEngine = (type: "native" | "kokoro") => {
	engine.value = type
	if (type === "kokoro") loadKokoro()
}
</script>

<template>
	<div class="flex flex-col md:flex-row md:items-center flex-wrap justify-between gap-4 mb-8">
		<div class="flex items-center gap-3">
			<div class="p-2 bg-primary/10 rounded-lg text-primary">
				<Volume2Icon class="w-6 h-6" />
			</div>
			<div>
				<h2 class="text-2xl font-bold text-foreground">Text-to-Speech</h2>
				<p class="text-xs lg:text-sm text-muted-foreground">
					Local processing via WebSpeech or Kokoro AI
				</p>
			</div>
		</div>

		<div class="flex bg-muted p-1 rounded-xl">
			<button
				@click="toggleEngine('native')"
				:class="[
					'px-4 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all',
					engine === 'native'
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground',
				]"
			>
				System Native
			</button>
			<button
				@click="toggleEngine('kokoro')"
				:class="[
					'px-4 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all flex items-center gap-2',
					engine === 'kokoro'
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground',
				]"
			>
				Kokoro AI
				<span
					class="text-xs lg:text-sm bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase font-bold"
					>HQ</span
				>
			</button>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
		<!-- Left Column: Input and Controls -->
		<div class="lg:col-span-7 space-y-6">
			<div class="relative">
				<label
					class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
				>
					Input Text
				</label>
				<Textarea
					v-model="text"
					placeholder="Type something to hear it..."
					class="h-64 p-4"
				></Textarea>
				<div class="absolute bottom-4 right-4 text-xs text-muted-foreground/60">
					{{ text.length }} characters
				</div>
			</div>

			<div class="flex gap-4">
				<button
					@click="isSpeaking ? handleStop() : handleSpeak()"
					:disabled="isModelLoading"
					:class="[
						'flex-1 flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
						isSpeaking
							? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
							: 'bg-primary text-primary-foreground hover:bg-primary/90',
					]"
				>
					<RefreshCwIcon v-if="isModelLoading" class="w-5 h-5 animate-spin" />
					<CircleStopIcon v-else-if="isSpeaking" class="w-5 h-5" />
					<PlayIcon v-else class="w-5 h-5" />

					{{
						isModelLoading
							? "Loading AI Model..."
							: isSpeaking
								? "Stop Playing"
								: "Start Reading"
					}}
				</button>
			</div>

			<!-- Progress Bar -->
			<div v-if="isModelLoading" class="space-y-2">
				<div class="flex justify-between text-xs font-bold text-primary uppercase">
					<span>Downloading Kokoro Engine</span>
					<span>{{ loadProgress }}%</span>
				</div>
				<div class="w-full bg-secondary h-2 rounded-full overflow-hidden">
					<div
						class="h-full bg-primary transition-all duration-500"
						:style="{ width: `${loadProgress}%` }"
					/>
				</div>
				<p class="text-xs lg:text-sm text-muted-foreground text-center italic">
					Initial download is ~80MB. This will be cached for next time.
				</p>
			</div>
		</div>

		<!-- Right Column: Settings -->
		<div class="lg:col-span-5 space-y-8">
			<div class="p-2 space-y-6">
				<h3
					class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
				>
					Parameters
				</h3>

				<div class="space-y-5">
					<div>
						<div class="flex justify-between mb-2">
							<label class="text-xs lg:text-sm font-semibold text-foreground"
								>Rate (Speed)</label
							>
							<span class="text-xs font-mono text-primary">{{ rate }}x</span>
						</div>
						<input
							type="range"
							min="0.5"
							max="2"
							step="0.1"
							v-model.number="rate"
							class="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
						/>
					</div>

					<div>
						<div class="flex justify-between mb-2">
							<label class="text-xs lg:text-sm font-semibold text-foreground"
								>Pitch</label
							>
							<span class="text-xs font-mono text-primary">{{ pitch }}</span>
						</div>
						<input
							type="range"
							min="0.5"
							max="2"
							step="0.1"
							v-model.number="pitch"
							:disabled="engine === 'kokoro'"
							class="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-20"
						/>
						<p
							v-if="engine === 'kokoro'"
							class="text-xs lg:text-sm text-muted-foreground mt-1"
						>
							Pitch is voice-specific in Kokoro.
						</p>
					</div>

					<div>
						<div class="flex justify-between mb-2">
							<label class="text-xs lg:text-sm font-semibold text-foreground"
								>Volume</label
							>
							<span class="text-xs font-mono text-primary"
								>{{ Math.round(volume * 100) }}%</span
							>
						</div>
						<input
							type="range"
							min="0"
							max="1"
							step="0.1"
							v-model.number="volume"
							class="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
						/>
					</div>
				</div>
			</div>

			<!-- Voice Selection -->
			<div>
				<label
					class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3"
				>
					{{ engine === "native" ? "System Voices" : "AI Voice Profiles" }}
				</label>

				<div class="max-h-75 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
					<template v-if="engine === 'native'">
						<Select
							v-if="nativeVoices.length > 0"
							v-model="selectedNativeVoice"
							:disabled="isModelLoading || isSpeaking"
						>
							<SelectTrigger>
								<SelectValue
									:placeholder="
										isModelLoading ? 'Loading voices...' : 'Select a voice'
									"
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem disabled value="-">Select a voice</SelectItem>
								<SelectItem
									v-for="(v, i) in nativeVoices"
									:key="i"
									:value="v.voiceURI"
								>
									{{ v.name }} ({{ v.lang }})
									{{ v.localService ? `- offline` : "" }}
								</SelectItem>
							</SelectContent>
						</Select>
						<p
							v-else
							class="text-xs lg:text-sm text-muted-foreground italic p-4 text-center"
						>
							No system voices detected.
						</p>
					</template>

					<template v-else>
						<Select
							v-model="selectedKokoroVoice"
							:disabled="isModelLoading || isSpeaking"
						>
							<SelectTrigger>
								<SelectValue
									:placeholder="
										isModelLoading ? 'Loading voices...' : 'Select a voice'
									"
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem disabled value="-">Select a voice</SelectItem>
								<SelectItem
									v-for="(v, i) in kokoroVoices"
									:key="i"
									:value="v.voice"
								>
									{{ v.name }} ({{ v.accent }})
								</SelectItem>
							</SelectContent>
						</Select>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>
