<script setup lang="ts">
import { Pin, PinOff, Pencil, Plus, Trash2, X } from 'lucide-vue-next';
import type { AdminNote } from '~/types';
import { formatDate } from '~/utils/format';

const props = withDefaults(defineProps<{ notes: AdminNote[]; loading?: boolean; saving?: boolean; editable?: boolean }>(), { loading: false, saving: false, editable: true });
const emit = defineEmits<{
  add: [body: string, pinned: boolean];
  update: [id: string, payload: { body?: string; pinned?: boolean }];
  remove: [id: string];
}>();
const body = ref('');
const pinned = ref(false);
const editingId = ref<string | null>(null);
const editBody = ref('');

function submit() {
  if (body.value.trim().length < 2) return;
  emit('add', body.value.trim(), pinned.value);
  body.value = '';
  pinned.value = false;
}
function startEdit(note: AdminNote) { editingId.value = note.id; editBody.value = note.body; }
function saveEdit(id: string) {
  if (editBody.value.trim().length < 2) return;
  emit('update', id, { body: editBody.value.trim() });
  editingId.value = null;
}
</script>

<template>
  <div class="card">
    <div class="flex items-center justify-between gap-2 border-b border-line p-4">
      <div><p class="text-xs font-bold">Internal support notes</p><p class="text-[10px] text-muted">Never shown to the business or user.</p></div>
      <span class="text-[9px] font-bold uppercase tracking-wider text-muted">{{ notes.length }} note{{ notes.length === 1 ? '' : 's' }}</span>
    </div>
    <div v-if="editable" class="border-b border-line p-4">
      <textarea v-model="body" rows="3" maxlength="2000" placeholder="What happened? What did support promise? Include ticket or payment references." class="input-base min-h-[84px] resize-y text-xs" aria-label="New support note" />
      <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
        <label class="flex items-center gap-2 text-[10px] text-muted"><input v-model="pinned" type="checkbox" class="rounded border-line"> Pin to top</label>
        <AdminButton size="sm" :loading="saving" :disabled="body.trim().length < 2" @click="submit"><Plus class="h-3.5 w-3.5" /> Add note</AdminButton>
      </div>
    </div>
    <div v-if="loading && !notes.length" class="p-4"><div class="skeleton h-16" /></div>
    <div v-else-if="notes.length" class="divide-y divide-line">
      <article v-for="note in notes" :key="note.id" class="p-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[10px] font-bold">{{ note.authorName }}</span>
          <span class="text-[9px] text-muted">{{ formatDate(note.createdAt, true) }}</span>
          <AdminBadge v-if="note.pinned" variant="accent">Pinned</AdminBadge>
          <div v-if="editable" class="ml-auto flex items-center gap-1">
            <button type="button" class="rounded p-1 text-muted hover:bg-raised hover:text-ink" :aria-label="note.pinned ? 'Unpin note' : 'Pin note'" @click="emit('update', note.id, { pinned: !note.pinned })"><PinOff v-if="note.pinned" class="h-3 w-3" /><Pin v-else class="h-3 w-3" /></button>
            <button type="button" class="rounded p-1 text-muted hover:bg-raised hover:text-ink" aria-label="Edit note" @click="startEdit(note)"><Pencil class="h-3 w-3" /></button>
            <button type="button" class="rounded p-1 text-muted hover:bg-danger/10 hover:text-danger" aria-label="Delete note" @click="emit('remove', note.id)"><Trash2 class="h-3 w-3" /></button>
          </div>
        </div>
        <template v-if="editingId === note.id">
          <textarea v-model="editBody" rows="3" maxlength="2000" class="input-base mt-2 min-h-[72px] py-2 text-xs" aria-label="Edit note" />
          <div class="mt-2 flex justify-end gap-2"><button class="text-[10px] font-bold text-muted" @click="editingId = null"><X class="mr-1 inline h-3 w-3" />Cancel</button><AdminButton size="sm" :loading="saving" @click="saveEdit(note.id)">Save</AdminButton></div>
        </template>
        <p v-else class="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-muted">{{ note.body }}</p>
      </article>
    </div>
    <p v-else class="p-4 text-[10px] text-muted">No notes yet. Add context for the next person who handles this account.</p>
  </div>
</template>
