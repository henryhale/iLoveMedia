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
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { ChevronsUpDownIcon, HouseIcon, SunMoonIcon } from "lucide-vue-next"
import { TOOLS } from "../constants/tools"
import { RouterLink, useRoute } from "vue-router"
import { useColorMode } from "@vueuse/core"
import { computed } from "vue"
import SearchBar from "@/components/SearchBar.vue"
import NavLink from "@/components/NavLink.vue"

const mode = useColorMode()
const route = useRoute()

const currentTool = computed(() => {
	return TOOLS.find((tool) => tool.link === route.path)
})

const groupedTools = Object.groupBy(TOOLS, ({ category }) => category)
</script>

<template>
	<SidebarProvider class="flex min-h-screen">
		<Sidebar>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton as-child size="lg" class="hover:bg-transparent">
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
								<SidebarMenuButton as-child :is-active="route.fullPath === '/'">
									<RouterLink to="/">
										<HouseIcon />
										<span>All tools</span>
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
							<NavLink v-for="tool in tools" :key="tool.link" :tool="tool"> </NavLink>
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
									<SunMoonIcon /> Theme
									<ChevronsUpDownIcon class="ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent side="top" class="w-(--reka-popper-anchor-width)">
								<DropdownMenuGroup>
									<DropdownMenuItem @click="mode = 'light'">Light</DropdownMenuItem>
									<DropdownMenuItem @click="mode = 'dark'">Dark</DropdownMenuItem>
									<DropdownMenuItem @click="mode = 'auto'">
										Use device setting
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
		<SidebarInset>
			<header
				class="sticky z-20 top-0 bg-background border-b flex h-16 shrink-0 items-center"
			>
				<div class="flex items-center gap-x-4 px-4 w-full">
					<SidebarTrigger class="-ml-1" />
					<div v-if="currentTool" class="hidden sm:flex h-5">
						<Separator orientation="vertical" />
					</div>
					<div class="grow flex items-center min-w-0">
						<Breadcrumb v-if="currentTool">
							<BreadcrumbList>
								<BreadcrumbItem>
									<RouterLink to="/"> Home </RouterLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem class="min-w-0">
									<BreadcrumbPage class="truncate">
										{{ currentTool.name }}
									</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
						<span v-else class="font-bold text-xl md:hidden">i💙Media</span>
					</div>
					<div class="hidden md:block w-full max-w-sm">
						<SearchBar />
					</div>
				</div>
			</header>
			<main class="container mx-auto p-4 sm:p-6 lg:p-8">
				<div class="max-w-6xl min-h-[70vh] mx-auto">
					<div class="mb-6 md:hidden">
						<SearchBar />
					</div>
					<header
						v-if="currentTool"
						class="flex items-start gap-4 mb-6 pb-6 border-b"
					>
						<div class="p-3 rounded-xl border bg-card text-primary border-border">
							<component :is="currentTool.icon" class="size-6" />
						</div>
						<div class="min-w-0">
							<h1 class="text-3xl font-bold text-foreground">
								{{ currentTool.name }}
							</h1>
							<p class="text-sm text-muted-foreground mt-1">
								{{ currentTool.description }}
							</p>
						</div>
					</header>

					<section
						v-if="currentTool"
						class="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-xl border bg-card text-card-foreground px-4 py-6 sm:p-8 flex flex-col gap-6"
					>
						<slot />
					</section>

					<slot v-else class="animate-in fade-in slide-in-from-bottom-4 duration-500" />
				</div>
			</main>
		</SidebarInset>
	</SidebarProvider>
</template>
