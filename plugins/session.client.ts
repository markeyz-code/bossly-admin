import { useAdminAuthStore } from '~/stores/auth';
export default defineNuxtPlugin(async () => {
  const auth = useAdminAuthStore();
  await auth.hydrate();
  window.addEventListener('ojaly:admin-expired', () => {
    auth.clear();
    if (!window.location.pathname.startsWith('/login')) void navigateTo('/login');
  });
});
