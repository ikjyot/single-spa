import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vitePluginSingleSpa from 'vite-plugin-single-spa';
// Need @types/node for using a standard nodejs module like path, fs, os, etc.
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vitePluginSingleSpa({
      type: 'mife',
      serverPort: 8085,
      spaEntryPoints: 'src/main.ts',
    }),
  ],
  server: {
    port: 8085,
  },
  // THE ENTERPRISE FIX: Shadcn requires this alias!
  resolve: {
    alias: {
      // Alias used by shadcn for path resolution
      '@': path.resolve(__dirname, './src'),
    },
  },
});