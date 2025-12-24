<script setup lang="ts">
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuShortcut,
	DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { ArrowUpRightIcon, ChevronsUpDownIcon, HouseIcon, SettingsIcon, SearchIcon, XIcon } from "lucide-vue-next"
import { TOOLS } from "../constants/tools"
import { RouterLink, useRoute } from "vue-router"
import { useColorMode } from "@vueuse/core"
import { computed, ref } from "vue"
import { ToolCategory, type ToolDef } from "@/constants/types"
import ToolLayout from "./ToolLayout.vue"

const mode = useColorMode()
const route = useRoute()
const searchQuery = ref('')

const currentTool = computed(() => {
	return TOOLS.find((tool) => tool.link === route.path)
})

const groupedTools = computed(() => {
	const groups: Record<string, ToolDef[]> = {}
	const categories = Object.values(ToolCategory)

	categories.forEach((cat) => {
		const categoryTools = TOOLS.filter((t) => t.category === cat)
		if (categoryTools.length > 0) {
			groups[cat] = categoryTools
		}
	})

	return groups
})
</script>

<template>
	<SidebarProvider storage-key="browserbox-sidebar" class="flex min-h-screen">
		<Sidebar>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" class="hover:bg-transparent">
							<RouterLink to="/" class="text-4xl font-semibold">
								i💙Media
							</RouterLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton as-child>
									<RouterLink to="/"
										:class="{ 'text-primary dark:text-current dark:bg-background': route.fullPath == '/' }">
										<HouseIcon />
										<span>Dashboard</span>
									</RouterLink>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup v-for="(tools, group) in groupedTools" :key="group">
					<SidebarGroupLabel>{{ group }}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem v-for="tool in tools" :key="tool.id">
								<SidebarMenuButton as-child>
									<RouterLink :to="tool.link"
										:class="{ 'text-primary dark:text-current dark:bg-background': tool.link == route.fullPath }">
										<component :is="tool.icon"></component>
										<span>{{ tool.name }}</span>
									</RouterLink>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger as-child>
								<SidebarMenuButton>
									<SettingsIcon /> Settings
									<ChevronsUpDownIcon class="ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent side="top" class="w-(--reka-popper-anchor-width)">
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
									<DropdownMenuPortal>
										<DropdownMenuSubContent>
											<DropdownMenuItem @click="mode = 'light'">Light</DropdownMenuItem>
											<DropdownMenuItem @click="mode = 'dark'">Dark</DropdownMenuItem>
											<DropdownMenuItem @click="mode = 'auto'">System</DropdownMenuItem>
										</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<a class="flex-1" target="_blank"
										href="https://github.com/henryhale/">License</a>
									<DropdownMenuShortcut>
										<ArrowUpRightIcon />
									</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<a class="flex-1" target="_blank" href="https://github.com/henryhale/">Author</a>
									<DropdownMenuShortcut>
										<ArrowUpRightIcon />
									</DropdownMenuShortcut>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
		<SidebarInset>
			<header
				class="sticky z-20 top-0 left-0 right-0 bg-background flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[[collapsible=icon]]/sidebar-wrapper:h-12">
				<div class="flex items-center gap-2 px-4 w-full">
					<SidebarTrigger class="-ml-1" />
					<Separator orientation="vertical" class="w-10 bg-red-500" />
					<Breadcrumb v-if="currentTool" class="hidden sm:block">
						<BreadcrumbList>
							<BreadcrumbItem>
								<RouterLink to="/"> Home </RouterLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink as="span">
									{{ currentTool.name }}
								</BreadcrumbLink>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
					<div class="grow"></div>
					<div class="relative flex-1">
						<div class="relative group max-w-xl">
							<SearchIcon
								class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
							<Input class="px-10 text-sm" type="text" placeholder="Search tools..."
								v-model="searchQuery" />
							<span v-if="searchQuery" @click="searchQuery = ''"
								class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground">
								<XIcon class="w-4 h-4" />
							</span>
						</div>
					</div>
				</div>
			</header>
			<div class="container mx-auto p-4 md:p-8 lg:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div v-if="currentTool" class="flex items-center gap-4 mb-8">
					<div class="p-3 rounded-xl border shadow-sm bg-card text-primary border-border">
						<component :is="currentTool.icon" class="w-6 h-6" />
					</div>
					<div>
						<h1 class="text-3xl font-bold text-foreground">
							{{ currentTool.name }}
						</h1>
						<div class="flex items-center gap-2 mt-1">
							<span
								class="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-primary/20 text-primary">
								{{ currentTool.category }}
							</span>
							<span class="text-muted-foreground/40">•</span>
							<p class="text-sm italic text-muted-foreground">
								{{ currentTool.description }}
							</p>
						</div>
					</div>
				</div>

				<ToolLayout v-if="currentTool?.link == route.fullPath">
					<slot></slot>
				</ToolLayout>

				<slot v-else></slot>

				<div class="pt-16 pb-4 lg:pb-0 text-center text-sm font-normal opacity-40 grid gap-2">
					<span>Developed by i💙Media Team</span>
					<div class="flex gap-2 items-center justify-center">
						<span>Version 1.0.0</span>
						<span>|</span>
						<span>MIT Licence</span>
					</div>
				</div>
			</div>
		</SidebarInset>
	</SidebarProvider>
</template>
