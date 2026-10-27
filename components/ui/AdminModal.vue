<script setup lang="ts">
import { X } from 'lucide-vue-next';
const props = defineProps<{ open: boolean; title?: string; description?: string; size?: 'sm' | 'md' | 'lg' }>();
const emit = defineEmits<{ 'update:open': [boolean] }>();
const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };
function close() { emit('update:open', false); }
watch(() => props.open, (open) => { if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''; });
onBeforeUnmount(() => { if (import.meta.client) document.body.style.overflow = ''; });
</script>

<template>
  <Teleport to="body"><Transition name="fade"><div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" @mousedown.self="close"><div class="max-h-[90dvh] w-full overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-lift" :class="sizes[size || 'md']"><div class="mb-4 flex items-start justify-between gap-3"><div><h2 v-if="title" class="font-display text-xl font-bold">{{ title }}</h2><p v-if="description" class="mt-1 text-xs text-muted">{{ description }}</p></div><button class="rounded-lg p-1.5 text-muted hover:bg-raised" aria-label="Close" @click="close"><X class="h-4 w-4" /></button></div><slot /></div></div></Transition></Teleport>
</template>

<style scoped>.fade-enter-active,.fade-leave-active{transition:opacity .18s ease}.fade-enter-from,.fade-leave-to{opacity:0}</style>
