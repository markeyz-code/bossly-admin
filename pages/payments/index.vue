<script setup lang="ts">
import { CreditCard, RefreshCw, Search } from 'lucide-vue-next';
import { formatDate, formatNaira, titleCase } from '~/utils/format';
useSeoMeta({ title: 'Payments' });
const toast = useAdminToast();
const { exporting, download } = useAdminExport();
async function exportCsv() { try { await download('payments', { search: search.value || undefined, status: status.value }); toast.success('Payments exported.'); } catch (error) { toast.error((error as Error).message); } }
const { data, loading, load: loadPayments } = useAdminPayments();
const search = ref('');
const status = ref('all');
const purpose = ref('all');
const page = ref(1);
let timer: ReturnType<typeof setTimeout> | null = null;
async function load() {
  loading.value = true;
  try { await loadPayments({ page: page.value, limit: 30, search: search.value || undefined, status: status.value, purpose: purpose.value }); }
  catch (error) { toast.error((error as Error).message); }
}
watch(search, () => { if (timer) clearTimeout(timer); timer = setTimeout(() => { page.value = 1; load(); }, 300); });
watch([status, purpose], () => { page.value = 1; load(); });
const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = { success: 'success', pending: 'warning', processing: 'warning', failed: 'danger', abandoned: 'neutral', reversed: 'danger' };
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeading title="Payments" subtitle="Every Paystack reference across orders, debts, invoices and subscriptions." eyebrow="Revenue">
      <template #actions><AdminButton variant="outline" :loading="exporting === 'payments'" @click="exportCsv">Export CSV</AdminButton><AdminButton variant="outline" :loading="loading" @click="load"><RefreshCw class="h-3.5 w-3.5" /> Refresh</AdminButton></template>
    </PageHeading>
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStat label="Successful" :value="formatNaira(data?.meta.byStatus.success?.amountKobo || 0, true)" tone="acid" :hint="`${data?.meta.byStatus.success?.count || 0} transactions`" />
      <AdminStat label="Pending" :value="String(data?.meta.byStatus.pending?.count || 0)" hint="Awaiting provider confirmation" />
      <AdminStat label="Failed" :value="String(data?.meta.byStatus.failed?.count || 0)" tone="danger" hint="Needs review" />
      <AdminStat label="All payments" :value="String(data?.meta.total || 0)" hint="Across all purposes" />
    </div>
    <div class="flex flex-col gap-2 sm:flex-row"><div class="relative flex-1"><Search class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" /><input v-model="search" type="search" placeholder="Search reference…" class="input-base pl-9"></div><AdminSelect v-model="status" :options="[{ value: 'all', label: 'All statuses' }, { value: 'success', label: 'Success' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }, { value: 'abandoned', label: 'Abandoned' }, { value: 'reversed', label: 'Reversed' }]" aria-label="Payment status" class="!w-40" /><AdminSelect v-model="purpose" :options="[{ value: 'all', label: 'All purposes' }, { value: 'order', label: 'Orders' }, { value: 'debt', label: 'Debts' }, { value: 'invoice', label: 'Invoices' }, { value: 'subscription', label: 'Subscriptions' }]" aria-label="Purpose" class="!w-40" /></div>
    <AdminTable :loading="loading && !data">
      <template #head><tr><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Reference</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Business</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Purpose</th><th class="px-4 py-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-muted">Amount</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Status</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Created</th></tr></template>
      <template #body><tr v-for="payment in data?.items || []" :key="payment.id" class="border-b border-line last:border-0"><td class="px-4 py-2.5"><p class="font-mono text-[10px] font-semibold">{{ payment.reference }}</p><p class="text-[9px] text-muted">{{ payment.email || '—' }}</p></td><td class="px-4 py-2.5"><p class="text-[10px] font-semibold">{{ payment.business?.name || payment.businessId }}</p><p class="text-[9px] text-muted">/s/{{ payment.business?.slug }}</p></td><td class="px-4 py-2.5"><AdminBadge variant="neutral">{{ titleCase(payment.purpose) }}</AdminBadge></td><td class="px-4 py-2.5 text-right text-[11px] font-bold">{{ formatNaira(payment.amountKobo) }}</td><td class="px-4 py-2.5"><AdminBadge :variant="statusVariant[payment.status] || 'neutral'">{{ payment.status }}</AdminBadge></td><td class="px-4 py-2.5 text-[9px] text-muted">{{ formatDate(payment.createdAt, true) }}</td></tr><tr v-if="!(data?.items || []).length && !loading"><td colspan="6"><AdminEmpty title="No payments found" message="Try a different filter."><template #icon><CreditCard class="h-6 w-6" /></template></AdminEmpty></td></tr></template>
    </AdminTable>
    <div class="flex items-center justify-between border-t border-line pt-3 text-[10px] text-muted"><span>{{ data?.meta.total || 0 }} payments</span><div class="flex items-center gap-2"><AdminButton size="sm" variant="outline" :disabled="page <= 1" @click="page--; load()">Previous</AdminButton><span>Page {{ data?.meta.page || 1 }} / {{ data?.meta.pages || 1 }}</span><AdminButton size="sm" variant="outline" :disabled="page >= (data?.meta.pages || 1)" @click="page++; load()">Next</AdminButton></div></div>
  </div>
</template>
