<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import QRCode from "qrcode"
import { DownloadIcon } from "lucide-vue-next"
import { toast } from "vue-sonner"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { downloadFile } from "@/lib/helpers"

const PRESET_COLORS = ["#000000", "#4F46E5", "#EF4444", "#10B981", "#F59E0B", "#3B82F6", "#8B5CF6"]

const text = ref(window.location.origin)
const fgColor = ref("#000000")
const bgColor = ref("#ffffff")
const errorLevel = ref<"L" | "M" | "Q" | "H">("M")
const margin = ref(4)
const isDownloading = ref(false)

const canvasRef = ref<HTMLCanvasElement | null>(null)

const generateQr = async () => {
	if (!canvasRef.value || !text.value) return
	try {
		await QRCode.toCanvas(canvasRef.value, text.value, {
			width: canvasRef.value.width,
			margin: margin.value,
			errorCorrectionLevel: errorLevel.value,
			color: {
				dark: fgColor.value,
				light: bgColor.value,
			},
		})
	} catch (err) {
		console.error("QR Generation failed:", err)
		toast.error("Failed to generate QR Code.")
	}
}

watch([text, fgColor, bgColor, errorLevel, margin], () => {
	generateQr()
})

// Initial draw
onMounted(() => {
	generateQr()
})

const handleDownload = async (format: "png" | "jpeg" | "svg") => {
	isDownloading.value = true
	const canvas = canvasRef.value
	if (!canvas) return

	if (format === "svg") {
		try {
			const svgString = await QRCode.toString(text.value, {
				type: "svg",
				margin: margin.value,
				errorCorrectionLevel: errorLevel.value,
				color: { dark: fgColor.value, light: bgColor.value },
			})
			const blob = new Blob([svgString], { type: "image/svg+xml" })
			downloadFile(blob, `qrcode-${Date.now().toString(16)}.svg`)
		} catch (err) {
			console.error(err)
		}
	} else {
		const mimeType = format === "png" ? "image/png" : "image/jpeg"
		const url = canvas.toDataURL(mimeType, 1.0)
		downloadFile(url, `qrcode-${Date.now().toString(16)}.${format}`)
	}

	setTimeout(() => (isDownloading.value = false), 800)
}
</script>

<template>
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
		<!-- Controls -->
		<div class="order-2 lg:order-1 lg:col-span-5 space-y-6">
			<div>
				<Label
					class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
				>
					Content (URL or Text)
				</Label>
				<Textarea
					v-model="text"
					placeholder="https://example.com"
					class="w-full h-24 p-4 resize-none text-base !bg-background"
				></Textarea>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<Label
						class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
					>
						Error Correction
					</Label>
					<Select v-model="errorLevel">
						<SelectTrigger>
							<SelectValue placeholder="Select error level" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="L">Low (7%)</SelectItem>
							<SelectItem value="M">Medium (15%)</SelectItem>
							<SelectItem value="Q">Quartile (25%)</SelectItem>
							<SelectItem value="H">High (30%)</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label
						class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
					>
						Margin ({{ margin }}px)
					</Label>
					<input
						type="range"
						min="0"
						max="20"
						step="1"
						v-model.number="margin"
						class="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary mt-2.5"
					/>
				</div>
			</div>

			<div class="space-y-4">
				<div>
					<Label
						class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3"
					>
						Foreground Color
					</Label>
					<div class="flex flex-wrap gap-2 mb-3">
						<button
							v-for="c in PRESET_COLORS"
							:key="c"
							@click="fgColor = c"
							:style="{ backgroundColor: c }"
							:class="[
								'w-8 h-8 rounded-md border transition-all ring-offset-background',
								fgColor === c ? 'ring-2 ring-ring ring-offset-2' : 'border-input',
							]"
						></button>
						<input
							type="color"
							v-model="fgColor"
							class="w-8 h-8 rounded-md p-0 overflow-hidden cursor-pointer border border-input"
						/>
					</div>
				</div>

				<div>
					<Label
						class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3"
					>
						Background Color
					</Label>
					<div class="flex flex-wrap gap-2">
						<button
							@click="bgColor = '#ffffff'"
							:class="[
								'w-8 h-8 bg-white border rounded-md ring-offset-background',
								bgColor === '#ffffff'
									? 'ring-2 ring-ring ring-offset-2'
									: 'border-input',
							]"
						></button>
						<button
							@click="bgColor = '#00000000'"
							:class="[
								'w-8 h-8 border rounded-md pattern-checkered-sm ring-offset-background',
								bgColor === '#00000000'
									? 'ring-2 ring-ring ring-offset-2'
									: 'border-input',
							]"
							title="Transparent"
						></button>
						<input
							type="color"
							:value="bgColor === '#00000000' ? '#ffffff' : bgColor"
							@input="(e: Event) => (bgColor = (e.target as HTMLInputElement).value)"
							class="w-8 h-8 rounded-md p-0 overflow-hidden cursor-pointer border border-input"
						/>
					</div>
				</div>
			</div>

			<div class="pt-6 border-t border-border space-y-3">
				<Label
					class="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
				>
					Download formats
				</Label>
				<div class="grid grid-cols-3 gap-2">
					<Button size="lg" @click="handleDownload('png')">
						<DownloadIcon class="w-4 h-4" /> PNG
					</Button>
					<Button size="lg" @click="handleDownload('svg')" variant="secondary">
						<DownloadIcon class="w-4 h-4" /> SVG
					</Button>
					<Button @click="handleDownload('jpeg')" variant="secondary">
						<DownloadIcon class="w-4 h-4" /> JPG
					</Button>
				</div>
			</div>
		</div>

		<!-- Preview -->
		<div class="order-1 lg:order-2 lg:col-span-7 flex flex-col items-center justify-center">
			<div
				class="w-full aspect-square bg-muted/50 rounded-3xl border border-border flex items-center justify-center p-4 sm:p-8 pattern-checkered relative overflow-hidden min-h-70"
			>
				<div
					class="bg-card text-card-foreground p-2 sm:p-4 rounded-xl shadow-2xl animate-in zoom-in duration-500 flex items-center justify-center max-w-[85%] sm:max-w-full"
				>
					<canvas
						ref="canvasRef"
						class="max-w-full h-auto rounded-sm"
						style="width: 100%; max-width: 340px; height: auto"
					></canvas>
				</div>

				<div
					class="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 bg-background/90 backdrop-blur px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-border shadow-sm z-10"
				>
					<span
						class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"
					></span>
					<span
						class="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap"
					>
						Live Preview
					</span>
				</div>
			</div>

			<p
				class="mt-4 sm:mt-6 text-[10px] sm:text-xs text-muted-foreground text-center max-w-xl px-4"
			>
				Error Correction Level: Higher levels allow the QR to be readable even if dirty or
				damaged, but makes the pattern denser.
			</p>
		</div>
	</div>
</template>

<style scoped>
.pattern-checkered-sm {
	background-image:
		linear-gradient(45deg, var(--color-accent) 25%, transparent 25%),
		linear-gradient(-45deg, var(--color-accent) 25%, transparent 25%),
		linear-gradient(45deg, transparent 75%, var(--color-accent) 75%),
		linear-gradient(-45deg, transparent 75%, var(--color-accent) 75%);
	background-size: 8px 8px;
	background-position:
		0 0,
		0 4px,
		4px -4px,
		-4px 0px;
}
</style>
