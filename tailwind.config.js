/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design system colors
        bg: '#0b0c10',
        card: '#11131a',
        text: '#e8f0ff',
        sub: '#b7c0d1',
        accent: '#00BAFF',
        success: '#4ade80',
        error: '#ff4444',
        warning: '#ff8844',
        // Official LA.IO brand colors
        badge: {
          // Dark colors
          navy: '#111948',
          darkOlive: '#1A2706',
          darkBlue: '#07233C',
          brown: '#312511',
          charcoal: '#231F20',
          // Bright colors
          hotPink: '#F927CC',
          lime: '#99FA04',
          cyan: '#00BAFF',
          gold: '#F7C223',
          gray: '#929497',
          // Pastel colors
          lavender: '#E885FF',
          lightLime: '#CBEE5D',
          teal: '#67DDDF',
          lightGold: '#F4DD42',
          lightGray: '#E6E7E8',
        }
      },
      fontFamily: {
        sans: ['Aktiv Grotesk', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
