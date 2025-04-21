import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
    plugins: [vue()],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, './index.html'), // Ö¸¶¨ popup µÄ HTML
                content: resolve(__dirname, 'src/contentScript.js'),
                background: resolve(__dirname, 'src/background.js'),
            },
            output: {
                entryFileNames: chunk => {
                    if (chunk.name === 'content') return 'contentScript.js'
                    if (chunk.name === 'background') return 'background.js'
                    return '[name].js'
                }
            }
        },
        outDir: 'dist',
        emptyOutDir: true
    }
})
