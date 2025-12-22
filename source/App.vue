<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, markRaw } from "vue"
import { ToolCategory, ToolDef } from "./types"
import { RouterView, useRouter } from "vue-router"

// Icons
import {
	ImageIcon,
	FileTextIcon,
	KeyIcon,
	DatabaseIcon,
	ArrowRightIcon,
	HomeIcon,
	MenuIcon,
	XIcon,
	SunIcon,
	MoonIcon,
	SearchIcon,
	MicIcon,
	MusicIcon,
	FileCodeIcon,
	SmileIcon,
	UserIcon,
	Volume2Icon,
	WavesIcon,
	QrCodeIcon,
	AppWindowIcon,
	ScissorIcon,
	ScanIcon,
	GithubIcon,
	HelpCircleIcon,
	ChevronDownIcon,
} from "./components/Icon"

// --- State ---
const router = useRouter()
const activeToolId = ref<string | null>(null)
const isSidebarOpen = ref(false)
const theme = ref<"light" | "dark">("light")
const searchQuery = ref("")
const deferredPrompt = ref<any>(null)
const collapsedCategories = ref<Set<string>>(new Set())

// --- Static Data (The Tools List) ---
// We use markRaw so Vue doesn't proxy the component objects
const tools = computed<ToolDef[]>(() => [
	{
		id: "ocr-tool",
		name: "Image to Text (OCR)",
		description: "Convert scanned documents and images into editable text using AI.",
		icon: markRaw(ScanIcon),
		category: ToolCategory.IMAGE,
		component: markRaw(OcrTool),
	},
	{
		id: "bg-remover",
		name: "Background Remover",
		description: "AI-powered background removal directly in your browser.",
		icon: markRaw(ScissorIcon),
		category: ToolCategory.IMAGE,
		component: markRaw(BackgroundRemover),
	},
	{
		id: "image-converter",
		name: "Image Converter",
		description: "Convert images to PNG, JPEG, or WEBP instantly in your browser.",
		icon: markRaw(ImageIcon),
		category: ToolCategory.IMAGE,
		component: markRaw(ImageConverter),
	},
	{
		id: "qr-gen",
		name: "QR Code Studio",
		description: "Create high-resolution QR codes with custom colors and formats.",
		icon: markRaw(QrCodeIcon),
		category: ToolCategory.IMAGE,
		component: markRaw(QrCodeGenerator),
	},
	{
		id: "pfp-creator",
		name: "Profile Pic Creator",
		description: "Create unique emoji avatars with custom backgrounds and shapes.",
		icon: markRaw(UserIcon),
		category: ToolCategory.IMAGE,
		component: markRaw(ProfilePictureCreator),
	},
	{
		id: "tts",
		name: "Text to Speech",
		description: "Convert written text into natural human speech using local AI.",
		icon: markRaw(Volume2Icon),
		category: ToolCategory.AUDIO,
		component: markRaw(TextToSpeech),
	},
	{
		id: "stt",
		name: "Speech to Text",
		description: "Transcribe your voice recordings into text accurately in real-time.",
		icon: markRaw(WavesIcon),
		category: ToolCategory.AUDIO,
		component: markRaw(SpeechToText),
	},
	{
		id: "audio-recorder",
		name: "Audio Recorder",
		description: "Record audio from your microphone and download locally.",
		icon: markRaw(MicIcon),
		category: ToolCategory.AUDIO,
		component: markRaw(AudioRecorder),
	},
	{
		id: "audio-converter",
		name: "Audio Converter",
		description: "Convert audio formats (MP3, WAV, etc.) using FFmpeg WASM.",
		icon: markRaw(MusicIcon),
		category: ToolCategory.AUDIO,
		component: markRaw(AudioConverter),
	},
])

// --- Computed ---
const activeTool = computed(() => tools.value.find((t) => t.id === activeToolId.value))

const filteredTools = computed(() => {
	const lowerQuery = searchQuery.value.toLowerCase()
	return tools.value.filter(
		(tool) =>
			tool.name.toLowerCase().includes(lowerQuery) ||
			tool.description.toLowerCase().includes(lowerQuery) ||
			tool.category.toLowerCase().includes(lowerQuery),
	)
})

const groupedTools = computed(() => {
	const groups: Record<string, ToolDef[]> = {}
	const categories = Object.values(ToolCategory)

	categories.forEach((cat) => {
		const categoryTools = filteredTools.value.filter((t) => t.category === cat)
		if (categoryTools.length > 0) {
			groups[cat] = categoryTools
		}
	})
	return groups
})

// --- Methods ---
const toggleTheme = () => {
	const newTheme = theme.value === "light" ? "dark" : "light"
	theme.value = newTheme
	localStorage.setItem("theme", newTheme)
	syncTheme()
}

const syncTheme = () => {
	if (theme.value === "dark") {
		document.documentElement.classList.add("dark")
	} else {
		document.documentElement.classList.remove("dark")
	}
}

const toggleCategory = (category: string) => {
	if (collapsedCategories.value.has(category)) {
		collapsedCategories.value.delete(category)
	} else {
		collapsedCategories.value.add(category)
	}
}

const handleNavClick = (id: string | null) => {
	activeToolId.value = id
	isSidebarOpen.value = false
	searchQuery.value = ""
}

// --- Lifecycle ---
onMounted(() => {
	const savedTheme = localStorage.getItem("theme")
	if (
		savedTheme === "dark" ||
		(!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
	) {
		theme.value = "dark"
	} else {
		theme.value = "light"
	}
	syncTheme()
})
</script>

<template>
	<div
		class="h-screen bg-gray-50 dark:bg-gray-950 flex flex-row transition-colors duration-300 overflow-hidden"
	>
		<!-- Mobile Sidebar Backdrop -->
		<div
			v-if="isSidebarOpen"
			class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
			@click="isSidebarOpen = false"
		/>

		<!-- Sidebar -->
		<aside
			class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:flex flex-col h-screen shrink-0"
			:class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
		>
			<!-- Sidebar Header -->
			<div
				class="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-white dark:bg-gray-900 z-10"
			>
				<div class="flex items-center gap-2 cursor-pointer" @click="handleNavClick(null)">
					<div
						class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
					>
						B
					</div>
					<h1 class="text-xl font-bold text-gray-900 dark:text-white">BrowserBox</h1>
				</div>
				<button
					@click="isSidebarOpen = false"
					class="md:hidden p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
				>
					<XIcon class="w-6 h-6" />
				</button>
			</div>

			<!-- Sidebar Nav -->
			<nav class="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar scroll-smooth">
				<button
					@click="handleNavClick(null)"
					class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
					:class="
						activeToolId === null
							? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
							: 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
					"
				>
					<HomeIcon class="w-5 h-5" />
					Dashboard
				</button>

				<div
					v-for="[category, categoryTools] in Object.entries(groupedTools)"
					:key="category"
					class="pt-4 pb-1"
				>
					<button
						@click="toggleCategory(category)"
						class="w-full flex items-center justify-between px-4 mb-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] group hover:text-green-500 transition-colors"
					>
						<span>{{ category }} Tools</span>
						<svg
							class="w-3 h-3 transition-transform duration-200"
							:class="collapsedCategories.has(category) ? '-rotate-90' : 'rotate-0'"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth="3"
						>
							<path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</button>

					<div
						class="space-y-0.5 transition-all duration-300 overflow-hidden"
						:class="
							collapsedCategories.has(category)
								? 'max-h-0 opacity-0'
								: 'max-h-[1000px] opacity-100'
						"
					>
						<button
							v-for="tool in categoryTools"
							:key="tool.id"
							@click="handleNavClick(tool.id)"
							class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
							:class="
								activeToolId === tool.id
									? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
									: 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
							"
						>
							<span
								:class="
									activeToolId === tool.id
										? 'text-green-600 dark:text-green-400'
										: 'text-gray-400 dark:text-gray-500'
								"
							>
								<component :is="tool.icon" class="w-5 h-5" />
							</span>
							{{ tool.name }}
						</button>
					</div>
				</div>

				<div
					v-if="Object.keys(groupedTools).length === 0 && searchQuery"
					class="p-4 text-center text-xs text-gray-400 italic"
				>
					No tools match your search.
				</div>
			</nav>

			<!-- Sidebar Footer -->
			<div
				class="p-4 border-t border-gray-100 dark:border-gray-800 space-y-1 shrink-0 bg-white dark:bg-gray-900 mt-auto"
			>
				<button
					@click="toggleTheme"
					class="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
				>
					<span class="flex items-center gap-3">
						<SunIcon v-if="theme === 'light'" class="w-5 h-5" />
						<MoonIcon v-else class="w-5 h-5" />
						{{ theme === "light" ? "Light Mode" : "Dark Mode" }}
					</span>
					<span
						class="relative w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors"
					>
						<span
							class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform"
							:class="theme === 'dark' ? 'translate-x-4' : 'translate-x-0'"
						/>
					</span>
				</button>
			</div>
		</aside>

		<!-- Main Content -->
		<main
			class="flex-1 min-w-0 h-screen flex flex-col relative overflow-hidden bg-gray-50 dark:bg-gray-950"
		>
			<!-- Main Content Header -->
			<header
				class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-4 sticky top-0 z-30 shrink-0"
			>
				<button
					@click="isSidebarOpen = true"
					class="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md shrink-0"
				>
					<MenuIcon class="w-6 h-6" />
				</button>

				<div class="relative flex-1 max-w-xl">
					<div class="relative group">
						<SearchIcon
							class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors"
						/>
						<input
							type="text"
							placeholder="Search tools..."
							v-model="searchQuery"
							class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all text-sm"
						/>
						<button
							v-if="searchQuery"
							@click="searchQuery = ''"
							class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
						>
							<XIcon class="w-4 h-4" />
						</button>
					</div>

					<!-- Search Results Dropdown -->
					<div
						v-if="searchQuery"
						class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 max-h-[60vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
					>
						<template v-if="filteredTools.length > 0">
							<div
								class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"
							>
								Matching Tools
							</div>
							<button
								v-for="tool in filteredTools"
								:key="tool.id"
								@click="handleNavClick(tool.id)"
								class="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors group"
							>
								<div
									class="text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
								>
									<component :is="tool.icon" class="w-5 h-5" />
								</div>
								<div>
									<div class="font-medium text-gray-900 dark:text-white">
										{{ tool.name }}
									</div>
									<div
										class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] md:max-w-xs"
									>
										{{ tool.description }}
									</div>
								</div>
							</button>
						</template>
						<div v-else class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
							<p>No tools found for "{{ searchQuery }}"</p>
						</div>
					</div>
				</div>

				<div class="hidden md:flex items-center gap-1 lg:gap-3 ml-auto">
					<a
						href="#"
						@click.prevent="
							() => alert('Documentation and support portal coming soon!')
						"
						class="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
					>
						<HelpCircleIcon class="w-5 h-5" />
						<span class="hidden lg:inline">Support</span>
					</a>
					<a
						href="https://github.com"
						target="_blank"
						class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
					>
						<GithubIcon class="w-5 h-5" />
					</a>
					<div class="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>
					<button
						class="group flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
					>
						<div
							class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-500"
						>
							BB
						</div>
						<span class="hidden lg:inline">More</span>
						<ChevronDownIcon
							class="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
						/>
					</button>
				</div>
			</header>

			<!-- Main Content Body -->
			<div class="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
				<div class="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
					<!-- Tool View -->
					<div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
						<div class="mb-8">
							<button
								@click="router.back()"
								class="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 mb-2 flex items-center gap-1 md:hidden"
							>
								← Back to Dashboard
							</button>
							<div class="flex items-center gap-4 mb-2">
								<div
									class="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-green-600 dark:text-green-400 shadow-sm"
								>
									<component :is="activeTool.icon" class="w-6 h-6" />
								</div>
								<div>
									<h1 class="text-3xl font-bold text-gray-900 dark:text-white">
										{{ activeTool.name }}
									</h1>
									<div class="flex items-center gap-2 mt-1">
										<span
											class="text-xs font-bold uppercase tracking-widest text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded"
											>{{ activeTool.category }}</span
										>
										<span class="text-gray-300 dark:text-gray-700">•</span>
										<p class="text-gray-500 dark:text-gray-400 text-sm italic">
											{{ activeTool.description }}
										</p>
									</div>
								</div>
							</div>
						</div>
						<!-- Tool Component Injection -->
						<RouterView />
					</div>
				</div>
			</div>
		</main>
	</div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
	width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
	background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: #e2e8f0;
	border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
	background: #1f2937;
}
</style>
