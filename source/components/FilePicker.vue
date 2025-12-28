<script setup lang="ts">
import { ref, watchEffect, type Component } from 'vue';
import { FileIcon } from 'lucide-vue-next';

defineProps<{ accept: string, title?: string; subtitle?: string, footer?: string, icon?: Component }>()

const emit = defineEmits<{ change: [File | undefined] }>()

const selectedFile = ref<File>()

const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files[0]) {
        const file = target.files[0]
        selectedFile.value = file
    }
}

watchEffect(() => {
    emit("change", selectedFile.value)
})

</script>

<template>
    <div
        class="border-2 border-dashed border-border rounded-3xl py-12 px-6 md:p-16 text-center hover:bg-accent/50 transition-colors relative group">
        <input type="file" :accept="accept" @change="handleFileChange"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <div class="space-y-4">
            <div
                class="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileIcon v-if="!icon" class="w-8 h-8" />
                <component v-else :is="icon"></component>
            </div>
            <div>
                <p class="text-xl font-bold text-foreground">{{ title || "Drop your file here" }}</p>
                <p class="text-muted-foreground">{{ subtitle || "or click to browse local files" }}</p>
            </div>
            <div class="pt-2" v-if="footer">
                <span
                    class="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-secondary text-secondary-foreground rounded-full">
                    {{ footer }}
                </span>
            </div>
        </div>
    </div>

</template>