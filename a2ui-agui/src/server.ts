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
import { createMedicalGraphPrompt } from "./graph.js";

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
  maxSteps: 6,
  temperature: 0.2,
  prompt: createMedicalGraphPrompt(),
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
