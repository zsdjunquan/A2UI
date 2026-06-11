# A2UI 全流程维护指南

这份文档不是只讲动态表单，而是讲 `a2ui-vue3` 里完整的 A2UI 工作方式：用户消息、后端 agent、AG-UI event、activity 组件、frontend tool 弹窗、workflow event、动态表单字段库之间怎么串起来。

后续你新增任何 A2UI 能力，都先判断它属于哪条链路。

## 1. 项目里的三类 A2UI 能力

当前项目里有三种前端交互形态：

```text
1. 普通 assistant 文本
2. A2UI activity 组件
3. AG-UI frontend tool 弹窗
```

它们的区别：

```text
assistant 文本
  后端返回普通文本，前端用 markdown 渲染。

A2UI activity 组件
  后端返回 activity message，内容里带 component + props。
  前端把它渲染成聊天里的卡片或表单。

frontend tool 弹窗
  后端 agent 调用前端工具。
  前端弹出 modal，用户提交后以 role=tool 结果回传给 agent。
```

动态表单 `DynamicAgentForm` 本身不是独立链路，它是一个可复用组件。它可以被 frontend tool 弹窗使用，也可以未来被 activity 组件使用。

## 2. 总体数据流

普通聊天流程：

```text
用户输入
  -> AgentChat.vue
  -> useAguiAgent.sendText
  -> HttpAgent.addMessage
  -> HttpAgent.runAgent({ tools: frontendTools })
  -> 后端 agent
  -> AG-UI events
  -> subscriber 同步到前端
  -> 页面渲染
```

核心文件：

```text
src/components/AgentChat.vue
src/composables/useAguiAgent.ts
src/protocol/frontendTools.ts
```

## 3. 普通文本渲染链路

当后端返回 assistant 文本：

```text
AG-UI TEXT_MESSAGE_CONTENT
  -> useAguiAgent.syncFromAgent
  -> messages
  -> AgentChat.vue
  -> MessageContentRenderer.vue
```

核心文件：

```text
src/components/MessageContentRenderer.vue
```

职责：

```text
1. 普通文本展示
2. assistant markdown 渲染
3. 表格、列表、代码块展示
4. 自动识别未包裹 ``` 的多行代码
5. 给代码块增加复制按钮
```

维护点：

```text
如果你要改 assistant 回复样式，看 MessageContentRenderer.vue 和 style.css。
如果你要改 markdown 能力，比如表格、代码复制，也看 MessageContentRenderer.vue。
不要把 markdown 渲染逻辑写到 A2UI 卡片组件里。
```

## 4. A2UI activity 组件链路

activity 用于“后端主动把一个 UI 卡片插进聊天流里”。

完整流程：

```text
后端返回 activity message
  -> useAguiAgent.syncFromAgent
  -> AgentChat.vue 识别 message.role === "activity"
  -> A2UIRenderer.vue
  -> extractA2UIPayload(activity.content)
  -> 根据 payload.component 渲染具体组件
```

核心文件：

```text
src/components/a2ui/A2UIRenderer.vue
src/protocol/a2uiPayload.ts
src/protocol/a2uiCatalog.ts
```

当前 activity 组件：

```text
PatientInfoForm
BloodGasMetricDynamicForm
BloodGasDataConfirmCard
BloodGasAnalysisReportCard
NodeAnswerCard
```

后端 activity payload 推荐格式：

```json
{
  "component": "NodeAnswerCard",
  "props": {
    "nodeTitle": "指标判断",
    "status": "completed",
    "answer": "当前指标提示存在异常风险。",
    "evidence": ["D-dimer 升高", "FIB 偏低"],
    "nextSteps": ["建议结合临床症状复核"]
  }
}
```

前端也兼容一些包裹结构，比如：

```text
surface
root
node
ui
a2ui
value
snapshot
activities
```

这些由 `a2uiPayload.ts` 负责解析。

## 5. activity 组件怎么继续 agent 流程

有些 activity 只是展示，比如：

```text
BloodGasAnalysisReportCard
NodeAnswerCard
```

有些 activity 有用户操作，比如：

```text
PatientInfoForm
BloodGasMetricDynamicForm
BloodGasDataConfirmCard
```

它们提交时不是走 frontend tool result，而是走 workflow event。

流程：

```text
组件 emit submit/confirm
  -> A2UIRenderer.forward
  -> AgentChat.handleWorkflow
  -> useAguiAgent.sendWorkflowEvent
  -> createWorkflowMessage
  -> 生成一条 role=user 的结构化消息
  -> agent 继续后续节点
```

核心文件：

```text
src/protocol/workflowEvents.ts
src/components/a2ui/A2UIRenderer.vue
src/components/AgentChat.vue
```

什么时候用 workflow event：

```text
这个 UI 已经出现在聊天流里，用户在卡片上点击确认/提交，然后让 agent 沿当前流程继续。
```

什么时候不要用 workflow event：

```text
后端主动要求前端弹窗收集信息，这种是 frontend tool。
```

## 6. frontend tool 弹窗链路

frontend tool 用于“后端 agent 主动调用前端能力，让用户填写/确认，然后把结果作为 tool result 回传”。

完整流程：

```text
frontendTools.ts 声明工具
  -> runAgent({ tools: frontendTools })
  -> 后端 agent 调用 tool
  -> AG-UI TOOL_CALL_END
  -> useAguiAgent.onToolCallEndEvent
  -> pendingFrontendTool
  -> A2UIFrontendToolModals.vue
  -> 具体 Modal 组件
  -> 用户提交
  -> submitFrontendToolResult
  -> addMessage({ role: "tool", toolCallId, content })
  -> continueAgent
```

核心文件：

```text
src/protocol/frontendTools.ts
src/composables/useAguiAgent.ts
src/components/a2ui/A2UIFrontendToolModals.vue
src/components/a2ui/frontendToolTypes.ts
```

当前 frontend tools：

```text
requestBasicInfoModal
requestInspectionIndicatorsModal
requestAgentFormModal
```

当前对应弹窗：

```text
requestBasicInfoModal
  -> BasicInfoToolModal.vue

requestInspectionIndicatorsModal
  -> InspectionIndicatorsToolModal.vue

requestAgentFormModal
  -> AgentFormToolModal.vue
  -> DynamicAgentForm.vue
```

## 7. 动态表单在整个 A2UI 里的位置

动态表单组件：

```text
src/components/a2ui/DynamicAgentForm.vue
```

字段组件库：

```text
src/components/a2ui/fields
```

动态表单不是直接和 agent 通信的组件。它只做一件事：

```text
解释后端返回的表单 JSON，并把用户填写结果 emit 出去。
```

当前它被这里使用：

```text
AgentFormToolModal.vue
```

所以现在的链路是：

```text
后端调用 requestAgentFormModal
  -> AgentFormToolModal
  -> DynamicAgentForm
  -> 用户提交
  -> role=tool result
  -> agent 继续
```

未来也可以这么用：

```text
后端返回 activity component = DynamicRequirementFormCard
  -> A2UIRenderer
  -> DynamicAgentForm
  -> workflow event
```

这就是为什么动态表单要独立封装，而不是写死在 tool modal 里。

## 8. 新增一种 A2UI 能力时怎么判断走哪条路

### 场景 A：只展示一张结果卡片

例如：

```text
需求拆解结果
风险分析报告
检查报告摘要
节点推理结论
```

用 activity 组件。

要改：

```text
1. src/components/a2ui/NewCard.vue
2. src/protocol/a2uiCatalog.ts
3. src/components/a2ui/A2UIRenderer.vue
```

如果没有用户操作，不用改 `workflowEvents.ts`。

### 场景 B：聊天流里的卡片需要用户点确认

例如：

```text
确认识别结果
确认指标数据
确认需求拆解方案
```

用 activity + workflow event。

要改：

```text
1. src/components/a2ui/NewConfirmCard.vue
2. src/protocol/a2uiCatalog.ts
3. src/components/a2ui/A2UIRenderer.vue
4. src/protocol/workflowEvents.ts
```

提交结果会变成一条 user message，不是 tool result。

### 场景 C：后端 agent 要主动弹窗收集信息

例如：

```text
补充基本信息
补充检测指标
补充需求拆解字段
选择功能模块
```

用 frontend tool。

要改：

```text
1. src/protocol/frontendTools.ts
2. src/components/a2ui/frontendToolTypes.ts
3. src/components/a2ui/NewToolModal.vue
4. src/components/a2ui/A2UIFrontendToolModals.vue
5. src/composables/useAguiAgent.ts
```

提交结果会变成 `role: "tool"` 消息。

### 场景 D：只是给动态表单多一种字段

例如：

```text
CheckboxField
DateField
UploadField
SliderField
```

改字段库。

要改：

```text
1. src/components/a2ui/fields/NewField.vue
2. src/components/a2ui/fields/types.ts
3. src/components/a2ui/fields/index.ts
4. src/components/a2ui/DynamicAgentForm.vue
```

如果这个字段也要被 `requestAgentFormModal` 的 tool schema 允许，再改：

```text
5. src/protocol/frontendTools.ts
```

## 9. 新增 CheckboxField 放在完整流程里怎么理解

你现在要加 `CheckboxField`，它属于：

```text
场景 D：给动态表单多一种字段
```

它本身不需要新增 activity，不需要新增 frontend tool，不需要改 workflow event。

但是如果后端要通过 `requestAgentFormModal` 直接返回这个字段，那么最后还要让 tool schema 认识它：

```text
src/protocol/frontendTools.ts
  agentFormFieldSchema.type.enum
```

完整改动顺序：

```text
1. 新增 CheckboxField.vue
2. types.ts 加 CheckboxFieldProps
3. types.ts 的 AgentFormFieldKind 加 "CheckboxField"
4. types.ts 的 AgentFormFieldConfig 加 CheckboxField 分支
5. index.ts 导出 CheckboxField 和 CheckboxFieldProps
6. DynamicAgentForm.vue import CheckboxField
7. DynamicAgentForm.vue 模板加 v-else-if 分支
8. DynamicAgentForm.vue 的 getInitialValue 给 CheckboxField 默认 []
9. 如果 tool schema 也要支持，frontendTools.ts enum 加 "CheckboxField"
10. npm run build
```

## 10. A2UI 维护时最容易混的点

### activity submit 和 frontend tool submit 不一样

activity submit：

```text
emit workflow
  -> createWorkflowMessage
  -> role=user
```

frontend tool submit：

```text
submitFrontendToolResult
  -> role=tool
  -> toolCallId
```

不要混用。

### A2UIRenderer 不负责 frontend tool

`A2UIRenderer.vue` 只渲染 activity message。

frontend tool 由：

```text
A2UIFrontendToolModals.vue
```

负责。

### DynamicAgentForm 不直接认识后端 agent

它只认识：

```text
schema
submit event
skip event
```

具体是 tool result 还是 workflow event，由外层组件决定。

### frontendTools.ts 是告诉后端 agent 能调用什么

如果 `frontendTools.ts` 里没有声明，后端就不应该调用这个前端工具。

但是字段组件类型不一定都要立刻注册到 tool schema，取决于它是否会通过 frontend tool 参数下发。

## 11. 你以后自己改时的通用检查表

每次改 A2UI，先回答：

```text
1. 这是普通文本、activity、frontend tool，还是动态字段？
2. 后端返回的数据形状是什么？
3. 前端由哪个组件接收？
4. 用户操作后的结果是 workflow event 还是 tool result？
5. 是否需要在 protocol 里注册 schema？
6. 是否需要在 useAguiAgent 里识别 tool name？
7. 是否需要缓存跨轮状态？
8. npm run build 是否通过？
```

## 12. 当前重要文件索引

聊天壳：

```text
src/components/AgentChat.vue
```

AG-UI 运行态：

```text
src/composables/useAguiAgent.ts
```

普通文本渲染：

```text
src/components/MessageContentRenderer.vue
```

activity 渲染：

```text
src/components/a2ui/A2UIRenderer.vue
src/protocol/a2uiPayload.ts
src/protocol/a2uiCatalog.ts
src/protocol/workflowEvents.ts
```

frontend tool：

```text
src/protocol/frontendTools.ts
src/components/a2ui/A2UIFrontendToolModals.vue
src/components/a2ui/frontendToolTypes.ts
```

动态表单：

```text
src/components/a2ui/DynamicAgentForm.vue
src/components/a2ui/AgentFormToolModal.vue
src/components/a2ui/fields
```

业务弹窗：

```text
src/components/a2ui/BasicInfoToolModal.vue
src/components/a2ui/InspectionIndicatorsToolModal.vue
```

业务 activity：

```text
src/components/a2ui/PatientInfoForm.vue
src/components/a2ui/BloodGasMetricDynamicForm.vue
src/components/a2ui/BloodGasDataConfirmCard.vue
src/components/a2ui/BloodGasAnalysisReportCard.vue
src/components/a2ui/NodeAnswerCard.vue
```
