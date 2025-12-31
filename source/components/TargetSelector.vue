<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

defineProps<{
	value: string
	options: string[]
}>()

const emit = defineEmits(["change"])
</script>
<template>
	<div class="space-y-2.5">
		<Label class="text-muted-foreground uppercase tracking-wider">Target Format</Label>
		<div class="flex flex-wrap gap-4">
			<Button
				v-for="opt in options"
				:key="opt"
				:variant="value == opt ? 'default' : 'outline'"
				@click="emit('change', opt)"
				class="uppercase border"
				>{{ opt }}</Button
			>
		</div>
	</div>
</template>
