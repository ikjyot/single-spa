import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import singleSpa from 'vite-plugin-single-spa'
import externalize from 'vite-plugin-externalize-dependencies'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    singleSpa({
      type: 'mife',
      serverPort: 8082,
      spaEntryPoints: 'src/main.tsx',
    }),
    // Force Dev Server to ignore the Design System import
    externalize({ externals: ['@comp/design-system', '@comp/react-core'] })],
  server: {
    port: 8082,
  },
  build: {
    rollupOptions: {
      // Externalize dependencies in production
      external: ['@comp/design-system', '@comp/react-core']
    }
  }
})
