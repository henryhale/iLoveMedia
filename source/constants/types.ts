export enum ToolCategory {
	IMAGE = "Image",
	TEXT = "Text",
	DATA = "Data",
	SECURITY = "Security",
	AUDIO = "Audio",
}

export interface ToolDef {
	id: string
	name: string
	description: string
	icon: ReactNode
	category: ToolCategory
	component: ReactNode
}

export type FileState = {
	file: File
	previewUrl: string
	type: string
	size: number
} | null
