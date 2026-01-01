<script setup lang="ts">
import { ref, onMounted } from "vue"
import { MusicIcon, DownloadIcon, RefreshCwIcon, CheckIcon } from "lucide-vue-next"
import { toast } from "vue-sonner"
import { useFFmpeg } from "@/composables/useFfmpeg"
import FilePicker from "@/components/FilePicker.vue"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { downloadFile } from "@/lib/helpers"
import ResourceLoader from "@/components/ResourceLoader.vue"
import FilePreview from "@/components/FilePreview.vue"
import TargetSelector from "@/components/TargetSelector.vue"
import ProgressDisplay from "@/components/ProgressDisplay.vue"

const file = ref<File | null>(null)
const targetFormat = ref("mp3")
const formats = ["mp3", "wav", "aac", "ogg"]

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
		await convert(file.value, "audio", targetFormat.value)
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

	<div class="space-y-2">
		<Label class="text-muted-foreground uppercase tracking-wider">Audio File</Label>

		<!-- File Upload Dropzone -->
		<FilePicker
			v-if="!file"
			accept="audio/*"
			@change="handleFileChange"
			:icon="MusicIcon"
			title="Select an audio file"
			subtitle="MP3, WAV, AAC, OGG, etc."
		/>

		<!-- File Info Card -->
		<FilePreview
			v-else
			:file="file"
			:icon="MusicIcon"
			:disabled="isConverting"
			:reset="handleReset"
		/>
	</div>

	<!-- Progress Bar -->
	<ProgressDisplay v-if="isConverting" title="Processing..." :progress="progress" />

	<TargetSelector
		:options="formats"
		:value="targetFormat"
		@change="(val) => (targetFormat = val)"
	/>

	<div>
		<Button
			@click="handleConvert"
			:disabled="isConverting || !file || !isLoaded"
			size="lg"
			class="w-full max-w-md"
		>
			<RefreshCwIcon v-if="isConverting" class="w-4 h-4 mr-2 animate-spin" />
			<CheckIcon v-else class="w-4 h-4 mr-2" />
			{{ isConverting ? `Converting (${progress}%)` : "Start Conversion" }}
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
		<audio controls :src="convertedURL" class="w-full mb-4 rounded-lg"></audio>
		<Button @click="handleDownload" class="w-full max-w-sm" size="lg">
			<DownloadIcon class="w-5 h-5" />
			Download Audio
		</Button>
	</div>

	<div class="mt-8 text-center p-4 rounded-lg">
		<p class="text-xs text-muted-foreground leading-relaxed">
			Conversion is powered by FFmpeg WebAssembly. Everything stays on your device. Large
			files may take more time depending on your hardware.
		</p>
	</div>
</template>
