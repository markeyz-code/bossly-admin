<script setup lang="ts">
useHead({ titleTemplate: (title) => title ? `${title} · Ojaly Ops` : 'Ojaly Control Room' });
</script>

<template>
  <div><NuxtLoadingIndicator color="#C8FF00" :height="2" /><NuxtLayout><NuxtPage /></NuxtLayout><AdminToast v-if="false" /></div>
</template>
