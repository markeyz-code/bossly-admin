<script setup lang="ts">
import { FileClock, RefreshCw, Search } from 'lucide-vue-next';
import { formatDate } from '~/utils/format';
useSeoMeta({ title: 'Audit log' });
const toast = useAdminToast();
const { exporting, download } = useAdminExport();
async function exportCsv() { try { await download('audit', { action: action.value || undefined, businessId: businessId.value || undefined, actorId: actorId.value || undefined }); toast.success('Audit log exported.'); } catch (error) { toast.error((error as Error).message); } }
const { result, loading, load: loadAudit } = useAdminAudit();
const action = ref('');
const actorId = ref('');
const businessId = ref('');
const page = ref(1);
let timer: ReturnType<typeof setTimeout> | null = null;
async function load() {
  loading.value = true;
  try { await loadAudit({ page: page.value, limit: 40, action: action.value || undefined, actorId: actorId.value || undefined, businessId: businessId.value || undefined }); }
  catch (error) { toast.error((error as Error).message); }
}
watch([action, actorId, businessId], () => { if (timer) clearTimeout(timer); timer = setTimeout(() => { page.value = 1; load(); }, 350); });
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <PageHeading title="Audit log" subtitle="An immutable trail of sensitive platform and business actions." eyebrow="Accountability">
      <template #actions><AdminButton variant="outline" :loading="exporting === 'audit'" @click="exportCsv">Export CSV</AdminButton><AdminButton variant="outline" :loading="loading" @click="load"><RefreshCw class="h-3.5 w-3.5" /> Refresh</AdminButton></template>
    </PageHeading>
    <div class="grid gap-2 sm:grid-cols-3"><div class="relative"><Search class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" /><input v-model="action" placeholder="Filter action (e.g. plan_changed)" class="input-base pl-9"></div><input v-model="businessId" placeholder="Business ID" class="input-base"><input v-model="actorId" placeholder="Actor user ID" class="input-base"></div>
    <AdminTable :loading="loading && !result">
      <template #head><tr><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Action</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Actor</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Entity</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Business</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Metadata</th><th class="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">When</th></tr></template>
      <template #body><tr v-for="log in result?.items || []" :key="log.id" class="border-b border-line last:border-0 hover:bg-raised/20"><td class="px-4 py-2.5"><p class="font-mono text-[10px] font-semibold text-acid">{{ log.action }}</p></td><td class="px-4 py-2.5"><p class="text-[10px]">{{ log.actorType }}</p><p class="font-mono text-[9px] text-muted">{{ log.actorId || 'system' }}</p></td><td class="px-4 py-2.5 text-[10px]">{{ log.entity || '—' }}<p class="font-mono text-[9px] text-muted">{{ log.entityId || '' }}</p></td><td class="px-4 py-2.5 font-mono text-[9px] text-muted">{{ log.businessId || '—' }}</td><td class="max-w-[260px] truncate px-4 py-2.5 font-mono text-[9px] text-muted" :title="JSON.stringify(log.metadata)">{{ JSON.stringify(log.metadata) }}</td><td class="px-4 py-2.5 text-[9px] text-muted">{{ formatDate(log.createdAt, true) }}</td></tr><tr v-if="!(result?.items || []).length && !loading"><td colspan="6"><AdminEmpty title="No audit entries" message="Sensitive actions will appear here."><template #icon><FileClock class="h-6 w-6" /></template></AdminEmpty></td></tr></template>
    </AdminTable>
    <div class="flex items-center justify-between border-t border-line pt-3 text-[10px] text-muted"><span>{{ result?.meta.total || 0 }} entries</span><div class="flex items-center gap-2"><AdminButton size="sm" variant="outline" :disabled="page <= 1" @click="page--; load()">Previous</AdminButton><span>Page {{ result?.meta.page || 1 }} / {{ result?.meta.pages || 1 }}</span><AdminButton size="sm" variant="outline" :disabled="page >= (result?.meta.pages || 1)" @click="page++; load()">Next</AdminButton></div></div>
  </div>
</template>
