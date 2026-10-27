<script setup lang="ts">
import { Check, ChevronDown, Search } from 'lucide-vue-next';
import { useId } from 'vue';

interface Option { value: string | number; label: string; description?: string; disabled?: boolean }
const props = withDefaults(defineProps<{
  modelValue?: string | number | null;
  label?: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  ariaLabel?: string;
  size?: 'sm' | 'md';
}>(), { placeholder: 'Select', searchable: false, size: 'md' });
const emit = defineEmits<{ 'update:modelValue': [string | number]; change: [string | number] }>();
const id = useId();
const listId = `${id}-listbox`;
const trigger = ref<HTMLButtonElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const open = ref(false);
const query = ref('');
const activeIndex = ref(-1);
const menuStyle = ref<Record<string, string>>({});
const placement = ref<'bottom' | 'top'>('bottom');
const selected = computed(() => props.options.find((option) => String(option.value) === String(props.modelValue ?? '')));
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q ? props.options.filter((option) => `${option.label} ${option.description || ''}`.toLowerCase().includes(q)) : props.options;
});
function available(start: number, direction: 1 | -1): number {
  const total = filtered.value.length;
  for (let step = 0; step < total; step++) {
    const index = (start + step * direction + total) % total;
    if (!filtered.value[index]?.disabled) return index;
  }
  return -1;
}
function position() {
  if (!trigger.value) return;
  const rect = trigger.value.getBoundingClientRect();
  const below = window.innerHeight - rect.bottom;
  const above = rect.top;
  const height = Math.min(320, Math.max(170, filtered.value.length * 44 + (props.searchable ? 52 : 10)));
  const place = below < height + 14 && above > below ? 'top' : 'bottom';
  placement.value = place;
  const width = Math.max(rect.width, 180);
  const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - width - 8));
  menuStyle.value = {
    position: 'fixed', left: `${left}px`, width: `${width}px`, zIndex: '120',
    maxHeight: `${Math.max(150, place === 'top' ? Math.min(height, above - 12) : Math.min(height, below - 12))}px`,
    ...(place === 'top' ? { bottom: `${window.innerHeight - rect.top + 6}px` } : { top: `${rect.bottom + 6}px` }),
  };
}
async function openMenu() {
  if (props.disabled || open.value) return;
  open.value = true; query.value = '';
  const found = filtered.value.findIndex((option) => String(option.value) === String(props.modelValue ?? ''));
  activeIndex.value = found >= 0 ? found : available(0, 1);
  await nextTick(); position();
  (props.searchable ? searchInput.value : trigger.value)?.focus();
  document.addEventListener('pointerdown', outside, true);
  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, true);
}
function close(focus = true) {
  if (!open.value) return;
  open.value = false; query.value = ''; activeIndex.value = -1;
  document.removeEventListener('pointerdown', outside, true);
  window.removeEventListener('resize', position);
  window.removeEventListener('scroll', position, true);
  if (focus) trigger.value?.focus();
}
function outside(event: PointerEvent) {
  const target = event.target as Node;
  if (trigger.value?.contains(target) || document.getElementById(listId)?.contains(target)) return;
  close(false);
}
function choose(option: Option) {
  if (option.disabled) return;
  emit('update:modelValue', option.value); emit('change', option.value); close();
}
function triggerKeys(event: KeyboardEvent) {
  if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) { event.preventDefault(); void openMenu(); }
  else if (event.key === 'Escape') close();
}
function menuKeys(event: KeyboardEvent) {
  if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
  else if (event.key === 'Tab') close(false);
  else if (event.key === 'ArrowDown') { event.preventDefault(); activeIndex.value = available(activeIndex.value + 1, 1); }
  else if (event.key === 'ArrowUp') { event.preventDefault(); activeIndex.value = available(activeIndex.value - 1 || filtered.value.length - 1, -1); }
  else if (event.key === 'Home') { event.preventDefault(); activeIndex.value = available(0, 1); }
  else if (event.key === 'End') { event.preventDefault(); activeIndex.value = available(filtered.value.length - 1, -1); }
  else if (event.key === 'Enter') { event.preventDefault(); const option = filtered.value[activeIndex.value]; if (option) choose(option); }
}
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', outside, true);
  window.removeEventListener('resize', position);
  window.removeEventListener('scroll', position, true);
});
</script>

<template>
  <div class="w-full">
    <label v-if="label" :id="`${id}-label`" :for="id" class="label-base">{{ label }}</label>
    <button
      :id="id" ref="trigger" type="button" role="combobox" aria-haspopup="listbox" :aria-expanded="open" :aria-controls="listId"
      :aria-activedescendant="open && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined"
      :aria-label="ariaLabel || label || placeholder" :disabled="disabled"
      class="group flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 text-left text-ink transition focus:border-acid focus:outline-none focus:ring-2 focus:ring-acid/20 disabled:opacity-50"
      :class="[size === 'sm' ? 'min-h-[36px] py-1.5 text-[11px]' : 'min-h-[44px] py-2.5 text-xs', open ? 'border-acid ring-2 ring-acid/20' : '']"
      @click="open ? close() : openMenu()" @keydown="triggerKeys"
    >
      <span class="min-w-0 flex-1 truncate" :class="selected ? '' : 'text-muted/70'">{{ selected?.label || placeholder }}</span>
      <ChevronDown class="h-3.5 w-3.5 shrink-0 text-muted transition" :class="open ? 'rotate-180' : ''" />
    </button>
    <Teleport to="body">
      <Transition name="admin-select">
        <div v-if="open" :id="listId" role="listbox" :aria-labelledby="`${id}-label`" :style="menuStyle" class="overflow-hidden rounded-xl border border-line bg-surface shadow-2xl" @keydown="menuKeys">
          <div v-if="searchable" class="border-b border-line p-2"><div class="relative"><Search class="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted" /><input ref="searchInput" v-model="query" type="search" placeholder="Search…" class="h-8 w-full rounded-lg border border-line bg-raised/60 pl-8 pr-2 text-[11px] outline-none focus:border-acid" aria-label="Search options"></div></div>
          <div class="max-h-[250px] overflow-y-auto p-1">
            <button v-for="(option, index) in filtered" :id="`${listId}-option-${index}`" :key="String(option.value)" type="button" role="option" :aria-selected="String(option.value) === String(modelValue ?? '')" :disabled="option.disabled" class="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition disabled:opacity-40" :class="[index === activeIndex ? 'bg-raised' : '', String(option.value) === String(modelValue ?? '') ? 'text-ink' : 'text-muted hover:text-ink']" @mouseenter="activeIndex = index" @click="choose(option)">
              <span class="min-w-0 flex-1"><span class="block text-[11px] font-semibold">{{ option.label }}</span><span v-if="option.description" class="mt-0.5 block text-[9px] text-muted">{{ option.description }}</span></span>
              <Check v-if="String(option.value) === String(modelValue ?? '')" class="mt-0.5 h-3 w-3 shrink-0 text-acid" />
            </button>
            <p v-if="!filtered.length" class="px-3 py-5 text-center text-[10px] text-muted">No matches.</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.admin-select-enter-active, .admin-select-leave-active { transition: opacity .13s ease, transform .13s ease; }
.admin-select-enter-from, .admin-select-leave-to { opacity: 0; transform: translateY(-3px) scale(.99); }
</style>
