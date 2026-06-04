import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 允许所有局域网设备访问
    port: 3000,      // 你可以改成任意端口
    open: true       // 启动时自动打开浏览器
  }
})
