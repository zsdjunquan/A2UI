# A2UI + AG-UI 真实 Agent 后端

这个服务为 CopilotKit `1.59.2` 前端提供真实模型 agent：

1. 用户消息通过 `runtimeUrl` 进入 CopilotKit Runtime。
2. `BuiltInAgent` 调用 OpenAI-compatible 模型。
3. Runtime 的 A2UI middleware 向模型注入 `render_a2ui` tool。
4. 模型流式生成 tool-call 参数时，middleware 持续发出 A2UI
   `ACTIVITY_SNAPSHOT`，页面边生成边渲染。

服务中没有固定报告数据。所有 UI 内容都由模型根据用户输入生成。

## 配置模型

复制 `.env.example` 为 `.env`，填写真实密钥：

```env
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
MODEL_ID=gpt-4.1-mini
PORT=8080
```

也支持 DeepSeek 等 OpenAI-compatible 服务，例如：

```env
OPENAI_API_KEY=your-deepseek-key
OPENAI_BASE_URL=https://api.deepseek.com/v1
MODEL_ID=deepseek-chat
PORT=8080
```

所选模型必须支持流式输出和 tool calling。

## 启动

```bash
npm install
npm run dev
```

`npm run dev` 会先编译 TypeScript，再运行 `dist/server.js`，不依赖 `tsx`，
也不会在 Windows 上每次删除可能被占用的构建目录。
修改源码后重新执行一次该命令即可。

- CopilotKit Runtime: `http://localhost:8080/api/copilotkit`
- 健康检查: `http://localhost:8080/health`

健康检查中的 `apiKeyConfigured` 应为 `true`。

## 前端配置

A2UI 需要使用 CopilotKit v2 React API：

```tsx
import { CopilotChat, CopilotKit } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";

<CopilotKit runtimeUrl="http://localhost:8080/api/copilotkit">
  <CopilotChat
    instructions="你是一个医疗 AI 报告助手。优先使用结构化 UI 输出，不要只输出大段文字。"
    labels={{ title: "医疗 AI 报告助手" }}
  />
</CopilotKit>
```

后端同时兼容默认 single endpoint 模式，以及
`useSingleEndpoint={false}` 的 multi-route 模式。

## 测试输入

不要只发送“你好”，应提供真实报告内容，例如：

```text
请解读下面的血常规并生成结构化报告：
白细胞 12.6×10^9/L，参考范围 3.5-9.5；
血红蛋白 108 g/L，参考范围 115-150；
血小板 235×10^9/L，参考范围 125-350。
```

参考：

- https://docs.ag-ui.com/introduction
- https://a2ui.wiki/agents/
- https://a2ui.org/specification/v0.9-a2ui/
