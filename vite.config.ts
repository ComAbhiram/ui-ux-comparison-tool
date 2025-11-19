import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  preview: {
    allowedHosts: [
      'scales-south-congressional-millennium.trycloudflare.com',
      '.trycloudflare.com',
      '.loca.lt',
      'localhost'
    ]
  },
  server: {
    allowedHosts: [
      'scales-south-congressional-millennium.trycloudflare.com',
      '.trycloudflare.com',
      '.loca.lt',
      'localhost'
    ]
  }
})
