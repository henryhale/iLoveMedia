<script setup lang="ts">
import { ref } from "vue"
import { DownloadIcon, RefreshCwIcon, ImageIcon, CheckIcon } from "lucide-vue-next"
import { type FileState } from "../constants/types"

// State
const fileState = ref<FileState>(null)
const targetFormat = ref<string>("image/jpeg")
const quality = ref<number>(0.9)
const isProcessing = ref(false)
const showSuccess = ref(false)

// Template Refs
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Methods
const handleFileChange = (e: Event) => {
	const target = e.target as HTMLInputElement
	if (target.files && target.files[0]) {
		const file = target.files[0]
		const previewUrl = URL.createObjectURL(file)
		fileState.value = {
			file,
			previewUrl,
			type: file.type,
			size: file.size,
		}
		showSuccess.value = false
	}
}

const handleConvert = () => {
	if (!fileState.value || !canvasRef.value) return
	isProcessing.value = true
	showSuccess.value = false

	const img = new Image()
	img.src = fileState.value.previewUrl
	img.onload = () => {
		const canvas = canvasRef.value
		if (!canvas) return

		canvas.width = img.width
		canvas.height = img.height
		const ctx = canvas.getContext("2d")

		if (ctx) {
			// Fill white background for JPEG/Transparency handling
			if (targetFormat.value === "image/jpeg") {
				ctx.fillStyle = "#FFFFFF"
				ctx.fillRect(0, 0, canvas.width, canvas.height)
			}
			ctx.drawImage(img, 0, 0)

			canvas.toBlob(
				(blob) => {
					if (blob) {
						const url = URL.createObjectURL(blob)
						const a = document.createElement("a")
						a.href = url
						const ext = targetFormat.value.split("/")[1]
						a.download = `converted-image.${ext}`
						a.click()
						URL.revokeObjectURL(url)

						// Success animation feedback
						showSuccess.value = true
						setTimeout(() => (showSuccess.value = false), 2000)
					}
					isProcessing.value = false
				},
				targetFormat.value,
				quality.value,
			)
		}
	}
}

const reset = () => {
	fileState.value = null
	showSuccess.value = false
}

const formatSize = (bytes: number) => {
	if (bytes === 0) return "0 Bytes"
	const k = 1024
	const sizes = ["Bytes", "KB", "MB", "GB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
</script>

<template>
	<div class="max-w-3xl mx-auto space-y-6">
		<div
			class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
			<h2 class="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
				<ImageIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
				Image Converter
			</h2>
			<p class="text-slate-600 dark:text-slate-400 mb-6">
				Convert images between formats locally. Your photos never leave your browser.
			</p>

			<!-- Upload State -->
			<div v-if="!fileState"
				class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative">
				<input type="file" accept="image/*" @change="handleFileChange"
					class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
				<div class="space-y-2">
					<div
						class="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
						<ImageIcon class="w-6 h-6" />
					</div>
					<p class="text-lg font-medium text-slate-900 dark:text-white">
						Drop an image here
					</p>
					<p class="text-sm text-slate-500 dark:text-slate-400">
						or click to upload (PNG, JPG, WEBP)
					</p>
				</div>
			</div>

			<!-- Preview & Controls State -->
			<div v-else class="space-y-6">
				<div class="flex flex-col md:flex-row gap-6">
					<div
						class="w-full md:w-1/2 bg-slate-100 dark:bg-slate-900 rounded-lg p-4 flex items-center justify-center min-h-50">
						<img :src="fileState.previewUrl" alt="Preview"
							class="max-w-full max-h-64 object-contain shadow-sm rounded-md" />
					</div>
					<div class="w-full md:w-1/2 space-y-4">
						<div>
							<h3 class="font-medium text-slate-900 dark:text-white truncate">
								{{ fileState.file.name }}
							</h3>
							<p class="text-sm text-slate-500 dark:text-slate-400">
								{{ formatSize(fileState.size) }} • {{ fileState.type }}
							</p>
						</div>

						<div class="space-y-3">
							<div>
								<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target
									Format</label>
								<select v-model="targetFormat"
									class="w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border py-2 px-3">
									<option value="image/jpeg">JPEG</option>
									<option value="image/png">PNG</option>
									<option value="image/webp">WEBP</option>
								</select>
							</div>

							<div v-if="targetFormat !== 'image/png'">
								<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quality
									({{ Math.round(quality * 100) }}%)</label>
								<input type="range" min="0.1" max="1" step="0.1" v-model.number="quality"
									class="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600" />
							</div>
						</div>

						<div class="flex gap-2 pt-2">
							<button @click="handleConvert" :disabled="isProcessing"
								class="flex-1 px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
								:class="showSuccess
									? 'bg-emerald-600 text-white'
									: 'bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500'
									">
								<RefreshCwIcon v-if="isProcessing" class="animate-spin w-4 h-4" />
								<CheckIcon v-else-if="showSuccess" class="w-4 h-4 animate-in zoom-in duration-300" />
								<DownloadIcon v-else class="w-4 h-4" />

								<span>
									{{
										isProcessing
											? "Converting..."
											: showSuccess
												? "Converted!"
												: "Convert & Download"
									}}
								</span>
							</button>
							<button @click="reset"
								class="px-4 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-medium transition-colors">
								Reset
							</button>
						</div>
					</div>
				</div>
			</div>
			<canvas ref="canvasRef" class="hidden" />
		</div>
	</div>
</template>
