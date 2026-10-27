<script setup lang="ts">
import { Check, Pencil, Plus, RefreshCw, Ticket, Trash2 } from 'lucide-vue-next';
import { useAdminAuthStore } from '~/stores/auth';
import type { AdminPlan } from '~/types';
import { formatDate, formatNaira, titleCase } from '~/utils/format';
useSeoMeta({ title: 'Plans & coupons' });
const toast = useAdminToast();
const auth = useAdminAuthStore();
const { plans, coupons, loading, saving, load: loadPlans, savePlan: persistPlan, createCoupon: persistCoupon, revokeCoupon } = useAdminPlans();
const planOpen = ref(false);
const couponOpen = ref(false);
const creatingPlan = ref(false);
const editingKey = ref<string | null>(null);
const form = reactive({ key: '', name: '', description: '', monthly: '', yearly: '', trialDays: 14, milestone: 0, monthlyCode: '', yearlyCode: '', features: '', active: true, default: false, trial: false, productLimit: '25', staffSeats: 0, customDomain: false, csvExport: false, pdfExport: false, advancedReports: false, templates: 'lagos-pop, market-bright' });
const coupon = reactive({ code: '', percentOff: 20, amountOff: '', maxRedemptions: '', expiresAt: '', businessId: '' });
async function load() {
  loading.value = true;
  try { await loadPlans(); }
  catch (error) { toast.error((error as Error).message); }
}
function openPlan(plan?: AdminPlan) {
  creatingPlan.value = !plan; editingKey.value = plan?.key || null;
  Object.assign(form, plan ? {
    key: plan.key, name: plan.name, description: plan.description, monthly: String(plan.priceMonthlyKobo / 100), yearly: String(plan.priceYearlyKobo / 100),
    trialDays: plan.trialDays, milestone: plan.trialMilestoneOrders || 0, monthlyCode: plan.paystackPlanCodeMonthly || '', yearlyCode: plan.paystackPlanCodeYearly || '',
    features: (plan.marketingFeatures || []).join(', '), active: plan.isActive, default: plan.isDefault, trial: plan.isTrialPlan,
    productLimit: plan.entitlements.productLimit === null ? '' : String(plan.entitlements.productLimit), staffSeats: plan.entitlements.staffSeats,
    customDomain: plan.entitlements.customDomain, csvExport: plan.entitlements.csvExport, pdfExport: plan.entitlements.pdfExport,
    advancedReports: plan.entitlements.advancedReports, templates: (plan.entitlements.templates || []).join(', '),
  } : { key: '', name: '', description: '', monthly: '', yearly: '', trialDays: 14, milestone: 0, monthlyCode: '', yearlyCode: '', features: '', active: true, default: false, trial: false, productLimit: '25', staffSeats: 0, customDomain: false, csvExport: false, pdfExport: false, advancedReports: false, templates: 'lagos-pop, market-bright' });
  planOpen.value = true;
}
async function savePlan() {
  const payload = {
    key: form.key, name: form.name, description: form.description,
    priceMonthlyKobo: Math.round(Number(form.monthly || 0) * 100), priceYearlyKobo: Math.round(Number(form.yearly || 0) * 100),
    trialDays: Number(form.trialDays), trialMilestoneOrders: Number(form.milestone), isActive: form.active, isDefault: form.default, isTrialPlan: form.trial,
    paystackPlanCodeMonthly: form.monthlyCode || null, paystackPlanCodeYearly: form.yearlyCode || null,
    marketingFeatures: form.features.split(',').map((f) => f.trim()).filter(Boolean),
    entitlements: { productLimit: form.productLimit === '' ? null : Number(form.productLimit), staffSeats: Number(form.staffSeats), customDomain: form.customDomain, csvExport: form.csvExport, pdfExport: form.pdfExport, advancedReports: form.advancedReports, templates: form.templates.split(',').map((t) => t.trim()).filter(Boolean) },
  };
  saving.value = true;
  try {
    await persistPlan(creatingPlan.value, payload.key, { ...payload });
    toast.success('Plan saved.'); planOpen.value = false; await load();
  } catch (error) { toast.error((error as Error).message); }
  finally { saving.value = false; }
}
async function createCoupon() {
  if (!coupon.code) { toast.error('Enter a coupon code.'); return; }
  saving.value = true;
  try {
    await persistCoupon({ code: coupon.code, percentOff: Number(coupon.percentOff), amountOffKobo: coupon.amountOff ? Math.round(Number(coupon.amountOff) * 100) : 0, maxRedemptions: coupon.maxRedemptions ? Number(coupon.maxRedemptions) : null, expiresAt: coupon.expiresAt || undefined, grantedToBusinessId: coupon.businessId || undefined });
    toast.success('Coupon created.'); couponOpen.value = false; await load();
    Object.assign(coupon, { code: '', percentOff: 20, amountOff: '', maxRedemptions: '', expiresAt: '', businessId: '' });
  } catch (error) { toast.error((error as Error).message); }
  finally { saving.value = false; }
}
async function revoke(id: string) { try { await revokeCoupon(id); toast.success('Coupon revoked.'); await load(); } catch (e) { toast.error((e as Error).message); } }
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeading title="Plans & coupons" subtitle="Entitlements, trial logic and discount plumbing. Changes affect entitlements immediately." eyebrow="Monetisation">
      <template #actions><AdminButton variant="outline" :loading="loading" @click="load"><RefreshCw class="h-3.5 w-3.5" /> Refresh</AdminButton><AdminButton v-if="auth.isSuperAdmin" @click="openPlan()"><Plus class="h-3.5 w-3.5" /> New plan</AdminButton></template>
    </PageHeading>
    <div class="grid gap-3 lg:grid-cols-3">
      <div v-for="plan in plans" :key="plan.key" class="card p-4">
        <div class="flex items-start justify-between gap-2"><div><p class="font-display text-lg font-bold">{{ plan.name }}</p><p class="text-[10px] text-muted">{{ plan.description }}</p></div><div class="flex flex-col items-end gap-1"><AdminBadge :variant="plan.isActive ? 'success' : 'neutral'">{{ plan.isActive ? 'Active' : 'Inactive' }}</AdminBadge><AdminBadge v-if="plan.isTrialPlan" variant="accent">Trial</AdminBadge></div></div>
        <p class="mt-3 font-display text-2xl font-bold">{{ plan.priceMonthlyKobo === 0 ? 'Free' : formatNaira(plan.priceMonthlyKobo) }}<span v-if="plan.priceMonthlyKobo" class="text-[10px] text-muted">/mo</span></p>
        <div class="mt-2 flex flex-wrap gap-1"><span class="rounded bg-raised px-1.5 py-0.5 text-[9px]">{{ plan.subscriptions }} subs</span><span class="rounded bg-raised px-1.5 py-0.5 text-[9px]">{{ plan.entitlements.productLimit ?? '∞' }} products</span><span class="rounded bg-raised px-1.5 py-0.5 text-[9px]">{{ plan.entitlements.staffSeats }} seats</span><span class="rounded bg-raised px-1.5 py-0.5 text-[9px]">{{ plan.trialDays }}d trial</span></div>
        <div class="mt-3 space-y-1 text-[10px] text-muted"><p v-for="feature in plan.marketingFeatures.slice(0, 3)" :key="feature" class="flex gap-1"><Check class="mt-0.5 h-2.5 w-2.5 text-acid" />{{ feature }}</p></div>
        <AdminButton v-if="auth.isSuperAdmin" size="sm" variant="outline" block class="mt-3" @click="openPlan(plan)"><Pencil class="h-3 w-3" /> Edit plan</AdminButton>
      </div>
    </div>

    <div class="card">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4"><div><p class="text-xs font-bold">Coupons</p><p class="text-[10px] text-muted">Codes for discounts and student promos. Coupons can be tied to one business.</p></div><AdminButton v-if="auth.isSuperAdmin" size="sm" variant="outline" @click="couponOpen = true"><Ticket class="h-3 w-3" /> New coupon</AdminButton></div>
      <AdminTable>
        <template #head><tr><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Code</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Discount</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Uses</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Expires</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Status</th><th class="px-4 py-2.5"></th></tr></template>
        <template #body><tr v-for="c in coupons" :key="c.id" class="border-b border-line last:border-0"><td class="px-4 py-2.5 font-mono text-[11px] font-bold">{{ c.code }}</td><td class="px-4 py-2.5 text-[10px]">{{ c.percentOff }}%{{ c.amountOffKobo ? ` + ${formatNaira(c.amountOffKobo)}` : '' }}</td><td class="px-4 py-2.5 text-[10px]">{{ c.redeemedCount }}{{ c.maxRedemptions ? ` / ${c.maxRedemptions}` : '' }}</td><td class="px-4 py-2.5 text-[10px] text-muted">{{ c.expiresAt ? formatDate(c.expiresAt) : 'Never' }}</td><td class="px-4 py-2.5"><AdminBadge :variant="c.isActive ? 'success' : 'neutral'">{{ c.isActive ? 'Live' : 'Off' }}</AdminBadge></td><td class="px-4 py-2.5 text-right"><button v-if="auth.isSuperAdmin && c.isActive" class="text-[10px] font-bold text-danger" @click="revoke(c.id)">Revoke</button></td></tr><tr v-if="!coupons.length"><td colspan="6"><AdminEmpty title="No coupons yet" message="Create a code for a student promo or a private discount." /></td></tr></template>
      </AdminTable>
    </div>

    <AdminModal v-model:open="planOpen" :title="creatingPlan ? 'Create a plan' : 'Edit plan'" description="Paystack plan codes are required for recurring billing. Leave blank for one-time discounted checkouts." size="lg">
      <div class="grid gap-3 sm:grid-cols-2">
        <AdminInput v-model="form.key" label="Key" :disabled="!creatingPlan" placeholder="hustle" /><AdminInput v-model="form.name" label="Name" /><div class="sm:col-span-2"><AdminInput v-model="form.description" label="Description" /></div>
        <AdminInput v-model="form.monthly" label="Monthly price (₦)" type="number" /><AdminInput v-model="form.yearly" label="Yearly price (₦)" type="number" />
        <AdminInput v-model.number="form.trialDays" label="Trial days" type="number" /><AdminInput v-model.number="form.milestone" label="Trial usage milestone (orders, 0 = time only)" type="number" />
        <AdminInput v-model="form.monthlyCode" label="Paystack monthly plan code" /><AdminInput v-model="form.yearlyCode" label="Paystack yearly plan code" />
        <AdminInput v-model="form.productLimit" label="Product limit (blank = unlimited)" /><AdminInput v-model.number="form.staffSeats" label="Staff seats" type="number" />
        <div class="sm:col-span-2"><AdminInput v-model="form.templates" label="Templates (comma separated)" /></div>
        <div class="sm:col-span-2"><AdminInput v-model="form.features" label="Marketing features (comma separated)" /></div>
      </div>
      <div class="mt-3 flex flex-wrap gap-4 text-[11px]"><label class="flex items-center gap-1.5"><input v-model="form.active" type="checkbox"> Active</label><label class="flex items-center gap-1.5"><input v-model="form.default" type="checkbox"> Default free plan</label><label class="flex items-center gap-1.5"><input v-model="form.trial" type="checkbox"> Trial plan</label><label class="flex items-center gap-1.5"><input v-model="form.customDomain" type="checkbox"> Custom domain</label><label class="flex items-center gap-1.5"><input v-model="form.csvExport" type="checkbox"> CSV export</label><label class="flex items-center gap-1.5"><input v-model="form.pdfExport" type="checkbox"> PDF export</label><label class="flex items-center gap-1.5"><input v-model="form.advancedReports" type="checkbox"> Advanced reports</label></div>
      <div class="mt-4 flex justify-end gap-2"><AdminButton variant="ghost" @click="planOpen = false">Cancel</AdminButton><AdminButton :loading="saving" @click="savePlan">Save plan</AdminButton></div>
    </AdminModal>

    <AdminModal v-model:open="couponOpen" title="Create a coupon">
      <div class="grid gap-3 sm:grid-cols-2"><AdminInput v-model="coupon.code" label="Code" /><AdminInput v-model.number="coupon.percentOff" label="Percent off" type="number" /><AdminInput v-model="coupon.amountOff" label="Extra ₦ off (optional)" /><AdminInput v-model.number="coupon.maxRedemptions" label="Max redemptions (optional)" type="number" /><AdminDatePicker v-model="coupon.expiresAt" label="Expires" /><AdminInput v-model="coupon.businessId" label="Limit to business ID (optional)" /></div>
      <div class="mt-4 flex justify-end gap-2"><AdminButton variant="ghost" @click="couponOpen = false">Cancel</AdminButton><AdminButton :loading="saving" @click="createCoupon">Create coupon</AdminButton></div>
    </AdminModal>
  </div>
</template>
