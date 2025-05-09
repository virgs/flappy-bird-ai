import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { qrcode } from 'vite-plugin-qrcode'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(), qrcode()
    ],
    server: {
        port: 8080
    }
})
