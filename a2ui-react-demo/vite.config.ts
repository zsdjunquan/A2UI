// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function convertCopilotToBackendPayload(payload: any) {
  const body = payload.body ?? payload

  return {
    threadId: body.threadId,
    runId: body.runId,
    messages: body.messages ?? []
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copilot-agent-adapter',
      configureServer(server) {
        server.middlewares.use('/api/copilot-agent', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          let rawBody = ''

          req.on('data', chunk => {
            rawBody += chunk
          })

          req.on('end', async () => {
            try {
              const copilotPayload = JSON.parse(rawBody)

              const backendPayload = convertCopilotToBackendPayload(copilotPayload)

              const backendRes = await fetch('http://10.17.1.244:12307/api/agent/chat', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'text/event-stream'
                },
                body: JSON.stringify(backendPayload)
              })

              res.statusCode = backendRes.status
              res.setHeader('Content-Type', backendRes.headers.get('content-type') || 'text/event-stream')
              res.setHeader('Cache-Control', 'no-cache')
              res.setHeader('Connection', 'keep-alive')

              if (!backendRes.body) {
                res.end()
                return
              }

              const reader = backendRes.body.getReader()

              while (true) {
                const { done, value } = await reader.read()

                if (done) break

                res.write(Buffer.from(value))
              }

              res.end()
            } catch (error) {
              console.error('[copilot-agent-adapter]', error)

              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error: 'Copilot adapter failed'
                })
              )
            }
          })
        })
      }
    }
  ],
  server: {
    host: '0.0.0.0', // 允许所有局域网设备访问
    port: 3000,      // 你可以改成任意端口
    open: true       // 启动时自动打开浏览器
  }
})
