// Explicit ESM imports — avoids string-based resolution that
// can cause Vite to accidentally treat tailwindcss as app code.
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [tailwindcss, autoprefixer],
}
