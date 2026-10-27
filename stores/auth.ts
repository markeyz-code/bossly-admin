import { defineStore } from 'pinia';
import { adminApi } from '~/api/adminApi';
import { adminTokenStorage } from '~/utils/auth-storage';
import type { AdminUser } from '~/types';

export const useAdminAuthStore = defineStore('admin-auth', () => {
  const user = ref<AdminUser | null>(null);
  const ready = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isAuthenticated = computed(() => Boolean(user.value && adminTokenStorage.getAccess()));
  const isSuperAdmin = computed(() => user.value?.platformRole === 'super_admin');

  async function login(email: string, password: string) {
    loading.value = true; error.value = null;
    try {
      const result = await adminApi.login(email, password);
      const role = result.user.platformRole;
      if (!role) throw new Error('This account does not have platform access.');
      adminTokenStorage.set(result.accessToken, result.refreshToken);
      user.value = result.user;
      ready.value = true;
      return result;
    } catch (err) { error.value = (err as Error).message; throw err; }
    finally { loading.value = false; }
  }

  async function hydrate() {
    if (!import.meta.client) return;
    if (!adminTokenStorage.getAccess()) { ready.value = true; return; }
    try {
      const me = await adminApi.me();
      if (!me.user.platformRole) throw new Error('No platform access');
      user.value = me.user;
    } catch {
      adminTokenStorage.clear();
      user.value = null;
    } finally { ready.value = true; }
  }

  async function logout() {
    try { await adminApi.logout(adminTokenStorage.getRefresh() || undefined); } catch {}
    adminTokenStorage.clear();
    user.value = null;
  }

  function clear() { adminTokenStorage.clear(); user.value = null; }
  return { user, ready, loading, error, isAuthenticated, isSuperAdmin, login, hydrate, logout, clear };
});
