# A2UI Vue3 Agent Demo

Vue3 + TypeScript + Vite 版本的 AG-UI/CopilotKit Runtime 前端示例，参考 `a2ui-react-demo` 的医疗报告场景。

## 核心结构

- `src/components/AgentChat.vue`：agent 聊天组件，已在 `App.vue` 中引用。
- `src/composables/useAguiAgent.ts`：基于 `@ag-ui/client` 的 `HttpAgent` 封装请求协议、流式事件和消息同步。
- `src/components/a2ui/A2UIRenderer.vue`：把 AG-UI activity payload 渲染为 Vue A2UI 组件。
- `src/protocol/workflowEvents.ts`：按 React demo 的工作流事件语义，把表单提交回灌为用户消息。
- `src/protocol/a2uiCatalog.ts`：Vue 侧的 catalog id 和组件 schema 说明。

## 启动

先启动后端：

```bash
cd ../a2ui-agui
npm run dev
```

再启动 Vue3 前端：

```bash
cd ../a2ui-vue3
npm install
npm run dev
```

Vite 默认端口是 `5174`。前端默认请求 `/api/copilotkit`，开发环境会代理到 `http://localhost:8080/api/copilotkit`。

## Agent 组件用法

```vue
<script setup lang="ts">
import AgentChat from "./components/AgentChat.vue";
</script>

<template>
  <AgentChat runtime-url="/api/copilotkit" />
</template>
```

## A2UI payload 示例

```json
{
  "component": "PatientInfoForm",
  "props": {
    "title": "基础信息",
    "submitText": "提交"
  }
}
```
