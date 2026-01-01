<script setup lang="ts">
import { ref, onMounted } from "vue"
import { VideoIcon, DownloadIcon, RefreshCwIcon, CheckIcon } from "lucide-vue-next"
import { useFFmpeg } from "@/composables/useFfmpeg"
import ResourceLoader from "@/components/ResourceLoader.vue"
import { toast } from "vue-sonner"
import { downloadFile } from "@/lib/helpers"
import FilePicker from "@/components/FilePicker.vue"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import FilePreview from "@/components/FilePreview.vue"
import TargetSelector from "@/components/TargetSelector.vue"
import ProgressDisplay from "@/components/ProgressDisplay.vue"

const file = ref<File | null>(null)
const targetFormat = ref("mp4")

const formats = ["mp4", "mkv", "avi", "mov"]

const { isLoaded, isLoading, isConverting, progress, convertedURL, load, convert, reset } =
	useFFmpeg()

onMounted(async () => {
	try {
		await load()
	} catch {
		toast.error("Failed to load FFmpeg components. Check browser security settings.")
	}
})

const handleFileChange = (selectedFile: File | undefined) => {
	if (selectedFile) {
		file.value = selectedFile
		reset()
	}
}

const handleConvert = async () => {
	if (!file.value) return
	try {
		await convert(file.value, "video", targetFormat.value)
		toast.success("Conversion complete!")
	} catch {
		toast.error("Conversion failed. Check browser resource limits.")
	}
}

const handleReset = () => {
	file.value = null
	reset()
}

const handleDownload = () => {
	if (!file.value || !convertedURL.value) return
	const segments = file.value.name.split(".")
	segments.pop()
	downloadFile(convertedURL.value, `${segments.join(".")}.${targetFormat.value}`)
}
</script>

<template>
	<ResourceLoader
		v-if="!isLoaded"
		:loading="isLoading"
		:load="load"
		text-loading="Initializing FFmpeg secure environment(~33MB)..."
		text-loaded="Failed create secure environment."
	/>

	<!-- File Upload Dropzone -->
	<div class="space-y-2">
		<Label class="text-muted-foreground uppercase tracking-wider">Video File</Label>

		<!-- File Upload Dropzone -->
		<FilePicker
			v-if="!file"
			accept="audio/*"
			@change="handleFileChange"
			:icon="VideoIcon"
			title="Select video file"
			subtitle="MP4, MKV, AVI, MOV, WebM"
		/>

		<!-- File Info Card -->
		<FilePreview
			v-else
			:file="file"
			:icon="VideoIcon"
			:disabled="isConverting"
			:reset="handleReset"
		/>
	</div>

	<!-- Conversion Interface -->
	<TargetSelector
		:options="formats"
		:value="targetFormat"
		@change="(val) => (targetFormat = val)"
	/>

	<ProgressDisplay v-if="isConverting" title="Re-encoding stream..." :progress="progress" />

	<div>
		<Button
			@click="handleConvert"
			:disabled="isConverting || !isLoaded"
			class="w-full max-w-md"
			size="lg"
		>
			<RefreshCwIcon v-if="isConverting" class="w-6 h-6 animate-spin" />
			<CheckIcon v-else class="w-6 h-6" />
			{{ isConverting ? `Processing (${progress}%)` : "Start Conversion" }}
		</Button>
	</div>

	<!-- Download Result -->
	<div
		v-if="convertedURL"
		class="bg-emerald-500/10 p-6 rounded-xl border border-emerald-500/20 animate-in fade-in duration-300"
	>
		<p class="text-emerald-600 dark:text-emerald-400 font-bold mb-3 flex items-center gap-2">
			<CheckIcon class="w-5 h-5" /> Conversion Successful!
		</p>
		<video controls :src="convertedURL" class="w-full mb-4 rounded-lg"></video>
		<Button @click="handleDownload" class="w-full max-w-sm" size="lg">
			<DownloadIcon class="w-5 h-5" />
			Download Video
		</Button>
	</div>

	<div class="mt-8 text-center rounded-lg">
		<p class="text-xs text-muted-foreground leading-relaxed">
			Uses browser-based FFmpeg via WebAssembly. <br />
			No cloud servers are used. Large high-definition videos may take significant time or
			memory.
		</p>
	</div>
</template>
