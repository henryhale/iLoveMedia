<script setup lang="ts">
import { ArrowRightIcon } from "lucide-vue-next"
import { RouterLink } from "vue-router"
import { TOOLS } from "../constants/tools"
</script>

<template>
	<div class="space-y-8 animate-in fade-in duration-500">
		<div
			class="bg-primary rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg shadow-primary/20">
			<div class="max-w-2xl">
				<h1 class="text-3xl md:text-5xl font-bold mb-4">Serverless Tools.</h1>
				<p class="text-lg md:text-xl leading-relaxed">
					A collection of powerful utilities that run entirely in your browser. No
					uploads, no servers, no data tracking. 100% local and private.
				</p>
			</div>
			<div
				class="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2">
			</div>
			<div
				class="absolute bottom-0 left-0 w-64 h-64 bg-primary/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2">
			</div>
		</div>

		<div>
			<h2 class="text-xl font-bold mb-6 px-1 uppercase tracking-widest opacity-50">
				Browser Capabilities
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<RouterLink v-for="tool in TOOLS" :key="tool.id" :to="tool.link"
					class="group flex flex-col h-full rounded-xl border border-border bg-card p-6 text-card-foreground transition-all hover:border-primary/50 hover:shadow-md hover:bg-transparent">
					<div class="mb-4 flex items-start justify-between">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
							<component :is="tool.icon" class="h-6 w-6" />
						</div>
						<span
							class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-primary">
							{{ tool.category }}
						</span>
					</div>

					<h3 class="mb-2 text-lg font-bold transition-colors group-hover:text-primary">
						{{ tool.name }}
					</h3>

					<p class="grow text-sm leading-relaxed text-muted-foreground mb-6">
						{{ tool.description }}
					</p>

					<div
						class="flex -translate-x-2 items-center text-sm font-semibold text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
						Launch Tool
						<ArrowRightIcon class="ml-1 h-4 w-4" />
					</div>
				</RouterLink>
			</div>
		</div>
	</div>
</template>
