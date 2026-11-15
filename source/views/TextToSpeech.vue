<script setup lang="ts">
import { ref } from "vue"
import TTSNative from "@/components/TTSNative.vue"
import TTSAi from "@/components/TTSAi.vue"

const engine = ref<"native" | "ai">("native")
</script>

<template>
	<div class="flex flex-col justify-between mb-8">
		<label
			class="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5"
		>
			Voice type
		</label>
		<div class="flex bg-muted p-1 rounded-xl max-w-max">
			<button
				@click="engine = 'native'"
				:class="[
					'px-4 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all',
					engine === 'native'
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground',
				]"
			>
				Device voices
			</button>
			<button
				@click="engine = 'ai'"
				:class="[
					'px-4 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all flex items-center gap-2',
					engine === 'ai'
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground',
				]"
			>
				Natural voices
			</button>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
		<TTSNative v-if="engine == 'native'" />
		<TTSAi v-else />
	</div>
</template>
