<script setup lang="ts">
import { AlertTriangle, CheckCircle2, MessageCircle, RefreshCw, RotateCw, WifiOff } from 'lucide-vue-next';
import { useAdminAuthStore } from '~/stores/auth';
import { formatDate, titleCase } from '~/utils/format';
useSeoMeta({ title: 'WhatsApp health' });
const toast = useAdminToast();
const auth = useAdminAuthStore();
const { health, webhooks, loading, retrying, load: loadHealth, retry: retryWebhooks } = useAdminWhatsApp();
async function load() {
  loading.value = true;
  try { await loadHealth(); }
  catch (error) { toast.error((error as Error).message); }
}
async function retry() {
  retrying.value = true;
  try { const result = await retryWebhooks(); toast.success(`${result.retried} webhook event(s) retried.`); await load(); }
  catch (error) { toast.error((error as Error).message); }
}
const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = { processed: 'success', received: 'warning', failed: 'danger', ignored: 'neutral' };
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeading title="WhatsApp health" subtitle="Cloud API connectivity, delivery, failures and webhook idempotency." eyebrow="Trust systems">
      <template #actions><AdminButton variant="outline" :loading="loading" @click="load"><RefreshCw class="h-3.5 w-3.5" /> Refresh</AdminButton><AdminButton v-if="auth.isSuperAdmin" :loading="retrying" @click="retry"><RotateCw class="h-3.5 w-3.5" /> Retry failed</AdminButton></template>
    </PageHeading>
    <div v-if="loading && !health" class="grid gap-3 sm:grid-cols-4"><div v-for="i in 4" :key="i" class="skeleton h-28" /></div>
    <template v-else-if="health">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="card p-4"><div class="flex items-center justify-between"><p class="text-[9px] uppercase tracking-wider text-muted">API status</p><span class="flex items-center gap-1 text-[9px] font-bold" :class="health.configured ? 'text-success' : 'text-warning'"><CheckCircle2 v-if="health.configured" class="h-3 w-3" /><WifiOff v-else class="h-3 w-3" />{{ health.configured ? 'Connected' : 'Not configured' }}</span></div><p class="mt-1.5 font-display text-2xl font-bold">{{ health.linkedNumbers }} <span class="text-xs text-muted">linked</span></p><p class="text-[9px] text-muted">Phone ID: {{ health.phoneNumberId || '—' }}</p></div>
        <AdminStat label="Inbound · 24h" :value="health.last24h?.inbound || 0" :hint="`Last ${health.lastInboundAt ? formatDate(health.lastInboundAt, true) : 'never'}`" />
        <AdminStat label="Outbound · 24h" :value="health.last24h?.outbound || 0" :hint="`Last ${health.lastOutboundAt ? formatDate(health.lastOutboundAt, true) : 'never'}`" />
        <AdminStat label="Failed · 24h" :value="health.last24h?.failed || 0" :tone="health.last24h?.failed ? 'danger' : 'acid'" :hint="`${health.last24h?.skipped || 0} skipped (window/template)`" />
      </div>
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="card"><div class="flex items-center gap-2 border-b border-line p-4"><MessageCircle class="h-4 w-4 text-acid" /><p class="text-xs font-bold">Configuration</p></div><div class="space-y-2 p-4 text-[10px]"><p><span class="text-muted">Webhook URL:</span> <code class="break-all rounded bg-raised px-1.5 py-0.5">{{ health.webhookUrl }}</code></p><p><span class="text-muted">Templates:</span></p><div class="flex flex-wrap gap-1"><span v-for="template in health.templates || []" :key="template" class="rounded bg-raised px-1.5 py-0.5 font-mono text-[9px]">{{ template }}</span></div><p class="pt-2 text-[9px] leading-relaxed text-muted">Outbound outside the 24-hour window requires an approved template. The client falls back automatically.</p></div></div>
        <div class="card"><div class="flex items-center gap-2 border-b border-line p-4"><AlertTriangle class="h-4 w-4 text-warning" /><p class="text-xs font-bold">Recent failures</p></div><div class="divide-y divide-line"><div v-for="failure in health.recentFailures || []" :key="failure.id" class="px-4 py-2.5"><p class="text-[10px] font-semibold">{{ failure.phone }}</p><p class="text-[9px] text-danger">{{ failure.error || 'Unknown error' }}</p><p class="text-[9px] text-muted">{{ formatDate(failure.createdAt, true) }}</p></div><p v-if="!(health.recentFailures || []).length" class="p-4 text-[10px] text-muted">No outbound failures. Good.</p></div></div>
      </div>
      <div class="card"><div class="border-b border-line p-4"><p class="text-xs font-bold">Webhook events</p><p class="text-[10px] text-muted">Unique provider event IDs prevent duplicate processing. Failed events are retried by the scheduled job.</p></div>
        <AdminTable><template #head><tr><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Event</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Type</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Status</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Attempts</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Created</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Error</th></tr></template><template #body><tr v-for="event in webhooks" :key="event.id" class="border-b border-line last:border-0"><td class="px-4 py-2.5 font-mono text-[9px]">{{ event.eventId }}</td><td class="px-4 py-2.5 text-[10px]">{{ event.eventType }}</td><td class="px-4 py-2.5"><AdminBadge :variant="statusVariant[event.status] || 'neutral'">{{ event.status }}</AdminBadge></td><td class="px-4 py-2.5 text-[10px]">{{ event.attempts }}</td><td class="px-4 py-2.5 text-[9px] text-muted">{{ formatDate(event.createdAt, true) }}</td><td class="max-w-[240px] truncate px-4 py-2.5 text-[9px] text-danger" :title="event.error">{{ event.error || '—' }}</td></tr><tr v-if="!webhooks.length"><td colspan="6"><AdminEmpty title="No webhook events" message="Paystack events will appear here as they arrive." /></td></tr></template></AdminTable>
      </div>
    </template>
  </div>
</template>
