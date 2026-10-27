<script setup lang="ts">
import { ArrowLeft, CalendarPlus, ExternalLink, PauseCircle, PlayCircle, RefreshCw, ShieldAlert, Ticket, UserCog } from 'lucide-vue-next';
import { useAdminAuthStore } from '~/stores/auth';
import { formatDate, formatNaira, titleCase } from '~/utils/format';
useSeoMeta({ title: 'Business detail' });
const route = useRoute();
const toast = useAdminToast();
const auth = useAdminAuthStore();
const config = useRuntimeConfig();
const notesApi = useAdminNotes('business', String(route.params.id));
const { business: data, plans, loading, saving, loadBusiness, loadPlans, changePlan: persistPlan, extendTrial: persistTrial, suspend: persistSuspend, grantCoupon: persistCoupon, impersonate } = useAdminBusinesses();
const planOpen = ref(false);
const trialOpen = ref(false);
const suspendOpen = ref(false);
const couponOpen = ref(false);
const planKey = ref('');
const interval = ref('monthly');
const trialDays = ref(14);
const trialPlan = ref('');
const suspendReason = ref('');
const note = ref('');
const coupon = reactive({ code: '', percentOff: 20, amountOff: '', expiresAt: '' });
async function load() {
  loading.value = true;
  try { await loadBusiness(String(route.params.id)); planKey.value = data.value?.subscription?.planKey || data.value?.plan?.key || 'free'; trialPlan.value = data.value?.subscription?.planKey !== 'free' ? data.value?.subscription?.planKey : 'hustle'; }
  catch (error) { toast.error((error as Error).message); }
}
async function loadPlanOptions() { try { await loadPlans(); } catch {} }
async function changePlan() {
  saving.value = true;
  try { await persistPlan(String(route.params.id), { planKey: planKey.value, interval: interval.value, note: note.value }); toast.success('Plan changed.'); planOpen.value = false; await load(); }
  catch (error) { toast.error((error as Error).message); }
}
async function extendTrial() {
  saving.value = true;
  try { await persistTrial(String(route.params.id), { days: Number(trialDays.value), planKey: trialPlan.value || undefined, note: note.value }); toast.success(`Trial extended ${trialDays.value} days.`); trialOpen.value = false; await load(); }
  catch (error) { toast.error((error as Error).message); }
}
async function toggleSuspend() {
  saving.value = true;
  try { await persistSuspend(String(route.params.id), { suspended: !data.value?.business.isSuspended, reason: suspendReason.value }); toast.success(data.value?.business.isSuspended ? 'Business restored.' : 'Business suspended.'); suspendOpen.value = false; await load(); }
  catch (error) { toast.error((error as Error).message); }
}
async function grantCoupon() {
  saving.value = true;
  try { await persistCoupon({ code: coupon.code, percentOff: Number(coupon.percentOff), amountOffKobo: coupon.amountOff ? Math.round(Number(coupon.amountOff) * 100) : 0, expiresAt: coupon.expiresAt || undefined, grantedToBusinessId: String(route.params.id) }); toast.success('Coupon granted to this business.'); couponOpen.value = false; await load(); }
  catch (error) { toast.error((error as Error).message); }
}
async function startImpersonation() {
  const win = window.open('about:blank', '_blank');
  if (!win) { toast.error('Allow popups to open the business app as this owner.'); return; }
  win.opener = null;
  try {
    const result = await impersonate(String(route.params.id));
    const url = `${config.public.appUrl}/impersonate#token=${encodeURIComponent(result.token)}&businessId=${encodeURIComponent(result.business.id)}`;
    win.location.href = url;
    toast.success(`Impersonation link opened for ${result.user.name}. It expires in 15 minutes.`);
  } catch (error) { win.close(); toast.error((error as Error).message); }
}
function addNote(body: string, pinned: boolean) { notesApi.create(body, pinned).then(() => toast.success('Note added.')).catch((error) => toast.error((error as Error).message)); }
function updateNote(id: string, payload: { body?: string; pinned?: boolean }) { notesApi.update(id, payload).catch((error) => toast.error((error as Error).message)); }
function removeNote(id: string) { notesApi.remove(id).then(() => toast.success('Note deleted.')).catch((error) => toast.error((error as Error).message)); }
onMounted(async () => { await Promise.all([load(), loadPlanOptions()]); await notesApi.load().catch(() => undefined); });
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-5">
    <div class="flex flex-wrap items-center gap-3"><NuxtLink to="/businesses" class="flex h-9 w-9 items-center justify-center rounded-lg border border-line"><ArrowLeft class="h-4 w-4" /></NuxtLink><div><p class="eyebrow">Business</p><h1 class="font-display text-2xl font-bold">{{ data?.business.name || 'Loading…' }}</h1></div><div class="ml-auto flex gap-1"><AdminBadge :variant="data?.business.storefrontPublished ? 'success' : 'neutral'">{{ data?.business.storefrontPublished ? 'Published' : 'Draft' }}</AdminBadge><AdminBadge v-if="data?.business.isSuspended" variant="danger">Suspended</AdminBadge></div></div>
    <div v-if="loading" class="skeleton h-64" />
    <template v-else-if="data">
      <div class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="card p-5">
          <div class="flex items-center justify-between gap-3"><div><p class="text-[10px] uppercase tracking-wider text-muted">Plan</p><p class="mt-1 text-lg font-display font-bold capitalize">{{ data.subscription?.planKey || data.plan?.key }}</p><p class="text-[10px] text-muted">{{ data.subscription?.status || 'none' }}<span v-if="data.subscription?.trialEndsAt"> · trial ends {{ formatDate(data.subscription.trialEndsAt) }}</span><span v-if="data.subscription?.currentPeriodEnd"> · period ends {{ formatDate(data.subscription.currentPeriodEnd) }}</span></p></div><AdminBadge :variant="data.subscription?.status === 'active' ? 'success' : data.subscription?.status === 'trialing' ? 'warning' : 'neutral'">{{ data.subscription?.status || 'none' }}</AdminBadge></div>
          <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><div class="rounded-lg bg-raised/60 p-2.5"><p class="text-[8px] uppercase tracking-wider text-muted">Products</p><p class="mt-0.5 text-sm font-bold">{{ data.usage.products }}</p></div><div class="rounded-lg bg-raised/60 p-2.5"><p class="text-[8px] uppercase tracking-wider text-muted">Sales</p><p class="mt-0.5 text-sm font-bold">{{ data.usage.sales }}</p></div><div class="rounded-lg bg-raised/60 p-2.5"><p class="text-[8px] uppercase tracking-wider text-muted">Revenue</p><p class="mt-0.5 text-sm font-bold">{{ formatNaira(data.usage.revenueKobo, true) }}</p></div><div class="rounded-lg bg-raised/60 p-2.5"><p class="text-[8px] uppercase tracking-wider text-muted">Orders</p><p class="mt-0.5 text-sm font-bold">{{ data.usage.orders }}</p></div></div>
          <div class="mt-4 border-t border-line pt-3"><p class="text-[10px] uppercase tracking-wider text-muted">Storefront</p><div class="mt-1 flex flex-wrap items-center gap-2 text-[11px]"><span class="rounded bg-raised px-2 py-0.5 font-mono">/s/{{ data.business.slug }}</span><span v-if="data.business.customDomain" class="rounded bg-raised px-2 py-0.5 font-mono">{{ data.business.customDomain }}</span><a :href="`${useRuntimeConfig().public.appUrl}/s/${data.business.slug}`" target="_blank" class="inline-flex items-center gap-1 font-bold text-acid">Open <ExternalLink class="h-3 w-3" /></a></div></div>
        </div>
        <div class="card p-5"><p class="text-xs font-bold">Admin controls</p><p v-if="!auth.isSuperAdmin" class="mt-2 rounded-lg bg-warning/10 p-2.5 text-[10px] text-warning">Support access is read-only.</p><div v-else class="mt-3 grid gap-2"><AdminButton variant="outline" @click="planOpen = true"><UserCog class="h-3.5 w-3.5" /> Change plan</AdminButton><AdminButton variant="outline" @click="trialOpen = true"><CalendarPlus class="h-3.5 w-3.5" /> Extend trial</AdminButton><AdminButton variant="outline" @click="couponOpen = true"><Ticket class="h-3.5 w-3.5" /> Grant coupon</AdminButton><AdminButton variant="outline" :loading="saving" @click="startImpersonation"><ShieldAlert class="h-3.5 w-3.5" /> Impersonate owner</AdminButton><AdminButton :variant="data.business.isSuspended ? 'primary' : 'danger'" @click="suspendOpen = true"><PlayCircle v-if="data.business.isSuspended" class="h-3.5 w-3.5" /><PauseCircle v-else class="h-3.5 w-3.5" /> {{ data.business.isSuspended ? 'Restore business' : 'Suspend business' }}</AdminButton></div></div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="card"><div class="border-b border-line p-4"><p class="text-xs font-bold">Team</p></div><div class="divide-y divide-line"><div v-for="member in data.memberships" :key="member.id" class="flex flex-wrap items-center gap-2 px-4 py-3 text-[11px]"><p class="font-semibold">{{ member.user?.name }}</p><span class="text-[9px] text-muted">{{ member.user?.email }}</span><AdminBadge class="ml-auto" :variant="member.role === 'owner' ? 'accent' : 'neutral'">{{ member.role }}</AdminBadge><span class="text-[9px] text-muted">{{ member.status }}</span></div></div></div>
        <div class="card"><div class="border-b border-line p-4"><p class="text-xs font-bold">Payment history</p></div><div class="divide-y divide-line"><div v-for="payment in data.payments" :key="payment.id" class="flex items-center justify-between gap-2 px-4 py-2.5 text-[10px]"><div><p class="font-mono">{{ payment.reference }}</p><p class="text-muted">{{ payment.purpose }} · {{ formatDate(payment.createdAt, true) }}</p></div><div class="text-right"><p class="font-bold">{{ formatNaira(payment.amountKobo) }}</p><AdminBadge :variant="payment.status === 'success' ? 'success' : payment.status === 'failed' ? 'danger' : 'warning'">{{ payment.status }}</AdminBadge></div></div><p v-if="!data.payments.length" class="p-4 text-[10px] text-muted">No payments yet.</p></div></div>
      </div>

      <div class="card"><div class="border-b border-line p-4"><p class="text-xs font-bold">Business audit trail</p></div><div class="divide-y divide-line"><div v-for="log in data.audit" :key="log.id" class="flex flex-wrap items-center gap-2 px-4 py-2.5 text-[10px]"><span class="rounded bg-raised px-1.5 py-0.5 font-mono text-[9px]">{{ log.action }}</span><span class="text-muted">{{ log.actorType }}</span><span class="ml-auto text-muted">{{ formatDate(log.createdAt, true) }}</span></div><p v-if="!data.audit.length" class="p-4 text-[10px] text-muted">No audit entries.</p></div></div>

      <AdminSupportNotes :notes="notesApi.notes.value" :loading="notesApi.loading.value" :saving="notesApi.saving.value" :editable="auth.isSuperAdmin" @add="addNote" @update="updateNote" @remove="removeNote" />

      <AdminModal v-model:open="planOpen" title="Change plan" description="This takes effect immediately. No payment is collected.">
        <div class="space-y-3"><AdminSelect v-model="planKey" label="Plan" :options="plans.map((p) => ({ value: p.key, label: `${p.name} — ${formatNaira(p.priceMonthlyKobo)}/mo` }))" /><AdminSelect v-model="interval" label="Billing interval" :options="[{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }]" /><AdminInput v-model="note" label="Internal note" placeholder="Why was this changed?" /></div>
        <div class="mt-4 flex justify-end gap-2"><AdminButton variant="ghost" @click="planOpen = false">Cancel</AdminButton><AdminButton :loading="saving" @click="changePlan">Apply plan</AdminButton></div>
      </AdminModal>
      <AdminModal v-model:open="trialOpen" title="Extend trial" description="Extra access without payment. Data remains safe.">
        <div class="space-y-3"><AdminInput v-model.number="trialDays" label="Days to add" type="number" min="1" /><AdminSelect v-model="trialPlan" label="Trial plan" :options="plans.map((p) => ({ value: p.key, label: p.name }))" /><AdminInput v-model="note" label="Internal note" /></div>
        <div class="mt-4 flex justify-end gap-2"><AdminButton variant="ghost" @click="trialOpen = false">Cancel</AdminButton><AdminButton :loading="saving" @click="extendTrial">Extend trial</AdminButton></div>
      </AdminModal>
      <AdminModal v-model:open="suspendOpen" :title="data.business.isSuspended ? 'Restore business' : 'Suspend business'" :description="data.business.isSuspended ? 'API access resumes immediately.' : 'The team will be blocked at the tenant guard. Data is preserved.'">
        <AdminInput v-model="suspendReason" label="Reason (audited)" placeholder="Chargeback investigation" />
        <div class="mt-4 flex justify-end gap-2"><AdminButton variant="ghost" @click="suspendOpen = false">Cancel</AdminButton><AdminButton :variant="data.business.isSuspended ? 'primary' : 'danger'" :loading="saving" @click="toggleSuspend">{{ data.business.isSuspended ? 'Restore' : 'Suspend' }}</AdminButton></div>
      </AdminModal>
      <AdminModal v-model:open="couponOpen" title="Grant a coupon" description="A private discount code tied to this business.">
        <div class="grid gap-3 sm:grid-cols-2"><AdminInput v-model="coupon.code" label="Code" placeholder="TOLA20" /><AdminInput v-model.number="coupon.percentOff" label="Percent off" type="number" /><AdminInput v-model="coupon.amountOff" label="Extra ₦ off (optional)" /><AdminDatePicker v-model="coupon.expiresAt" label="Expires (optional)" /></div>
        <div class="mt-4 flex justify-end gap-2"><AdminButton variant="ghost" @click="couponOpen = false">Cancel</AdminButton><AdminButton :loading="saving" @click="grantCoupon"><Ticket class="h-3.5 w-3.5" /> Grant coupon</AdminButton></div>
      </AdminModal>
    </template>
  </div>
</template>
