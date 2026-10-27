<script setup lang="ts">
import { Activity, ArrowUpRight, Building2, CheckCircle2, CircleDollarSign, FileWarning, MessageCircle, RefreshCw, ServerCog, TrendingUp, Users, XCircle, Zap } from 'lucide-vue-next';
import { formatNaira, formatNumber, formatDate, titleCase } from '~/utils/format';
useSeoMeta({ title: 'Overview' });
const toast = useAdminToast();
const auth = useAdminAuthStore();
const { data, loading, load: loadDashboard } = useAdminDashboard();
const metric = ref<'revenue' | 'growth'>('revenue');
async function load() {
  try { await loadDashboard(); }
  catch (error) { toast.error((error as Error).message); }
}
const integration = computed(() => Object.entries(data.value?.integrations || {}).map(([key, ok]) => ({ key, ok })));
const planMax = computed(() => Math.max(1, ...(data.value?.planDistribution.map((p) => p.count) || [1])));
const totalPlans = computed(() => data.value?.planDistribution.reduce((s, p) => s + p.count, 0) || 0);
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeading title="Platform overview" subtitle="The health of the whole network — users, businesses, money and trust systems." eyebrow="Live operations">
      <template #actions><AdminButton variant="outline" :loading="loading" @click="load"><RefreshCw class="h-3.5 w-3.5" /> Refresh</AdminButton></template>
    </PageHeading>

    <div v-if="loading && !data" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div v-for="i in 4" :key="i" class="skeleton h-28" /></div>
    <div v-else-if="data" class="space-y-5">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat label="Total users" :value="formatNumber(data.metrics.users)" :hint="`${data.metrics.newUsers} new in 30 days · ${data.metrics.verifiedUsers} verified`" />
        <AdminStat label="Businesses" :value="formatNumber(data.metrics.businesses)" :hint="`${data.metrics.published} published · ${data.metrics.suspended} suspended`" />
        <AdminStat label="MRR" :value="formatNaira(data.metrics.mrrKobo, true)" tone="acid" :hint="`${data.metrics.activeSubscriptions} active · ${data.metrics.trials} trials`" />
        <AdminStat label="Revenue · 30d" :value="formatNaira(data.metrics.revenue30Kobo, true)" :hint="`${data.metrics.payments30} payments · ${data.metrics.trialExpiring} trials ending soon`" />
      </div>

      <div class="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div class="rounded-2xl border border-line bg-surface p-4">
          <div class="flex flex-wrap items-center justify-between gap-2"><div><p class="text-xs font-bold">Platform trend</p><p class="text-[10px] text-muted">Last 14 days</p></div><div class="flex rounded-lg border border-line p-0.5"><button class="rounded-md px-2.5 py-1 text-[9px] font-bold" :class="metric === 'revenue' ? 'bg-acid text-forest-950' : 'text-muted'" @click="metric = 'revenue'">Revenue</button><button class="rounded-md px-2.5 py-1 text-[9px] font-bold" :class="metric === 'growth' ? 'bg-acid text-forest-950' : 'text-muted'" @click="metric = 'growth'">Signups</button></div></div>
          <AdminAreaChart :data="data.growth" :metric="metric" class="mt-3" />
        </div>
        <div class="rounded-2xl border border-line bg-surface p-4">
          <div class="flex items-center justify-between"><p class="text-xs font-bold">Plan distribution</p><span class="text-[9px] text-muted">{{ totalPlans }} businesses</span></div>
          <div class="mt-4 space-y-3">
            <div v-for="plan in data.planDistribution" :key="plan.planKey">
              <div class="flex justify-between text-[10px]"><span class="font-semibold capitalize">{{ plan.planKey }}</span><span class="text-muted">{{ plan.count }}</span></div>
              <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-raised"><div class="h-full rounded-full bg-acid" :style="{ width: `${(plan.count / planMax) * 100}%` }" /></div>
            </div>
            <p v-if="!data.planDistribution.length" class="text-[10px] text-muted">No subscriptions yet.</p>
          </div>
          <div class="mt-5 border-t border-line pt-3">
            <p class="text-xs font-bold">Integrations</p>
            <div class="mt-2 space-y-1.5"><div v-for="integration in integration" :key="integration.key" class="flex items-center justify-between text-[10px]"><span class="capitalize text-muted">{{ integration.key }}</span><span class="inline-flex items-center gap-1 font-bold" :class="integration.ok ? 'text-success' : 'text-warning'"><CheckCircle2 v-if="integration.ok" class="h-3 w-3" /><XCircle v-else class="h-3 w-3" />{{ integration.ok ? 'Connected' : 'Needs setup' }}</span></div></div>
          </div>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div class="rounded-2xl border border-line bg-surface">
          <div class="flex items-center justify-between border-b border-line p-4"><div><p class="text-xs font-bold">Top businesses · 30 days</p><p class="text-[10px] text-muted">By recorded sales value</p></div><TrendingUp class="h-4 w-4 text-acid" /></div>
          <div v-if="data.topBusinesses.length" class="divide-y divide-line">
            <div v-for="(business, index) in data.topBusinesses" :key="business.businessId" class="flex items-center gap-3 px-4 py-3">
              <span class="flex h-6 w-6 items-center justify-center rounded-md bg-raised text-[9px] font-bold text-muted">{{ index + 1 }}</span>
              <div class="min-w-0 flex-1"><p class="truncate text-xs font-semibold">{{ business.name }}</p><p class="text-[9px] text-muted">{{ business.sales }} sales · /s/{{ business.slug }}</p></div>
              <p class="text-xs font-bold">{{ formatNaira(business.revenueKobo) }}</p>
              <NuxtLink :to="`/businesses/${business.businessId}`" class="text-muted hover:text-acid"><ArrowUpRight class="h-3.5 w-3.5" /></NuxtLink>
            </div>
          </div>
          <AdminEmpty v-else title="No sales yet" message="Top businesses appear once the network records sales." />
        </div>
        <div class="rounded-2xl border border-line bg-surface">
          <div class="flex items-center justify-between border-b border-line p-4"><div><p class="text-xs font-bold">WhatsApp health · 24h</p><p class="text-[10px] text-muted">{{ data.whatsapp.linkedNumbers }} linked numbers</p></div><MessageCircle class="h-4 w-4 text-acid" /></div>
          <div class="grid grid-cols-2 gap-2 p-4">
            <div class="rounded-lg bg-raised/60 p-3"><p class="text-[9px] uppercase tracking-wider text-muted">Inbound</p><p class="mt-1 font-display text-xl font-bold">{{ data.whatsapp.last24h.inbound }}</p></div>
            <div class="rounded-lg bg-raised/60 p-3"><p class="text-[9px] uppercase tracking-wider text-muted">Outbound</p><p class="mt-1 font-display text-xl font-bold">{{ data.whatsapp.last24h.outbound }}</p></div>
            <div class="rounded-lg bg-raised/60 p-3"><p class="text-[9px] uppercase tracking-wider text-muted">Failed</p><p class="mt-1 font-display text-xl font-bold" :class="data.whatsapp.last24h.failed ? 'text-danger' : 'text-success'">{{ data.whatsapp.last24h.failed }}</p></div>
            <div class="rounded-lg bg-raised/60 p-3"><p class="text-[9px] uppercase tracking-wider text-muted">Skipped</p><p class="mt-1 font-display text-xl font-bold">{{ data.whatsapp.last24h.skipped }}</p></div>
          </div>
          <div class="border-t border-line p-4 text-[10px] text-muted"><p>Last inbound: {{ data.whatsapp.lastInboundAt ? formatDate(data.whatsapp.lastInboundAt, true) : '—' }}</p><p class="mt-1">Last outbound: {{ data.whatsapp.lastOutboundAt ? formatDate(data.whatsapp.lastOutboundAt, true) : '—' }}</p><NuxtLink to="/whatsapp" class="mt-2 inline-flex items-center gap-1 font-bold text-acid">Open health console <ArrowUpRight class="h-3 w-3" /></NuxtLink></div>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <div class="rounded-2xl border border-line bg-surface p-4"><div class="flex items-center gap-2"><FileWarning class="h-4 w-4 text-warning" /><p class="text-xs font-bold">Webhook failures</p></div><p class="mt-2 font-display text-2xl font-bold" :class="data.metrics.failedWebhooks ? 'text-danger' : 'text-success'">{{ data.metrics.failedWebhooks }}</p><NuxtLink to="/whatsapp" class="mt-1 inline-block text-[10px] font-bold text-acid">Review events →</NuxtLink></div>
        <div class="rounded-2xl border border-line bg-surface p-4"><div class="flex items-center gap-2"><Zap class="h-4 w-4 text-acid" /><p class="text-xs font-bold">Quick actions</p></div><div class="mt-2 flex flex-wrap gap-1.5"><NuxtLink to="/plans" class="rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-bold hover:border-acid">Manage plans</NuxtLink><NuxtLink to="/users" class="rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-bold hover:border-acid">Find user</NuxtLink><NuxtLink to="/businesses" class="rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-bold hover:border-acid">Find business</NuxtLink></div></div>
        <div class="rounded-2xl border border-line bg-surface p-4"><div class="flex items-center gap-2"><ServerCog class="h-4 w-4 text-muted" /><p class="text-xs font-bold">Your access</p></div><p class="mt-2 text-[11px] font-semibold text-acid capitalize">{{ auth.user?.platformRole?.replace('_', ' ') }}</p><p class="mt-1 text-[10px] text-muted">{{ auth.isSuperAdmin ? 'Write access to plans, trials, suspensions and users.' : 'Read-only access. Sensitive actions are hidden.' }}</p></div>
      </div>

      <div class="rounded-2xl border border-line bg-surface">
        <div class="flex items-center justify-between border-b border-line p-4"><p class="text-xs font-bold">Recent platform activity</p><NuxtLink to="/audit" class="text-[10px] font-bold text-acid">Full audit log →</NuxtLink></div>
        <div class="divide-y divide-line">
          <div v-for="log in data.recentAudit" :key="log.id" class="flex flex-wrap items-center gap-2 px-4 py-2.5 text-[10px]"><span class="rounded bg-raised px-1.5 py-0.5 font-mono text-[9px] text-muted">{{ log.action }}</span><span class="text-muted">{{ log.actorType }}</span><span class="ml-auto text-muted">{{ formatDate(log.createdAt, true) }}</span></div>
          <p v-if="!data.recentAudit.length" class="p-4 text-[10px] text-muted">No audit records yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>
