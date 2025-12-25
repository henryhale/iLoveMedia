<script setup lang="ts">
import { ref, onMounted } from "vue"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import { MusicIcon, DownloadIcon, RefreshCwIcon, CheckIcon } from "lucide-vue-next"
import { toast } from "vue-sonner"

const file = ref<File | null>(null)
const targetFormat = ref("mp3")
const isLoaded = ref(false)
const isConverting = ref(false)
const progress = ref(0)
const convertedURL = ref<string | null>(null)

const ffmpeg = new FFmpeg()

onMounted(() => {
	loadFFmpeg()
})

const loadFFmpeg = async () => {
	const coreBaseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm"
	const ffmpegBaseURL = "https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm"

	ffmpeg.on("log", ({ message }) => {
		console.log("FFmpeg Log:", message)
	})

	ffmpeg.on("progress", ({ progress: p }) => {
		progress.value = Math.round(p * 100)
	})

	try {
		await ffmpeg.load({
			coreURL: await toBlobURL(`${coreBaseURL}/ffmpeg-core.js`, "text/javascript"),
			wasmURL: await toBlobURL(`${coreBaseURL}/ffmpeg-core.wasm`, "application/wasm"),
			workerURL: await toBlobURL(`${ffmpegBaseURL}/worker.js`, "text/javascript"),
		})
		isLoaded.value = true
	} catch (err) {
		console.error("Failed to load FFmpeg:", err)
		toast.error(
			"Failed to load FFmpeg components. This may be due to browser security settings.",
		)
	}
}

const handleFileChange = (e: Event) => {
	const target = e.target as HTMLInputElement
	if (target.files && target.files[0]) {
		file.value = target.files[0]
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

		const data = await ffmpeg.readFile(outputName)
		const url = URL.createObjectURL(
			new Blob([data as any], { type: `audio/${targetFormat.value}` }),
		)
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
	<h2 class="text-xl font-semibold leading-none tracking-tight mb-4 flex items-center gap-2">
		<MusicIcon class="w-5 h-5 text-primary" />
		Audio Converter (FFmpeg WASM)
	</h2>

	<!-- Loading State -->
	<div
		v-if="!isLoaded"
		class="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground mb-6 flex items-center gap-3 border border-border"
	>
		<RefreshCwIcon class="w-4 h-4 animate-spin" />
		Initializing FFmpeg secure environment...
	</div>

	<!-- File Upload Dropzone -->
	<div
		v-if="!file"
		class="relative border-2 border-dashed border-input rounded-xl p-10 text-center hover:bg-accent hover:text-accent-foreground transition-colors group"
	>
		<input
			type="file"
			accept="audio/*"
			@change="handleFileChange"
			class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
		/>
		<div class="space-y-2">
			<div
				class="mx-auto w-12 h-12 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
			>
				<MusicIcon class="w-6 h-6" />
			</div>
			<p class="text-lg font-medium">Upload an audio file</p>
			<p class="text-sm text-muted-foreground">MP3, WAV, AAC, OGG, etc.</p>
		</div>
	</div>

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
				<p class="text-sm font-bold truncate">
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

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<label class="block text-sm font-medium text-foreground mb-2">Target Format</label>
				<select
					v-model="targetFormat"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
				>
					<option value="mp3">MP3</option>
					<option value="wav">WAV</option>
					<option value="aac">AAC</option>
					<option value="ogg">OGG</option>
				</select>
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
			<audio controls :src="convertedURL" class="w-full mb-4 rounded-lg" />
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

	<div class="mt-8 text-center bg-muted/30 p-4 rounded-lg">
		<p class="text-xs text-muted-foreground leading-relaxed">
			Conversion is powered by FFmpeg WebAssembly. Everything stays on your device. Large
			files may take more time depending on your hardware.
		</p>
	</div>
</template>
