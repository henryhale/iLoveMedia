<script setup lang="ts">
defineProps<{
	title: string
	progress: number
}>()
</script>

<template>
	<div class="space-y-2">
		<div class="flex justify-between text-xs sm:text-sm font-medium text-muted-foreground">
			<span>{{ title }}</span>
			<span>{{ progress }}%</span>
		</div>
		<div class="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
			<div
				class="bg-primary h-full transition-all duration-300 ease-out"
				:style="{ width: progress + '%' }"
			></div>
		</div>
	</div>
</template>
