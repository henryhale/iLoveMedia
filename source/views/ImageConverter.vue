<script setup lang="ts">
import { ref, useCallback } from "vue" // Note: useCallback isn't needed in Vue, but keeping imports as requested
import { DownloadIcon, RefreshIcon, ImageIcon, CheckIcon } from "../components/Icon.vue"
import { FileState } from "../types"

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
			class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors"
		>
			<h2
				class="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"
			>
				<ImageIcon class="w-5 h-5 text-green-600 dark:text-green-400" />
				Image Converter
			</h2>
			<p class="text-gray-600 dark:text-gray-400 mb-6">
				Convert images between formats locally. Your photos never leave your browser.
			</p>

			<!-- Upload State -->
			<div
				v-if="!fileState"
				class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative"
			>
				<input
					type="file"
					accept="image/*"
					@change="handleFileChange"
					class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
				/>
				<div class="space-y-2">
					<div
						class="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center"
					>
						<ImageIcon class="w-6 h-6" />
					</div>
					<p class="text-lg font-medium text-gray-900 dark:text-white">
						Drop an image here
					</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">
						or click to upload (PNG, JPG, WEBP)
					</p>
				</div>
			</div>

			<!-- Preview & Controls State -->
			<div v-else class="space-y-6">
				<div class="flex flex-col md:flex-row gap-6">
					<div
						class="w-full md:w-1/2 bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center min-h-[200px]"
					>
						<img
							:src="fileState.previewUrl"
							alt="Preview"
							class="max-w-full max-h-64 object-contain shadow-sm rounded-md"
						/>
					</div>
					<div class="w-full md:w-1/2 space-y-4">
						<div>
							<h3 class="font-medium text-gray-900 dark:text-white truncate">
								{{ fileState.file.name }}
							</h3>
							<p class="text-sm text-gray-500 dark:text-gray-400">
								{{ formatSize(fileState.size) }} • {{ fileState.type }}
							</p>
						</div>

						<div class="space-y-3">
							<div>
								<label
									class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>Target Format</label
								>
								<select
									v-model="targetFormat"
									class="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border py-2 px-3"
								>
									<option value="image/jpeg">JPEG</option>
									<option value="image/png">PNG</option>
									<option value="image/webp">WEBP</option>
								</select>
							</div>

							<div v-if="targetFormat !== 'image/png'">
								<label
									class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>Quality ({{ Math.round(quality * 100) }}%)</label
								>
								<input
									type="range"
									min="0.1"
									max="1"
									step="0.1"
									v-model.number="quality"
									class="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-600"
								/>
							</div>
						</div>

						<div class="flex gap-2 pt-2">
							<button
								@click="handleConvert"
								:disabled="isProcessing"
								class="flex-1 px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
								:class="
									showSuccess
										? 'bg-emerald-600 text-white'
										: 'bg-green-600 text-white hover:bg-green-700 dark:hover:bg-green-500'
								"
							>
								<RefreshIcon v-if="isProcessing" class="animate-spin w-4 h-4" />
								<CheckIcon
									v-else-if="showSuccess"
									class="w-4 h-4 animate-in zoom-in duration-300"
								/>
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
							<button
								@click="reset"
								class="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
							>
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
