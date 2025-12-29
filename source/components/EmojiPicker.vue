<script setup lang="ts">
import { EMOJI_CATEGORIES } from "@/constants/emoji"
import { computed, ref, watchEffect } from "vue"
import twemoji from "twemoji"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const emit = defineEmits(["change"])

const native = ref(false)
const emoji = ref("🦊")
const activeCategory = ref("Smileys")
const currentCategory = computed(() =>
	EMOJI_CATEGORIES.find((cat) => cat.name === activeCategory.value),
)

const getImageURL = (emoji: string) => {
	const temp = document.createElement("span")
	temp.innerHTML = twemoji.parse(emoji, { folder: "svg", ext: ".svg" })
	const img = temp.querySelector("img")!
	return img.src
}

watchEffect(() => {
	if (emoji.value) {
		emit("change", native.value ? emoji.value : getImageURL(emoji.value))
	}
})
</script>

<template>
	<div class="space-y-3">
		<div
			class="flex flex-wrap items-center text-xs font-bold uppercase tracking-wider text-muted-foreground"
		>
			<Label class="grow block"> Choose Avatar Emoji </Label>
			<span class="flex items-center gap-3">
				Use local?
				<Switch v-model="native" />
			</span>
		</div>
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
					<span v-if="native">{{ e }}</span>
					<img v-else :src="getImageURL(e)" class="size-full" />
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
