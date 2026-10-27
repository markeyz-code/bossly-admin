<script setup lang="ts">
withDefaults(defineProps<{ loading?: boolean }>(), { loading: false });
</script>

<template><div class="overflow-hidden rounded-2xl border border-line bg-surface"><div class="overflow-x-auto"><table class="w-full min-w-[720px] text-left text-xs"><thead class="border-b border-line bg-raised/50"><slot name="head" /></thead><tbody><tr v-if="loading"><td colspan="20" class="p-10 text-center text-muted"><div class="mx-auto h-4 w-40 animate-pulse rounded bg-raised" /></td></tr><slot v-else name="body" /></tbody></table></div><slot name="footer" /></div></template>
