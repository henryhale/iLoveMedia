<script setup lang="ts">
import AppLayout from "./layouts/AppLayout.vue"
import { RouterView } from "vue-router"
import { Toaster } from "vue-sonner"
import "vue-sonner/style.css"
</script>
<template>
	<AppLayout>
		<RouterView></RouterView>
		<Toaster
			position="bottom-right"
			:duration="3000"
			close-button
			close-button-position="top-right"
		/>
	</AppLayout>
</template>
