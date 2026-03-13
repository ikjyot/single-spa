import { defineConfig } from 'vite';

export default defineConfig({
    // By default vite will start from index.html. That works for our case as that file imports main.tsx which in turn gets root-config.
    // build: {
    //     rollupOptions: {
    //         // We need to tell Rollup that the entry point is src/main.ts
    //         input: 'src/main.ts',
    //         // This tells Rollup to preserve the entry point signature, which is required for single-spa. Rollup will not 
    //         // remove any code from the entry point, even if it thinks it's unused.
    //         preserveEntrySignatures: 'strict',
    //         output: {
    //             // We force Vite to output ES modules and NOT add random hash strings 
    //             // to the filename so our registry.json always knows where to find it.
    //             format: 'es',
    //             entryFileNames: '[name].js'
    //         }
    //     }
    // },
    server: {
        port: 9000 // The Root Config will always run on localhost:9000 locally
    }
});