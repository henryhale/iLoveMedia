<script setup lang="ts">
import { ref } from "vue"
import { useObjectUrl } from "@vueuse/core"
import { PlayIcon, RefreshCwIcon, TrashIcon, DownloadIcon } from "lucide-vue-next"
import { Textarea } from "@/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "vue-sonner"
import { downloadFile } from "@/lib/helpers"
import Worker from "@/constants/vits-web-worker?worker"
import * as tts from "@diffusionstudio/vits-web"
import InputLabel from "./InputLabel.vue"

const text = ref("Welcome to iLoveMedia. What would you like me to read?")
const selectedVoice = ref("en_US-hfc_female-medium")
const voices = ref<{ key: string }[]>([])
const isFlushing = ref(false)
const isGenerating = ref(false)
const progress = ref<tts.Progress>({
	url: "",
	total: 100,
	loaded: 10,
})
const audioBlob = ref<Blob>()
const audioUrl = useObjectUrl(audioBlob)

type WorkerMessage =
	| { type: "voices"; voices: { key: string }[] }
	| { type: "flushed" }
	| { type: "error"; message: string }
	| { type: "progress"; progress: tts.Progress }
	| { type: "result"; audio: Blob }

const worker = new Worker()
worker.postMessage({ type: "voices" })
worker.onmessage = ({ data }: MessageEvent<WorkerMessage>) => {
	switch (data.type) {
		case "voices":
			voices.value = data.voices
			break
		case "flushed":
			isFlushing.value = false
			break
		case "error":
			isGenerating.value = false
			toast.error(data.message)
			console.error(data.message)
			break
		case "progress":
			progress.value = data.progress
			break
		case "result":
			audioBlob.value = data.audio
			isGenerating.value = false
	}
}

function flushStorage() {
	if (isFlushing.value) return
	worker.postMessage({ type: "flush" })
	isFlushing.value = true
	setTimeout(() => {
		window.location.reload()
	}, 2000)
}

function generate() {
	worker.postMessage({
		type: "init",
		text: text.value,
		voiceId: selectedVoice.value || "en_US-hfc_female-medium",
	})
	isGenerating.value = true
}

function downloadAudio() {
	if (!audioBlob.value) return
	downloadFile(audioBlob.value, `text-to-speech-${Date.now().toString(16)}.wav`)
}
</script>

<template>
	<!-- Left Column: Input and Controls -->
	<div class="lg:col-span-7 space-y-6">
		<div class="relative">
			<InputLabel>Input Text </InputLabel>
			<Textarea
				v-model="text"
				placeholder="Type something to hear it..."
				class="min-h-64 max-h-[50vh] p-4 field-sizing-content"
			></Textarea>
			<div class="absolute bottom-4 right-4 text-xs text-muted-foreground/60">
				{{ text.length }} characters
			</div>
		</div>

		<div class="flex gap-4">
			<Button @click="text.length && generate()" class="w-full" size="lg">
				<RefreshCwIcon v-if="isGenerating" class="w-5 h-5 animate-spin" />
				<PlayIcon v-else class="w-5 h-5" />
				{{
					isGenerating
						? `Generating audio (${Math.floor(progress.loaded / progress.total) * 100}%)...`
						: "Start Reading"
				}}
			</Button>
		</div>
	</div>

	<!-- Right Column: Settings -->
	<div class="lg:col-span-5 space-y-8">
		<!-- Voice Selection -->
		<div>
			<InputLabel> Choose a voice </InputLabel>

			<div class="max-h-75 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
				<Select v-if="voices.length > 0" v-model="selectedVoice" :disabled="!!isGenerating">
					<SelectTrigger>
						<SelectValue placeholder="Select a voice" class="capitalize" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem disabled value="-">Select a voice</SelectItem>
						<SelectItem
							v-for="(v, i) in voices"
							:key="i"
							:value="v.key"
							class="capitalize"
						>
							{{ v.key.split("-").slice(1).join(" - ") }}
						</SelectItem>
					</SelectContent>
				</Select>
				<p v-else class="text-xs lg:text-sm text-muted-foreground italic p-4 text-center">
					Voices are still loading.
				</p>
			</div>
		</div>

		<!-- Download & Cleanup  -->
		<div class="flex flex-col lg:flex-row lg:flex-wrap gap-4">
			<audio v-if="audioUrl" :src="audioUrl" autoplay controls class="w-full"></audio>
			<Button
				v-if="audioBlob"
				@click="downloadAudio"
				size="lg"
				class="bg-emerald-600 hover:bg-emerald-500 text-white"
			>
				<DownloadIcon class="w-5 h-5" />
				Download Audio (.wav)
			</Button>
			<div class="p-3 grow lg:w-full"></div>
			<Button
				v-if="voices.length"
				@click="flushStorage"
				:disabled="isFlushing"
				variant="ghost"
				size="lg"
			>
				<TrashIcon class="w-5 h-5" />
				{{ isFlushing ? "Clearing voices..." : "Clear downloaded voices" }}
			</Button>
		</div>
	</div>
</template>
