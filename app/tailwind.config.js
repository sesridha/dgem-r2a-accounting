// ESM tailwind config — project uses "type": "module"
// createRequire lets us load the CJS package preset from @dgem/design-system
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

/** @type {import('tailwindcss').Config} */
const dgemPreset = require('../package/tailwind.config.js')

export default {
  presets: [dgemPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}