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
import { ArrowUpRightIcon, ChevronsUpDownIcon, HouseIcon, SettingsIcon } from "lucide-vue-next"
import { TOOLS } from "../constants/tools"
import { RouterLink, useRoute } from "vue-router"
import { useColorMode } from "@vueuse/core"
import { computed } from "vue"
import { ToolCategory, type ToolDef } from "@/constants/types"
import ToolLayout from "./ToolLayout.vue"
import SearchBar from "@/components/SearchBar.vue"
import NavLink from "@/components/NavLink.vue"
import AppLoader from "@/components/AppLoader.vue"

const mode = useColorMode()
const route = useRoute()

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
							<RouterLink to="/" class="text-xl md:text-3xl font-semibold">
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
									<RouterLink
										to="/"
										:class="{
											'text-primary dark:text-current dark:bg-background':
												route.fullPath == '/',
										}"
									>
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
							<NavLink v-for="tool in tools" :key="tool.id" :tool="tool"> </NavLink>
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
											<DropdownMenuItem @click="mode = 'light'"
												>Light</DropdownMenuItem
											>
											<DropdownMenuItem @click="mode = 'dark'"
												>Dark</DropdownMenuItem
											>
											<DropdownMenuItem @click="mode = 'auto'"
												>System</DropdownMenuItem
											>
										</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<a
										class="flex-1"
										target="_blank"
										href="https://github.com/henryhale/iLoveMedia"
										>License</a
									>
									<DropdownMenuShortcut>
										<ArrowUpRightIcon />
									</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<a
										class="flex-1"
										target="_blank"
										href="https://henryhale.github.io/"
										>Author</a
									>
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
				class="sticky z-20 top-0 left-0 right-0 bg-background flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[[collapsible=icon]]/sidebar-wrapper:h-12"
			>
				<div class="flex items-center gap-x-4 px-4 w-full">
					<SidebarTrigger class="-ml-1" />
					<div v-if="currentTool" class="hidden sm:flex h-5">
						<Separator orientation="vertical" />
					</div>
					<div class="md:grow flex items-center">
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
						<span v-else class="font-bold text-xl md:hidden">i💙Media</span>
					</div>
					<div class="flex-1 grow flex justify-end">
						<SearchBar />
					</div>
				</div>
			</header>
			<div
				class="container mx-auto p-4 md:p-8 lg:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
			>
				<div v-if="currentTool" class="flex items-start lg:items-center gap-4 mb-8">
					<div class="p-3 rounded-xl border shadow-sm bg-card text-primary border-border">
						<component :is="currentTool.icon" class="w-6 h-6" />
					</div>
					<div>
						<h1 class="text-3xl font-bold text-foreground">
							{{ currentTool.name }}
						</h1>
						<div
							class="flex items-start md:items-center gap-2 mt-1 flex-col md:flex-row"
						>
							<span
								class="hidden lg:block text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-primary/20 text-primary"
							>
								{{ currentTool.category }}
							</span>
							<span class="text-muted-foreground/40 hidden lg:block">•</span>
							<p class="text-sm italic text-muted-foreground">
								{{ currentTool.description }}
							</p>
						</div>
					</div>
				</div>

				<ToolLayout v-if="currentTool?.link == route.fullPath">
					<slot>
						<AppLoader />
					</slot>
				</ToolLayout>

				<slot v-else>
					<AppLoader />
				</slot>

				<div
					class="pt-16 pb-4 lg:pb-0 text-center text-sm font-normal opacity-40 grid gap-2"
				>
					<span>Developed by i💙Media Authors</span>
					<div class="flex gap-2 items-center justify-center">
						<span>Free Forever</span>
						<span>|</span>
						<a
							href="https://github.com/henryhale/iLoveMedia/"
							class="underline underline-offset-2"
							>MIT Licence</a
						>
					</div>
				</div>
			</div>
		</SidebarInset>
	</SidebarProvider>
</template>
