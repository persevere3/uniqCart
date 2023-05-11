import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'

let webVersion = 'common'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'development' || webVersion == 'uniqm.net' ? "/" : "/cart",
  plugins: [
    vue(),
    AutoImport({ 
      imports: ['vue', 'vue-router', 'pinia'],  
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  server: {
    proxy: {
      '^/api': {
        target: 'https://demo.uniqcarttest.tk/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
})
