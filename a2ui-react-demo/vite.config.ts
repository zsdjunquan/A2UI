// vite.config.ts
import { defineConfig, type PreviewServer, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'

const backendAgentUrl =
  process.env.A2UI_BACKEND_AGENT_URL || 'http://10.17.1.244:12307/api/agent/chat'

function sendJson(res: any, statusCode: number, payload: unknown) {
  // Node 原生 res 没有 Express 的 res.json，这里统一封装 JSON 响应，避免每个分支重复写 header。
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function createRuntimeInfo() {
  // CopilotKit 启动时会先请求 runtime info，用它注册名为 default 的远程 agent。
  // 后端只有 chat 流式接口，所以这个 runtime info 由前端适配器直接补齐。
  return {
    version: 'local-a2ui-adapter',
    mode: 'sse',
    a2uiEnabled: true,
    openGenerativeUIEnabled: true,
    agents: {
      default: {
        description: '医疗 A2UI 报告助手',
        capabilities: {}
      }
    }
  }
}

function convertCopilotToBackendPayload(payload: any) {
  // CopilotKit 发到 Vite 适配器的是 JSON-RPC 风格 envelope：
  // { method, params, body }。业务后端只需要 body，不应该收到外层 method/params。
  const body = payload.body ?? payload

  // 保留 body 内的 tools/context/state 等字段：
  // - tools 是 agent 能主动调用前端弹窗的关键，不传给后端模型就无法命中 requestBasicInfoModal。
  // - 这里只剥掉外层 envelope，不裁剪 body 内的业务上下文。
  return {
    threadId: body.threadId,
    runId: body.runId,
    tools: body.tools ?? [],
    context: body.context ?? [],
    forwardedProps: body.forwardedProps ?? {},
    state: body.state ?? {},
    messages: body.messages ?? []
  }
}

function registerCopilotAgentAdapter(server: ViteDevServer | PreviewServer) {
  // CopilotKit runtimeUrl 指向 /api/copilot-agent；dev 和 preview 都要注册这个中间件，
  // 否则 npm run preview 时前端会报 runtime_info_fetch_failed / Failed to fetch。
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

        if (copilotPayload.method === 'info') {
          // runtime info 不是业务消息，不能转发到 /api/agent/chat，否则页面初始化会 502。
          sendJson(res, 200, createRuntimeInfo())
          return
        }

        const backendPayload = convertCopilotToBackendPayload(copilotPayload)

        // 后端地址集中在 backendAgentUrl，后续只需要改环境变量 A2UI_BACKEND_AGENT_URL。
        const backendRes = await fetch(backendAgentUrl, {
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

        sendJson(res, 502, {
          error: 'Copilot adapter failed',
          message: error instanceof Error ? error.message : String(error)
        })
      }
    })
  })
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copilot-agent-adapter',
      configureServer(server) {
        registerCopilotAgentAdapter(server)
      },
      configurePreviewServer(server) {
        registerCopilotAgentAdapter(server)
      }
    }
  ],
  server: {
    host: '0.0.0.0', // 允许所有局域网设备访问
    port: 3000,      // 你可以改成任意端口
    open: true       // 启动时自动打开浏览器
  }
})
