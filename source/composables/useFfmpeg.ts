import { ref } from "vue"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile } from "@ffmpeg/util"
import { useObjectUrl } from "@vueuse/core"
import coreURL from "@ffmpeg/core?url"
import wasmURL from "@ffmpeg/core/wasm?url"
import classWorkerURL from "@ffmpeg/ffmpeg/worker?worker&url"
import { toast } from "vue-sonner"

export function useFFmpeg() {
	const isLoaded = ref(false)
	const isLoading = ref(false)
	const isConverting = ref(false)
	const progress = ref(0)
	const convertedBlob = ref<Blob | null>(null)

	// Automatically manages URL.createObjectURL and revokeObjectURL
	const convertedURL = useObjectUrl(convertedBlob)

	const ffmpeg = new FFmpeg()

	const load = async () => {
		if (isLoaded.value) return

		isLoading.value = true

		ffmpeg.on("log", ({ message }) => {
			console.log("FFmpeg Log:", message)
		})

		ffmpeg.on("progress", ({ progress: p }) => {
			progress.value = Math.round(p * 100)
			toast.loading(`Processing...: ${progress.value}%`, {
				id: "ffmpeg-progress",
			})
		})

		try {
			toast.loading("Loading FFmpeg components...", { id: "ffmpeg-progress" })
			await ffmpeg.load({
				coreURL,
				wasmURL,
				classWorkerURL,
			})
			isLoaded.value = true
			toast.success("FFmpeg loaded successfully!", { id: "ffmpeg-progress" })
		} catch (err) {
			console.error("Failed to load FFmpeg:", err)
			toast.error("Failed to load FFmpeg components. Check browser security settings.", {
				id: "ffmpeg-progress",
			})
		} finally {
			isLoading.value = false
		}
	}

	const convert = async (file: File, targetType: "audio" | "video", targetFormat: string) => {
		if (!isLoaded.value) {
			await load()
			if (!isLoaded.value) return
		}

		isConverting.value = true
		progress.value = 0
		convertedBlob.value = null

		const inputName = file.name
		const outputName = `output.${targetFormat}`

		try {
			// Write file to FFmpeg Virtual File System
			await ffmpeg.writeFile(inputName, await fetchFile(file))

			// Run Command
			await ffmpeg.exec(["-i", inputName, outputName])

			// Read Result
			const data = (await ffmpeg.readFile(outputName)) as BlobPart

			// Update blob (triggers useObjectUrl to generate new URL)
			convertedBlob.value = new Blob([data], { type: `${targetType}/${targetFormat}` })

			// Notify user of completion
			toast.success("Conversion complete!", { id: "ffmpeg-progress" })
		} catch (err) {
			console.error("Conversion failed:", err)
			toast.error("Conversion failed. Check browser resource limits.", {
				id: "ffmpeg-progress",
			})
		} finally {
			isConverting.value = false
		}
	}

	const reset = () => {
		convertedBlob.value = null
		progress.value = 0
	}

	return {
		isLoaded,
		isLoading,
		isConverting,
		progress,
		convertedURL,
		load,
		convert,
		reset,
	}
}
