import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Add this import

export default defineConfig({
  plugins: [
    tailwindcss(), // Add this here
    tanstackStart(),
    viteReact(),
  ],
  build: {
    cssMinify: 'esbuild',
  },
})
