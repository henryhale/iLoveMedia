<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { MicIcon, CircleStopIcon, DownloadIcon, RefreshCwIcon } from "lucide-vue-next"
import { toast } from "vue-sonner"

const isRecording = ref(false)
const audioURL = ref<string | null>(null)
const recordingTime = ref(0)

const mediaRecorderRef = ref<MediaRecorder | null>(null)
const chunksRef = ref<Blob[]>([])
let timerInterval: number | null = null

// Helper: Format Time
const formatTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins}:${secs.toString().padStart(2, "0")}`
}

// Methods
const startRecording = async () => {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
		const mediaRecorder = new MediaRecorder(stream)
		mediaRecorderRef.value = mediaRecorder
		chunksRef.value = []

		mediaRecorder.ondataavailable = (e) => {
			if (e.data.size > 0) {
				chunksRef.value.push(e.data)
			}
		}

		mediaRecorder.onstop = () => {
			const blob = new Blob(chunksRef.value, { type: "audio/webm" })
			const url = URL.createObjectURL(blob)
			audioURL.value = url
			stream.getTracks().forEach((track) => track.stop())
		}

		mediaRecorder.start()
		isRecording.value = true
		recordingTime.value = 0
		audioURL.value = null

		timerInterval = window.setInterval(() => {
			recordingTime.value++
		}, 1000)
	} catch (err) {
		console.error("Error accessing microphone:", err)
		toast.error("Could not access microphone. Please check permissions.")
	}
}

const stopRecording = () => {
	if (mediaRecorderRef.value && isRecording.value) {
		mediaRecorderRef.value.stop()
		isRecording.value = false
		if (timerInterval) {
			clearInterval(timerInterval)
			timerInterval = null
		}
	}
}

const resetRecorder = () => {
	audioURL.value = null
	recordingTime.value = 0
}

// Lifecycle (Replacing useEffect cleanup)
onUnmounted(() => {
	if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
	<h2 class="text-xl font-semibold mb-6 flex items-center justify-center gap-2 text-foreground">
		<MicIcon class="w-5 h-5 text-primary" />
		Audio Recorder
	</h2>

	<div class="flex flex-col items-center space-y-8">
		<!-- Visualizer / Timer Circle -->
		<div
			class="relative w-48 h-48 rounded-full flex items-center justify-center border-4 transition-all duration-300"
			:class="
				isRecording
					? 'border-primary scale-110 shadow-lg shadow-primary/20'
					: 'border-border'
			"
		>
			<div class="text-3xl font-mono font-bold text-foreground">
				{{ formatTime(recordingTime) }}
			</div>
			<div
				v-if="isRecording"
				class="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-25"
			></div>
		</div>

		<div class="flex gap-4">
			<button
				v-if="!isRecording"
				@click="startRecording"
				class="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-md"
			>
				<MicIcon class="w-5 h-5" />
				Start Recording
			</button>

			<button
				v-else
				@click="stopRecording"
				class="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-md"
			>
				<CircleStopIcon class="w-5 h-5" />
				Stop Recording
			</button>
		</div>

		<!-- Recording Result -->
		<div
			v-if="audioURL && !isRecording"
			class="w-full pt-8 animate-in fade-in slide-in-from-top-4"
		>
			<div
				class="bg-card text-card-foreground p-6 rounded-xl border border-border space-y-4 shadow-sm"
			>
				<p class="text-sm font-medium text-muted-foreground">Recording Finished</p>

				<audio controls :src="audioURL" class="w-full"></audio>

				<div class="flex gap-2">
					<a
						:href="audioURL"
						download="recording.webm"
						class="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
					>
						<DownloadIcon class="w-4 h-4" />
						Download
					</a>
					<button
						@click="resetRecorder"
						class="px-4 py-2 border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
					>
						<RefreshCwIcon class="w-4 h-4 text-muted-foreground" />
					</button>
				</div>
			</div>
		</div>
	</div>

	<p class="mt-8 text-xs text-muted-foreground text-center">
		Recording is processed locally in your browser and never uploaded to any server.
	</p>
</template>
