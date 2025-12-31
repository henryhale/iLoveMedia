<script setup lang="ts">
import { RefreshCwIcon } from "lucide-vue-next"
import { Button } from "@/components/ui/button"

defineProps<{
	loading: boolean
	load: () => unknown
	textLoading: string
	textLoaded: string
}>()
</script>

<template>
	<div
		class="bg-background py-2 px-4 rounded-lg text-sm text-muted-foreground flex items-center gap-3 border border-border"
	>
		<RefreshCwIcon v-if="loading" class="w-4 h-4 animate-spin" />
		<span v-if="loading">{{ textLoading }}</span>
		<span v-if="!loading" class="grow">{{ textLoaded }}</span>
		<Button v-if="!loading" @click="load" variant="ghost">
			<RefreshCwIcon class="w-4 h-4" />
			Reload
		</Button>
	</div>
</template>
