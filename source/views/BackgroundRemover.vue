<script setup lang="ts">
import { ref } from "vue"
import { ScissorsIcon, DownloadIcon, RefreshCwIcon, ImageIcon } from "lucide-vue-next"
import { removeBackground } from "@imgly/background-removal"

// State (Replacing useState)
const originalFile = ref<File | null>(null)
const originalUrl = ref<string | null>(null)
const resultUrl = ref<string | null>(null)
const isProcessing = ref(false)
const progress = ref(0)
const error = ref<string | null>(null)

// Methods
const handleFileChange = (e: Event) => {
	const target = e.target as HTMLInputElement
	if (target.files && target.files[0]) {
		const file = target.files[0]
		originalFile.value = file
		originalUrl.value = URL.createObjectURL(file)
		resultUrl.value = null
		error.value = null
		progress.value = 0
	}
}

const handleRemoveBackground = async () => {
	if (!originalUrl.value) {
		isProcessing.value = false
		error.value = "Failed to generate image path"
		progress.value = 0
		return
	}

	isProcessing.value = true
	error.value = null
	progress.value = 0

	try {
		// Library processes everything locally in browser using WASM
		const resultBlob = await removeBackground(originalUrl.value, {
			progress: (key, current, total) => {
				const percent = Math.round((current / total) * 100)
				progress.value = percent
				console.log(`[${key}] ${percent}%`)
			},
		})

		const url = URL.createObjectURL(resultBlob)
		resultUrl.value = url
	} catch (err) {
		console.error("Background removal failed:", err)
		error.value =
			"Failed to process image. This tool requires a modern browser and may take a moment to initialize the AI model (~40MB)."
	} finally {
		isProcessing.value = false
	}
}

const handleDownload = () => {
	if (!resultUrl.value) return
	const a = document.createElement("a")
	a.href = resultUrl.value
	a.download = `background-removed-${Date.now()}.png`
	a.click()
}

const reset = () => {
	originalFile.value = null
	originalUrl.value = null
	resultUrl.value = null
	isProcessing.value = false
	progress.value = 0
	error.value = null
}
</script>

<template>
	<div class="max-w-5xl mx-auto space-y-6">
		<div
			class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors"
		>
			<div class="flex items-center gap-3 mb-8">
				<div
					class="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400"
				>
					<ScissorsIcon class="w-6 h-6" />
				</div>
				<div>
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
						AI Background Remover
					</h2>
					<p class="text-sm text-gray-500">
						Remove image backgrounds instantly in your browser
					</p>
				</div>
			</div>

			<!-- Upload State -->
			<div
				v-if="!originalUrl"
				class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-3xl p-16 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative group"
			>
				<input
					type="file"
					accept="image/*"
					@change="handleFileChange"
					class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
				/>
				<div class="space-y-4">
					<div
						class="mx-auto w-16 h-16 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
					>
						<ImageIcon class="w-8 h-8" />
					</div>
					<div>
						<p class="text-xl font-bold text-gray-900 dark:text-white">
							Drop your image here
						</p>
						<p class="text-gray-500 dark:text-gray-400">
							or click to browse local files
						</p>
					</div>
					<div class="pt-2">
						<span
							class="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500"
							>Supports PNG, JPG, WEBP</span
						>
					</div>
				</div>
			</div>

			<!-- Processing/Result State -->
			<div v-else class="space-y-8">
				<div
					v-if="error"
					class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-center gap-3"
				>
					<div class="w-2 h-2 rounded-full bg-red-500"></div>
					{{ error }}
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					<!-- Left Side: Original -->
					<div class="space-y-3">
						<label class="text-xs font-bold uppercase tracking-widest text-gray-400"
							>Original Image</label
						>
						<div
							class="aspect-square bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center relative"
						>
							<img
								:src="originalUrl"
								alt="Original"
								class="max-w-full max-h-full object-contain"
							/>

							<div
								v-if="isProcessing"
								class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white"
							>
								<RefreshCwIcon class="w-10 h-10 animate-spin mb-4" />
								<p class="font-bold">Analyzing pixels...</p>
								<p class="text-xs opacity-75">{{ progress }}% Complete</p>
								<div
									class="w-48 h-1.5 bg-white/20 rounded-full mt-4 overflow-hidden"
								>
									<div
										class="h-full bg-white transition-all duration-300"
										:style="{ width: `${progress}%` }"
									/>
								</div>
							</div>
						</div>
					</div>

					<!-- Right Side: Result -->
					<div class="space-y-3">
						<label class="text-xs font-bold uppercase tracking-widest text-gray-400"
							>Result (Transparent)</label
						>
						<div
							class="aspect-square pattern-checkered bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center"
						>
							<img
								v-if="resultUrl"
								:src="resultUrl"
								alt="Result"
								class="max-w-full max-h-full object-contain animate-in zoom-in duration-500"
							/>
							<div v-else class="text-center p-8">
								<ScissorsIcon
									class="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4 opacity-20"
								/>
								<p class="text-sm text-gray-400 font-medium">Ready to process</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex flex-col sm:flex-row gap-4 pt-4 border-t dark:border-gray-700">
					<button
						v-if="!resultUrl"
						@click="handleRemoveBackground"
						:disabled="isProcessing"
						class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
					>
						<RefreshCwIcon v-if="isProcessing" class="w-5 h-5 animate-spin" />
						<ScissorsIcon v-else class="w-5 h-5" />
						{{
							isProcessing
								? `Removing Background (${progress}%)`
								: "Remove Background"
						}}
					</button>

					<button
						v-else
						@click="handleDownload"
						class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
					>
						<DownloadIcon class="w-5 h-5" />
						Download Transparent PNG
					</button>

					<button
						@click="reset"
						:disabled="isProcessing"
						class="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
					>
						{{ resultUrl ? "New Image" : "Reset" }}
					</button>
				</div>
			</div>

			<!-- Feature Cards -->
			<div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
				<div
					class="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800"
				>
					<p
						class="text-xs font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wider"
					>
						100% Client-Side
					</p>
					<p class="text-[11px] text-gray-500 leading-relaxed">
						Processing happens in your browser's RAM. No image data is ever uploaded to
						a server.
					</p>
				</div>
				<div
					class="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800"
				>
					<p
						class="text-xs font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wider"
					>
						Edge AI Model
					</p>
					<p class="text-[11px] text-gray-500 leading-relaxed">
						Uses a dedicated WASM-powered background removal model for precision
						masking.
					</p>
				</div>
				<div
					class="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800"
				>
					<p
						class="text-xs font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wider"
					>
						High Resolution
					</p>
					<p class="text-[11px] text-gray-500 leading-relaxed">
						Exports your processed image as a full-resolution 32-bit PNG with alpha
						transparency.
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.pattern-checkered {
	background-image:
		radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px);
	background-position:
		0 0,
		10px 10px;
	background-size: 20px 20px;
}

:deep(.dark) .pattern-checkered,
.dark .pattern-checkered {
	background-image:
		radial-gradient(#1e293b 1px, transparent 1px), radial-gradient(#1e293b 1px, transparent 1px);
}
</style>
