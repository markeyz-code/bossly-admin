<script setup lang="ts">
import { ArrowUpRight, RefreshCw, Search, Users } from 'lucide-vue-next';
import { formatDate } from '~/utils/format';
useSeoMeta({ title: 'Users' });
const toast = useAdminToast();
const { exporting, download } = useAdminExport();
async function exportCsv() { try { await download('users', { search: search.value || undefined, status: status.value }); toast.success('Users exported.'); } catch (error) { toast.error((error as Error).message); } }
const { result, loading, list: listUsers } = useAdminUsers();
const search = ref('');
const status = ref('all');
const page = ref(1);
let timer: ReturnType<typeof setTimeout> | null = null;
async function load() {
  loading.value = true;
  try { await listUsers({ page: page.value, limit: 25, search: search.value || undefined, status: status.value }); }
  catch (error) { toast.error((error as Error).message); }
}
watch(search, () => { if (timer) clearTimeout(timer); timer = setTimeout(() => { page.value = 1; load(); }, 300); });
watch(status, () => { page.value = 1; load(); });
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeading title="Users" subtitle="Every person on Ojaly, their businesses and their platform access." eyebrow="Network">
      <template #actions><AdminButton variant="outline" :loading="exporting === 'users'" @click="exportCsv">Export CSV</AdminButton><AdminButton variant="outline" :loading="loading" @click="load"><RefreshCw class="h-3.5 w-3.5" /> Refresh</AdminButton></template>
    </PageHeading>
    <div class="flex flex-col gap-2 sm:flex-row">
      <div class="relative flex-1"><Search class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" /><input v-model="search" type="search" placeholder="Search name, email or phone…" class="input-base pl-9"></div>
      <AdminSelect v-model="status" :options="[{ value: 'all', label: 'All users' }, { value: 'active', label: 'Active' }, { value: 'disabled', label: 'Disabled' }, { value: 'platform', label: 'Platform staff' }]" aria-label="User status" class="!w-44" />
    </div>
    <AdminTable :loading="loading && !result">
      <template #head><tr><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">User</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Businesses</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Access</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Status</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Joined</th><th class="px-4 py-2.5"></th></tr></template>
      <template #body>
        <tr v-for="user in result?.items || []" :key="user.id" class="border-b border-line last:border-0 hover:bg-raised/30">
          <td class="px-4 py-3"><p class="text-xs font-bold">{{ user.name }}</p><p class="text-[10px] text-muted">{{ user.email }}{{ user.phone ? ` · ${user.phone}` : '' }}</p></td>
          <td class="px-4 py-3"><div class="flex flex-wrap gap-1"><span v-for="biz in user.businesses || []" :key="biz.id" class="rounded bg-raised px-1.5 py-0.5 text-[9px] font-semibold">{{ biz.name || biz.id }}</span><span v-if="!(user.businesses || []).length" class="text-[10px] text-muted">None</span></div></td>
          <td class="px-4 py-3"><AdminBadge :variant="user.platformRole ? 'accent' : 'neutral'">{{ user.platformRole?.replace('_', ' ') || 'User' }}</AdminBadge></td>
          <td class="px-4 py-3"><AdminBadge :variant="user.isActive ? 'success' : 'danger'">{{ user.isActive ? 'Active' : 'Disabled' }}</AdminBadge></td>
          <td class="px-4 py-3 text-[10px] text-muted">{{ formatDate(user.createdAt) }}</td>
          <td class="px-4 py-3 text-right"><NuxtLink :to="`/users/${user.id}`" class="inline-flex items-center gap-1 text-[10px] font-bold text-acid">Open <ArrowUpRight class="h-3 w-3" /></NuxtLink></td>
        </tr>
        <tr v-if="!(result?.items || []).length && !loading"><td colspan="6"><AdminEmpty title="No users matched" message="Try a different search or filter."><template #icon><Users class="h-6 w-6" /></template></AdminEmpty></td></tr>
      </template>
    </AdminTable>
    <div class="flex items-center justify-between border-t border-line pt-3 text-[10px] text-muted"><span>{{ result?.meta.total || 0 }} users</span><div class="flex items-center gap-2"><AdminButton size="sm" variant="outline" :disabled="page <= 1" @click="page--; load()">Previous</AdminButton><span>Page {{ result?.meta.page || 1 }} / {{ result?.meta.pages || 1 }}</span><AdminButton size="sm" variant="outline" :disabled="page >= (result?.meta.pages || 1)" @click="page++; load()">Next</AdminButton></div></div>
  </div>
</template>
