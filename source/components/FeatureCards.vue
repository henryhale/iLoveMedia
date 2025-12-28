<script setup lang="ts">
defineProps<{ features: { title: string; subtitle: string }[] }>()
</script>

<template>
    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="feature in features" :key="feature.title"
            class="bg-card text-card-foreground p-4 rounded-xl border border-border shadow-sm">
            <p class="text-xs font-bold mb-1 uppercase tracking-wider">
                {{ feature.title }}
            </p>
            <p class="text-[11px] text-muted-foreground leading-relaxed">
                {{ feature.subtitle }}
            </p>
        </div>
    </div>
</template>