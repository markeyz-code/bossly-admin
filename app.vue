<script setup lang="ts">
useHead({ titleTemplate: (title) => title ? `${title} · Bossly Ops` : 'Bossly Control Room' });
</script>

<template>
  <div><NuxtLoadingIndicator color="#C8FF00" :height="2" /><NuxtLayout><NuxtPage /></NuxtLayout><AdminToast v-if="false" /></div>
</template>
