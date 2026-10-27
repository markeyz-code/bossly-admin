<script setup lang="ts">
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-vue-next';
import { useId } from 'vue';

const props = withDefaults(defineProps<{
  modelValue?: string | null;
  label?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  clearable?: boolean;
  ariaLabel?: string;
}>(), {
  placeholder: 'Choose a date',
  clearable: true,
});

const emit = defineEmits<{
  'update:modelValue': [string];
  change: [string];
}>();

const id = useId();
const trigger = ref<HTMLButtonElement | null>(null);
const open = ref(false);
const viewMode = ref<'days' | 'months'>('days');

const viewYear = ref(new Date().getFullYear());
const viewMonth = ref(new Date().getMonth());
const activeIso = ref('');
const menuStyle = ref<Record<string, string>>({});
const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseIso(value?: string | null) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? { year, month, day } : null;
}

function iso(year: number, month: number, day: number) {
  return `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const selected = computed(() => parseIso(props.modelValue));
const today = new Date();
const todayIso = iso(today.getFullYear(), today.getMonth(), today.getDate());

const display = computed(() => {
  if (!selected.value) return props.placeholder;
  const dateObj = new Date(selected.value.year, selected.value.month, selected.value.day, 12);
  const formatted = new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(dateObj);
  if (props.modelValue === todayIso) return `Today · ${formatted}`;
  return formatted;
});

const monthLabel = computed(() => new Intl.DateTimeFormat('en-NG', { month: 'long', year: 'numeric' }).format(new Date(viewYear.value, viewMonth.value, 1)));

function isDisabled(value: string) {
  if (props.min && value < props.min) return true;
  if (props.max && value > props.max) return true;
  return false;
}

const presets = computed(() => {
  const list: { label: string; iso: string }[] = [];
  const makePreset = (daysDiff: number, label: string) => {
    const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysDiff);
    const targetIso = iso(target.getFullYear(), target.getMonth(), target.getDate());
    if (!isDisabled(targetIso)) list.push({ label, iso: targetIso });
  };
  makePreset(0, 'Today');
  makePreset(1, 'Tomorrow');
  makePreset(7, '+7d');
  makePreset(14, '+14d');
  makePreset(30, '+30d');
  return list.slice(0, 4);
});

const cells = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1);
  const offset = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(viewYear.value, viewMonth.value, 1 - offset + i);
    const value = iso(d.getFullYear(), d.getMonth(), d.getDate());
    return {
      value,
      day: d.getDate(),
      inMonth: d.getMonth() === viewMonth.value,
      today: value === todayIso,
      selected: value === props.modelValue,
      disabled: isDisabled(value),
    };
  });
});

function position() {
  if (!trigger.value) return;
  const r = trigger.value.getBoundingClientRect();
  const width = Math.min(330, window.innerWidth - 24);
  const top = window.innerHeight - r.bottom < 400 ? undefined : r.bottom + 6;
  menuStyle.value = {
    position: 'fixed',
    left: `${Math.min(Math.max(12, r.left), window.innerWidth - width - 12)}px`,
    width: `${width}px`,
    zIndex: '150',
    ...(top ? { top: `${top}px` } : { bottom: `${window.innerHeight - r.top + 6}px` }),
  };
}

async function openMenu() {
  if (props.disabled || open.value) return;
  viewMode.value = 'days';
  open.value = true;
  const base = selected.value || { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
  viewYear.value = base.year;
  viewMonth.value = base.month;
  activeIso.value = props.modelValue || iso(base.year, base.month, base.day);
  await nextTick();
  position();
  focusActive();
  document.addEventListener('pointerdown', outside, true);
  window.addEventListener('scroll', position, true);
  window.addEventListener('resize', position);
}

function close(restore = true) {
  if (!open.value) return;
  open.value = false;
  viewMode.value = 'days';
  document.removeEventListener('pointerdown', outside, true);
  window.removeEventListener('scroll', position, true);
  window.removeEventListener('resize', position);
  if (restore) trigger.value?.focus();
}

function outside(e: PointerEvent) {
  const t = e.target as Node;
  if (!trigger.value?.contains(t) && !document.getElementById(`${id}-cal`)?.contains(t)) close(false);
}

function focusActive() {
  document.querySelector<HTMLButtonElement>(`#${CSS.escape(`${id}-cal`)} [data-date="${activeIso.value}"]`)?.focus({ preventScroll: true });
}

function setActive(value: string) {
  const p = parseIso(value);
  if (!p) return;
  activeIso.value = value;
  viewYear.value = p.year;
  viewMonth.value = p.month;
  nextTick(focusActive);
}

function move(days: number) {
  const p = parseIso(activeIso.value) || selected.value || { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
  const d = new Date(p.year, p.month, p.day + days);
  setActive(iso(d.getFullYear(), d.getMonth(), d.getDate()));
}

function moveMonth(months: number) {
  const p = parseIso(activeIso.value) || selected.value || { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
  const d = new Date(p.year, p.month + months, 1);
  viewYear.value = d.getFullYear();
  viewMonth.value = d.getMonth();
  setActive(iso(d.getFullYear(), d.getMonth(), Math.min(p.day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())));
}

function choose(value: string) {
  if (isDisabled(value)) return;
  emit('update:modelValue', value);
  emit('change', value);
  close();
}

function clear(e?: Event) {
  e?.stopPropagation();
  emit('update:modelValue', '');
  emit('change', '');
  close();
}

function selectMonth(mIdx: number) {
  viewMonth.value = mIdx;
  viewMode.value = 'days';
}

function triggerKeys(e: KeyboardEvent) {
  if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
    e.preventDefault();
    openMenu();
  } else if (e.key === 'Escape') close();
}

function dialogKeys(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
    close();
  } else if (e.key === 'Tab') close(false);
}

function gridKeys(e: KeyboardEvent) {
  if (viewMode.value !== 'days') return;
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Enter', ' '].includes(e.key)) e.preventDefault();
  if (e.key === 'ArrowLeft') move(-1);
  else if (e.key === 'ArrowRight') move(1);
  else if (e.key === 'ArrowUp') move(-7);
  else if (e.key === 'ArrowDown') move(7);
  else if (e.key === 'PageUp') moveMonth(-1);
  else if (e.key === 'PageDown') moveMonth(1);
  else if (e.key === 'Home') move(-((new Date(activeIso.value).getDay() + 6) % 7));
  else if (e.key === 'End') move(6 - ((new Date(activeIso.value).getDay() + 6) % 7));
  else if (e.key === 'Enter' || e.key === ' ') choose(activeIso.value);
}

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', outside, true);
  window.removeEventListener('scroll', position, true);
  window.removeEventListener('resize', position);
});
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="label-base flex items-center justify-between">
      <span>{{ label }}</span>
      <span v-if="modelValue && clearable" class="text-[10px] font-semibold text-muted hover:text-ink cursor-pointer" @click="clear">Clear</span>
    </label>
    <button
      :id="id"
      ref="trigger"
      type="button"
      :disabled="disabled"
      :aria-label="ariaLabel || label || placeholder"
      :aria-expanded="open"
      aria-haspopup="dialog"
      class="flex min-h-[44px] w-full items-center gap-2 rounded-xl border border-line bg-surface px-3 text-left text-xs text-ink transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
      :class="[open ? 'border-brand-500 ring-2 ring-brand-500/20' : '', selected ? 'font-medium' : 'text-muted/70']"
      @click="open ? close() : openMenu()"
      @keydown="triggerKeys"
    >
      <CalendarDays class="h-3.5 w-3.5 text-muted" />
      <span class="min-w-0 flex-1 truncate">{{ display }}</span>
      <button
        v-if="clearable && modelValue && !disabled"
        type="button"
        class="flex h-5 w-5 items-center justify-center rounded-full text-muted hover:text-ink"
        @click="clear"
      >
        <X class="h-3 w-3" />
      </button>
      <ChevronDown class="h-3.5 w-3.5 text-muted transition" :class="open ? 'rotate-180' : ''" />
    </button>

    <Teleport to="body">
      <Transition name="admin-date">
        <div
          v-if="open"
          :id="`${id}-cal`"
          :style="menuStyle"
          role="dialog"
          aria-modal="false"
          :aria-label="`${label || 'Choose date'} calendar`"
          class="rounded-2xl border border-line bg-surface p-3 shadow-2xl backdrop-blur-xl"
          @keydown="dialogKeys"
        >
          <!-- Presets -->
          <div v-if="presets.length" class="mb-2.5 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              v-for="p in presets"
              :key="p.iso"
              type="button"
              class="shrink-0 rounded-lg border border-line px-2 py-0.5 text-[10px] font-semibold text-muted hover:bg-raised hover:text-ink transition"
              :class="modelValue === p.iso ? 'bg-ink text-canvas border-ink' : 'bg-surface'"
              @click="choose(p.iso)"
            >
              {{ p.label }}
            </button>
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between border-b border-line/60 pb-2">
            <div class="flex">
              <button
                type="button"
                class="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-raised"
                aria-label="Previous year"
                @click="viewMode === 'months' ? viewYear-- : moveMonth(-12)"
              >
                <ChevronsLeft class="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                class="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-raised"
                aria-label="Previous month"
                @click="moveMonth(-1)"
              >
                <ChevronLeft class="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              class="rounded-lg px-2 py-0.5 text-xs font-bold text-ink hover:bg-raised transition"
              @click="viewMode = viewMode === 'days' ? 'months' : 'days'"
            >
              {{ viewMode === 'months' ? viewYear : monthLabel }} ▾
            </button>

            <div class="flex">
              <button
                type="button"
                class="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-raised"
                aria-label="Next month"
                @click="moveMonth(1)"
              >
                <ChevronRight class="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                class="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-raised"
                aria-label="Next year"
                @click="viewMode === 'months' ? viewYear++ : moveMonth(12)"
              >
                <ChevronsRight class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <!-- Month Selector Grid -->
          <div v-if="viewMode === 'months'" class="mt-2.5 grid grid-cols-3 gap-1.5 py-1">
            <button
              v-for="(mName, mIdx) in monthsShort"
              :key="mName"
              type="button"
              class="flex h-9 items-center justify-center rounded-xl text-xs font-bold transition"
              :class="viewMonth === mIdx ? 'bg-ink text-canvas' : 'hover:bg-raised text-ink'"
              @click="selectMonth(mIdx)"
            >
              {{ mName }}
            </button>
          </div>

          <!-- Days Grid -->
          <template v-else>
            <div class="mt-2 grid grid-cols-7 text-center">
              <span v-for="w in weekdays" :key="w" class="py-0.5 text-[9px] font-bold text-muted">{{ w }}</span>
            </div>
            <div class="mt-1 grid grid-cols-7 gap-0.5" role="grid" @keydown="gridKeys">
              <button
                v-for="c in cells"
                :key="c.value"
                type="button"
                role="gridcell"
                :data-date="c.value"
                :disabled="c.disabled"
                :tabindex="c.value === activeIso ? 0 : -1"
                class="relative flex h-8 items-center justify-center rounded-lg text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-25"
                :class="[
                  c.selected ? 'bg-ink text-canvas font-bold' : c.today ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20' : c.inMonth ? 'text-ink hover:bg-raised' : 'text-muted/40 hover:bg-raised',
                  c.value === activeIso && !c.selected ? 'ring-2 ring-brand-500/40' : '',
                ]"
                @click="choose(c.value)"
                @focus="activeIso = c.value"
              >
                {{ c.day }}
                <span v-if="c.today && !c.selected" class="absolute bottom-1 h-1 w-1 rounded-full bg-brand-500" />
              </button>
            </div>
          </template>

          <div class="mt-2.5 flex items-center justify-between border-t border-line/60 pt-2 text-[11px]">
            <button type="button" class="font-bold text-brand-600 hover:underline" @click="choose(todayIso)">Today</button>
            <button v-if="clearable && modelValue" type="button" class="text-muted hover:text-ink font-semibold" @click="clear">Clear</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.admin-date-enter-active, .admin-date-leave-active { transition: opacity .15s ease, transform .15s ease; }
.admin-date-enter-from, .admin-date-leave-to { opacity: 0; transform: translateY(-4px) scale(.98); }
</style>
