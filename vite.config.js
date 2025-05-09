import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { qrcode } from 'vite-plugin-qrcode';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), qrcode()],
    assetsInclude: [],
    optimizeDeps: {
        exclude: [],
    },
    base: '/flappy-bird-ai',
    build: {
        target: 'esnext',
        rollupOptions: {
            output: {},
        },
        outDir: 'docs',
        assetsDir: '.',
    },
});
