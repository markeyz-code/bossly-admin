const ACCESS = 'bossly.admin.access';
const REFRESH = 'bossly.admin.refresh';
export const adminTokenStorage = {
  getAccess: () => import.meta.client ? localStorage.getItem(ACCESS) : null,
  getRefresh: () => import.meta.client ? localStorage.getItem(REFRESH) : null,
  set(access: string, refresh?: string) { if (!import.meta.client) return; localStorage.setItem(ACCESS, access); if (refresh) localStorage.setItem(REFRESH, refresh); },
  clear() { if (!import.meta.client) return; localStorage.removeItem(ACCESS); localStorage.removeItem(REFRESH); },
};
