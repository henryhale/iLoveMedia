<script setup lang="ts">
import { computed } from "vue"
import { SnowflakeIcon } from "lucide-vue-next"
import { useColorMode } from "@vueuse/core"

const mode = useColorMode()

interface SnowflakeData {
	id: number
	left: string
	size: string
	duration: string
	delay: string
	opacity: number
	blur: string
}

const snowflakes = computed<SnowflakeData[]>(() =>
	Array.from({ length: 50 }).map((_, i) => ({
		id: i,
		left: `${Math.random() * 100}%`,
		size: `${Math.random() * (10 - 5) + 5}px`,
		duration: `${Math.random() * (15 - 5) + 5}s`,
		delay: `${Math.random() * 10}s`,
		opacity: Math.random() * 0.7 + 0.3,
		blur: `${Math.random() * 2}px`,
	})),
)
</script>

<template>
	<div
		v-if="mode == 'dark'"
		class="fixed inset-0 pointer-events-none overflow-hidden"
		aria-hidden="true"
	>
		<div
			v-for="flake in snowflakes"
			:key="flake.id"
			class="snowflake"
			:style="{
				left: flake.left,
				animationDuration: flake.duration,
				animationDelay: flake.delay,
				opacity: flake.opacity,
				filter: `blur(${flake.blur})`,
			}"
		>
			<SnowflakeIcon :style="{ width: flake.size, height: flake.size }" />
		</div>
	</div>
</template>

<style lang="css" scoped>
@keyframes fall {
	0% {
		transform: translateY(-10vh) translateX(0) rotate(0deg);
		opacity: 0;
	}

	10% {
		opacity: 1;
	}

	30% {
		transform: translateY(25vh) translateX(15px) rotate(45deg);
	}

	60% {
		transform: translateY(65vh) translateX(-15px) rotate(135deg);
	}

	90% {
		opacity: 1;
	}

	100% {
		transform: translateY(110vh) translateX(10px) rotate(360deg);
		opacity: 0;
	}
}

.snowflake {
	position: fixed;
	top: -10%;
	user-select: none;
	z-index: 1;
	pointer-events: none;
	animation: fall linear infinite;
}
</style>
