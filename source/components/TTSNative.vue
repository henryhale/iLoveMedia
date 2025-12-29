<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { PlayIcon, CircleStopIcon } from "lucide-vue-next"
import { Textarea } from "@/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useSpeechSynthesis } from "@vueuse/core"
import { Button } from "./ui/button"
import { toast } from "vue-sonner"

const text = ref("Welcome to iLoveMedia. Your privacy-first workspace.")
const pitch = ref(1)
const rate = ref(1)
const volume = ref(1)
const tts = useSpeechSynthesis(text, { rate, pitch, volume })
const nativeVoices = ref<SpeechSynthesisVoice[]>([])
const selectedNativeVoice = ref("")

// Initialize Native Voices
const loadNativeVoices = () => {
	if (!tts.isSupported) return

	const voices = window.speechSynthesis.getVoices()
	nativeVoices.value = voices

	if (voices.length > 0 && !selectedNativeVoice.value) {
		const defaultVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0]
		selectedNativeVoice.value = defaultVoice!.voiceURI
	}

	window.speechSynthesis.onvoiceschanged = loadNativeVoices
}

onMounted(() => {
	loadNativeVoices()
})

onUnmounted(() => {
	if (tts.isSupported) {
		window.speechSynthesis.onvoiceschanged = null
	}
	tts.stop()
})

const toggle = () => {
	if (tts.isPlaying.value) {
		tts.stop()
	} else {
		if (!tts.isSupported.value) {
			toast.error("Oh no! Your browser does not support speech synthesis.")
		} else if (nativeVoices.value.length > 0) {
			if (text.value) tts.speak()
		} else {
			toast.error("Sorry, no system voices detected.")
		}
	}
}
</script>

<template>
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
				class="min-h-64 max-h-[50vh] p-4 field-sizing-content"
			></Textarea>
			<div class="absolute bottom-4 right-4 text-xs text-muted-foreground/60">
				{{ text.length }} characters
			</div>
		</div>

		<div class="flex gap-4">
			<Button
				@click="toggle"
				:variant="!!tts.isPlaying.value ? 'destructive' : 'default'"
				class="w-full"
				size="lg"
			>
				<CircleStopIcon v-if="tts.isPlaying.value" class="w-5 h-5" />
				<PlayIcon v-else class="w-5 h-5" />
				{{ !!tts.isPlaying.value ? "Stop Playing" : "Start Reading" }}
			</Button>
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
						class="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-20"
					/>
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
				System Voices
			</label>

			<div class="max-h-75 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
				<Select
					v-if="nativeVoices.length > 0"
					v-model="selectedNativeVoice"
					:disabled="!!tts.isPlaying.value"
				>
					<SelectTrigger>
						<SelectValue placeholder="Select a voice" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem disabled value="-">Select a voice</SelectItem>
						<SelectItem v-for="(v, i) in nativeVoices" :key="i" :value="v.voiceURI">
							{{ v.name }} ({{ v.lang }})
							{{ v.localService ? `- offline` : "" }}
						</SelectItem>
					</SelectContent>
				</Select>
				<p v-else class="text-sm text-muted-foreground italic p-4 text-center">
					No system voices detected.
				</p>
			</div>
		</div>
	</div>
</template>
