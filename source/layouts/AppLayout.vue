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
						<SidebarMenuButton size="lg">
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<GalleryVerticalEnd class="size-4" />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">BrowserBox</span>
								<span class="truncate text-xs">FREE</span>
							</div>
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
									<RouterLink to="/">
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
									<RouterLink :to="tool.link">
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
										href="https://github.com/henryhale/browserbox">License</a>
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
				class="sticky z-10 top-0 left-0 right-0 bg-background flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[[collapsible=icon]]/sidebar-wrapper:h-12">
				<div class="flex items-center gap-2 px-4 w-full">
					<SidebarTrigger class="-ml-1" />
					<Separator orientation="vertical" />
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
								class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
							<Input class="px-10 text-sm" type="text" placeholder="Search tools..."
								v-model="searchQuery" />
							<span v-if="searchQuery" @click="searchQuery = ''"
								class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
								<XIcon class="w-4 h-4" />
							</span>
						</div>
					</div>
				</div>
			</header>
			<div class="container mx-auto p-4 md:p-8 lg:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div v-if="currentTool" class="flex items-center gap-4 mb-8">
					<div
						class="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-green-600 dark:text-green-400 shadow-sm">
						<component :is="currentTool.icon" class="w-6 h-6" />
					</div>
					<div>
						<h1 class="text-3xl font-bold text-gray-900 dark:text-white">
							{{ currentTool.name }}
						</h1>
						<div class="flex items-center gap-2 mt-1">
							<span
								class="text-xs font-bold uppercase tracking-widest text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">{{
									currentTool.category }}</span>
							<span class="text-gray-300 dark:text-gray-700">•</span>
							<p class="text-gray-500 dark:text-gray-400 text-sm italic">
								{{ currentTool.description }}
							</p>
						</div>
					</div>
				</div>

				<slot></slot>
				<div class="pt-16 pb-4 lg:pb-0 text-center text-sm font-normal opacity-40 grid gap-2">
					<span>Developed by BrowserBox Team</span>
					<div class="flex gap-2 items-center justify-center">
						<span>Version 1.2.0</span>
						<span>|</span>
						<span>Licence MIT</span>
					</div>
				</div>
			</div>
		</SidebarInset>
	</SidebarProvider>
</template>
