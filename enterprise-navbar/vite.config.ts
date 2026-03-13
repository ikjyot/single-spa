import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginSingleSpa from 'vite-plugin-single-spa'
import externalize from 'vite-plugin-externalize-dependencies'

// https://vite.dev/config/
export default defineConfig({
  // Remove @vitejs/plugin-react dependency entirely from the MFE's vite.config.ts. Vite's underlying ESBuild engine natively compiles .tsx and JSX without requiring the plugin, resulting in a cleaner, faster, and crash-free headless build. The only tradeoff is no HMR. 
  //if HMR is absolutely needed, the enterprise pattern is to adopt a specialized adapter like vite-plugin-single-spa, which handles the complex Dev Server integrations seamlessly without polluting the shell. But for a highly decoupled, high-performance baseline, relying natively on ESBuild is bulletproof.
  plugins: [
    react(),
    vitePluginSingleSpa({
      type: 'mife',
      // The entry point for the MFE
      spaEntryPoints: 'src/main.tsx',
      serverPort: 8083,
    }),
    // THE ENTERPRISE FIX: Force the Dev Server to ignore this import! Required only for standalone run as by default Vite's import analyse plugin tries to resolve all imports, even before the browser gets a chance to look at the mini import map in the index.html.
    externalize({ externals: ['@comp/auth-utility'] })
  ],
  build: {
    target: 'esnext',
    // THE ENTERPRISE FIX: Tell Vite to leave this import alone and do not bundle it!
    rollupOptions: {
      external: ['@comp/auth-utility']
    }
    // Commenting below code since we have vitePluginSingleSpa now, which handles rollup config implicitely.
    // rollupOptions: {
    //   input: 'src/main.tsx',
    //   preserveEntrySignatures: 'strict',
    //   output: {
    //     format: 'es',
    //     entryFileNames: 'main.js'
    //   }
    // }
  },
  server: {
    port: 8083,
    cors: true
  }
})
