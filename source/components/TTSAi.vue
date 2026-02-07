<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue"
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

const text = ref("Welcome to iLoveMedia. Your privacy-first workspace.")
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
const audio = new Audio()

watchEffect((onCleanup) => {
	const blob = audioBlob.value
	if (!(blob instanceof Blob)) return
	if (audio.src) {
		URL.revokeObjectURL(audio.src)
	}
	const link = URL.createObjectURL(blob)
	audio.src = link
	audio.play()
	onCleanup(() => URL.revokeObjectURL(link))
})

let worker: Worker | null = null
onMounted(() => {
	worker = new Worker()

	// voices
	worker.postMessage({ type: "voices" })
	worker.addEventListener(
		"message",
		(event: MessageEvent<{ type: "voices"; voices: { key: string }[] }>) => {
			if (event.data.type !== "voices") return
			voices.value = event.data.voices
		},
	)

	// clear cache
	worker.addEventListener("message", (event: MessageEvent<{ type: "flushed" }>) => {
		if (event.data.type !== "flushed") return
		isFlushing.value = false
	})

	// error
	worker.addEventListener(
		"message",
		(event: MessageEvent<{ type: "error"; message: string }>) => {
			if (event.data.type !== "error") return
			isGenerating.value = false
			toast.error(event.data.message)
			console.error(event.data.message)
		},
	)

	// progress
	worker.addEventListener(
		"message",
		(event: MessageEvent<{ type: "progress"; progress: tts.Progress }>) => {
			if (event.data.type !== "progress") return
			progress.value = event.data.progress
		},
	)

	// result
	worker.addEventListener("message", (event: MessageEvent<{ type: "result"; audio: Blob }>) => {
		if (event.data.type != "result") return
		audioBlob.value = event.data.audio
		isGenerating.value = false
	})
})

async function flushStorage() {
	if (isFlushing.value) return
	const mainWorker = worker ?? new Worker()
	mainWorker.postMessage({ type: "flush" })
	isFlushing.value = true
	setTimeout(() => {
		window.location.reload()
	}, 2000)
}

async function generate() {
	const mainWorker = worker ?? new Worker()
	mainWorker.postMessage({
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
			<InputLabel> AI Voices </InputLabel>

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
					No AI voices found.
				</p>
			</div>
		</div>

		<!-- Download & Cleanup  -->
		<div class="flex flex-col lg:flex-row lg:flex-wrap gap-4">
			<audio v-if="audioBlob" :src="audio.src" controls class="w-full"></audio>
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
				{{ isFlushing ? "Deleting cached data..." : "Flush cached data" }}
			</Button>
		</div>
	</div>
</template>
