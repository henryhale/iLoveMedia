<script setup lang="ts">
import { ref, onMounted } from "vue"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile } from "@ffmpeg/util"
import { MusicIcon, DownloadIcon, RefreshCwIcon, CheckIcon } from "lucide-vue-next"
import { toast } from "vue-sonner"
import coreURL from "@ffmpeg/core?url"
import wasmURL from "@ffmpeg/core/wasm?url"
import classWorkerURL from "@ffmpeg/ffmpeg/worker?url"
import FilePicker from "@/components/FilePicker.vue"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
	SelectItem,
} from "@/components/ui/select"

const file = ref<File | null>(null)
const targetFormat = ref("mp3")
const loading = ref(true)
const isLoaded = ref(false)
const isConverting = ref(false)
const progress = ref(0)
const convertedURL = ref<string | null>(null)

const ffmpeg = new FFmpeg()

onMounted(() => {
	loadFFmpeg()
})

const loadFFmpeg = async () => {
	loading.value = true

	ffmpeg.on("log", ({ message }) => {
		console.log("FFmpeg Log:", message)
	})

	ffmpeg.on("progress", ({ progress: p }) => {
		progress.value = Math.round(p * 100)
	})

	try {
		await ffmpeg.load({
			coreURL,
			wasmURL,
			classWorkerURL,
		})
		isLoaded.value = true
	} catch (err) {
		console.error("Failed to load FFmpeg:", err)
		toast.error(
			"Failed to load FFmpeg components. This may be due to browser security settings.",
		)
		isLoaded.value = false
	} finally {
		loading.value = false
	}
}

const handleFileChange = (selectedFile: File | undefined) => {
	if (selectedFile) {
		file.value = selectedFile
		convertedURL.value = null
		progress.value = 0
	}
}

const resetFile = () => {
	file.value = null
	convertedURL.value = null
	progress.value = 0
}

const convert = async () => {
	if (!file.value || !isLoaded.value) return

	isConverting.value = true
	convertedURL.value = null
	progress.value = 0

	const inputName = file.value.name
	const outputName = `output.${targetFormat.value}`

	try {
		await ffmpeg.writeFile(inputName, await fetchFile(file.value))
		await ffmpeg.exec(["-i", inputName, outputName])

		const data = (await ffmpeg.readFile(outputName)) as BlobPart
		const url = URL.createObjectURL(new Blob([data], { type: `audio/${targetFormat.value}` }))
		convertedURL.value = url
	} catch (err) {
		console.error("Conversion failed:", err)
		toast.error("Conversion failed. Format incompatibility or browser resource limits.")
	} finally {
		isConverting.value = false
	}
}
</script>

<template>
	<!-- Loading State -->
	<div
		v-if="!isLoaded"
		class="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground mb-6 flex items-center gap-3 border border-border"
	>
		<RefreshCwIcon class="w-4 h-4 animate-spin" />
		Initializing FFmpeg secure environment (~33MB)...
	</div>

	<!-- File Upload Dropzone -->
	<FilePicker
		v-if="!file"
		accept="audio/*"
		@change="handleFileChange"
		:icon="MusicIcon"
		title="Upload an audio file"
		subtitle="MP3, WAV, AAC, OGG, etc."
	/>

	<!-- Conversion Interface -->
	<div v-else class="space-y-6">
		<!-- File Info Card -->
		<div class="flex items-center gap-4 bg-secondary/30 p-4 rounded-lg border border-border">
			<div
				class="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary"
			>
				<MusicIcon class="w-6 h-6" />
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-sm font-bold truncate line-clamp-1 max-w-[220px] lg:max-w-sm">
					{{ file.name }}
				</p>
				<p class="text-xs text-muted-foreground">
					{{ (file.size / (1024 * 1024)).toFixed(2) }} MB
				</p>
			</div>
			<button
				@click="resetFile"
				class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
			>
				<RefreshCwIcon class="w-5 h-5" />
			</button>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div>
				<Label class="block text-sm font-medium text-foreground mb-2">Target Format</Label>
				<Select v-model="targetFormat">
					<SelectTrigger class="min-w-1/2">
						<SelectValue placeholder="Select format" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="mp3">MP3</SelectItem>
						<SelectItem value="wav">WAV</SelectItem>
						<SelectItem value="aac">AAC</SelectItem>
						<SelectItem value="ogg">OGG</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div class="flex flex-col justify-end">
				<button
					@click="convert"
					:disabled="isConverting || !isLoaded"
					class="inline-flex items-center justify-center rounded-md text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow"
				>
					<RefreshCwIcon v-if="isConverting" class="w-4 h-4 mr-2 animate-spin" />
					<CheckIcon v-else class="w-4 h-4 mr-2" />
					{{ isConverting ? `Converting (${progress}%)` : "Start Conversion" }}
				</button>
			</div>
		</div>

		<!-- Progress Bar -->
		<div v-if="isConverting" class="space-y-2">
			<div class="flex justify-between text-xs font-medium text-muted-foreground">
				<span>Processing...</span>
				<span>{{ progress }}%</span>
			</div>
			<div class="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
				<div
					class="bg-primary h-full transition-all duration-300 ease-out"
					:style="{ width: progress + '%' }"
				></div>
			</div>
		</div>

		<!-- Download Result -->
		<div
			v-if="convertedURL"
			class="bg-emerald-500/10 p-6 rounded-xl border border-emerald-500/20 animate-in zoom-in duration-300"
		>
			<p
				class="text-emerald-600 dark:text-emerald-400 font-bold mb-3 flex items-center gap-2"
			>
				<CheckIcon class="w-5 h-5" /> Conversion Successful!
			</p>
			<audio controls :src="convertedURL" class="w-full mb-4 rounded-lg"></audio>
			<a
				:href="convertedURL"
				:download="`converted.${targetFormat}`"
				class="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-bold shadow-sm"
			>
				<DownloadIcon class="w-5 h-5" />
				Download Result
			</a>
		</div>
	</div>

	<div class="mt-8 text-center p-4 rounded-lg">
		<p class="text-xs text-muted-foreground leading-relaxed">
			Conversion is powered by FFmpeg WebAssembly. Everything stays on your device. Large
			files may take more time depending on your hardware.
		</p>
	</div>
</template>
