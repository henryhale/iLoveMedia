<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchIcon, XIcon } from "lucide-vue-next"
import { Input } from "@/components/ui/input"
import { computed, ref } from "vue"
import { TOOLS } from "@/constants/tools"
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
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
		<PopoverTrigger>
			<div class="relative group max-w-xl w-full">
				<SearchIcon
					class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
				/>
				<Input
					class="px-10 text-sm"
					type="text"
					placeholder="Search tools..."
					v-model="searchQuery"
				/>
				<span
					v-if="searchQuery"
					@click="searchQuery = ''"
					class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
				>
					<XIcon class="w-4 h-4" />
				</span>
			</div>
		</PopoverTrigger>
		<PopoverContent class="mt-2">
			<ItemGroup v-if="searchQuery.length && filteredTools.length">
				<template v-for="(tool, index) in filteredTools" :key="tool.id">
					<Item class="hover:text-primary" @click="searchQuery = ''">
						<RouterLink :to="tool.link">
							<!-- <ItemMedia>
                            <component :is="tool.icon"></component>
                        </ItemMedia> -->
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
