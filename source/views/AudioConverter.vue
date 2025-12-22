<script setup lang="ts">
import { ref, onMounted } from "vue"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import { MusicIcon, DownloadIcon, RefreshIcon, CheckIcon } from "../components/Icon.vue"

// State (Replacing useState)
const file = ref<File | null>(null)
const targetFormat = ref("mp3")
const isLoaded = ref(false)
const isConverting = ref(false)
const progress = ref(0)
const convertedURL = ref<string | null>(null)

// FFmpeg Instance (Replacing useRef)
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
		alert("Failed to load FFmpeg components. This may be due to browser security settings.")
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
		const url = URL.createObjectURL(new Blob([data], { type: `audio/${targetFormat.value}` }))
		convertedURL.value = url
	} catch (err) {
		console.error("Conversion failed:", err)
		alert("Conversion failed. Format incompatibility or browser resource limits.")
	} finally {
		isConverting.value = false
	}
}
</script>

<template>
	<div class="max-w-3xl mx-auto space-y-6">
		<div
			class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors"
		>
			<h2
				class="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"
			>
				<MusicIcon class="w-5 h-5 text-green-600 dark:text-green-400" />
				Audio Converter (FFmpeg WASM)
			</h2>

			<!-- Loading State -->
			<div
				v-if="!isLoaded"
				class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-sm text-green-700 dark:text-green-300 mb-6 flex items-center gap-3 border border-green-100 dark:border-green-900/30"
			>
				<RefreshIcon class="w-4 h-4 animate-spin" />
				Initializing FFmpeg secure environment...
			</div>

			<!-- File Upload Dropzone -->
			<div
				v-if="!file"
				class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative"
			>
				<input
					type="file"
					accept="audio/*"
					@change="handleFileChange"
					class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
				/>
				<div class="space-y-2">
					<div
						class="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center"
					>
						<MusicIcon class="w-6 h-6" />
					</div>
					<p class="text-lg font-medium text-gray-900 dark:text-white">
						Upload an audio file
					</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">MP3, WAV, AAC, OGG, etc.</p>
				</div>
			</div>

			<!-- Conversion Interface -->
			<div v-else class="space-y-6">
				<div
					class="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
				>
					<div
						class="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded flex items-center justify-center text-green-600"
					>
						<MusicIcon class="w-6 h-6" />
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-bold text-gray-900 dark:text-white truncate">
							{{ file.name }}
						</p>
						<p class="text-xs text-gray-500">
							{{ (file.size / (1024 * 1024)).toFixed(2) }} MB
						</p>
					</div>
					<button
						@click="resetFile"
						class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
					>
						<RefreshIcon class="w-5 h-5" />
					</button>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>Target Format</label
						>
						<select
							v-model="targetFormat"
							class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
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
							class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
						>
							<RefreshIcon v-if="isConverting" class="w-4 h-4 animate-spin" />
							<CheckIcon v-else class="w-4 h-4" />
							{{ isConverting ? `Converting (${progress}%)` : "Start Conversion" }}
						</button>
					</div>
				</div>

				<!-- Progress Bar -->
				<div v-if="isConverting" class="space-y-2">
					<div class="flex justify-between text-xs font-medium text-gray-500">
						<span>Processing...</span>
						<span>{{ progress }}%</span>
					</div>
					<div
						class="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden"
					>
						<div
							class="bg-green-600 h-full transition-all duration-300 ease-out"
							:style="{ width: progress + '%' }"
						></div>
					</div>
				</div>

				<!-- Download Result -->
				<div
					v-if="convertedURL"
					class="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-in zoom-in duration-300"
				>
					<p
						class="text-emerald-700 dark:text-emerald-300 font-bold mb-3 flex items-center gap-2"
					>
						<CheckIcon class="w-5 h-5" /> Conversion Successful!
					</p>
					<audio controls :src="convertedURL" class="w-full mb-4 rounded-lg" />
					<a
						:href="convertedURL"
						:download="`converted.${targetFormat}`"
						class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all"
					>
						<DownloadIcon class="w-5 h-5" />
						Download Result
					</a>
				</div>
			</div>

			<div class="mt-8 text-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
				<p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
					Conversion is powered by FFmpeg WebAssembly. Everything stays on your device.
					Large files may take more time depending on your hardware.
				</p>
			</div>
		</div>
	</div>
</template>
