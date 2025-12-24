<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue"
import { Volume2Icon, PlayIcon, DownloadIcon, RefreshCwIcon, CircleStopIcon } from "lucide-vue-next"

// Dynamic import for Kokoro
let KokoroModule: any = null

// State
const text = ref("Welcome to i💙Media. Your privacy-first workspace.")
const engine = ref<"native" | "kokoro">("native")
const nativeVoices = ref<SpeechSynthesisVoice[]>([])
const selectedVoiceURI = ref("")

// Settings
const pitch = ref(1)
const rate = ref(1)
const volume = ref(1)

const isSpeaking = ref(false)
const isModelLoading = ref(false)
const loadProgress = ref(0)

// Refs for logic
const kokoroRef = ref<any>(null)
const currentAudioRef = ref<HTMLAudioElement | null>(null)

// Initialize Native Voices
const loadVoices = () => {
	if (typeof window === "undefined" || !window.speechSynthesis) return

	const voices = window.speechSynthesis.getVoices()
	nativeVoices.value = voices

	if (voices.length > 0 && !selectedVoiceURI.value) {
		const defaultVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0]
		selectedVoiceURI.value = defaultVoice!.voiceURI
	}
}

onMounted(() => {
	loadVoices()
	if (typeof window !== "undefined" && window.speechSynthesis) {
		window.speechSynthesis.onvoiceschanged = loadVoices
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
		if (!KokoroModule) {
			KokoroModule = await import("kokoro-js")
		}
		loadProgress.value = 40

		let KokoroClass = null
		if (KokoroModule.Kokoro) {
			KokoroClass = KokoroModule.Kokoro
		} else if (KokoroModule.default?.Kokoro) {
			KokoroClass = KokoroModule.default.Kokoro
		} else if (
			typeof KokoroModule.default === "function" &&
			KokoroModule.default.fromPretrained
		) {
			KokoroClass = KokoroModule.default
		} else if (typeof KokoroModule.fromPretrained === "function") {
			KokoroClass = KokoroModule
		}

		if (!KokoroClass || typeof KokoroClass.fromPretrained !== "function") {
			console.error("Module structure:", KokoroModule)
			throw new Error("Kokoro engine initialization failed: class not found.")
		}

		const k = await KokoroClass.fromPretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
			dtype: "q8",
			device: "wasm",
		})

		loadProgress.value = 100
		kokoroRef.value = k
		return k
	} catch (err) {
		console.error("Failed to load Kokoro:", err)
		const msg = err instanceof Error ? err.message : String(err)
		alert(`AI Engine Load Error: ${msg}. Switching back to system voices.`)
		engine.value = "native"
		return null
	} finally {
		isModelLoading.value = false
	}
}

const handleSpeak = async () => {
	if (!text.value.trim()) return

	if (engine.value === "native") {
		window.speechSynthesis.cancel()
		const utterance = new SpeechSynthesisUtterance(text.value)
		const voice = nativeVoices.value.find((v) => v.voiceURI === selectedVoiceURI.value)

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
			const k = await loadKokoro()
			if (!k) {
				isSpeaking.value = false
				return
			}

			const audio = await k.generate(text.value, {
				voice: "af_bella",
				speed: rate.value,
			})

			if (audio && typeof audio.play === "function") {
				currentAudioRef.value = audio
				audio.play()
				audio.onended = () => {
					isSpeaking.value = false
					currentAudioRef.value = null
				}
			} else {
				isSpeaking.value = false
				console.error("Generated audio invalid:", audio)
				alert("Audio generation error. Check the console for details.")
			}
		} catch (err) {
			console.error("Kokoro generation error:", err)
			isSpeaking.value = false
		}
	}
}

const handleStop = () => {
	if (engine.value === "native") {
		window.speechSynthesis.cancel()
	} else if (currentAudioRef.value) {
		currentAudioRef.value.pause()
		currentAudioRef.value = null
	}
	isSpeaking.value = false
}

const toggleEngine = (type: "native" | "kokoro") => {
	engine.value = type
	if (type === "kokoro") loadKokoro()
}
</script>

<template>
	<div class="max-w-5xl mx-auto space-y-6">
		<div
			class="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
			<!-- Header Section -->
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
						<Volume2Icon class="w-6 h-6" />
					</div>
					<div>
						<h2 class="text-2xl font-bold text-slate-900 dark:text-white">
							Text-to-Speech
						</h2>
						<p class="text-sm text-slate-500">
							Local processing via WebSpeech or Kokoro AI
						</p>
					</div>
				</div>

				<div class="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
					<button @click="toggleEngine('native')" :class="[
						'px-4 py-2 text-sm font-bold rounded-lg transition-all',
						engine === 'native'
							? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
							: 'text-slate-500',
					]">
						System Native
					</button>
					<button @click="toggleEngine('kokoro')" :class="[
						'px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2',
						engine === 'kokoro'
							? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
							: 'text-slate-500',
					]">
						Kokoro AI
						<span
							class="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-600 px-1.5 py-0.5 rounded uppercase font-bold">HQ</span>
					</button>
				</div>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
				<!-- Left Column: Input and Controls -->
				<div class="lg:col-span-7 space-y-6">
					<div class="relative">
						<label
							class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Input
							Text</label>
						<textarea v-model="text" placeholder="Type something to hear it..."
							class="w-full h-64 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-lg leading-relaxed shadow-inner"></textarea>
						<div class="absolute bottom-4 right-4 text-xs text-slate-400">
							{{ text.length }} characters
						</div>
					</div>

					<div class="flex gap-4">
						<button @click="isSpeaking ? handleStop() : handleSpeak()" :disabled="isModelLoading" :class="[
							'flex-1 flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50',
							isSpeaking
								? 'bg-red-500 text-white shadow-red-500/20'
								: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
						]">
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
						<div class="flex justify-between text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
							<span>Downloading Kokoro Engine</span>
							<span>{{ loadProgress }}%</span>
						</div>
						<div class="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
							<div class="h-full bg-blue-600 transition-all duration-500"
								:style="{ width: `${loadProgress}%` }" />
						</div>
						<p class="text-[10px] text-slate-400 text-center italic">
							Initial download is ~80MB. This will be cached for next time.
						</p>
					</div>
				</div>

				<!-- Right Column: Settings -->
				<div class="lg:col-span-5 space-y-8">
					<div
						class="space-y-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
						<h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
							<RefreshCwIcon class="w-3 h-3" /> Parameters
						</h3>

						<div class="space-y-5">
							<!-- Rate -->
							<div>
								<div class="flex justify-between mb-2">
									<label class="text-sm font-bold text-slate-700 dark:text-slate-300">Rate
										(Speed)</label>
									<span class="text-xs font-mono text-blue-600">{{ rate }}x</span>
								</div>
								<input type="range" min="0.5" max="2" step="0.1" v-model.number="rate"
									class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
							</div>

							<!-- Pitch -->
							<div>
								<div class="flex justify-between mb-2">
									<label class="text-sm font-bold text-slate-700 dark:text-slate-300">Pitch</label>
									<span class="text-xs font-mono text-blue-600">{{
										pitch
									}}</span>
								</div>
								<input type="range" min="0.5" max="2" step="0.1" v-model.number="pitch"
									:disabled="engine === 'kokoro'"
									class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-30" />
								<p v-if="engine === 'kokoro'" class="text-[10px] text-slate-400 mt-1">
									Pitch is voice-specific in Kokoro.
								</p>
							</div>

							<!-- Volume -->
							<div>
								<div class="flex justify-between mb-2">
									<label class="text-sm font-bold text-slate-700 dark:text-slate-300">Volume</label>
									<span class="text-xs font-mono text-blue-600">{{ Math.round(volume * 100)
									}}%</span>
								</div>
								<input type="range" min="0" max="1" step="0.1" v-model.number="volume"
									class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
							</div>
						</div>
					</div>

					<!-- Voice Selection -->
					<div>
						<label
							class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
							{{ engine === "native" ? "System Voices" : "AI Voice Profiles" }}
						</label>

						<div class="max-h-75 overflow-y-auto space-y-2 pr-2">
							<template v-if="engine === 'native'">
								<button v-for="v in nativeVoices" :key="v.voiceURI"
									@click="selectedVoiceURI = v.voiceURI" :class="[
										'w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center justify-between',
										selectedVoiceURI === v.voiceURI
											? 'border-blue-500 bg-white dark:bg-slate-800 shadow-sm'
											: 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
									]">
									<div class="flex flex-col">
										<span class="font-bold text-slate-900 dark:text-white truncate max-w-45">{{
											v.name }}</span>
										<span class="text-[10px] text-slate-500 uppercase">{{
											v.lang
										}}</span>
									</div>
									<span v-if="v.localService"
										class="text-[9px] bg-emerald-100 text-emerald-700 px-1 rounded font-bold">Offline</span>
								</button>
								<p v-if="nativeVoices.length === 0"
									class="text-sm text-slate-500 italic p-4 text-center">
									No system voices detected.
								</p>
							</template>

							<template v-else>
								<button v-for="v in [
									'af_bella',
									'af_nicole',
									'af_sky',
									'bf_emma',
									'bf_isabella',
								]" :key="v" :disabled="isModelLoading"
									class="w-full text-left p-3 rounded-xl border border-blue-500 bg-white dark:bg-slate-800 shadow-sm transition-all flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed">
									<span class="font-bold text-slate-900 dark:text-white uppercase">{{
										v.replace("af_",
											"").replace("bf_", "") }}</span>
									<span class="text-[9px] bg-blue-100 text-blue-700 px-1 rounded font-bold">AI
										Optimized</span>
								</button>
							</template>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
