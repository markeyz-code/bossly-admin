<script setup lang="ts">
import { ArrowLeft, Shield, UserCog } from 'lucide-vue-next';
import { useAdminAuthStore } from '~/stores/auth';
import { formatDate } from '~/utils/format';
useSeoMeta({ title: 'User detail' });
const route = useRoute();
const toast = useAdminToast();
const auth = useAdminAuthStore();
const notesApi = useAdminNotes('user', String(route.params.id));
const { user: data, loading, saving, loadUser, updateUser } = useAdminUsers();
const role = ref<string | null>(null);
const active = ref(true);
async function load() {
  loading.value = true;
  try { await loadUser(String(route.params.id)); role.value = data.value?.user.platformRole || null; active.value = Boolean(data.value?.user.isActive); }
  catch (error) { toast.error((error as Error).message); }
}
async function save() {
  if (!data.value) return;
  saving.value = true;
  try { await updateUser(data.value.user.id, { platformRole: (role.value || null) as 'super_admin' | 'support' | null, isActive: active.value }); toast.success('User access updated.'); await load(); }
  catch (error) { toast.error((error as Error).message); }
}
async function addNote(body: string, pinned: boolean) { try { await notesApi.create(body, pinned); toast.success('Note added.'); } catch (error) { toast.error((error as Error).message); } }
async function updateNote(id: string, payload: { body?: string; pinned?: boolean }) { try { await notesApi.update(id, payload); } catch (error) { toast.error((error as Error).message); } }
async function removeNote(id: string) { try { await notesApi.remove(id); toast.success('Note deleted.'); } catch (error) { toast.error((error as Error).message); } }
onMounted(async () => { await load(); await notesApi.load().catch(() => undefined); });
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-5">
    <div class="flex items-center gap-3"><NuxtLink to="/users" class="flex h-9 w-9 items-center justify-center rounded-lg border border-line"><ArrowLeft class="h-4 w-4" /></NuxtLink><div><p class="eyebrow">User</p><h1 class="font-display text-2xl font-bold">{{ data?.user.name || 'Loading…' }}</h1></div><AdminBadge v-if="data" class="ml-auto" :variant="data.user.isActive ? 'success' : 'danger'">{{ data.user.isActive ? 'Active' : 'Disabled' }}</AdminBadge></div>
    <div v-if="loading" class="skeleton h-64" />
    <template v-else-if="data">
      <div class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="card p-5"><div class="flex items-center gap-3"><div class="flex h-12 w-12 items-center justify-center rounded-xl bg-acid text-sm font-bold text-forest-950">{{ data.user.name.slice(0, 2).toUpperCase() }}</div><div><p class="font-bold">{{ data.user.name }}</p><p class="text-[11px] text-muted">{{ data.user.email }}{{ data.user.phone ? ` · ${data.user.phone}` : '' }}</p><p class="mt-1 text-[10px] text-muted">Joined {{ formatDate(data.user.createdAt) }} · Last login {{ formatDate(data.user.lastLoginAt, true) }}</p></div></div><div class="mt-5 grid gap-3 sm:grid-cols-2"><div class="rounded-lg bg-raised/60 p-3"><p class="text-[9px] uppercase tracking-wider text-muted">Email verified</p><p class="mt-1 text-xs font-bold">{{ data.user.emailVerified ? 'Yes' : 'No' }}</p></div><div class="rounded-lg bg-raised/60 p-3"><p class="text-[9px] uppercase tracking-wider text-muted">Platform role</p><p class="mt-1 text-xs font-bold">{{ data.user.platformRole?.replace('_', ' ') || 'Standard' }}</p></div></div></div>
        <div class="card p-5"><div class="flex items-center gap-2"><UserCog class="h-4 w-4 text-acid" /><p class="text-xs font-bold">Platform access</p></div><p v-if="!auth.isSuperAdmin" class="mt-3 rounded-lg bg-warning/10 p-2.5 text-[10px] text-warning">Support accounts cannot change user access.</p><div v-else class="mt-3 space-y-3"><AdminSelect v-model="role" label="Platform role" :options="[{ value: '', label: 'Standard user' }, { value: 'support', label: 'Support (read-only)' }, { value: 'super_admin', label: 'Super admin' }]" /><label class="flex items-center gap-2 text-xs"><input v-model="active" type="checkbox" class="rounded"> Account active</label><AdminButton block :loading="saving" @click="save"><Shield class="h-3.5 w-3.5" /> Save access</AdminButton><p class="text-[9px] leading-relaxed text-muted">Disabling a user revokes all refresh sessions immediately. Their business data is untouched.</p></div></div>
      </div>
      <div class="card"><div class="border-b border-line p-4"><p class="text-xs font-bold">Business memberships</p></div><div v-if="data.memberships.length" class="divide-y divide-line"><div v-for="membership in data.memberships" :key="String(membership._id)" class="flex flex-wrap items-center gap-2 px-4 py-3 text-[11px]"><p class="font-semibold">{{ membership.business?.name || membership.businessId }}</p><AdminBadge :variant="membership.role === 'owner' ? 'accent' : 'neutral'">{{ membership.role }}</AdminBadge><span class="text-muted">/s/{{ membership.business?.slug }}</span><NuxtLink :to="`/businesses/${membership.businessId}`" class="ml-auto text-[10px] font-bold text-acid">Open business →</NuxtLink></div></div><p v-else class="p-4 text-[10px] text-muted">No business memberships.</p></div>
      <div class="card"><div class="border-b border-line p-4"><p class="text-xs font-bold">Recent audit activity</p></div><div class="divide-y divide-line"><div v-for="log in data.audit" :key="log.id" class="flex flex-wrap items-center gap-2 px-4 py-2.5 text-[10px]"><span class="rounded bg-raised px-1.5 py-0.5 font-mono text-[9px]">{{ log.action }}</span><span class="text-muted">{{ log.entity }} {{ log.entityId }}</span><span class="ml-auto text-muted">{{ formatDate(log.createdAt, true) }}</span></div><p v-if="!data.audit.length" class="p-4 text-[10px] text-muted">No audit records.</p></div></div>
      <AdminSupportNotes :notes="notesApi.notes.value" :loading="notesApi.loading.value" :saving="notesApi.saving.value" :editable="auth.isSuperAdmin" @add="addNote" @update="updateNote" @remove="removeNote" />
    </template>
  </div>
</template>
