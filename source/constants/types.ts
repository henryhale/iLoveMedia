import type { Component } from "vue"

export enum ToolCategory {
	IMAGE = "Image",
	TEXT = "Text",
	DATA = "Data",
	SECURITY = "Security",
	AUDIO = "Audio",
}

export interface ToolDef {
	link: string
	id: string
	name: string
	description: string
	icon: Component
	category: ToolCategory
}

export type FileState = {
	file: File
	previewUrl: string
	type: string
	size: number
} | null
