import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

function normalizeAgentPayload(payload: any) {
  // React demo 的适配器会剥掉 CopilotKit JSON-RPC envelope。
  // Vue 版用 @ag-ui/client 时通常已经是 AG-UI RunAgentInput；这里兼容两种形态。
  const body = payload.body ?? payload;

  return {
    threadId: body.threadId,
    runId: body.runId,
    tools: body.tools ?? [],
    context: body.context ?? [],
    forwardedProps: body.forwardedProps ?? {},
    state: body.state ?? {},
    messages: body.messages ?? [],
  };
}

export default defineConfig({
  plugins: [
    vue(),
    {
      name: "copilot-agent-adapter",
      configureServer(server) {
        ///api/copilot-agent
        server.middlewares.use("/api/copilotkit", async (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end("Method Not Allowed");
            return;
          }

          let rawBody = "";

          req.on("data", (chunk) => {
            rawBody += chunk;
          });

          req.on("end", async () => {
            try {
              const payload = JSON.parse(rawBody);
              const backendPayload = normalizeAgentPayload(payload);
              //http://10.17.1.244:12307/api/agent/chat
              const backendRes = await fetch("http://127.0.0.1:8080/api/copilotkit", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "text/event-stream",
                },
                body: JSON.stringify(backendPayload),
              });

              res.statusCode = backendRes.status;
              res.setHeader("Content-Type", backendRes.headers.get("content-type") || "text/event-stream");
              res.setHeader("Cache-Control", "no-cache");
              res.setHeader("Connection", "keep-alive");

              if (!backendRes.body) {
                res.end();
                return;
              }

              const reader = backendRes.body.getReader();

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(Buffer.from(value));
              }

              res.end();
            } catch (error) {
              console.error("[copilot-agent-adapter]", error);

              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Copilot adapter failed" }));
            }
          });
        });
      },
    },
  ],
  server: {
    host: "0.0.0.0",
    port: 5174,
  },
});
