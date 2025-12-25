<script setup lang="ts">
import { useRoute } from "vue-router"
import { useSidebar } from "./ui/sidebar"
import { SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar"

defineProps(["tool"])

const route = useRoute()
const sidebar = useSidebar()
</script>

<template>
	<SidebarMenuItem>
		<SidebarMenuButton as-child>
			<RouterLink
				:to="tool.link"
				@click="sidebar.isMobile && sidebar.setOpenMobile(false)"
				:class="{
					'text-primary dark:text-current dark:bg-background':
						tool.link == route.fullPath,
				}"
			>
				<component :is="tool.icon"></component>
				<span>{{ tool.name }}</span>
			</RouterLink>
		</SidebarMenuButton>
	</SidebarMenuItem>
</template>
