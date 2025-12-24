<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue"
import { UserIcon, DownloadIcon, RefreshCwIcon, CheckIcon } from "lucide-vue-next"
import { EMOJI_CATEGORIES, PRESET_COLORS } from "@/constants/emoji"

// Reactive State
const emoji = ref("🦊")
const bgColor = ref("#4F46E5")
const shape = ref("circle")
const emojiSize = ref(120)
const rotation = ref(0)
const activeCategory = ref("Smileys")
const isDownloading = ref(false)
const showSuccess = ref(false)

// Ref for Canvas (useRef equivalent)
const canvasRef = ref<HTMLCanvasElement|null>(null)

// Logic: Computed property for filtering emojis
const currentCategory = computed(() =>
	EMOJI_CATEGORIES.find((cat) => cat.name === activeCategory.value),
)

// Logic: Drawing the Avatar
const drawAvatar = () => {
	const canvas = canvasRef.value
	if (!canvas) return
	const ctx = canvas.getContext("2d")
	if (!ctx) return

	const size = 512
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
	ctx.translate(size / 2, size / 2)
	ctx.rotate((rotation.value * Math.PI) / 180)
	ctx.textAlign = "center"
	ctx.textBaseline = "middle"
	ctx.font = `${emojiSize.value * 2}px serif`
	ctx.fillText(emoji.value, 0, 5)
	ctx.restore()
}

// Lifecycle: useEffect equivalent
onMounted(() => {
	drawAvatar()
})

// Watch for changes to redraw (Dependency array equivalent)
watch([emoji, bgColor, shape, emojiSize, rotation], () => {
	drawAvatar()
})

const handleDownload = () => {
	const canvas = canvasRef.value
	if (!canvas) return
	isDownloading.value = true

	const link = document.createElement("a")
	link.download = `avatar-${Date.now()}.png`
	link.href = canvas.toDataURL("image/png")
	link.click()

	showSuccess.value = true
	setTimeout(() => {
		isDownloading.value = false
		showSuccess.value = false
	}, 2000)
}
</script>

<template>
	<div class="max-w-5xl mx-auto space-y-6">
		<div
			class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors"
		>
			<h2
				class="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"
			>
				<UserIcon class="w-5 h-5 text-green-600 dark:text-green-400" />
				Profile Picture Creator
			</h2>

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
				<!-- Controls -->
				<div class="lg:col-span-5 space-y-8">
					<!-- Shape & Rotation -->
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label
								class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
							>
								Background Shape
							</label>
							<div class="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
								<button
									@click="shape = 'circle'"
									:class="[
										'flex-1 py-2 text-sm font-medium rounded-md transition-all',
										shape === 'circle'
											? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
											: 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200',
									]"
								>
									Circle
								</button>
								<button
									@click="shape = 'square'"
									:class="[
										'flex-1 py-2 text-sm font-medium rounded-md transition-all',
										shape === 'square'
											? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
											: 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200',
									]"
								>
									Square
								</button>
							</div>
						</div>
						<div>
							<label
								class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
							>
								Rotation ({{ rotation }}°)
							</label>
							<input
								type="range"
								min="-180"
								max="180"
								v-model.number="rotation"
								class="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600 mt-3"
							/>
						</div>
					</div>

					<!-- Background Color -->
					<div>
						<label
							class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3"
							>Background Color</label
						>
						<div class="flex flex-wrap gap-3 mb-3">
							<button
								v-for="color in PRESET_COLORS"
								:key="color"
								@click="bgColor = color"
								:style="{ backgroundColor: color }"
								:class="[
									'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95',
									bgColor === color
										? 'border-green-500 ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-800'
										: 'border-white dark:border-gray-600',
								]"
							/>
							<div class="relative">
								<input
									type="color"
									v-model="bgColor"
									class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-600 cursor-pointer overflow-hidden p-0"
								/>
							</div>
						</div>
					</div>

					<!-- Emoji Picker -->
					<div>
						<label
							class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3"
							>Choose Avatar Emoji</label
						>
						<div
							class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
						>
							<div
								class="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar"
							>
								<button
									v-for="cat in EMOJI_CATEGORIES"
									:key="cat.name"
									@click="activeCategory = cat.name"
									:class="[
										'px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors',
										activeCategory === cat.name
											? 'text-green-600 border-b-2 border-green-600'
											: 'text-gray-500 hover:text-gray-700',
									]"
								>
									{{ cat.name }}
								</button>
							</div>
							<div class="p-3 grid grid-cols-6 gap-2 max-h-55 overflow-y-auto">
								<button
									v-for="e in currentCategory?.emojis"
									:key="e"
									@click="emoji = e"
									:class="[
										'w-10 h-10 text-xl flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all',
										emoji === e
											? 'bg-white dark:bg-gray-800 ring-2 ring-green-500 shadow-sm'
											: 'bg-transparent',
									]"
								>
									{{ e }}
								</button>
							</div>
						</div>
					</div>

					<div>
						<label
							class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
							>Emoji Size ({{ emojiSize }}px)</label
						>
						<input
							type="range"
							min="40"
							max="240"
							v-model.number="emojiSize"
							class="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
						/>
					</div>

					<button
						@click="handleDownload"
						:class="[
							'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98]',
							showSuccess
								? 'bg-emerald-600 text-white'
								: 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20',
						]"
					>
						<RefreshCwIcon v-if="isDownloading" class="w-5 h-5 animate-spin" />
						<CheckIcon v-else-if="showSuccess" class="w-5 h-5" />
						<DownloadIcon v-else class="w-5 h-5" />
						{{ showSuccess ? "Saved to Downloads" : "Download Profile Picture" }}
					</button>
				</div>

				<!-- Preview Area -->
				<div class="lg:col-span-7 flex flex-col items-center">
					<div
						class="w-full aspect-square bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-700 flex items-center justify-center p-8 pattern-checkered relative"
					>
						<canvas
							ref="canvasRef"
							class="max-w-full h-auto rounded-lg shadow-2xl bg-white dark:bg-gray-800 transition-all duration-300"
							style="width: 380px; height: 380px"
						/>

						<div
							class="absolute top-4 right-4 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
						>
							<span class="w-2 h-2 rounded-full bg-green-500"></span>
							<span
								class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
								>512 x 512 Canvas</span
							>
						</div>
					</div>

					<div
						class="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30 max-w-md text-center"
					>
						<p class="text-sm text-green-700 dark:text-green-300 font-medium">
							Perfect for Slack, Discord, or GitHub! Customize your background and
							character without any complex software.
						</p>
					</div>
				</div>
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

.pattern-checkered {
	background-image:
		radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px);
	background-position:
		0 0,
		10px 10px;
	background-size: 20px 20px;
}

:global(.dark) .pattern-checkered {
	background-image:
		radial-gradient(#1e293b 1px, transparent 1px), radial-gradient(#1e293b 1px, transparent 1px);
}
</style>
