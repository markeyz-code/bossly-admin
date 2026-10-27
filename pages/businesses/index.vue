<script setup lang="ts">
import { ArrowUpRight, Building2, RefreshCw, Search } from 'lucide-vue-next';
import { formatDate, formatNaira } from '~/utils/format';
useSeoMeta({ title: 'Businesses' });
const toast = useAdminToast();
const { exporting, download } = useAdminExport();
async function exportCsv() { try { await download('businesses', { search: search.value || undefined, status: status.value }); toast.success('Businesses exported.'); } catch (error) { toast.error((error as Error).message); } }
const { result, loading, list: listBusinesses } = useAdminBusinesses();
const search = ref('');
const status = ref('all');
const page = ref(1);
let timer: ReturnType<typeof setTimeout> | null = null;
async function load() {
  loading.value = true;
  try { await listBusinesses({ page: page.value, limit: 25, search: search.value || undefined, status: status.value }); }
  catch (error) { toast.error((error as Error).message); }
}
watch(search, () => { if (timer) clearTimeout(timer); timer = setTimeout(() => { page.value = 1; load(); }, 300); });
watch(status, () => { page.value = 1; load(); });
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeading title="Businesses" subtitle="Every tenant, their plan, storefront and revenue at a glance." eyebrow="Network">
      <template #actions><AdminButton variant="outline" :loading="exporting === 'businesses'" @click="exportCsv">Export CSV</AdminButton><AdminButton variant="outline" :loading="loading" @click="load"><RefreshCw class="h-3.5 w-3.5" /> Refresh</AdminButton></template>
    </PageHeading>
    <div class="flex flex-col gap-2 sm:flex-row"><div class="relative flex-1"><Search class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" /><input v-model="search" type="search" placeholder="Search business, slug or email…" class="input-base pl-9"></div><AdminSelect v-model="status" :options="[{ value: 'all', label: 'All businesses' }, { value: 'published', label: 'Published' }, { value: 'unpublished', label: 'Unpublished' }, { value: 'suspended', label: 'Suspended' }]" aria-label="Business status" class="!w-44" /></div>
    <AdminTable :loading="loading && !result">
      <template #head><tr><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Business</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Owner</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Plan</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Activity</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Status</th><th class="px-4 py-2.5"></th></tr></template>
      <template #body>
        <tr v-for="business in result?.items || []" :key="business.id" class="border-b border-line last:border-0 hover:bg-raised/30">
          <td class="px-4 py-3"><p class="text-xs font-bold">{{ business.name }}</p><p class="text-[10px] text-muted">/s/{{ business.slug }} · {{ business.category }}</p></td>
          <td class="px-4 py-3"><p class="text-[11px]">{{ business.owner?.name || '—' }}</p><p class="text-[9px] text-muted">{{ business.owner?.email }}</p></td>
          <td class="px-4 py-3"><p class="text-[10px] font-bold uppercase">{{ business.subscription?.planKey || 'free' }}</p><AdminBadge class="mt-1" :variant="business.subscription?.status === 'active' ? 'success' : business.subscription?.status === 'trialing' ? 'warning' : 'neutral'">{{ business.subscription?.status || 'none' }}</AdminBadge></td>
          <td class="px-4 py-3"><p class="text-[10px]">{{ business.products }} products · {{ business.sales }} sales</p><p class="text-[10px] font-semibold text-acid">{{ formatNaira(business.revenueKobo) }}</p></td>
          <td class="px-4 py-3"><div class="flex flex-col gap-1"><AdminBadge :variant="business.published ? 'success' : 'neutral'">{{ business.published ? 'Published' : 'Draft' }}</AdminBadge><AdminBadge v-if="business.suspended" variant="danger">Suspended</AdminBadge></div></td>
          <td class="px-4 py-3 text-right"><NuxtLink :to="`/businesses/${business.id}`" class="inline-flex items-center gap-1 text-[10px] font-bold text-acid">Open <ArrowUpRight class="h-3 w-3" /></NuxtLink></td>
        </tr>
        <tr v-if="!(result?.items || []).length && !loading"><td colspan="6"><AdminEmpty title="No businesses matched" message="Try a different search or filter."><template #icon><Building2 class="h-6 w-6" /></template></AdminEmpty></td></tr>
      </template>
    </AdminTable>
    <div class="flex items-center justify-between border-t border-line pt-3 text-[10px] text-muted"><span>{{ result?.meta.total || 0 }} businesses</span><div class="flex items-center gap-2"><AdminButton size="sm" variant="outline" :disabled="page <= 1" @click="page--; load()">Previous</AdminButton><span>Page {{ result?.meta.page || 1 }} / {{ result?.meta.pages || 1 }}</span><AdminButton size="sm" variant="outline" :disabled="page >= (result?.meta.pages || 1)" @click="page++; load()">Next</AdminButton></div></div>
  </div>
</template>
