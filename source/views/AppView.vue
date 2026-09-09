<script setup lang="ts">
import { ArrowRightIcon } from "lucide-vue-next"
import { RouterLink } from "vue-router"
import { TOOLS } from "../constants/tools"

const groupedTools = Object.groupBy(TOOLS, ({ category }) => category)
</script>

<template>
	<div class="flex flex-col gap-10 animate-in fade-in duration-500">
		<section class="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12">
			<div class="max-w-2xl">
				<h1 class="text-3xl md:text-5xl font-bold mb-4">Simple tools for your media</h1>
				<p class="text-lg md:text-xl leading-relaxed">
					Convert files, record audio or video, extract text from images, and create
					shareable graphics in one place.
				</p>
			</div>
		</section>

		<section
			v-for="(tools, category) in groupedTools"
			:key="category"
			class="flex flex-col gap-4"
		>
			<h2 class="text-2xl font-bold">{{ category }} tools</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<RouterLink
					v-for="tool in tools"
					:key="tool.link"
					:to="tool.link"
					class="group flex flex-col h-full rounded-2xl border bg-card p-6 text-card-foreground transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<div
						class="mb-4 flex size-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
					>
						<component :is="tool.icon" class="size-6" />
					</div>

					<h3 class="mb-2 text-lg font-bold group-hover:text-primary">
						{{ tool.name }}
					</h3>

					<p class="grow text-sm leading-relaxed text-muted-foreground">
						{{ tool.description }}
					</p>

					<span class="flex items-center gap-1 mt-6 text-sm font-semibold text-primary">
						Open <ArrowRightIcon class="size-4" />
					</span>
				</RouterLink>
			</div>
		</section>
	</div>
</template>
