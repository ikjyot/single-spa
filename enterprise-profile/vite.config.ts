import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import singleSpa from 'vite-plugin-single-spa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    singleSpa({
      type: 'mife',
      serverPort: 8084,
      spaEntryPoints: 'src/main.tsx',
    })],
  server: {
    port: 8084,
  },
})
