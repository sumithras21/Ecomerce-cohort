import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/ },
            { name: 'charts-vendor', test: /[\\/]node_modules[\\/](recharts|d3-.*|victory-vendor|internmap)[\\/]/ },
            { name: 'maps-vendor', test: /[\\/]node_modules[\\/](react-simple-maps|topojson-client)[\\/]/ },
            { name: 'markdown-vendor', test: /[\\/]node_modules[\\/](react-markdown|micromark.*|hast-util.*|mdast-util.*|unified|remark-.*|unist-util-.*)[\\/]/ },
            { name: 'icons-vendor', test: /[\\/]node_modules[\\/]lucide-react[\\/]/ },
          ],
        },
      },
    },
  },
})
