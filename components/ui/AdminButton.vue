<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';
withDefaults(defineProps<{ variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'; size?: 'sm' | 'md'; loading?: boolean; disabled?: boolean; to?: string; block?: boolean; type?: 'button' | 'submit' }>(), { variant: 'primary', size: 'md', loading: false, disabled: false, block: false, type: 'button' });
const variants = {
  primary: 'bg-acid text-forest-950 hover:brightness-95',
  secondary: 'bg-surface border border-line text-ink hover:bg-raised',
  outline: 'border border-line text-ink hover:border-acid hover:text-acid',
  ghost: 'text-muted hover:bg-raised hover:text-ink',
  danger: 'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25',
};
const sizes = { sm: 'min-h-[36px] px-3 text-[11px] rounded-lg', md: 'min-h-[42px] px-4 text-xs rounded-xl' };
</script>

<template>
  <NuxtLink v-if="to" :to="to" class="inline-flex items-center justify-center gap-1.5 font-bold transition" :class="[variants[variant], sizes[size], block ? 'w-full' : '']"><slot /></NuxtLink>
  <button v-else :type="type" class="inline-flex items-center justify-center gap-1.5 font-bold transition disabled:opacity-40" :class="[variants[variant], sizes[size], block ? 'w-full' : '']" :disabled="disabled || loading" @click="$emit('click', $event)">
    <Loader2 v-if="loading" class="h-3.5 w-3.5 animate-spin" /><slot v-else />
  </button>
</template>
