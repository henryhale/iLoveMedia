<script setup lang="ts">
import { ref, watchEffect, onUnmounted } from "vue"
import { useUserMedia, useIntervalFn, useObjectUrl } from "@vueuse/core"
import { VideoIcon, StopCircleIcon, DownloadIcon, CameraIcon } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { downloadFile } from "@/lib/helpers"
import { toast } from "vue-sonner"

const videoRef = ref<HTMLVideoElement | null>(null)
const isRecording = ref(false)
const recordingTime = ref(0)
const videoBlob = ref<Blob | null>(null)

const videoURL = useObjectUrl(videoBlob)

const {
	start: startStream,
	stop: stopStream,
	stream,
	isSupported,
} = useUserMedia({
	constraints: { video: true, audio: true },
})

// Sync stream to video element preview
watchEffect(() => {
	if (videoRef.value && stream.value) {
		videoRef.value.srcObject = stream.value
	}
})

// Recording Logic
let mediaRecorder: MediaRecorder | null = null
let chunks: Blob[] = []

const { pause, resume } = useIntervalFn(
	() => {
		recordingTime.value++
	},
	1000,
	{ immediate: false },
)

const startRecording = async () => {
	try {
		await startStream()
	} catch {
		toast.error("Could not access camera/microphone. Please check permissions.")
	}

	if (!stream.value) return

	chunks = []
	mediaRecorder = new MediaRecorder(stream.value)

	mediaRecorder.ondataavailable = (e) => {
		if (e.data.size > 0) chunks.push(e.data)
	}

	mediaRecorder.onstop = () => {
		videoBlob.value = new Blob(chunks, { type: "video/webm" })
	}

	mediaRecorder.start()
	isRecording.value = true
	recordingTime.value = 0
	videoBlob.value = null // Clears previous recording
	resume()
}

const stopRecording = () => {
	if (mediaRecorder && isRecording.value) {
		mediaRecorder.stop()
		isRecording.value = false
		pause()
	}

	stopStream()
}

const reset = () => {
	videoBlob.value = null
	recordingTime.value = 0
}

const formatTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins}:${secs.toString().padStart(2, "0")}`
}

const handleDownload = () => {
	if (!videoURL.value) return
	downloadFile(videoURL.value, `video-recording-${Date.now().toString(16)}.webm`)
}

// Cleanup: Stop all tracks when component unmounts
onUnmounted(() => {
	stream.value?.getTracks().forEach((track) => track.stop())
})
</script>

<template>
	<h2 class="text-xl font-semibold mb-6 flex items-center justify-center gap-2 text-foreground">
		<CameraIcon class="size-5 text-primary" />
		Video Recorder
	</h2>

	<div class="flex flex-col items-center space-y-6">
		<!-- Preview/Playback Window -->
		<div
			class="relative w-full aspect-video bg-background rounded-2xl overflow-hidden border border-border"
		>
			<video
				v-if="videoURL && !isRecording"
				:src="videoURL"
				controls
				class="w-full h-full object-contain"
			></video>
			<video
				v-else
				ref="videoRef"
				autoplay
				muted
				playsinline
				class="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
			></video>

			<div
				v-if="isRecording"
				class="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse"
			>
				<div class="w-2 h-2 rounded-full bg-white"></div>
				REC • {{ formatTime(recordingTime) }}
			</div>

			<!-- Permission Loading Overlay -->
			<div
				v-if="!stream && !videoURL"
				class="absolute inset-0 font-bold flex items-center justify-center p-8 text-center text-muted-foreground"
			>
				<p v-if="isSupported">Waiting for camera permission...</p>
				<p v-else>
					Video recording not supported. <br />
					Check permissions or try another browser.
				</p>
			</div>
		</div>

		<!-- Controls -->
		<div class="flex gap-4 w-full justify-center">
			<Button v-if="!isRecording" @click="startRecording" size="lg" class="w-full max-w-md">
				<VideoIcon class="size-5" />
				Start New Recording
			</Button>

			<Button v-else @click="stopRecording" variant="secondary">
				<StopCircleIcon class="size-5" />
				Stop & Save
			</Button>
		</div>

		<!-- Post-recording Actions -->
		<div v-if="videoURL && !isRecording" class="w-full animate-in fade-in slide-in-from-top-4">
			<div class="flex gap-3 justify-center">
				<Button @click="handleDownload" class="w-full max-w-sm" size="lg">
					<DownloadIcon class="w-5 h-5" />
					Download Video
				</Button>
				<Button @click="reset" variant="outline" size="lg"> Discard </Button>
			</div>
		</div>
	</div>

	<p class="mt-8 text-xs text-muted-foreground text-center">
		Recording is processed locally in your browser and never uploaded to any server.
	</p>
</template>
