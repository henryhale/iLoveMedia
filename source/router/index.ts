import { createRouter, createWebHashHistory, isNavigationFailure } from "vue-router"
import AppView from "../views/AppView.vue"

const router = createRouter({
	history: createWebHashHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			meta: { title: "Home" },
			component: AppView,
		},
		{
			path: "/audio-recorder",
			meta: { title: "Audio Recoder" },
			component: () => import("../views/AudioRecorder.vue"),
		},
		{
			path: "/audio-converter",
			meta: { title: "Audio Converter" },
			component: () => import("../views/AudioConverter.vue"),
		},
		{
			path: "/background-remover",
			meta: { title: "Background Remover" },
			component: () => import("../views/BackgroundRemover.vue"),
		},
		{
			path: "/image-converter",
			meta: { title: "Image Converter" },
			component: () => import("../views/ImageConverter.vue"),
		},
		{
			path: "/ocr-tool",
			meta: { title: "Image to Text (OCR)" },
			component: () => import("../views/OcrTool.vue"),
		},
		{
			path: "/profile-picture-creator",
			meta: { title: "Profile Pic Creator" },
			component: () => import("../views/ProfilePictureCreator.vue"),
		},
		{
			path: "/qr-code-generator",
			meta: { title: "QR Code Studio" },
			component: () => import("../views/QrCodeGenerator.vue"),
		},
		{
			path: "/speech-to-text",
			meta: { title: "Speech to Text" },
			component: () => import("../views/SpeechToText.vue"),
		},
		{
			path: "/text-to-speech",
			meta: { title: "Text to Speech" },
			component: () => import("../views/TextToSpeech.vue"),
		},
	],
})

router.afterEach((to, from, failure) => {
	if (!isNavigationFailure(failure)) {
		document.title = to.meta.title ? `${to.meta.title} | BrowserBox` : "BrowserBox"
	}
	document.querySelector("#app")?.scrollTo(0, 0)
})

export default router
