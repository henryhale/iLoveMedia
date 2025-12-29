<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue"
import { ScanIcon, DownloadIcon, RefreshCwIcon, ImageIcon } from "lucide-vue-next"
import Tesseract from "tesseract.js"
import { toast } from "vue-sonner"
import {
	Select,
	SelectItem,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/CopyButton.vue"
import FeatureCards from "@/components/FeatureCards.vue"
import FilePicker from "@/components/FilePicker.vue"
import { downloadFile } from "@/lib/helpers"

const OCR_LANGUAGES = [
	{ code: "eng", name: "English" },
	{ code: "spa", name: "Spanish" },
	{ code: "fra", name: "French" },
	{ code: "deu", name: "German" },
	{ code: "chi_sim", name: "Chinese (Simp)" },
	{ code: "jpn", name: "Japanese" },
]

const imageFile = ref<File | null>(null)
const imageUrl = ref<string | null>(null)
const extractedText = ref("")
const isProcessing = ref(false)
const progress = ref(0)
const status = ref("")
const lang = ref("eng")

onBeforeUnmount(() => {
	if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
})

const handleFileChange = (file: File | undefined) => {
	if (file) {
		imageFile.value = file
		if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
		imageUrl.value = URL.createObjectURL(file)
		extractedText.value = ""
		progress.value = 0
		status.value = ""
	}
}

const handleOcr = async () => {
	if (!imageUrl.value) return

	isProcessing.value = true
	progress.value = 0
	status.value = "Initializing Tesseract..."

	try {
		const {
			data: { text },
		} = await Tesseract.recognize(imageUrl.value, lang.value, {
			logger: (m) => {
				if (m.status === "recognizing text") {
					progress.value = Math.round(m.progress * 100)
				}
				status.value = m.status
			},
		})

		extractedText.value = text
		status.value = "Complete"
	} catch (err) {
		console.error("OCR failed:", err)
		toast.error("Failed to generate text from image.")
		status.value = "Error: Failed to process image"
	} finally {
		isProcessing.value = false
	}
}

const handleDownload = () => {
	const blob = new Blob([extractedText.value], { type: "text/plain" })
	downloadFile(blob, `extracted-text-${Date.now().toString(16)}.txt`)
}

const reset = () => {
	imageFile.value = null
	imageUrl.value = null
	extractedText.value = ""
	isProcessing.value = false
	progress.value = 0
	status.value = ""
}

const features = [
	{
		title: "Zero Uploads",
		subtitle:
			"OCR engine runs entirely via WebAssembly. Your documents stay safe and private on your device.",
	},
	{
		title: "Multi-Language",
		subtitle:
			"Supports various languages including English, Spanish, French, and Japanese for diverse document types.",
	},
	{
		title: "Smart Extraction",
		subtitle:
			"Uses Tesseract AI to recognize text layout and characters with high accuracy for clear image sources.",
	},
]
</script>

<template>
	<div class="flex items-center justify-end gap-3 mb-8">
		<Label class="text-muted-foreground uppercase tracking-wider">Language</Label>
		<Select v-model="lang">
			<SelectTrigger>
				<SelectValue placeholder="Select language" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem v-for="l in OCR_LANGUAGES" :key="l.code" :value="l.code">
					{{ l.name }}
				</SelectItem>
			</SelectContent>
		</Select>
	</div>

	<!-- Dropzone -->
	<FilePicker
		v-if="!imageUrl"
		@change="handleFileChange"
		accept="image/*"
		:icon="ImageIcon"
		title="Drop image with text here"
		subtitle="or click to browse documents, photos, or screenshots"
		footer="Fast Local OCR"
	/>

	<!-- Preview & Result -->
	<div v-else class="space-y-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Left Side: Image Preview -->
			<div class="space-y-3">
				<label class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
					>Source Image</label
				>
				<div
					class="aspect-video bg-muted rounded-2xl border border-border overflow-hidden flex items-center justify-center relative shadow-inner"
				>
					<img
						:src="imageUrl"
						alt="Source"
						class="max-w-full max-h-full object-contain"
					/>

					<div
						v-if="isProcessing"
						class="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-foreground p-6 text-center"
					>
						<RefreshCwIcon class="w-10 h-10 animate-spin mb-4 text-primary" />
						<p class="font-bold text-lg capitalize">{{ status }}</p>
						<p v-if="progress > 0" class="text-sm text-muted-foreground">
							{{ progress }}% Complete
						</p>
						<div
							class="w-full max-w-xs h-1.5 bg-secondary rounded-full mt-4 overflow-hidden"
						>
							<div
								class="h-full bg-primary transition-all duration-300"
								:style="{ width: progress + '%' }"
							></div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Side: Extracted Text -->
			<div class="space-y-3 flex flex-col">
				<div class="flex justify-between items-center">
					<Label
						class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
					>
						Extracted Text
					</Label>
					<div v-if="extractedText" class="flex gap-4">
						<CopyButton :source="extractedText" />
					</div>
				</div>
				<div class="grow min-h-75 lg:min-h-0 relative group">
					<Textarea
						v-if="extractedText && !isProcessing"
						v-model="extractedText"
						:placeholder="
							isProcessing
								? 'Analyzing image...'
								: 'Extracted text will appear here...'
						"
						class="p-6 bg-background max-h-[70vh] text-foreground font-mono text-sm resize-none focus:outline-none placeholder:text-muted-foreground"
					></Textarea>

					<div
						v-if="!extractedText"
						class="absolute inset-0 bg-background flex flex-col items-center justify-center pointer-events-none opacity-30 rounded-2xl text-foreground"
					>
						<ScanIcon class="w-12 h-12 mb-2" />
						<p class="text-xs uppercase tracking-widest font-bold">Waiting for scan</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-border">
			<Button
				v-if="!extractedText"
				@click="handleOcr"
				:disabled="isProcessing"
				class="md:flex-1"
				size="lg"
			>
				<RefreshCwIcon v-if="isProcessing" class="w-5 h-5 animate-spin" />
				<ScanIcon v-else class="w-5 h-5" />
				{{ isProcessing ? `Processing...` : "Extract Text from Image" }}
			</Button>

			<Button
				v-else
				@click="handleDownload"
				size="lg"
				class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
			>
				<DownloadIcon class="w-5 h-5" />
				Download as .txt
			</Button>

			<Button variant="secondary" size="lg" @click="reset" :disabled="isProcessing">
				{{ extractedText ? "New Scan" : "Cancel" }}
			</Button>
		</div>
	</div>

	<!-- Feature Badges -->
	<FeatureCards :features="features" />
</template>
