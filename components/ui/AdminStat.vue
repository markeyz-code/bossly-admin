<script setup lang="ts">
withDefaults(defineProps<{ label: string; value: string | number; hint?: string; tone?: 'default' | 'acid' | 'danger' }>(), { tone: 'default' });
</script>

<template><div class="rounded-2xl border border-line bg-surface p-4"><p class="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">{{ label }}</p><p class="mt-1.5 font-display text-3xl font-bold tracking-tight mono" :class="tone === 'acid' ? 'text-acid' : tone === 'danger' ? 'text-danger' : ''">{{ value }}</p><p v-if="hint" class="mt-1 text-[10px] text-muted">{{ hint }}</p></div></template>
