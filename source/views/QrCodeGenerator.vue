<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import QRCode from "qrcode"
import { QrCodeIcon, DownloadIcon, RefreshCwIcon, CheckIcon } from "lucide-vue-next"

const PRESET_COLORS = ["#000000", "#4F46E5", "#EF4444", "#10B981", "#F59E0B", "#3B82F6", "#8B5CF6"]

// State (Replacing useState)
const text = ref("https://browserbox.app")
const fgColor = ref("#000000")
const bgColor = ref("#ffffff")
const errorLevel = ref<"L" | "M" | "Q" | "H">("M")
const margin = ref(4)
const size = ref(512)
const isDownloading = ref(false)

// Ref for the canvas element (Replacing useRef)
const canvasRef = ref<HTMLCanvasElement | null>(null)

// QR Generation Logic (Equivalent to the useCallback/useEffect combo)
const generateQr = async () => {
	if (!canvasRef.value || !text.value) return
	try {
		await QRCode.toCanvas(canvasRef.value, text.value, {
			width: size.value,
			margin: margin.value,
			errorCorrectionLevel: errorLevel.value,
			color: {
				dark: fgColor.value,
				light: bgColor.value,
			},
		})
	} catch (err) {
		console.error("QR Generation failed:", err)
	}
}

// Watch all dependencies for changes (Equivalent to useEffect deps)
watch([text, fgColor, bgColor, errorLevel, margin, size], () => {
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
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = `qrcode-${Date.now()}.svg`
			a.click()
			URL.revokeObjectURL(url)
		} catch (err) {
			console.error(err)
		}
	} else {
		const mimeType = format === "png" ? "image/png" : "image/jpeg"
		const url = canvas.toDataURL(mimeType, 1.0)
		const a = document.createElement("a")
		a.href = url
		a.download = `qrcode-${Date.now()}.${format}`
		a.click()
	}

	setTimeout(() => (isDownloading.value = false), 800)
}
</script>

<template>
	<div class="max-w-5xl mx-auto space-y-6">
		<div
			class="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors"
		>
			<div class="flex items-center gap-3 mb-8">
				<div
					class="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400"
				>
					<QrCodeIcon class="w-6 h-6" />
				</div>
				<div>
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white">QR Code Studio</h2>
					<p class="text-sm text-gray-500">Generate high-quality QR codes locally</p>
				</div>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
				<!-- Controls -->
				<div class="order-2 lg:order-1 lg:col-span-5 space-y-6">
					<div>
						<label
							class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
							>Content (URL or Text)</label
						>
						<textarea
							v-model="text"
							placeholder="https://example.com"
							class="w-full h-24 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none text-base"
						/>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label
								class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
								>Error Correction</label
							>
							<select
								v-model="errorLevel"
								class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
							>
								<option value="L">Low (7%)</option>
								<option value="M">Medium (15%)</option>
								<option value="Q">Quartile (25%)</option>
								<option value="H">High (30%)</option>
							</select>
						</div>
						<div>
							<label
								class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
								>Margin ({{ margin }}px)</label
							>
							<input
								type="range"
								min="0"
								max="20"
								step="1"
								v-model.number="margin"
								class="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600 mt-2.5"
							/>
						</div>
					</div>

					<div class="space-y-4">
						<div>
							<label
								class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3"
								>Foreground Color</label
							>
							<div class="flex flex-wrap gap-2 mb-3">
								<button
									v-for="c in PRESET_COLORS"
									:key="c"
									@click="fgColor = c"
									:style="{ backgroundColor: c }"
									:class="[
										'w-8 h-8 rounded-md border-2 transition-all',
										fgColor === c
											? 'border-green-500 scale-110 shadow-sm'
											: 'border-transparent',
									]"
								/>
								<input
									type="color"
									v-model="fgColor"
									class="w-8 h-8 rounded-md p-0 overflow-hidden cursor-pointer"
								/>
							</div>
						</div>

						<div>
							<label
								class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3"
								>Background Color</label
							>
							<div class="flex flex-wrap gap-2">
								<button
									@click="bgColor = '#ffffff'"
									:class="[
										'w-8 h-8 bg-white border-2 rounded-md',
										bgColor === '#ffffff'
											? 'border-green-500'
											: 'border-gray-200',
									]"
								/>
								<button
									@click="bgColor = '#00000000'"
									:class="[
										'w-8 h-8 border-2 rounded-md pattern-checkered-sm',
										bgColor === '#00000000'
											? 'border-green-500'
											: 'border-gray-200',
									]"
									title="Transparent"
								/>
								<input
									type="color"
									:value="bgColor === '#00000000' ? '#ffffff' : bgColor"
									@input="(e) => (bgColor = (e.target as HTMLInputElement).value)"
									class="w-8 h-8 rounded-md p-0 overflow-hidden cursor-pointer"
								/>
							</div>
						</div>
					</div>

					<div class="pt-6 border-t dark:border-gray-700 space-y-3">
						<label
							class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
							>Download formats</label
						>
						<div class="grid grid-cols-3 gap-2">
							<button
								@click="handleDownload('png')"
								class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-1 rounded-lg flex items-center justify-center gap-1 text-[10px] sm:text-xs transition-all active:scale-95 shadow-sm"
							>
								<DownloadIcon class="w-4 h-4" /> PNG
							</button>
							<button
								@click="handleDownload('svg')"
								class="bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white font-bold py-2 px-1 rounded-lg flex items-center justify-center gap-1 text-[10px] sm:text-xs transition-all active:scale-95 shadow-sm"
							>
								<DownloadIcon class="w-4 h-4" /> SVG
							</button>
							<button
								@click="handleDownload('jpeg')"
								class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-bold py-2 px-1 rounded-lg flex items-center justify-center gap-1 text-[10px] sm:text-xs transition-all active:scale-95 shadow-sm"
							>
								<DownloadIcon class="w-4 h-4" /> JPG
							</button>
						</div>
					</div>
				</div>

				<!-- Preview -->
				<div
					class="order-1 lg:order-2 lg:col-span-7 flex flex-col items-center justify-center"
				>
					<div
						class="w-full aspect-square bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-700 flex items-center justify-center p-4 sm:p-8 pattern-checkered relative overflow-hidden min-h-70"
					>
						<div
							class="bg-white p-2 sm:p-4 rounded-xl shadow-2xl animate-in zoom-in duration-500 flex items-center justify-center max-w-[85%] sm:max-w-full"
						>
							<canvas
								ref="canvasRef"
								class="max-w-full h-auto rounded-sm"
								style="width: 100%; max-width: 340px; height: auto"
							/>
						</div>

						<div
							class="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm z-10"
						>
							<span
								class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"
							></span>
							<span
								class="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 whitespace-nowrap"
								>Live Preview</span
							>
						</div>
					</div>

					<p
						class="mt-4 sm:mt-6 text-[10px] sm:text-xs text-gray-400 text-center max-w-sm px-4"
					>
						Error Correction Level: Higher levels allow the QR to be readable even if
						dirty or damaged, but makes the pattern denser.
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

.pattern-checkered-sm {
	background-image:
		linear-gradient(45deg, #ccc 25%, transparent 25%),
		linear-gradient(-45deg, #ccc 25%, transparent 25%),
		linear-gradient(45deg, transparent 75%, #ccc 75%),
		linear-gradient(-45deg, transparent 75%, #ccc 75%);
	background-size: 8px 8px;
	background-position:
		0 0,
		0 4px,
		4px -4px,
		-4px 0px;
}

:deep(.dark) .pattern-checkered {
	background-image:
		radial-gradient(#1e293b 1px, transparent 1px), radial-gradient(#1e293b 1px, transparent 1px);
}
</style>
