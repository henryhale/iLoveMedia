<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { MicIcon, StopIcon, DownloadIcon, RefreshIcon } from "../components/Icon.vue"

// State (Replacing useState and useRef)
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
		alert("Could not access microphone. Please check permissions.")
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
	<div class="max-w-3xl mx-auto space-y-6">
		<div
			class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors text-center"
		>
			<h2
				class="text-xl font-semibold mb-6 flex items-center justify-center gap-2 text-gray-900 dark:text-white"
			>
				<MicIcon class="w-5 h-5 text-red-500" />
				Audio Recorder
			</h2>

			<div class="flex flex-col items-center space-y-8">
				<!-- Visualizer / Timer Circle -->
				<div
					class="relative w-48 h-48 rounded-full flex items-center justify-center border-4 transition-all duration-300"
					:class="
						isRecording
							? 'border-red-500 scale-110 shadow-lg shadow-red-500/20'
							: 'border-gray-200 dark:border-gray-700'
					"
				>
					<div class="text-3xl font-mono font-bold text-gray-900 dark:text-white">
						{{ formatTime(recordingTime) }}
					</div>
					<div
						v-if="isRecording"
						class="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-25"
					></div>
				</div>

				<div class="flex gap-4">
					<button
						v-if="!isRecording"
						@click="startRecording"
						class="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-md"
					>
						<MicIcon class="w-5 h-5" />
						Start Recording
					</button>

					<button
						v-else
						@click="stopRecording"
						class="bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-md"
					>
						<StopIcon class="w-5 h-5" />
						Stop Recording
					</button>
				</div>

				<!-- Recording Result -->
				<div
					v-if="audioURL && !isRecording"
					class="w-full pt-8 animate-in fade-in slide-in-from-top-4"
				>
					<div
						class="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4"
					>
						<p class="text-sm font-medium text-gray-500 dark:text-gray-400">
							Recording Finished
						</p>
						<audio controls :src="audioURL" class="w-full" />

						<div class="flex gap-2">
							<a
								:href="audioURL"
								download="recording.webm"
								class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
							>
								<DownloadIcon class="w-4 h-4" />
								Download
							</a>
							<button
								@click="resetRecorder"
								class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
							>
								<RefreshIcon class="w-4 h-4 text-gray-500" />
							</button>
						</div>
					</div>
				</div>
			</div>

			<p class="mt-8 text-xs text-gray-400 dark:text-gray-500">
				Recording is processed locally in your browser and never uploaded to any server.
			</p>
		</div>
	</div>
</template>
