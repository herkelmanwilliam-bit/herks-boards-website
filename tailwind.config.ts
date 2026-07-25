import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gg-green': {
          50: '#faf8f0',
          100: '#f5f0dc',
          200: '#ecdeb0',
          300: '#e0c87a',
          400: '#d4af55',
          500: '#94a3b8',
          600: '#b8942f',
          700: '#9a7a25',
          800: '#7a6020',
          900: '#0f172a',
        },
        'gg-earth': {
          50: '#faf8f0',
          100: '#f5f0dc',
          200: '#ecdeb0',
          300: '#e0c87a',
          400: '#94a3b8',
          500: '#b8942f',
          600: '#9a7a25',
          700: '#7a6020',
          800: '#5a4515',
          900: '#3a2d0e',
        },
        'gg-black': '#0f172a',
        'gg-gold': '#94a3b8',
        'gg-ivory': '#f8fafc',
        'gg-forest': '#2A4D35',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
