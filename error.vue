<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';
defineProps<{ error: { statusCode?: number; message?: string } }>();
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-canvas p-6 text-center">
    <div><div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-danger/30 bg-danger/10 text-danger"><AlertTriangle class="h-7 w-7" /></div><p class="mt-4 eyebrow">Error {{ error.statusCode || 500 }}</p><h1 class="mt-2 font-display text-3xl font-bold">That didn't load.</h1><p class="mt-2 text-xs text-muted">{{ error.message }}</p><button class="mt-5 rounded-xl bg-acid px-4 py-2.5 text-xs font-bold text-forest-950" @click="clearError({ redirect: '/' })">Back to overview</button></div>
  </div>
</template>
