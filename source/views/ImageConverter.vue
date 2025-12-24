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
	<h2 class="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
		<ImageIcon class="w-5 h-5 text-primary" />
		Image Converter
	</h2>
	<p class="text-muted-foreground mb-6">
		Convert images between formats locally. Your photos never leave your browser.
	</p>

	<!-- Upload State -->
	<div v-if="!fileState"
		class="border-2 border-dashed border-border rounded-xl p-10 text-center hover:bg-accent/50 transition-colors relative">
		<input type="file" accept="image/*" @change="handleFileChange"
			class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
		<div class="space-y-2">
			<div class="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
				<ImageIcon class="w-6 h-6" />
			</div>
			<p class="text-lg font-medium text-foreground">
				Drop an image here
			</p>
			<p class="text-sm text-muted-foreground">
				or click to upload (PNG, JPG, WEBP)
			</p>
		</div>
	</div>

	<!-- Preview & Controls State -->
	<div v-else class="space-y-6">
		<div class="flex flex-col md:flex-row gap-6">
			<div class="w-full md:w-1/2 bg-muted rounded-lg p-4 flex items-center justify-center min-h-50">
				<img :src="fileState.previewUrl" alt="Preview"
					class="max-w-full max-h-64 object-contain shadow-sm rounded-md border border-border" />
			</div>

			<div class="w-full md:w-1/2 space-y-4">
				<div>
					<h3 class="font-medium text-foreground truncate">
						{{ fileState.file.name }}
					</h3>
					<p class="text-sm text-muted-foreground">
						{{ formatSize(fileState.size) }} • {{ fileState.type }}
					</p>
				</div>

				<div class="space-y-3">
					<div>
						<label class="block text-sm font-medium text-foreground mb-1.5">Target Format</label>
						<select v-model="targetFormat"
							class="w-full rounded-md border-input bg-background text-foreground shadow-sm focus:ring-2 focus:ring-ring focus:ring-offset-2 border py-2 px-3 text-sm outline-none">
							<option value="image/jpeg">JPEG</option>
							<option value="image/png">PNG</option>
							<option value="image/webp">WEBP</option>
						</select>
					</div>

					<div v-if="targetFormat !== 'image/png'">
						<label class="block text-sm font-medium text-foreground mb-1.5">
							Quality ({{ Math.round(quality * 100) }}%)
						</label>
						<input type="range" min="0.1" max="1" step="0.1" v-model.number="quality"
							class="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
					</div>
				</div>

				<div class="flex gap-2 pt-2">
					<button @click="handleConvert" :disabled="isProcessing"
						class="flex-1 px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all active:scale-95 flex items-center justify-center gap-2"
						:class="showSuccess
							? 'bg-emerald-600 text-white'
							: 'bg-primary text-primary-foreground hover:bg-primary/90'
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
						class="px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-accent hover:text-accent-foreground font-medium transition-colors">
						Reset
					</button>
				</div>
			</div>
		</div>
	</div>
	<canvas ref="canvasRef" class="hidden" />
</template>
