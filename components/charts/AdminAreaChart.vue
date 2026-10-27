<script setup lang="ts">
import { computed } from 'vue';
import { formatCompactNaira } from '~/utils/format';
const props = defineProps<{ data: { date: string; revenueKobo: number; users: number; businesses: number }[]; metric?: 'revenue' | 'growth' }>();
const width = 720; const height = 220; const pad = { top: 16, right: 12, bottom: 26, left: 56 };
const values = computed(() => props.data.map((d) => props.metric === 'growth' ? d.users + d.businesses : d.revenueKobo));
const max = computed(() => Math.max(1, ...values.value));
const innerW = computed(() => width - pad.left - pad.right);
const innerH = computed(() => height - pad.top - pad.bottom);
function x(i: number) { return pad.left + (props.data.length <= 1 ? innerW.value / 2 : i / (props.data.length - 1) * innerW.value); }
function y(v: number) { return pad.top + innerH.value - (v / max.value) * innerH.value; }
const path = computed(() => props.data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(values.value[i]).toFixed(1)}`).join(' '));
const area = computed(() => `${path.value} L${x(props.data.length - 1)},${pad.top + innerH.value} L${pad.left},${pad.top + innerH.value} Z`);
const labels = computed(() => [0, 0.5, 1].map((f) => props.data[Math.round(f * (props.data.length - 1))]?.date).filter(Boolean));
</script>

<template>
  <svg :viewBox="`0 0 ${width} ${height}`" class="w-full" role="img" aria-label="Platform trend">
    <defs><linearGradient id="adminFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C8FF00" stop-opacity=".25" /><stop offset="100%" stop-color="#C8FF00" stop-opacity="0" /></linearGradient></defs>
    <line v-for="f in [0, .25, .5, .75, 1]" :key="f" :x1="pad.left" :x2="width - pad.right" :y1="y(max * f)" :y2="y(max * f)" stroke="currentColor" stroke-opacity=".08" stroke-dasharray="4 6" />
    <text v-for="f in [0, .5, 1]" :key="'l' + f" :x="pad.left - 8" :y="y(max * f) + 3" text-anchor="end" class="fill-muted text-[9px]">{{ metric === 'growth' ? Math.round(max * f) : formatCompactNaira(max * f) }}</text>
    <path :d="area" fill="url(#adminFill)" />
    <path :d="path" fill="none" stroke="#C8FF00" stroke-width="2" stroke-linecap="round" />
    <text v-for="label in labels" :key="label" :x="pad.left + (labels.indexOf(label) / Math.max(1, labels.length - 1)) * innerW" :y="height - 6" text-anchor="middle" class="fill-muted text-[9px]">{{ label }}</text>
  </svg>
</template>
