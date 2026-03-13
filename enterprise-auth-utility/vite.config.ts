import { defineConfig } from 'vite';
import vitePluginSingleSpa from 'vite-plugin-single-spa';

export default defineConfig({
    plugins: [
        vitePluginSingleSpa({
            type: 'mife',
            serverPort: 8081,
            spaEntryPoints: 'src/main.tss',
        }),
    ],
    server: {
        port: 8081,
    },
});