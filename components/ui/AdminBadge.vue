<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' }>(), { variant: 'neutral' });
const variants = { neutral: 'bg-raised text-muted border-line', success: 'bg-success/10 text-success border-success/20', warning: 'bg-warning/10 text-warning border-warning/25', danger: 'bg-danger/10 text-danger border-danger/20', info: 'bg-forest-500/10 text-emerald-300 border-forest-500/30', accent: 'bg-acid/10 text-acid border-acid/25' };
</script>

<template><span class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider" :class="variants[variant]"><slot /></span></template>
