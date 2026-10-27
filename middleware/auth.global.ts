export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) return;
  const auth = useAdminAuthStore();
  if (!auth.ready) await auth.hydrate();
  if (to.path !== '/login' && !auth.isAuthenticated) return navigateTo('/login');
  if (to.path === '/login' && auth.isAuthenticated) return navigateTo('/');
});
