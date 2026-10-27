import { adminApi } from '~/api/adminApi';
import type { AdminAffiliatePayout, AdminAffiliateStats, AdminAuditLog, AdminBusiness, AdminDashboard, AdminNote, AdminPayment, AdminPlan, AdminUser, Paginated } from '~/types';

export function useAdminDashboard() {
  const data = ref<AdminDashboard | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  async function load() {
    loading.value = true; error.value = null;
    try { data.value = await adminApi.dashboard(); }
    catch (err) { error.value = (err as Error).message; throw err; }
    finally { loading.value = false; }
  }
  return { data, loading, error, load };
}

export function useAdminUsers() {
  const result = ref<Paginated<AdminUser> | null>(null);
  const user = ref<{ user: AdminUser; memberships: Record<string, any>[]; audit: AdminAuditLog[] } | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  async function list(params: Record<string, unknown>) {
    loading.value = true;
    try { result.value = await adminApi.users(params); return result.value; }
    finally { loading.value = false; }
  }
  async function loadUser(id: string) {
    loading.value = true;
    try { user.value = await adminApi.user(id); return user.value; }
    finally { loading.value = false; }
  }
  async function updateUser(id: string, payload: { isActive?: boolean; platformRole?: 'super_admin' | 'support' | null }) {
    saving.value = true;
    try { return await adminApi.updateUser(id, payload); }
    finally { saving.value = false; }
  }
  return { result, user, loading, saving, list, loadUser, updateUser };
}

export function useAdminBusinesses() {
  const result = ref<Paginated<AdminBusiness> | null>(null);
  const business = ref<Record<string, any> | null>(null);
  const plans = ref<AdminPlan[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  async function list(params: Record<string, unknown>) {
    loading.value = true;
    try { result.value = await adminApi.businesses(params); return result.value; }
    finally { loading.value = false; }
  }
  async function loadBusiness(id: string) {
    loading.value = true;
    try { business.value = await adminApi.business(id); return business.value; }
    finally { loading.value = false; }
  }
  async function loadPlans() { plans.value = await adminApi.plans(); return plans.value; }
  async function changePlan(id: string, payload: { planKey: string; interval?: string; note?: string }) {
    saving.value = true;
    try { return await adminApi.changePlan(id, payload); }
    finally { saving.value = false; }
  }
  async function extendTrial(id: string, payload: { days: number; planKey?: string; note?: string }) {
    saving.value = true;
    try { return await adminApi.extendTrial(id, payload); }
    finally { saving.value = false; }
  }
  async function suspend(id: string, payload: { suspended: boolean; reason?: string }) {
    saving.value = true;
    try { return await adminApi.suspendBusiness(id, payload); }
    finally { saving.value = false; }
  }
  async function grantCoupon(payload: Record<string, unknown>) {
    saving.value = true;
    try { return await adminApi.createCoupon(payload); }
    finally { saving.value = false; }
  }
  async function impersonate(id: string) {
    saving.value = true;
    try { return await adminApi.impersonateBusiness(id); }
    finally { saving.value = false; }
  }
  return { result, business, plans, loading, saving, list, loadBusiness, loadPlans, changePlan, extendTrial, suspend, grantCoupon, impersonate };
}

export function useAdminPlans() {
  const plans = ref<AdminPlan[]>([]);
  const coupons = ref<Record<string, any>[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  async function load() {
    loading.value = true;
    try { [plans.value, coupons.value] = await Promise.all([adminApi.plans(), adminApi.coupons()]); }
    finally { loading.value = false; }
  }
  async function savePlan(creating: boolean, key: string, payload: Record<string, unknown>) {
    saving.value = true;
    try {
      if (creating) return await adminApi.createPlan({ key, ...payload });
      const { key: _key, ...update } = payload;
      return await adminApi.updatePlan(key, update);
    } finally { saving.value = false; }
  }
  async function createCoupon(payload: Record<string, unknown>) {
    saving.value = true;
    try { return await adminApi.createCoupon(payload); }
    finally { saving.value = false; }
  }
  async function revokeCoupon(id: string) {
    saving.value = true;
    try { return await adminApi.revokeCoupon(id); }
    finally { saving.value = false; }
  }
  return { plans, coupons, loading, saving, load, savePlan, createCoupon, revokeCoupon };
}

export function useAdminPayments() {
  const data = ref<Awaited<ReturnType<typeof adminApi.payments>> | null>(null);
  const loading = ref(false);
  async function load(params: Record<string, unknown>) {
    loading.value = true;
    try { data.value = await adminApi.payments(params); return data.value; }
    finally { loading.value = false; }
  }
  return { data, loading, load };
}

export function useAdminWhatsApp() {
  const health = ref<Record<string, any> | null>(null);
  const webhooks = ref<Record<string, any>[]>([]);
  const loading = ref(false);
  const retrying = ref(false);
  async function load() {
    loading.value = true;
    try { [health.value, webhooks.value] = await Promise.all([adminApi.whatsapp(), adminApi.webhooks()]); }
    finally { loading.value = false; }
  }
  async function retry() {
    retrying.value = true;
    try { return await adminApi.retryWebhooks(); }
    finally { retrying.value = false; }
  }
  return { health, webhooks, loading, retrying, load, retry };
}

export function useAdminAudit() {
  const result = ref<Paginated<AdminAuditLog> | null>(null);
  const loading = ref(false);
  async function load(params: Record<string, unknown>) {
    loading.value = true;
    try { result.value = await adminApi.auditLogs(params); return result.value; }
    finally { loading.value = false; }
  }
  return { result, loading, load };
}

export type { AdminPayment };


export function useAdminAffiliates() {
  const stats = ref<AdminAffiliateStats | null>(null);
  const payouts = ref<Paginated<AdminAffiliatePayout> | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  async function load(params: Record<string, unknown> = {}) {
    loading.value = true;
    try { [stats.value, payouts.value] = await Promise.all([adminApi.affiliates(), adminApi.affiliatePayouts(params)]); }
    finally { loading.value = false; }
  }
  async function updatePayout(id: string, payload: { status: 'paid' | 'rejected'; reference?: string; note?: string }) {
    saving.value = true;
    try { return await adminApi.updateAffiliatePayout(id, payload); }
    finally { saving.value = false; }
  }
  return { stats, payouts, loading, saving, load, updatePayout };
}

export function useAdminNotes(targetType: 'user' | 'business', targetId: string) {
  const notes = ref<AdminNote[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  async function load() {
    loading.value = true;
    try { notes.value = await adminApi.notes(targetType, targetId); }
    finally { loading.value = false; }
  }
  async function create(body: string, pinned = false) {
    saving.value = true;
    try { const note = await adminApi.createNote({ targetType, targetId, body, pinned }); notes.value = [note, ...notes.value]; return note; }
    finally { saving.value = false; }
  }
  async function update(id: string, payload: { body?: string; pinned?: boolean }) {
    saving.value = true;
    try {
      const note = await adminApi.updateNote(id, payload);
      notes.value = notes.value.map((item) => item.id === id ? note : item);
      return note;
    } finally { saving.value = false; }
  }
  async function remove(id: string) {
    saving.value = true;
    try { await adminApi.deleteNote(id); notes.value = notes.value.filter((item) => item.id !== id); }
    finally { saving.value = false; }
  }
  return { notes, loading, saving, load, create, update, remove };
}

export function useAdminExport() {
  const exporting = ref<string | null>(null);
  async function download(resource: string, params: Record<string, unknown> = {}) {
    exporting.value = resource;
    try {
      const file = await adminApi.exportCsv(resource, params);
      const url = URL.createObjectURL(file.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return file;
    } finally { exporting.value = null; }
  }
  return { exporting, download };
}
