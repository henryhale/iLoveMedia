<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue"
import { ScissorsIcon, DownloadIcon, RefreshCwIcon, ImageIcon } from "lucide-vue-next"
import { removeBackground } from "@imgly/background-removal"
import { toast } from "vue-sonner"
import FeatureCards from "@/components/FeatureCards.vue"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import FilePicker from "@/components/FilePicker.vue"
import { downloadFile } from "@/lib/helpers"

const originalFile = ref<File | null>(null)
const originalUrl = ref<string | null>(null)
const resultUrl = ref<string | null>(null)
const isProcessing = ref(false)
const progress = ref(0)

onBeforeUnmount(() => {
	if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
	if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
})

// Methods
const handleFileChange = (file: File | undefined) => {
	if (file) {
		if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
		if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
		originalFile.value = file
		originalUrl.value = URL.createObjectURL(file)
		resultUrl.value = null
		progress.value = 0
	}
}

const handleRemoveBackground = async () => {
	if (!originalUrl.value) {
		isProcessing.value = false
		progress.value = 0
		console.error("Failed to generate image path")
		toast.error("Failed to generate image path")
		return
	}

	isProcessing.value = true
	progress.value = 0

	try {
		const resultBlob = await removeBackground(originalUrl.value, {
			publicPath: window.location.origin + window.location.pathname + "/models/imgly/",
			progress: (key, current, total) => {
				const percent = Math.round((current / total) * 100)
				progress.value = percent
				console.log(`[${key}] ${percent}%`)
				toast.loading(`Removing background... ${percent}%`, { id: "bg-removal-progress" })
			},
		})

		const url = URL.createObjectURL(resultBlob)
		resultUrl.value = url

		toast.success("Background removal complete!", { id: "bg-removal-progress" })
	} catch (err) {
		console.error("Background removal failed:", err)
		toast.error(
			"Failed to process image. This tool requires a modern browser and may take a moment to initialize the AI model (~40MB).",
			{ id: "bg-removal-progress" },
		)
	} finally {
		isProcessing.value = false
	}
}

const handleDownload = () => {
	downloadFile(resultUrl.value, `background-removed-${Date.now().toString(16)}.png`)
}

const reset = () => {
	if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
	if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
	originalFile.value = null
	originalUrl.value = null
	resultUrl.value = null
	isProcessing.value = false
	progress.value = 0
}

const features = [
	{
		title: "100% Client-Side",
		subtitle: "Processing happens in your browser's RAM. No image data is ever uploaded.",
	},
	{
		title: "Edge AI Model",
		subtitle: "Uses a dedicated WASM-powered background removal model for precision masking.",
	},
	{
		title: "High Resolution",
		subtitle: "Exports your processed image as a full-resolution 32-bit PNG.",
	},
]
</script>

<template>
	<!-- Upload State -->
	<FilePicker
		v-if="!originalUrl"
		@change="handleFileChange"
		:icon="ImageIcon"
		accept="image/*"
		title="Drop your image here"
		subtitle="or click to browse local files"
		footer="Supports PNG, JPG, WEBP"
	/>

	<!-- Processing/Result State -->
	<div v-else class="space-y-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Left Side: Original -->
			<div class="space-y-3">
				<Label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">
					Original Image
				</Label>
				<div
					class="aspect-square bg-muted rounded-2xl border border-border overflow-hidden flex items-center justify-center relative"
				>
					<img
						:src="originalUrl"
						alt="Original"
						class="max-w-full max-h-full object-contain"
					/>

					<div
						v-if="isProcessing"
						class="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-foreground"
					>
						<RefreshCwIcon class="w-10 h-10 animate-spin mb-4 text-primary" />
						<p class="font-bold">Analyzing pixels...</p>
						<p class="text-xs text-muted-foreground">{{ progress }}% Complete</p>
						<div class="w-48 h-1.5 bg-secondary rounded-full mt-4 overflow-hidden">
							<div
								class="h-full bg-primary transition-all duration-300"
								:style="{ width: `${progress}%` }"
							></div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Side: Result -->
			<div class="space-y-3">
				<label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">
					Result (Transparent)
				</label>
				<div
					class="aspect-square pattern-checkered bg-muted/50 rounded-2xl border border-border overflow-hidden flex items-center justify-center"
				>
					<img
						v-if="resultUrl"
						:src="resultUrl"
						alt="Result"
						class="max-w-full max-h-full object-contain animate-in zoom-in duration-500"
					/>
					<div v-else class="text-center p-8">
						<ScissorsIcon class="w-12 h-12 text-muted/50 mx-auto mb-4" />
						<p class="text-sm text-muted-foreground font-medium">Ready to process</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-border">
			<Button
				v-if="!resultUrl"
				@click="handleRemoveBackground"
				:disabled="isProcessing"
				size="lg"
				class="md:flex-1"
			>
				<RefreshCwIcon v-if="isProcessing" class="w-5 h-5 animate-spin" />
				<ScissorsIcon v-else class="w-5 h-5" />
				{{ isProcessing ? `Removing Background (${progress}%)` : "Remove Background" }}
			</Button>

			<Button
				v-else
				@click="handleDownload"
				size="lg"
				class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
			>
				<DownloadIcon class="w-5 h-5" />
				Download Transparent PNG
			</Button>

			<Button @click="reset" :disabled="isProcessing" variant="secondary">
				{{ resultUrl ? "New Image" : "Reset" }}
			</Button>
		</div>
	</div>

	<!-- Feature Cards -->
	<FeatureCards :features="features" />
</template>
