<script setup lang="ts">
import { Activity, ArrowUpRight, Building2, CreditCard, FileClock, Gift, LayoutDashboard, LogOut, Menu, MessageCircle, Search, ShieldCheck, Users, X, Zap } from 'lucide-vue-next';
const auth = useAdminAuthStore();
const route = useRoute();
const router = useRouter();
const open = ref(false);
const groups = [
  { label: 'Observe', links: [{ to: '/', label: 'Overview', icon: LayoutDashboard }, { to: '/audit', label: 'Audit log', icon: FileClock }] },
  { label: 'Network', links: [{ to: '/users', label: 'Users', icon: Users }, { to: '/businesses', label: 'Businesses', icon: Building2 }] },
  { label: 'Revenue', links: [{ to: '/payments', label: 'Payments', icon: CreditCard }, { to: '/plans', label: 'Plans & coupons', icon: Zap }, { to: '/affiliates', label: 'Affiliates & payouts', icon: Gift }] },
  { label: 'Operations', links: [{ to: '/whatsapp', label: 'WhatsApp health', icon: MessageCircle }] },
];
const active = (to: string) => to === '/' ? route.path === '/' : route.path.startsWith(to);
async function logout() { await auth.logout(); await router.push('/login'); }
</script>

<template>
  <div class="min-h-dvh bg-canvas">
    <div v-if="open" class="fixed inset-0 z-40 bg-black/60 lg:hidden" @click="open = false" />
    <aside class="fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-line bg-surface transition-transform lg:translate-x-0" :class="open ? 'translate-x-0' : '-translate-x-full'">
      <div class="flex h-16 items-center justify-between border-b border-line px-4"><AdminLogo /><button class="lg:hidden" @click="open = false"><X class="h-4 w-4" /></button></div>
      <div class="px-3 py-3">
        <div class="rounded-xl border border-acid/20 bg-acid/5 p-3"><div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-acid"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-acid" /> Platform live</div><p class="mt-1.5 text-[10px] leading-relaxed text-muted">Production controls. Every change is audited.</p></div>
      </div>
      <nav class="flex-1 overflow-y-auto px-3 pb-4">
        <div v-for="group in groups" :key="group.label" class="mb-4"><p class="mb-1 px-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted/60">{{ group.label }}</p><NuxtLink v-for="link in group.links" :key="link.to" :to="link.to" class="flex min-h-[40px] items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold transition" :class="active(link.to) ? 'bg-acid text-forest-950' : 'text-muted hover:bg-raised hover:text-ink'" @click="open = false"><component :is="link.icon" class="h-4 w-4" />{{ link.label }}<ArrowUpRight v-if="active(link.to)" class="ml-auto h-3 w-3" /></NuxtLink></div>
      </nav>
      <div class="border-t border-line p-3">
        <div class="flex items-center gap-2 rounded-lg bg-raised/60 p-2"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-acid text-xs font-bold text-forest-950">{{ auth.user?.name?.slice(0, 2).toUpperCase() }}</div><div class="min-w-0 flex-1"><p class="truncate text-[11px] font-bold">{{ auth.user?.name }}</p><p class="text-[9px] uppercase tracking-wider text-acid">{{ auth.user?.platformRole?.replace('_', ' ') }}</p></div><button class="text-muted hover:text-danger" aria-label="Sign out" @click="logout"><LogOut class="h-4 w-4" /></button></div>
        <p class="mt-2 flex items-center gap-1 text-[9px] text-muted"><ShieldCheck class="h-3 w-3" /> {{ auth.isSuperAdmin ? 'Full super admin access' : 'Support read-only access' }}</p>
      </div>
    </aside>
    <div class="lg:pl-[248px]">
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur-xl sm:px-6">
        <div class="flex items-center gap-2"><button class="flex h-9 w-9 items-center justify-center rounded-lg border border-line lg:hidden" @click="open = true"><Menu class="h-4 w-4" /></button><div class="hidden items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted sm:flex"><Search class="h-3.5 w-3.5" /><span>Search in page…</span><kbd class="ml-4 rounded border border-line px-1.5 py-0.5 text-[9px]">⌘K</kbd></div></div>
        <div class="flex items-center gap-2"><span class="hidden items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[9px] font-bold text-success sm:flex"><Activity class="h-3 w-3" /> Systems nominal</span><ThemeToggle /><div class="flex h-8 w-8 items-center justify-center rounded-full bg-raised text-[10px] font-bold">{{ auth.user?.name?.slice(0, 2).toUpperCase() }}</div></div>
      </header>
      <main class="p-4 sm:p-6"><slot /></main>
    </div>
  </div>
</template>
