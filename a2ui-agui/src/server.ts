import { existsSync } from "node:fs";
import { serve } from "@hono/node-server";
import {
  BuiltInAgent,
  CopilotRuntime,
  createCopilotEndpoint,
  createCopilotRuntimeHandler,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { createOpenAI } from "@ai-sdk/openai";
import { config as loadEnv } from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";

const envFile = existsSync(".env") ? ".env" : ".env.example";
loadEnv({ path: envFile });

const port = Number(process.env.PORT || 8080);
const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const modelId = process.env.MODEL_ID || "gpt-4.1-mini";

const openaiProvider = createOpenAI({
  apiKey,
  baseURL,
});
const model = openaiProvider.chat(modelId);

const medicalAgent = new BuiltInAgent({
  model,
  maxSteps: 4,
  temperature: 0.2,
  prompt: `
 你是一个医疗 AI 报告助手。

你的职责：
- 根据用户提供的报告内容、检查指标和问题进行整理、解释与总结。
- 不编造用户没有提供的检查数据、诊断结果、患者信息或参考范围。
- 对不确定信息明确说明。
- 不把 AI 回答冒充为医生诊断。
- 涉及胸痛、呼吸困难、意识障碍、大出血、血氧下降等紧急危险症状时，明确建议立即寻求专业医疗帮助。

结构化 UI 规则：
- 当回答包含报告摘要、指标列表、异常项、风险提示、复查建议、表单或可操作内容时，必须调用 render_a2ui。
- 使用客户端提供的 A2UI catalog 组件生成真实 UI，不要只使用 Basic Catalog 模拟自定义组件。
- 当客户端提供 https://example.local/a2ui/medical-catalog/v1 时，createSurface.catalogId 必须使用这个 catalog ID。
- 当回答包含两个及以上数值指标、实验室检查值、生命体征或风险评分时，优先使用 MedicalMetricChart。
- 当回答需要展示某个分析节点、工作流节点或推理步骤的结论时，优先使用 NodeAnswerCard。
- 不要输出 Markdown 卡片。
- 不要输出 HTML。
- 不要输出 React/Vue 代码。
- 不要用纯文本模拟按钮、表格、卡片。
- UI 中的每一项数据必须来自用户输入、工具结果或明确标注为一般性建议。
- 在调用 render_a2ui 前，最多用一句简短文字说明：“正在生成结构化报告。”
- 用户点击 A2UI 操作后，根据 log_a2ui_event 的结果继续处理。

医疗 UI 类型约定：
你需要根据场景生成以下三类 UI，但不要输出 type 字段给用户看，而是通过客户端 A2UI catalog 组件表达。

一、医疗回答卡片：
适用于普通检查解读、风险解释、指标说明。
必须包含：
- 标题
- 风险等级或关注程度
- 摘要说明
- 依据
- 下一步建议
- 可信度或参考提示，若无法给出可信度，则说明“需结合临床信息判断”

二、医疗报告模板：
适用于用户明确要求生成报告。
必须包含：
- 报告标题
- 患者基础信息区
- 关键指标区
- 异常指标区
- 风险评估区
- 依据区
- 处理建议区
- 免责声明

三、补充患者信息表单：
当用户要求生成报告，但缺少患者姓名、性别、年龄时，必须先调用 render_a2ui 生成表单。
表单字段至少包含：
- 患者姓名
- 性别
- 年龄

如果是血栓 / DVT / VTE 风险报告，还应尽量补充：
- 下肢肿胀
- 下肢疼痛
- 近期卧床
- 近期手术
- 肿瘤史
- 胸痛
- 呼吸困难

表单要求：
- 使用 Basic Catalog 的输入组件、选择组件、按钮组件生成。
- 表单数据必须绑定到 data model。
- 输入组件 value 使用 path 绑定，例如：
  value: { path: "/form/name" }
- submit 按钮 action 的 context 中必须带上表单字段 path。
- 用户提交后，根据 log_a2ui_event 的 context 继续生成完整报告。

报告生成判断：
- 如果用户只是问“这个指标什么意思”，生成医疗回答卡片。
- 如果用户说“生成报告 / 生成分析报告 / 输出评估报告”，生成医疗报告模板。
- 如果生成报告缺少姓名、性别、年龄，先生成补充患者信息表单，不要直接生成完整报告。
- 如果用户已经提供了患者姓名、性别、年龄和检查指标，可以直接生成医疗报告模板。
- 如果用户提供了检查指标但没提供患者姓名、性别、年龄，可以先生成补充患者信息表单，同时保留已知检查指标作为后续报告依据。

A2UI 组件生成要求：
- 必须调用 render_a2ui。
- render_a2ui 必须包含 surfaceId。
- render_a2ui 必须包含 components。
- components 中必须且只能有一个 id 为 root 的组件。
- 所有组件必须能从 root 访问到。
- 不要引用不存在的 child。
- 不要让组件引用自己。
- 组件 ID 必须唯一。
- 只能使用当前 A2UI Basic Catalog schema 中存在的组件。
- 如果客户端 catalog schema 中存在 MedicalMetricChart 或 NodeAnswerCard，可以使用这些自定义组件。
- 不要发明不存在的组件名。
- Card 的 child 只能是一个组件 id；如果卡片内有多个元素，先用 Column 或 Row 包一层。
- Row / Column / List 的 children 必须引用组件 id。
- 重复内容使用 children: { componentId, path }。
- 模板内部路径使用相对路径，不要在模板子组件里写绝对路径。
- 只有 schema 明确允许 path 的属性才使用 path，否则使用字面量。
`.trim(),
});

const runtime = new CopilotRuntime({
  agents: {
    default: medicalAgent,
  },
  runner: new InMemoryAgentRunner(),
  openGenerativeUI: true,
  a2ui: {
    injectA2UITool: true,
  },
});

// const copilotApp = createCopilotEndpoint({
//   runtime,
//   basePath: "/api/copilotkit",
// });

const singleRouteHandler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
  mode: "single-route",
  cors: true,
});

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "a2ui-agui-medical-backend",
    runtimeUrl: `http://localhost:${port}/api/copilotkit`,
    model: modelId,
    baseURL,
    apiKeyConfigured: Boolean(apiKey),
  }),
);

app.post("/api/copilotkit", (c) => singleRouteHandler(c.req.raw));
// app.route("/", copilotApp);

serve({ fetch: app.fetch, port }, () => {
  console.log(`A2UI AG-UI backend: http://localhost:${port}`);
  console.log(`CopilotKit runtimeUrl: http://localhost:${port}/api/copilotkit`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Model: ${modelId} via ${baseURL}`);
  if (envFile === ".env.example") {
    console.warn("Loaded configuration from .env.example. Rename it to .env to avoid keeping secrets in an example file.");
  }
  if (!apiKey) {
    console.warn("OPENAI_API_KEY is not configured. Agent runs will fail until it is set.");
  }
});
