import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#1a1a2e',
          navy: '#16213e',
          sky: '#4a90a4',
          leaf: '#2d9b2d',
          alert: '#e94560',
          cyan: '#00b4d8',
          mint: '#90be6d',
          sand: '#f4a261',
        },
        ops: {
          navy: '#0f172a',
          cyan: '#06b6d4',
          mint: '#10b981',
          sand: '#f59e0b',
        },
        clinic: {
          amber: '#f59e0b',
          blue: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;