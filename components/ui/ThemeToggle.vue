<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next';
const light = useState('admin-light', () => false);
function toggle() { light.value = !light.value; if (import.meta.client) { document.documentElement.classList.toggle('light', light.value); localStorage.setItem('ojaly.admin.theme', light.value ? 'light' : 'dark'); } }
onMounted(() => { const stored = localStorage.getItem('ojaly.admin.theme'); light.value = stored === 'light'; document.documentElement.classList.toggle('light', light.value); });
</script>

<template><button class="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted hover:bg-raised" :aria-label="light ? 'Use dark mode' : 'Use light mode'" @click="toggle"><Sun v-if="light" class="h-4 w-4" /><Moon v-else class="h-4 w-4" /></button></template>
