import type { Config } from 'tailwindcss';
export default <Partial<Config>>{
  darkMode: 'class',
  content: ['./components/**/*.{vue,js,ts}', './layouts/**/*.vue', './pages/**/*.vue', './composables/**/*.{js,ts}', './app.vue', './error.vue'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--bg) / <alpha-value>)', surface: 'rgb(var(--surface) / <alpha-value>)',
        raised: 'rgb(var(--raised) / <alpha-value>)', ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)', line: 'rgb(var(--line) / <alpha-value>)',
        brand: { 50: '#FFF2EC', 100: '#FFE0D1', 200: '#FFC2A8', 300: '#FF9C74', 400: '#FF7A49', 500: '#FF5A1F', 600: '#E84710', 700: '#BE350A', 800: '#8F290B', 900: '#63200D', DEFAULT: '#FF5A1F' },
        acid: '#C8FF00', forest: { 800: '#0B3D2E', 900: '#06231A', 950: '#08110D' },
        success: '#22C55E', warning: '#F5B700', danger: '#FF5C5C',
      },
      fontFamily: { display: ['"Space Grotesk Variable"', 'sans-serif'], sans: ['"DM Sans Variable"', 'sans-serif'] },
      borderRadius: { '4xl': '2rem' },
      boxShadow: { lift: '0 30px 80px -32px rgb(0 0 0 / .65)', glow: '0 0 0 1px rgb(200 255 0 / .18), 0 20px 60px -30px rgb(200 255 0 / .25)' },
      fontSize: { 'display-xl': ['clamp(2.6rem,5vw,4.5rem)', { lineHeight: '0.95', letterSpacing: '-0.055em', fontWeight: '700' }] },
    },
  },
  plugins: [],
};
