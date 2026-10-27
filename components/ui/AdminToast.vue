<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-vue-next';
import { useAdminToast } from '~/composables/useAdminToast';
const { toasts, dismiss } = useAdminToast();
const icons = { success: CheckCircle2, error: AlertTriangle, info: Info };
</script>

<template><Teleport to="body"><div class="pointer-events-none fixed right-4 top-4 z-[200] flex w-[340px] flex-col gap-2"><TransitionGroup name="toast"><div v-for="toast in toasts" :key="toast.id" class="pointer-events-auto flex items-start gap-2 rounded-xl border border-line bg-surface p-3 shadow-lift" :class="toast.tone === 'error' ? 'border-danger/30' : 'border-acid/20'"><component :is="icons[toast.tone]" class="mt-0.5 h-4 w-4 shrink-0" :class="toast.tone === 'error' ? 'text-danger' : 'text-acid'" /><p class="flex-1 text-xs leading-relaxed">{{ toast.message }}</p><button class="text-muted" @click="dismiss(toast.id)"><X class="h-3.5 w-3.5" /></button></div></TransitionGroup></div></Teleport></template>

<style scoped>.toast-enter-active,.toast-leave-active{transition:all .2s ease}.toast-enter-from,.toast-leave-to{opacity:0;transform:translateX(8px)}</style>
