<script setup lang="ts">
import { ArrowRightIcon } from "lucide-vue-next"
import { RouterLink } from "vue-router"
import { TOOLS } from "../constants/tools"
import SnowFall from "@/components/SnowFall.vue"
</script>

<template>
	<SnowFall />
	<div class="space-y-8 animate-in fade-in duration-500">
		<div class="bg-primary banner rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg shadow-primary/20">
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
					class="z-10 group flex flex-col h-full rounded-xl border border-border bg-card p-6 text-card-foreground transition-all hover:border-primary/50 hover:shadow-md hover:bg-transparent hover:backdrop-filter hover:backdrop-blur-sm">
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

<style scoped>
.banner {
	background-position: right;
	background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23fcfcfc' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
}
</style>