import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const phasermsg = () => {
    return {
        name: 'phasermsg',
        buildStart() {
            process.stdout.write(`Building for production...\n`);
        },
        buildEnd() {
            const line = "---------------------------------------------------------";
            process.stdout.write(`${line}\n`);
            process.stdout.write(`✨ Done ✨\n`);
        }
    }
}

export default defineConfig({
    base: "/flappy-bird-ai",
    plugins: [
        react(),
        phasermsg()
    ],
    logLevel: 'warning',
    build: {
        outDir: 'docs',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                passes: 2
            },
            mangle: true,
            format: {
                comments: false
            }
        }
    }
});
