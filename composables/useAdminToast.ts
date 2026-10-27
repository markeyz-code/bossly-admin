export function useAdminToast() {
  const toasts = useState<{ id: string; tone: 'success' | 'error' | 'info'; message: string }[]>('admin-toasts', () => []);
  function dismiss(id: string) { toasts.value = toasts.value.filter((t) => t.id !== id); }
  function push(tone: 'success' | 'error' | 'info', message: string) { const id = `${Date.now()}-${Math.random()}`; toasts.value = [...toasts.value.slice(-2), { id, tone, message }]; if (import.meta.client) setTimeout(() => dismiss(id), 4500); }
  return { toasts, dismiss, success: (m: string) => push('success', m), error: (m: string) => push('error', m), info: (m: string) => push('info', m) };
}
