import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        // Split React runtime into its own cached chunk
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
    // Inline small assets rather than extra requests
    assetsInlineLimit: 4096,
  },
})
