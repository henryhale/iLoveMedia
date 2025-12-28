<script setup lang="ts">
import { CheckIcon, CopyIcon } from 'lucide-vue-next';
import { Button } from './ui/button';
import { useClipboard } from '@vueuse/core';

const props = defineProps(['source'])

const {copied, copy, isSupported } = useClipboard({ source: props.source })
</script>

<template>
    <Button v-if="isSupported" variant="outline" @click="copy(source)"
        class="flex items-center gap-1.5 text-xs font-bold text-primary">
        <CheckIcon v-if="copied" class="w-3 h-3" />
        <CopyIcon v-else class="w-3 h-3" />
        {{ copied ? "Copied" : "Copy" }}
    </Button>
</template>