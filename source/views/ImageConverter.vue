<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue"
import { DownloadIcon, RefreshCwIcon, ImageIcon, CheckIcon } from "lucide-vue-next"
import { type FileState } from "../constants/types"
import FilePicker from "@/components/FilePicker.vue"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { downloadFile } from "@/lib/helpers"

const fileState = ref<FileState>(null)
const targetFormat = ref<string>("image/jpeg")
const quality = ref<number>(0.9)
const isProcessing = ref(false)
const showSuccess = ref(false)
const canvasRef = ref<HTMLCanvasElement | null>(null)

onBeforeUnmount(() => {
	if (fileState.value?.previewUrl) {
		URL.revokeObjectURL(fileState.value.previewUrl)
	}
})

const handleFileChange = (file: File | null | undefined) => {
	if (file) {
		const currentUrl = fileState.value?.previewUrl
		if (currentUrl) {
			URL.revokeObjectURL(currentUrl)
		}
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
	if (!fileState.value || !fileState.value?.previewUrl || !canvasRef.value) return
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
						const ext = targetFormat.value.split("/")[1]
						downloadFile(blob, `converted-image-${Date.now().toString(16)}.${ext}`)
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
	<FilePicker
		v-if="!fileState"
		accept="image/*"
		@change="handleFileChange"
		:icon="ImageIcon"
		title="Drop an image here"
		subtitle="or click to upload (PNG, JPG, WEBP)"
	/>

	<!-- Preview & Controls State -->
	<div v-else class="space-y-6">
		<div class="flex flex-col lg:flex-row gap-6">
			<div
				class="w-full lg:w-1/2 bg-muted rounded-lg p-4 flex items-center justify-center min-h-50"
			>
				<img
					:src="fileState.previewUrl"
					alt="Preview"
					class="max-w-full max-h-64 object-contain shadow-sm rounded-md border border-border"
				/>
			</div>

			<div class="w-full lg:w-1/2 space-y-4">
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
						<Label class="block text-sm font-medium text-foreground mb-1.5"
							>Target Format</Label
						>
						<Select v-model="targetFormat">
							<SelectTrigger>
								<SelectValue placeholder="Select a format" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="image/jpeg">JPEG</SelectItem>
								<SelectItem value="image/png">PNG</SelectItem>
								<SelectItem value="image/webp">WEBP</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div v-if="targetFormat !== 'image/png'">
						<Label class="block text-sm font-medium text-foreground mb-1.5">
							Quality ({{ Math.round(quality * 100) }}%)
						</Label>
						<input
							type="range"
							min="0.1"
							max="1"
							step="0.1"
							v-model.number="quality"
							class="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
						/>
					</div>
				</div>

				<div class="flex gap-2 pt-2">
					<Button
						@click="handleConvert"
						:disabled="isProcessing"
						size="lg"
						:class="{
							'bg-emerald-600 hover:bg-emerald-500 text-white': showSuccess,
						}"
					>
						<RefreshCwIcon v-if="isProcessing" class="animate-spin w-4 h-4" />
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
					</Button>

					<Button variant="secondary" @click="reset" size="lg"> Reset </Button>
				</div>
			</div>
		</div>
	</div>

	<canvas ref="canvasRef" class="hidden"></canvas>
</template>
