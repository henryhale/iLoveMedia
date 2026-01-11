<script setup lang="ts">
import { ref, onUnmounted, useTemplateRef, watchEffect } from "vue"
import { useDisplayMedia, useIntervalFn, useObjectUrl } from "@vueuse/core"
import { MonitorIcon, DownloadIcon, PlayIcon, StopCircleIcon } from "lucide-vue-next"
import { toast } from "vue-sonner"
import { downloadFile, formatTime } from "@/lib/helpers"
import { Button } from "@/components/ui/button"

const videoRef = useTemplateRef("video")
const isRecording = ref(false)
const recordingTime = ref(0)
const videoBlob = ref<Blob | null>(null)

const videoURL = useObjectUrl(videoBlob)

let chunks: Blob[] = []
let mediaRecorder: MediaRecorder | null = null

const { start: startStream, stop: stopStream, stream, enabled, isSupported } = useDisplayMedia()

watchEffect(() => {
	if (videoRef.value && stream.value) {
		videoRef.value.srcObject = stream.value

		// Handle when user stops sharing via browser bar
		stream.value.getTracks().forEach((track) => {
			track.onended = () => {
				if (isRecording.value) stopRecording()
				enabled.value = false
			}
		})
	}
})

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
	} catch (err) {
		console.log(err)
		toast.error("Failed to access screen recording interface. Please check permissions.")
	}

	if (!stream.value) return

	chunks = []
	mediaRecorder = new MediaRecorder(stream.value)

	mediaRecorder.ondataavailable = (e) => {
		if (e.data.size > 0) {
			chunks.push(e.data)
		}
	}

	mediaRecorder.onstop = () => {
		videoBlob.value = new Blob(chunks, { type: "video/webm" })
	}

	mediaRecorder.start()
	isRecording.value = true
	recordingTime.value = 0
	videoBlob.value = null // clears previous recoring
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

const handleDownload = () => {
	if (!videoURL.value) return
	downloadFile(videoURL.value, `screen-recording-${Date.now().toString(16)}.webm`)
}

onUnmounted(() => {
	pause()
	stream.value?.getTracks().forEach((track) => track.stop())
})
</script>

<template>
	<h2 class="text-xl font-bold flex items-center justify-center gap-2">
		<MonitorIcon class="size-5 text-primary" />
		Screen Recorder
	</h2>

	<div class="flex flex-col items-center space-y-6">
		<div
			class="relative w-full aspect-video bg-background rounded-2xl overflow-hidden border border-border shadow-inner group"
		>
			<!-- Video Preview / Result -->
			<video
				v-if="videoURL && !isRecording"
				:src="videoURL"
				controls
				class="w-full h-full object-contain"
			></video>
			<video
				ref="video"
				autoplay
				muted
				playsinline
				class="w-full h-full object-contain"
			></video>

			<!-- Recording Indicator -->
			<div
				v-if="isRecording"
				class="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse z-10"
			>
				REC • {{ formatTime(recordingTime) }}
			</div>

			<!-- Empty State -->
			<div
				v-if="!enabled && !videoURL"
				class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-4"
			>
				<MonitorIcon class="w-12 h-12 opacity-20" />
				<p class="font-medium text-sm">
					{{
						isSupported
							? "Select a window or screen to begin sharing"
							: "Screen recording is disabled or not supported. Please check browser settings."
					}}
				</p>
			</div>
		</div>

		<!-- Controls -->
		<div class="flex gap-4">
			<Button v-if="!isRecording" @click="startRecording">
				<PlayIcon class="w-5 h-5" />
				{{ enabled ? "Start Recording" : "Select Screen & Start" }}
			</Button>

			<Button v-else @click="stopStream" variant="outline">
				<StopCircleIcon class="w-5 h-5" />
				Finish Recording
			</Button>
		</div>

		<!-- Download & Clear -->
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
