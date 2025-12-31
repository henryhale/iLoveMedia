<script setup lang="ts">
import { formatSize } from "@/lib/helpers"
import { XIcon } from "lucide-vue-next"
import type { Component } from "vue"
import { Button } from "@/components/ui/button"

defineProps<{
	icon: Component
	file: { name: string; size: number }
	disabled?: boolean
	reset: () => unknown
}>()
</script>

<template>
	<div
		class="flex flex-col lg:flex-row items-center gap-4 bg-secondary/30 py-10 px-6 lg:p-4 rounded-2xl border border-border"
	>
		<div class="text-primary bg-primary/10 p-4 rounded-2xl">
			<component :is="icon" class="size-8"></component>
		</div>
		<div class="flex-1 min-w-0 text-center lg:text-left">
			<p class="font-bold truncate line-clamp-1 max-w-[220px] lg:max-w-md">
				{{ file.name }}
			</p>
			<p class="text-sm text-muted-foreground">
				{{ formatSize(file.size) }}
			</p>
		</div>
		<Button
			@click="reset"
			variant="ghost"
			:disabled="!!disabled"
			class="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
		>
			<XIcon class="w-5 h-5" />
			Remove
		</Button>
	</div>
</template>
