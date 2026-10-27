import { setupHttp } from '~/api/http';
export default defineNuxtPlugin(() => { setupHttp(useRuntimeConfig().public.apiBase); });
