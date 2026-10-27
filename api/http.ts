import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { adminTokenStorage } from '~/utils/auth-storage';

let instance: AxiosInstance | null = null;
let apiBase = '';
let refreshing: Promise<boolean> | null = null;
interface RetryConfig extends InternalAxiosRequestConfig { _retried?: boolean }

export function setupHttp(base: string) {
  apiBase = base.replace(/\/$/, '');
  instance = axios.create({ baseURL: apiBase, timeout: 25000 });
  instance.interceptors.request.use((config) => {
    const token = adminTokenStorage.getAccess();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryConfig | undefined;
      if (error.response?.status === 401 && config && !config._retried && !config.url?.includes('/auth/platform/login') && !config.url?.includes('/auth/refresh')) {
        config._retried = true;
        const refreshed = await refresh();
        if (refreshed) return http().request(config);
        adminTokenStorage.clear();
        if (import.meta.client) window.dispatchEvent(new CustomEvent('bossly:admin-expired'));
      }
      throw normalizeAdminError(error);
    },
  );
  return instance;
}
export function http(): AxiosInstance { if (!instance) throw new Error('Admin API not initialised'); return instance; }
async function refresh(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const token = adminTokenStorage.getRefresh();
    if (!token) return false;
    try {
      const response = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(`${apiBase}/auth/refresh`, { refreshToken: token }, { timeout: 15000 });
      adminTokenStorage.set(response.data.data.accessToken, response.data.data.refreshToken);
      return true;
    } catch { return false; }
    finally { refreshing = null; }
  })();
  return refreshing;
}
export function normalizeAdminError(error: unknown): Error {
  const maybe = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
  return new Error(maybe?.response?.data?.error?.message || maybe?.message || 'Request failed.');
}
export async function unwrap<T>(promise: Promise<{ data: { data: T } }>): Promise<T> {
  const response = await promise;
  return response.data.data;
}
