/**
 * Local declaration for the virtual #pwa composables used by @vite-pwa/nuxt.
 */
declare module '#pwa' {
  export function useTransparentPwaIcon(image: unknown): { icon: Record<string, unknown> };
  export function useMaskablePwaIcon(image: unknown): { icon: Record<string, unknown> };
  export function useFaviconPwaIcon(image: unknown): { icon: Record<string, unknown> };
  export function useApplePwaIcon(image: unknown): { icon: Record<string, unknown> };
  export function useAppleSplashScreenPwaIcon(image: unknown): { icon: Record<string, unknown> };
}
