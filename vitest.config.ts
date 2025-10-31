    1 /// <reference types="vitest" />
    2 import { defineConfig } from 'vite'
    3 import react from '@vitejs/plugin-react-swc'
    4
    5 // https://vitejs.dev/config/
    6 export default defineConfig({
    7   plugins: [react()],
    8   test: {
    9     globals: true,
   10     environment: 'jsdom',
   11     setupFiles: './src/test/setup.ts',
   12   },
   13 })