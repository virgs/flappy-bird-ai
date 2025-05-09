import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { qrcode } from 'vite-plugin-qrcode'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), qrcode()],
    assetsInclude: [],
    optimizeDeps: {
        exclude: [],
    },
    base: '/flappy-bird-ai',
    logLevel: 'warn',
    build: {
        target: 'esnext',
        assetsDir: '.',
        outDir: 'docs',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser'],
                },
            },
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                passes: 2,
            },
            mangle: true,
            format: {
                comments: false,
            },
        },
    },
})
