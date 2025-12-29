<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue"
import { DownloadIcon, RefreshCwIcon, CheckIcon } from "lucide-vue-next"
import { PRESET_COLORS } from "@/constants/emoji"
import { downloadFile } from "@/lib/helpers"
import { Button } from "@/components/ui/button"
import EmojiPicker from "@/components/EmojiPicker.vue"
import { useWindowSize } from "@vueuse/core"
import { toast } from "vue-sonner"

const emoji = ref()
const bgColor = ref("#4F46E5")
const shape = ref("circle")
const emojiSize = ref(120)
const rotation = ref(0)
const isDownloading = ref(false)
const showSuccess = ref(false)
const { width } = useWindowSize()
const canvasSize = computed(() => (width.value > 900 ? 512 : 256))

const canvasRef = ref<HTMLCanvasElement | null>(null)

const drawAvatar = () => {
	const canvas = canvasRef.value
	if (!canvas) return
	const ctx = canvas.getContext("2d")
	if (!ctx) return

	const size = canvasSize.value
	canvas.width = size
	canvas.height = size

	// Clear
	ctx.clearRect(0, 0, size, size)

	// Draw background
	ctx.fillStyle = bgColor.value
	if (shape.value === "circle") {
		ctx.beginPath()
		ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
		ctx.fill()
	} else {
		ctx.fillRect(0, 0, size, size)
	}

	// Draw Emoji
	ctx.save()
	ctx.rotate((rotation.value * Math.PI) / 180)
	ctx.translate(size / 2, size / 2)
	ctx.textAlign = "center"
	ctx.textBaseline = "middle"
	ctx.font = `${emojiSize.value * 2}px serif`
	ctx.fillText(emoji.value, 0, 10)
	ctx.restore()
}

onMounted(() => {
	drawAvatar()
})

watch([emoji, bgColor, shape, emojiSize, rotation], () => {
	drawAvatar()
})

const handleDownload = () => {
	const canvas = canvasRef.value
	if (!canvas) return
	isDownloading.value = true

	try {
		downloadFile(canvas.toDataURL("image/png"), `avatar-${Date.now().toString(16)}.png`)
		showSuccess.value = true
	} catch (err) {
		console.error(err)
		toast.error("Failed to generate profile picture.")
	}

	setTimeout(() => {
		isDownloading.value = false
		showSuccess.value = false
	}, 1500)
}
</script>

<template>
	<div class="grid grid-cols-1 xl:grid-cols-12 gap-10">
		<!-- Controls -->
		<div class="lg:col-span-5 space-y-8">
			<!-- Shape & Rotation -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div>
					<label
						class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
					>
						Background Shape
					</label>
					<div class="flex bg-muted p-1 rounded-lg">
						<button
							@click="shape = 'circle'"
							:class="[
								'flex-1 py-2 text-sm font-medium rounded-md transition-all',
								shape === 'circle'
									? 'bg-background text-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground',
							]"
						>
							Circle
						</button>
						<button
							@click="shape = 'square'"
							:class="[
								'flex-1 py-2 text-sm font-medium rounded-md transition-all',
								shape === 'square'
									? 'bg-background text-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground',
							]"
						>
							Square
						</button>
					</div>
				</div>
				<div>
					<label
						class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
					>
						Rotation ({{ rotation }}°)
					</label>
					<input
						type="range"
						min="-180"
						max="180"
						v-model.number="rotation"
						class="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary mt-3"
					/>
				</div>
			</div>

			<!-- Background Color -->
			<div>
				<label
					class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3"
				>
					Background Color
				</label>
				<div class="flex flex-wrap gap-3 mb-3">
					<button
						v-for="color in PRESET_COLORS"
						:key="color"
						@click="bgColor = color"
						:style="{ backgroundColor: color }"
						:class="[
							'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95',
							bgColor === color
								? 'border-primary ring-2 ring-ring ring-offset-2 ring-offset-background'
								: 'border-border',
						]"
					></button>
					<div class="relative">
						<input
							type="color"
							v-model="bgColor"
							class="w-8 h-8 rounded-full border-2 border-border cursor-pointer overflow-hidden p-0 bg-transparent"
						/>
					</div>
				</div>
			</div>

			<!-- Emoji Picker -->
			<EmojiPicker
				@change="
					(e) => {
						emoji = e
					}
				"
			/>

			<div>
				<label
					class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
				>
					Emoji Size ({{ emojiSize }}px)
				</label>
				<input
					type="range"
					min="40"
					:max="Math.floor(canvasSize / 3)"
					v-model.number="emojiSize"
					class="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
				/>
			</div>

			<Button
				size="lg"
				@click="handleDownload"
				:class="[
					'w-full',
					showSuccess ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : '',
				]"
			>
				<RefreshCwIcon v-if="isDownloading" class="w-5 h-5 animate-spin" />
				<CheckIcon v-else-if="showSuccess" class="w-5 h-5" />
				<DownloadIcon v-else class="w-5 h-5" />
				{{ showSuccess ? "Saved to Downloads" : "Download Profile Picture" }}
			</Button>
		</div>

		<!-- Preview Area -->
		<div class="lg:col-span-7 flex flex-col items-center">
			<div
				class="w-full aspect-square bg-muted/50 rounded-3xl border border-border flex items-center justify-center sm:p-8 p-1 pattern-checkered relative"
			>
				<canvas
					ref="canvasRef"
					class="sm:max-w-full sm:h-auto scale-75 sm:scale-100 rounded-lg bg-transparent transition-all duration-300"
					style="width: 380px; height: 380px"
				></canvas>

				<div
					class="absolute top-4 right-4 flex items-center gap-2 bg-background/90 backdrop-blur px-3 py-1.5 rounded-full border border-border shadow-sm"
				>
					<span class="w-2 h-2 rounded-full bg-primary"></span>
					<span
						class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
					>
						{{ canvasSize }} x {{ canvasSize }} Canvas
					</span>
				</div>
			</div>

			<div class="mt-8 p-4 max-w-lg text-center">
				<p class="text-sm text-muted-foreground font-medium">
					Perfect for Slack, Discord, or GitHub! Customize your background and character
					without any complex software.
				</p>
			</div>
		</div>
	</div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
	display: none;
}

.no-scrollbar {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
</style>
