<script setup lang="ts">
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-vue-next';
definePageMeta({ layout: false });
useSeoMeta({ title: 'Platform sign in', robots: 'noindex' });
const auth = useAdminAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const submitting = ref(false);
async function submit() {
  error.value = '';
  if (!email.value || !password.value) { error.value = 'Enter your email and password.'; return; }
  submitting.value = true;
  try { await auth.login(email.value, password.value); await router.push('/'); }
  catch (err) { error.value = (err as Error).message; }
  finally { submitting.value = false; }
}
</script>

<template>
  <div class="relative flex min-h-dvh items-center justify-center overflow-hidden bg-forest-950 p-5">
    <div class="absolute inset-0 grid-paper opacity-40" />
    <div class="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-acid/10 blur-3xl" />
    <div class="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
    <div class="relative w-full max-w-sm">
      <div class="mb-8 flex items-center justify-between"><AdminLogo /><span class="rounded-full border border-acid/30 bg-acid/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-acid">Internal</span></div>
      <div class="rounded-2xl border border-line bg-surface/90 p-6 shadow-lift backdrop-blur">
        <p class="eyebrow">Control room</p>
        <h1 class="mt-2 font-display text-2xl font-bold tracking-tight">Platform access only.</h1>
        <p class="mt-1.5 text-xs leading-relaxed text-muted">Manage the network, revenue and trust systems. Every action is recorded in the audit log.</p>
        <form class="mt-5 space-y-3" @submit.prevent="submit">
          <AdminInput v-model="email" label="Work email" type="email" placeholder="you@bossly.ng" />
          <AdminInput v-model="password" label="Password" type="password" placeholder="••••••••" />
          <div v-if="error" class="rounded-lg border border-danger/20 bg-danger/5 p-2.5 text-[11px] text-danger" role="alert">{{ error }}</div>
          <AdminButton type="submit" block :loading="submitting">Enter control room <ArrowRight class="h-3.5 w-3.5" /></AdminButton>
        </form>
        <div class="mt-5 flex items-start gap-2 rounded-lg bg-raised/60 p-2.5 text-[10px] leading-relaxed text-muted"><LockKeyhole class="mt-0.5 h-3.5 w-3.5 shrink-0 text-acid" /> Support accounts have read-only access. Only super admins can change plans, trials or users.</div>
      </div>
      <p class="mt-4 flex items-center justify-center gap-1 text-[9px] text-muted"><ShieldCheck class="h-3 w-3" /> Bossly internal systems · not indexed</p>
    </div>
  </div>
</template>
