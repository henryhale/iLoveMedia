import * as tts from "@diffusionstudio/vits-web"

type IPayload = MessageEvent<
	tts.InferenceConfg & {
		type: "init" | "voices" | "error" | "flush" | "flushed"
	}
>

async function main(event: IPayload) {
	if (event.data.type === "voices") {
		self.postMessage({ type: "voices", voices: await tts.voices() })
		return
	}

	if (event.data.type === "flush") {
		await tts.flush()
		self.postMessage({ type: "flushed" })
		return
	}

	if (event.data?.type != "init") return

	tts.predict(
		{
			text: event.data.text,
			voiceId: event.data.voiceId,
		},
		(progress) => {
			self.postMessage({ type: "progress", progress })
		},
	)
		.then((res) => {
			if (res instanceof Blob) {
				self.postMessage({ type: "result", audio: res })
				return res
			}
		})
		.catch((error) => {
			self.postMessage({ type: "error", message: error.message, error })
		})
}

self.addEventListener("message", main)
