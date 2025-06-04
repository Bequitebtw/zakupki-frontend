import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
    base: '/',
    plugins: [
        vue(),
        vueDevTools(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    server: {
        historyApiFallback: true,
        proxy: {
            '/api/user/registration': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/login': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false
            }
            , '/logout': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            }, '/api/welcome': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/api/admin/users': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/api/admin': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/api/user/profile': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/api/admin/products/': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/api/product': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/api/country': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/api/orders': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/api/admin/orders': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/api/admin/orders-ready': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/api/admin/orders/${selectedOrderId.value}/status': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },

        }
    }
})