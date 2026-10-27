import { http, unwrap } from './http';
import type { AdminAffiliatePayout, AdminAffiliateStats, AdminAuditLog, AdminBusiness, AdminDashboard, AdminNote, AdminPayment, AdminPlan, AdminUser, Paginated } from '~/types';

export const adminApi = {
  login(email: string, password: string) {
    return unwrap<{ user: AdminUser; accessToken: string; refreshToken: string }>(http().post('/auth/platform/login', { email, password }));
  },
  me() { return unwrap<{ user: AdminUser; activeBusinessId: string | null }>(http().get('/auth/me')); },
  logout(refreshToken?: string) { return unwrap<{ loggedOut: boolean }>(http().post('/auth/logout', { refreshToken })); },
  dashboard() { return unwrap<AdminDashboard>(http().get('/admin/dashboard')); },
  users(params: Record<string, unknown>) { return unwrap<Paginated<AdminUser>>(http().get('/admin/users', { params })); },
  user(id: string) { return unwrap<{ user: AdminUser; memberships: Record<string, unknown>[]; audit: AdminAuditLog[] }>(http().get(`/admin/users/${id}`)); },
  updateUser(id: string, payload: { isActive?: boolean; platformRole?: string | null }) { return unwrap<{ updated: boolean }>(http().patch(`/admin/users/${id}`, payload)); },
  businesses(params: Record<string, unknown>) { return unwrap<Paginated<AdminBusiness>>(http().get('/admin/businesses', { params })); },
  business(id: string) { return unwrap<Record<string, any>>(http().get(`/admin/businesses/${id}`)); },
  changePlan(id: string, payload: { planKey: string; interval?: string; note?: string }) { return unwrap(http().patch(`/admin/businesses/${id}/plan`, payload)); },
  extendTrial(id: string, payload: { days: number; planKey?: string; note?: string }) { return unwrap(http().post(`/admin/businesses/${id}/extend-trial`, payload)); },
  suspendBusiness(id: string, payload: { suspended: boolean; reason?: string }) { return unwrap(http().patch(`/admin/businesses/${id}/suspend`, payload)); },
  plans() { return unwrap<AdminPlan[]>(http().get('/admin/plans')); },
  createPlan(payload: Record<string, unknown>) { return unwrap(http().post('/admin/plans', payload)); },
  updatePlan(key: string, payload: Record<string, unknown>) { return unwrap(http().patch(`/admin/plans/${key}`, payload)); },
  coupons() { return unwrap<Record<string, any>[]>(http().get('/admin/coupons')); },
  createCoupon(payload: Record<string, unknown>) { return unwrap(http().post('/admin/coupons', payload)); },
  revokeCoupon(id: string) { return unwrap(http().delete(`/admin/coupons/${id}`)); },
  payments(params: Record<string, unknown>) {
    return unwrap<{ items: AdminPayment[]; meta: { total: number; page: number; limit: number; pages: number; byStatus: Record<string, { count: number; amountKobo: number }> } }>(http().get('/admin/payments', { params }));
  },
  whatsapp() { return unwrap<Record<string, any>>(http().get('/admin/whatsapp')); },
  webhooks() { return unwrap<Record<string, any>[]>(http().get('/admin/webhooks')); },
  retryWebhooks() { return unwrap<{ retried: number }>(http().post('/admin/webhooks/retry')); },
  auditLogs(params: Record<string, unknown>) { return unwrap<Paginated<AdminAuditLog>>(http().get('/admin/audit-logs', { params })); },
  impersonateBusiness(id: string) {
    return unwrap<{ token: string; expiresAt: string; business: { id: string; name: string; slug: string }; user: { id: string; name: string; email: string } }>(http().post(`/admin/businesses/${id}/impersonate`));
  },
  affiliates() { return unwrap<AdminAffiliateStats>(http().get('/admin/affiliates')); },
  affiliatePayouts(params: Record<string, unknown>) { return unwrap<Paginated<AdminAffiliatePayout>>(http().get('/admin/affiliate-payouts', { params })); },
  updateAffiliatePayout(id: string, payload: { status: 'paid' | 'rejected'; reference?: string; note?: string }) {
    return unwrap<{ updated: boolean; status: string }>(http().patch(`/admin/affiliate-payouts/${id}`, payload));
  },
  notes(targetType: 'user' | 'business', targetId: string) {
    return unwrap<AdminNote[]>(http().get('/admin/notes', { params: { targetType, targetId } }));
  },
  createNote(payload: { targetType: 'user' | 'business'; targetId: string; body: string; pinned?: boolean }) {
    return unwrap<AdminNote>(http().post('/admin/notes', payload));
  },
  updateNote(id: string, payload: { body?: string; pinned?: boolean }) {
    return unwrap<AdminNote>(http().patch(`/admin/notes/${id}`, payload));
  },
  deleteNote(id: string) { return unwrap<{ deleted: boolean }>(http().delete(`/admin/notes/${id}`)); },
  async exportCsv(resource: string, params: Record<string, unknown> = {}) {
    const response = await http().get(`/admin/exports/${resource}`, { params, responseType: 'blob' });
    const disposition = String(response.headers['content-disposition'] || '');
    const match = /filename="([^"]+)"/.exec(disposition);
    return { blob: response.data as Blob, filename: match?.[1] || `bossly-${resource}.csv` };
  },
};
