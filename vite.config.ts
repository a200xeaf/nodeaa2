import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'esnext',
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,    // remove console.* calls
        drop_debugger: true,   // remove debugger statements
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
