<script setup lang="ts">
import { ArrowRightIcon } from "lucide-vue-next"
import { RouterLink } from "vue-router"
import { TOOLS } from "../constants/tools"
</script>

<template>
	<div class="space-y-8 animate-in fade-in duration-500">
		<div
			class="bg-green-600 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg shadow-green-500/20"
		>
			<div class="max-w-2xl">
				<h1 class="text-3xl md:text-5xl font-bold mb-4">Serverless Tools.</h1>
				<p class="text-green-100 text-lg md:text-xl leading-relaxed">
					A collection of powerful utilities that run entirely in your browser. No
					uploads, no servers, no data tracking. 100% Private.
				</p>
			</div>
			<div
				class="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"
			></div>
			<div
				class="absolute bottom-0 left-0 w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"
			></div>
		</div>

		<div>
			<h2
				class="text-xl font-bold text-gray-900 dark:text-white mb-6 px-1 uppercase tracking-widest opacity-50"
			>
				Browser Capabilities
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<RouterLink
					v-for="tool in TOOLS"
					:key="tool.id"
					:to="tool.link"
					class="bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-transparent p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-500 hover:shadow-md transition-all text-left group flex flex-col h-full"
				>
					<div class="flex justify-between items-start mb-4">
						<div
							class="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-green-50 dark:group-hover:bg-green-900/30 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
						>
							<component :is="tool.icon" class="w-6 h-6" />
						</div>
						<span
							class="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-green-500 transition-colors"
							>{{ tool.category }}</span
						>
					</div>
					<h3
						class="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
					>
						{{ tool.name }}
					</h3>
					<p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 grow">
						{{ tool.description }}
					</p>
					<div
						class="flex items-center text-sm font-semibold text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300"
					>
						Launch Tool
						<ArrowRightIcon class="w-4 h-4 ml-1" />
					</div>
				</RouterLink>
			</div>
		</div>
	</div>
</template>
