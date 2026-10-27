<script setup lang="ts">
defineProps<{ title: string; message?: string }>();
</script>

<template><div class="flex flex-col items-center justify-center px-4 py-16 text-center"><div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-raised text-acid"><slot name="icon">◎</slot></div><p class="mt-4 font-display text-lg font-bold">{{ title }}</p><p v-if="message" class="mt-1 max-w-sm text-xs text-muted">{{ message }}</p><slot name="action" /></div></template>
