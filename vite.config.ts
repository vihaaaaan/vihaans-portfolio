import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsConfigPaths()
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components')
    }
  }
})
