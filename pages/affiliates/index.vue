<script setup lang="ts">
import { ArrowUpRight, BadgeDollarSign, Banknote, Download, RefreshCw, Users } from 'lucide-vue-next';
import { useAdminAuthStore } from '~/stores/auth';
import type { AdminAffiliatePayout } from '~/types';
import { formatDate, formatNaira } from '~/utils/format';
useSeoMeta({ title: 'Affiliates & payouts' });
const auth = useAdminAuthStore();
const toast = useAdminToast();
const { stats, payouts, loading, saving, load, updatePayout } = useAdminAffiliates();
const { exporting, download } = useAdminExport();
const status = ref('requested');
const page = ref(1);
const selected = ref<AdminAffiliatePayout | null>(null);
const action = ref<'paid' | 'rejected'>('paid');
const reference = ref('');
const note = ref('');
const modalOpen = ref(false);

async function reload() {
  try { await load({ status: status.value, page: page.value, limit: 30 }); }
  catch (error) { toast.error((error as Error).message); }
}
function openAction(payout: AdminAffiliatePayout, next: 'paid' | 'rejected') {
  selected.value = payout; action.value = next; reference.value = ''; note.value = ''; modalOpen.value = true;
}
async function confirmAction() {
  if (!selected.value) return;
  try {
    await updatePayout(selected.value.id, { status: action.value, reference: reference.value || undefined, note: note.value || undefined });
    toast.success(action.value === 'paid' ? 'Payout marked paid.' : 'Payout rejected and balance restored.');
    modalOpen.value = false;
    await reload();
  } catch (error) { toast.error((error as Error).message); }
}
async function exportRows(resource: 'affiliates' | 'affiliate-payouts') {
  try { await download(resource); toast.success(`${resource === 'affiliates' ? 'Affiliate' : 'Payout'} CSV downloaded.`); }
  catch (error) { toast.error((error as Error).message); }
}
watch(status, () => { page.value = 1; void reload(); });
onMounted(reload);
</script>

<template>
  <div class="space-y-5">
    <PageHeading title="Affiliates & payouts" subtitle="Who is bringing businesses to Bossly, what they earned and what needs to be paid." eyebrow="Growth">
      <template #actions><AdminButton variant="outline" :loading="loading" @click="reload"><RefreshCw class="h-3.5 w-3.5" /> Refresh</AdminButton><AdminButton variant="outline" :loading="exporting === 'affiliates'" @click="exportRows('affiliates')"><Download class="h-3.5 w-3.5" /> Export affiliates</AdminButton><AdminButton variant="outline" :loading="exporting === 'affiliate-payouts'" @click="exportRows('affiliate-payouts')"><Download class="h-3.5 w-3.5" /> Export payouts</AdminButton></template>
    </PageHeading>

    <div v-if="stats" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStat label="Affiliates" :value="stats.metrics.affiliates" :hint="`${stats.metrics.referrals} referrals · ${stats.metrics.conversions} conversions`" />
      <AdminStat label="Commission earned" :value="formatNaira(stats.metrics.totalEarnedKobo, true)" tone="acid" :hint="`${formatNaira(stats.metrics.pendingKobo, true)} on hold`" />
      <AdminStat label="Available" :value="formatNaira(stats.metrics.availableKobo, true)" :hint="`${formatNaira(stats.metrics.paidKobo, true)} paid out`" />
      <AdminStat label="Payout requests" :value="stats.metrics.pendingPayouts" :tone="stats.metrics.pendingPayouts ? 'danger' : 'acid'" hint="Awaiting review" />
    </div>

    <div class="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <div class="card">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4"><div><p class="text-xs font-bold">Payout requests</p><p class="text-[10px] text-muted">Paying a request moves the reserved balance to paid. Rejecting restores it.</p></div><AdminSelect v-model="status" :options="[{ value: 'requested', label: 'Requested' }, { value: 'paid', label: 'Paid' }, { value: 'rejected', label: 'Rejected' }, { value: 'all', label: 'All statuses' }]" aria-label="Payout status" class="!w-40" size="sm" /></div>
        <AdminTable :loading="loading && !payouts">
          <template #head><tr><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Business</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Bank</th><th class="px-4 py-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-muted">Amount</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Status</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Requested</th><th class="px-4 py-2.5"></th></tr></template>
          <template #body>
            <tr v-for="item in payouts?.items || []" :key="item.id" class="border-b border-line last:border-0 hover:bg-raised/30">
              <td class="px-4 py-3"><p class="text-[11px] font-bold">{{ item.business?.name || item.businessId }}</p><p class="text-[9px] text-muted">/s/{{ item.business?.slug }}</p></td>
              <td class="px-4 py-3"><p class="text-[10px] font-semibold">{{ item.bankName }}</p><p class="text-[9px] text-muted">{{ item.accountName }} · {{ item.accountNumber }}</p></td>
              <td class="px-4 py-3 text-right text-[11px] font-bold">{{ formatNaira(item.amountKobo) }}</td>
              <td class="px-4 py-3"><AdminBadge :variant="item.status === 'paid' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'">{{ item.status }}</AdminBadge></td>
              <td class="px-4 py-3 text-[9px] text-muted">{{ formatDate(item.createdAt, true) }}</td>
              <td class="px-4 py-3 text-right">
                <div v-if="auth.isSuperAdmin && item.status === 'requested'" class="flex justify-end gap-1"><button class="rounded-md border border-line px-2 py-1 text-[9px] font-bold text-success hover:border-success" @click="openAction(item, 'paid')">Pay</button><button class="rounded-md border border-line px-2 py-1 text-[9px] font-bold text-danger hover:border-danger" @click="openAction(item, 'rejected')">Reject</button></div>
                <span v-else class="text-[9px] text-muted">{{ item.reference || '—' }}</span>
              </td>
            </tr>
            <tr v-if="!(payouts?.items || []).length && !loading"><td colspan="6"><AdminEmpty title="No payouts here" message="Affiliate payout requests will appear as soon as they are submitted."><template #icon><Banknote class="h-6 w-6" /></template></AdminEmpty></td></tr>
          </template>
        </AdminTable>
        <div class="flex items-center justify-between border-t border-line px-4 py-3 text-[10px] text-muted"><span>{{ payouts?.meta.total || 0 }} requests</span><div class="flex items-center gap-2"><AdminButton size="sm" variant="outline" :disabled="page <= 1" @click="page--; reload()">Previous</AdminButton><span>Page {{ payouts?.meta.page || 1 }} / {{ payouts?.meta.pages || 1 }}</span><AdminButton size="sm" variant="outline" :disabled="page >= (payouts?.meta.pages || 1)" @click="page++; reload()">Next</AdminButton></div></div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between border-b border-line p-4"><div><p class="text-xs font-bold">Top affiliates</p><p class="text-[10px] text-muted">By commission earned</p></div><Users class="h-4 w-4 text-acid" /></div>
        <div class="divide-y divide-line">
          <div v-for="(item, index) in stats?.topAffiliates || []" :key="item.businessId" class="flex items-center gap-2.5 px-4 py-3">
            <span class="flex h-6 w-6 items-center justify-center rounded-md bg-raised text-[9px] font-bold text-muted">{{ index + 1 }}</span>
            <div class="min-w-0 flex-1"><p class="truncate text-[11px] font-bold">{{ item.name }}</p><p class="text-[9px] text-muted">{{ item.code }} · {{ item.conversions }}/{{ item.referrals }} converted</p></div>
            <div class="text-right"><p class="text-[10px] font-bold">{{ formatNaira(item.earnedKobo) }}</p><p class="text-[9px] text-acid">{{ formatNaira(item.availableKobo) }} avail.</p></div>
            <NuxtLink :to="`/businesses/${item.businessId}`" class="text-muted hover:text-acid" aria-label="Open business"><ArrowUpRight class="h-3.5 w-3.5" /></NuxtLink>
          </div>
          <p v-if="!stats?.topAffiliates.length" class="p-4 text-[10px] text-muted">No affiliate activity yet.</p>
        </div>
        <div class="border-t border-line p-4"><p class="text-[10px] font-bold">How it pays</p><p class="mt-1 text-[9px] leading-relaxed text-muted">20% of the referred business's first subscription payment. Commissions clear after 7 days. Minimum payout ₦1,000. Mark paid only after the transfer has left.</p><div class="mt-3 flex items-center gap-2 rounded-lg bg-success/10 p-2 text-[9px] text-success"><BadgeDollarSign class="h-3.5 w-3.5" /> All payouts are audited with your admin identity.</div></div>
      </div>
    </div>

    <AdminModal v-model:open="modalOpen" :title="action === 'paid' ? 'Mark payout as paid' : 'Reject payout request'" :description="selected ? `${selected.business?.name || selected.businessId} · ${formatNaira(selected.amountKobo)}` : ''">
      <div v-if="selected" class="space-y-3 rounded-xl bg-raised/60 p-3 text-[11px]"><p><span class="text-muted">Bank:</span> <strong>{{ selected.bankName }}</strong></p><p><span class="text-muted">Account:</span> <strong>{{ selected.accountName }} · {{ selected.accountNumber }}</strong></p><p><span class="text-muted">Requested:</span> {{ formatDate(selected.createdAt, true) }}</p></div>
      <div class="mt-4 space-y-3"><AdminInput v-if="action === 'paid'" v-model="reference" label="Transfer reference" placeholder="GTB-2026-..." /><AdminInput v-model="note" label="Internal note" :placeholder="action === 'paid' ? 'Paid via GTBank transfer' : 'Why was this rejected?'" /></div>
      <div class="mt-5 flex justify-end gap-2"><AdminButton variant="ghost" @click="modalOpen = false">Cancel</AdminButton><AdminButton :variant="action === 'paid' ? 'primary' : 'danger'" :loading="saving" @click="confirmAction">{{ action === 'paid' ? 'Mark paid' : 'Reject & restore' }}</AdminButton></div>
    </AdminModal>
  </div>
</template>
