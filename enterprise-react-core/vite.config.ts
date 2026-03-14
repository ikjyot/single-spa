import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vitePluginSingleSpa from 'vite-plugin-single-spa';
import externalize from 'vite-plugin-externalize-dependencies';

export default defineConfig({
  plugins: [
    react(),
    vitePluginSingleSpa({
      type: 'mife',
      serverPort: 8086,
      spaEntryPoints: 'src/main.ts',
    }),
    // Externalize dependencies in development
    externalize({ externals: ['@comp/auth-utility'] })
  ],
  server: { port: 8086 },
  build: {
    rollupOptions: {
      // Externalize dependencies in production
      external: ['@comp/auth-utility']
    }
  }
});