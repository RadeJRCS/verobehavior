import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        green: { DEFAULT: '#1A3A2A', light: '#E8F2EC', mid: '#2D5A42' },
        gold: { DEFAULT: '#C8963C', light: '#FBF3E4' },
        ink: { DEFAULT: '#14140F', 2: '#4A4947', 3: '#8F8D89' },
        surface: { DEFAULT: '#F7F6F1', 2: '#EEECEA', 3: '#E4E1DC' },
      },
    },
  },
  plugins: [],
}
export default config
