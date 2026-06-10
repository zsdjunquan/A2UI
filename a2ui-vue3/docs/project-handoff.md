# A2UI Vue3 项目接手文档

这份文档用于快速接手 `a2ui-vue3`。如果后续继续修 bug、加 A2UI 组件、改协议链路，可以先读这里。

## 1. 项目概览

项目路径：

```text
G:\Quan\useA2ui\a2ui-vue3
```

项目类型：

```text
Vue 3 + TypeScript + Vite + AG-UI Client + Ant Design Vue
```

入口：

- `src/main.ts`：创建 Vue 应用，引入 Ant Design Vue reset 样式和全局样式。
- `src/App.vue`：引用 `AgentChat`，当前 runtime URL 为 `/api/copilot-agent`。

当前核心链路：

```text
AgentChat.vue
  -> useAguiAgent.ts
  -> /api/copilot-agent
  -> vite.config.ts 中的 copilot-agent-adapter
  -> http://10.17.1.244:12307/api/agent/chat
```

## 2. 常用命令

安装依赖：

```bash
npm install
```

启动：

```bash
npm run dev
```

构建和类型检查：

```bash
npm run build
```

预览构建产物：

```bash
npm run preview
```

## 3. 目录说明

```text
src
├─ App.vue
├─ main.ts
├─ style.css
├─ components
│  ├─ AgentChat.vue
│  ├─ MessageContentRenderer.vue
│  └─ a2ui
│     ├─ A2UIRenderer.vue
│     ├─ A2UIFrontendToolModals.vue
│     ├─ BasicInfoToolModal.vue
│     ├─ InspectionIndicatorsToolModal.vue
│     ├─ PatientInfoForm.vue
│     ├─ BloodGasMetricDynamicForm.vue
│     ├─ BloodGasDataConfirmCard.vue
│     ├─ BloodGasAnalysisReportCard.vue
│     ├─ NodeAnswerCard.vue
│     └─ frontendToolTypes.ts
├─ composables
│  └─ useAguiAgent.ts
└─ protocol
   ├─ frontendTools.ts
   ├─ a2uiCatalog.ts
   ├─ a2uiPayload.ts
   └─ workflowEvents.ts
```

## 4. 关键文件说明

### `src/components/AgentChat.vue`

主聊天组件。

职责：

- 管理输入框、发送、停止生成。
- 根据 `hasStarted` 切换首屏居中布局和聊天布局。
- 渲染消息列表。
- activity 消息交给 `A2UIRenderer`。
- assistant 文本交给 `MessageContentRenderer`。
- frontend tool call 弹窗交给 `A2UIFrontendToolModals`。

注意：

- 输入框高度通过 `resizeInput` 自适应，最大 180px。
- 运行中发送按钮切换为停止按钮。
- `runtimeUrl` 默认 `/api/copilot-agent`。

### `src/composables/useAguiAgent.ts`

AG-UI 运行态封装，是项目最关键的逻辑文件。

职责：

- 创建 `HttpAgent`。
- 发送用户消息。
- 注册 AG-UI subscriber。
- 同步文本消息、activity 消息、错误消息。
- 处理 frontend tool call。
- 将工具提交结果作为 `role: "tool"` 消息回传给 Agent。
- 缓存已提交检测指标，避免二次修改时值丢失。

重点状态：

| 状态 | 说明 |
|---|---|
| `messages` | 页面展示消息 |
| `isRunning` | Agent 是否运行中 |
| `pendingFrontendTool` | 当前待展示的前端工具弹窗 |
| `lastUserText` | 最近一次用户输入，用于识别“修改哪个指标” |
| `submittedIndicatorResults` | 前端缓存的检测指标结果 |

工具调用处理逻辑：

- `requestBasicInfoModal`：打开基础信息弹窗。
- `requestInspectionIndicatorsModal`：打开检测指标弹窗。
- 如果用户输入“修改 TAT 指标”，前端会把 `fields` 修正为 `["tat"]`。
- 如果用户输入“修改指标 / 修改全部指标”，前端会设置 `showAll = true`。
- 每次打开指标弹窗前，会合并后端传入的 `initialResults` 和前端缓存。

### `src/protocol/frontendTools.ts`

定义传给 Agent 的 frontend tools。

目前两个工具：

- `requestBasicInfoModal`
- `requestInspectionIndicatorsModal`

如果后续要新增弹窗类工具，需要：

1. 在这里新增 tool schema。
2. 在 `useAguiAgent.ts` 的 `onToolCallEndEvent` 中识别工具名。
3. 在 `A2UIFrontendToolModals.vue` 中挂载对应组件。

### `src/components/a2ui/A2UIFrontendToolModals.vue`

根据 `pendingFrontendTool.name` 分发弹窗。

当前分发：

- `requestBasicInfoModal` -> `BasicInfoToolModal.vue`
- `requestInspectionIndicatorsModal` -> `InspectionIndicatorsToolModal.vue`

### `src/components/a2ui/BasicInfoToolModal.vue`

基础信息弹窗。

特性：

- 基于 Ant Design Vue Modal/Form/Input/Select。
- 支持字段白名单。
- 支持初始值回填。
- 默认只展示缺失字段。

### `src/components/a2ui/InspectionIndicatorsToolModal.vue`

检测指标弹窗。

特性：

- 支持默认指标。
- 支持后端传入指标配置。
- 支持根据 `fields` 展示指定指标。
- 支持 `showAll` 展示全部指标。
- 支持多种初始结果来源。
- 支持二次打开时保留已填值。
- 支持清空某个指标后提交。
- 自动计算异常状态。

指标默认值和异常判断在 `frontendToolTypes.ts`。

### `src/components/a2ui/A2UIRenderer.vue`

A2UI activity 渲染器。

职责：

- 调用 `extractA2UIPayload` 从 activity content 中提取 `{ component, props }`。
- 根据 `component` 渲染对应 Vue 组件。
- 组件提交后通过 `workflow` 事件回到 `AgentChat`。

当前支持：

- `PatientInfoForm`
- `BloodGasMetricDynamicForm`
- `BloodGasDataConfirmCard`
- `BloodGasAnalysisReportCard`
- `NodeAnswerCard`

### `src/protocol/a2uiPayload.ts`

A2UI payload 解析工具。

支持从这些字段中提取 UI payload：

- 直接 `{ component, props }`
- `surface`
- `root`
- `node`
- `ui`
- `a2ui`
- `value`
- `snapshot`
- `activities`

目的是兼容后端不同封装形态。

### `src/protocol/workflowEvents.ts`

把 A2UI 组件提交转换成用户消息。

当前事件：

- `patient-info-submit`
- `blood-gas-metrics-submit`
- `blood-gas-data-confirm`

这些事件不是 tool result，而是通过用户消息告诉 Agent：前端 A2UI 工作流节点已提交，请合并结构化数据并继续下一步。

### `src/components/MessageContentRenderer.vue`

AI 文本渲染器。

特性：

- Markdown 渲染。
- 自动识别代码、命令、JSON、SQL，包成代码块。
- 代码块添加复制按钮。
- `html: false`，不渲染 HTML。

## 5. 数据流说明

### 普通聊天

```text
用户输入
  -> AgentChat.handleSubmit
  -> useAguiAgent.sendText
  -> HttpAgent.addMessage
  -> HttpAgent.runAgent({ tools })
  -> 后端流式返回
  -> subscriber 同步 messages
  -> 页面渲染
```

### 前端工具弹窗

```text
后端 Agent 调用 frontend tool
  -> onToolCallEndEvent
  -> pendingFrontendTool
  -> A2UIFrontendToolModals 展示弹窗
  -> 用户提交
  -> submitFrontendToolResult
  -> addMessage({ role: "tool", toolCallId, content })
  -> continueAgent
```

### A2UI activity

```text
后端返回 activity message
  -> syncFromAgent
  -> AgentChat 渲染 activity
  -> A2UIRenderer 解析 payload
  -> 分发到具体 Vue 业务组件
  -> 组件提交 workflow event
  -> createWorkflowMessage
  -> Agent 继续流程
```

## 6. 后续新增 A2UI 组件步骤

假设新增组件 `RiskReviewCard`：

1. 在 `src/components/a2ui` 下创建 `RiskReviewCard.vue`。
2. 在 `src/protocol/a2uiCatalog.ts` 中新增 `RiskReviewCard` schema。
3. 在 `src/components/a2ui/A2UIRenderer.vue` 中 import 并增加 `v-else-if`。
4. 如果组件有提交动作，在 `workflowEvents.ts` 中新增事件类型。
5. 在 `AgentChat.vue` 的 `handleWorkflow` 链路中不需要额外改，只要事件类型已被支持即可。

## 7. 后续新增 Frontend Tool 步骤

假设新增工具 `requestMedicationModal`：

1. 在 `src/protocol/frontendTools.ts` 中新增 tool schema。
2. 新建弹窗组件，例如 `MedicationToolModal.vue`。
3. 在 `A2UIFrontendToolModals.vue` 中根据 tool name 渲染新弹窗。
4. 在 `useAguiAgent.ts` 中的 `onToolCallEndEvent` 加入工具名判断。
5. 如果需要跨轮状态保留，在 `useAguiAgent.ts` 中加缓存逻辑。

## 8. 已处理过的问题记录

### 404 请求链路不对

问题：

前端请求 `/api/copilotkit`，但实际后端链路是 `/api/agent/chat`。

处理：

使用 `/api/copilot-agent` 作为前端 runtime URL，在 Vite 中间件中转发到真实后端。

### tools 为空

问题：

AG-UI 请求中 `tools: []`，后端无法触发前端工具。

处理：

在 `useAguiAgent.ts` 中执行：

```ts
agent.value.runAgent({ tools: frontendTools }, subscriber);
```

### Vue3 无法直接使用 React A2UI Renderer

问题：

`@copilotkit/a2ui-renderer` 偏 React，不能直接在 Vue3 中作为渲染器使用。

处理：

实现 Vue 版 `A2UIRenderer.vue`，根据 `component` 字段分发 Vue 组件。

### AI 回复 Markdown 表格和代码显示不好

处理：

使用 `markdown-it` 渲染，并对代码块加复制按钮；对无 fenced code 的代码/命令做自动识别。

### 弹窗提交后出现空白对话框

处理：

在 `syncFromAgent` 中过滤空文本 user/assistant 消息，activity 单独保留。

### 修改指标时已填值丢失

处理：

`useAguiAgent.ts` 缓存上一次提交的指标结果，下一次工具弹窗打开时合并进 `initialResults`。`InspectionIndicatorsToolModal.vue` 同时兼容 `key/project/result/value/displayValue`。

## 9. 注意事项

- 不要把 runtime URL 改回 `/api/copilotkit`，当前实际使用 `/api/copilot-agent`。
- 后端地址目前写在 `vite.config.ts`：`http://10.17.1.244:12307/api/agent/chat`。
- 如果后端切换地址，优先改 Vite 中间件，不要散落到组件里。
- `@copilotkit/a2ui-renderer` 不建议直接接入 Vue3，除非后续官方提供 Vue renderer。
- Ant Design Vue 打包体积较大，构建出现 chunk size warning 属于预期。
- `MessageContentRenderer.vue` 使用 `v-html` 渲染 Markdown，但 `markdown-it` 已设置 `html: false`。

## 10. 快速排查清单

如果请求报 404：

- 检查 `App.vue` 是否还是 `/api/copilot-agent`。
- 检查 `vite.config.ts` 中间件是否存在。
- 检查后端 `http://10.17.1.244:12307/api/agent/chat` 是否可用。

如果弹窗不出来：

- 打开浏览器 Network，看请求体中 `tools` 是否有数据。
- 检查后端是否返回 tool call event。
- 检查 `useAguiAgent.ts` 是否识别了 tool name。

如果 A2UI UI 不渲染：

- 查看 activity content 是否包含 `component` 和 `props`。
- 检查 `extractA2UIPayload` 是否能解析该结构。
- 检查 `A2UIRenderer.vue` 是否支持该 component。

如果指标修改值丢失：

- 检查提交结果中是否有 `values` 或 `allValues`。
- 检查指标 key/project 是否能匹配默认指标。
- 检查 `submittedIndicatorResults` 是否被更新。

