<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchIcon, XIcon } from "lucide-vue-next"
import { Input } from "@/components/ui/input"
import { computed, ref } from "vue"
import { TOOLS } from "@/constants/tools"
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemSeparator,
	ItemTitle,
} from "@/components/ui/item"

const searchQuery = ref("")

const filteredTools = computed(() => {
	const query = searchQuery.value.toLowerCase()
	return TOOLS.filter(
		(tool) =>
			tool.name.toLowerCase().includes(query) ||
			tool.description.toLowerCase().includes(query) ||
			tool.category.toLowerCase().includes(query),
	)
})
</script>

<template>
	<Popover>
		<PopoverTrigger as-child>
			<div class="relative group max-w-xl w-full">
				<SearchIcon
					class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
				/>
				<Input
					class="px-10 text-sm"
					type="text"
					aria-label="Find a tool"
					placeholder="Find a tool..."
					v-model="searchQuery"
				/>
				<button
					v-if="searchQuery"
					type="button"
					aria-label="Clear search"
					@click="searchQuery = ''"
					class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
				>
					<XIcon class="w-4 h-4" />
				</button>
			</div>
		</PopoverTrigger>
		<PopoverContent v-if="searchQuery" class="mt-2">
			<ItemGroup v-if="searchQuery.length && filteredTools.length">
				<template v-for="(tool, index) in filteredTools" :key="tool.link">
					<Item as-child class="hover:text-primary">
						<RouterLink :to="tool.link" @click="searchQuery = ''">
							<ItemContent class="gap-1">
								<ItemTitle>{{ tool.name }}</ItemTitle>
								<ItemDescription>{{ tool.description }}</ItemDescription>
							</ItemContent>
						</RouterLink>
					</Item>
					<ItemSeparator v-if="index !== filteredTools.length - 1" />
				</template>
			</ItemGroup>
			<div v-if="searchQuery.length && !filteredTools.length">
				<p>No tools found.</p>
			</div>
		</PopoverContent>
	</Popover>
</template>
