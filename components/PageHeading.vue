<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; eyebrow?: string }>();
</script>

<template><div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p><h1 class="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">{{ title }}</h1><p v-if="subtitle" class="mt-1 max-w-2xl text-xs leading-relaxed text-muted">{{ subtitle }}</p></div><div class="flex flex-wrap gap-2"><slot name="actions" /></div></div></template>
