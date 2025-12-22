import { createRouter, createWebHashHistory } from "vue-router"
import AppView from "../views/AppView.vue"

const router = createRouter({
	history: createWebHashHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: AppView,
		},
		{
			path: "/audio-recorder",
			name: "audio-recoder",
			component: () => import("../views/AudioRecorder.vue"),
		},
		{
			path: "/audio-converter",
			name: "audio-converter",
			component: () => import("../views/AudioConverter.vue"),
		},
		{
			path: "/background-remover",
			name: "background-remover",
			component: () => import("../views/BackgroundRemover.vue"),
		},
		{
			path: "/image-converter",
			name: "image-converter",
			component: () => import("../views/ImageConverter.vue"),
		},
		{
			path: "/ocr-tool",
			name: "ocr-tool",
			component: () => import("../views/OcrTool.vue"),
		},
		{
			path: "/profile-picture-creator",
			name: "profile-picture-creator",
			component: () => import("../views/ProfilePictureCreator.vue"),
		},
		{
			path: "/qr-code-generator",
			name: "qr-code-generator",
			component: () => import("../views/QrCodeGenerator.vue"),
		},
		{
			path: "/speech-to-text",
			name: "speech-to-text",
			component: () => import("../views/SpeechToText.vue"),
		},
		{
			path: "/text-to-speech",
			name: "text-to-speech",
			component: () => import("../views/TextToSpeech.vue"),
		},
	],
})

export default router
