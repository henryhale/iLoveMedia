<script setup lang="ts">
import { EMOJI_CATEGORIES } from "@/constants/emoji"
import { computed, ref, watchEffect } from "vue"
import { Label } from "@/components/ui/label"

const emit = defineEmits<{ change: [emoji: string] }>()

const emoji = ref("😀")
const activeCategory = ref("Smileys")
const currentCategory = computed(() =>
	EMOJI_CATEGORIES.find((cat) => cat.name === activeCategory.value),
)

watchEffect(() => {
	if (emoji.value) emit("change", emoji.value)
})
</script>

<template>
	<div class="space-y-3">
		<Label class="grow block"> Choose Avatar Emoji </Label>
		<div class="bg-card border border-border rounded-xl overflow-hidden">
			<div class="flex border-b border-border overflow-x-auto no-scrollbar">
				<button
					v-for="cat in EMOJI_CATEGORIES"
					:key="cat.name"
					@click="activeCategory = cat.name"
					:class="[
						'px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors',
						activeCategory === cat.name
							? 'text-primary border-b-2 border-primary'
							: 'text-muted-foreground hover:text-foreground',
					]"
				>
					{{ cat.name }}
				</button>
			</div>
			<div class="p-3 grid grid-cols-6 gap-2 max-h-55 overflow-y-auto">
				<button
					v-for="(e, i) in currentCategory?.emojis ?? []"
					:key="i"
					@click="emoji = e"
					:class="[
						'w-10 h-10 text-xl flex items-center justify-center rounded-lg transition-all',
						emoji === e
							? 'bg-accent text-accent-foreground ring-2 ring-primary shadow-sm'
							: 'bg-transparent hover:bg-muted text-foreground',
					]"
				>
					{{ e }}
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
	display: none;
}

.no-scrollbar {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
</style>
