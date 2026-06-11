import { computed, ref, shallowRef } from "vue";
import { HttpAgent, type AgentSubscriber } from "@ag-ui/client";
import type {
  ActivityMessage,
  BaseEvent,
  Message,
  ToolCall,
  ToolCallEndEvent,
  TextMessageContentEvent,
} from "@ag-ui/core";
import { createWorkflowMessage, type A2UIWorkflowEventName } from "../protocol/workflowEvents";
import { frontendTools } from "../protocol/frontendTools";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "activity" | "error";
  content: string;
  activity?: ActivityMessage;
};

export type PendingFrontendTool = {
  id: string;
  name: string;
  args: Record<string, unknown>;
};

// 检测指标存在多种用户写法；先归一化，才能把“修改 TAT / t-PAIC”等自然语言请求映射到字段 key。
const knownIndicatorAliases: Record<string, string[]> = {
  tat: ["tat"],
  pic: ["pic"],
  "t-paic": ["t-paic", "tpaic", "t paic"],
  tm: ["tm"],
  pt: ["pt"],
  aptt: ["aptt"],
  tt: ["tt"],
  fib: ["fib"],
  "d-dimer": ["d-dimer", "ddimer", "d二聚体", "d-二聚体", "d 二聚体"],
  fdp: ["fdp"],
  plt: ["plt", "血小板"],
  hb: ["hb", "血红蛋白"],
  hct: ["hct"],
};

const frontendToolNames = new Set(frontendTools.map((tool) => tool.name));

type UnknownRecord = Record<string, unknown>;

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isTextEvent(event: BaseEvent): event is TextMessageContentEvent {
  return event.type === "TEXT_MESSAGE_CONTENT";
}

function isToolCallEndEvent(event: BaseEvent): event is ToolCallEndEvent {
  return event.type === "TOOL_CALL_END";
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFrontendToolCall(toolCall: ToolCall) {
  return frontendToolNames.has(toolCall.function.name);
}

function normalizeIndicatorKey(value: unknown) {
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) return "";

  const compactText = text.replace(/\s+/g, "");
  const matchedKey = Object.entries(knownIndicatorAliases).find(([key, aliases]) => {
    if (key === text || key.replace(/\s+/g, "") === compactText) return true;
    return aliases.some((alias) => {
      const normalizedAlias = alias.toLowerCase();
      return normalizedAlias === text || normalizedAlias.replace(/\s+/g, "") === compactText;
    });
  })?.[0];

  return matchedKey || compactText;
}

// 将不同来源的指标结果统一缓存成 key -> value。这样 frontend tool 重新打开时不会丢失已填写数据。
function rememberIndicatorResult(target: Record<string, string>, rawKey: unknown, rawValue: unknown) {
  const key = normalizeIndicatorKey(rawKey);
  const value = rawValue === undefined || rawValue === null ? "" : String(rawValue).trim();
  if (!key || !value) return;

  target[key] = value;
}

function forgetIndicatorResult(target: Record<string, string>, rawKey: unknown) {
  const key = normalizeIndicatorKey(rawKey);
  if (!key) return;

  delete target[key];
}

function mergePlainResultMap(target: Record<string, string>, value: unknown) {
  if (!isRecord(value)) return;

  Object.entries(value).forEach(([key, result]) => {
    rememberIndicatorResult(target, key, result);
  });
}

function mergeIndicatorRows(target: Record<string, string>, rows: unknown) {
  if (!Array.isArray(rows)) return;

  rows.forEach((row) => {
    if (!isRecord(row)) return;
    const key = row.key ?? row.project ?? row.name;
    const value = row.result ?? row.value ?? row.displayValue;
    rememberIndicatorResult(target, key, value);
  });
}

function collectIndicatorResults(value: unknown) {
  const results: Record<string, string> = {};

  if (isRecord(value)) {
    mergePlainResultMap(results, value.initialResults);
    mergeIndicatorRows(results, value.indicators);
    mergeIndicatorRows(results, value.values);
    mergeIndicatorRows(results, value.allValues);
  }

  return results;
}

// 用户提交指标弹窗后，缓存要能更新也要能删除：用户清空某项并提交时不应被旧值重新填回。
function updateSubmittedIndicatorResults(current: Record<string, string>, value: unknown) {
  const next = { ...current };

  if (isRecord(value) && Array.isArray(value.values)) {
    value.values.forEach((row) => {
      if (!isRecord(row)) return;
      const key = row.key ?? row.project ?? row.name;
      const result = row.result ?? row.value ?? row.displayValue;
      const text = result === undefined || result === null ? "" : String(result).trim();

      if (text) {
        rememberIndicatorResult(next, key, text);
      } else {
        forgetIndicatorResult(next, key);
      }
    });
  }

  return {
    ...next,
    ...collectIndicatorResults(value),
  };
}


// 从用户最近一句话中识别明确提到的指标，用于“只修改 TAT”这类精确编辑场景。
function extractRequestedIndicators(text: string) {
  const normalized = text.toLowerCase();
  const requested = Object.entries(knownIndicatorAliases)
    .filter(([, aliases]) =>
      aliases.some((alias) => new RegExp(`(^|[^a-z0-9])${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i").test(normalized)),
    )
    .map(([key]) => key);

  return Array.from(new Set(requested));
}

function isModifyIntent(text: string) {
  return /修改|更改|改一下|调整|修正|纠正|重新填写/.test(text);
}

function isModifyAllIndicatorsIntent(text: string) {
  return /(修改|更改|调整|修正|重新填写).*(全部|所有|指标)|((全部|所有).*(指标).*(修改|更改|调整|修正|重新填写))|^修改指标$|^修改检测指标$|^修改全部指标$|^修改全部检测指标$/.test(text.trim());
}

export function useAguiAgent(runtimeUrl: string) {
  const messages = ref<ChatMessage[]>([]);
  const isRunning = ref(false);
  const error = ref("");
  const pendingFrontendTool = ref<PendingFrontendTool | null>(null);
  const lastUserText = ref("");
  const submittedIndicatorResults = ref<Record<string, string>>({});
  const isSubmittingFrontendTool = ref(false);
  const submittedFrontendToolCallIds = new Set<string>();
  const agent = shallowRef(
    new HttpAgent({
      url: runtimeUrl,
      threadId: createId("thread"),
      debug: false,
    }),
  );

  const canSend = computed(() => !isRunning.value);

  // AG-UI agent 内部消息包含 tool、空 assistant 等运行态消息；UI 只展示用户、助手和 activity。
  function syncFromAgent(nextMessages: Message[]) {
    const visible: ChatMessage[] = nextMessages
      .filter((message) => message.role === "user" || message.role === "assistant" || message.role === "activity")
      .map((message): ChatMessage | null => {
        if (message.role === "activity") {
          return {
            id: message.id,
            role: "activity",
            content: "",
            activity: message,
          };
        }

        return {
          id: message.id,
          role: message.role,
          content: typeof message.content === "string" ? message.content : "",
        };
      })
      .filter((message): message is ChatMessage => {
        if (!message) return false;
        if (message.role === "activity") return Boolean(message.activity);
        return message.content.trim().length > 0;
      });

    if (visible.length) {
      messages.value = visible;
    }
  }

  const subscriber: AgentSubscriber = {
    onRunStartedEvent() {
      isRunning.value = true;
      error.value = "";
    },
    onTextMessageContentEvent({ event, messages: nextMessages }) {
      if (isTextEvent(event)) {
        syncFromAgent(nextMessages as Message[]);
      }
    },
    onActivitySnapshotEvent({ messages: nextMessages }) {
      syncFromAgent(nextMessages as Message[]);
    },
    onMessagesSnapshotEvent({ messages: nextMessages }) {
      syncFromAgent(nextMessages as Message[]);
    },
    onToolCallEndEvent({ event, toolCallName, toolCallArgs }) {
      if (!isToolCallEndEvent(event)) return;

      if (
        toolCallName === "requestBasicInfoModal" ||
        toolCallName === "requestInspectionIndicatorsModal" ||
        toolCallName === "requestAgentFormModal"
      ) {
        const args = { ...toolCallArgs };

        // 检测指标弹窗需要合并前端缓存和后端参数，支持“重新打开继续补/改”。
        if (toolCallName === "requestInspectionIndicatorsModal") {
          args.initialResults = {
            ...submittedIndicatorResults.value,
            ...collectIndicatorResults(args),
          };
        }

        // 用户说“修改 TAT”时只展示对应指标；说“修改全部指标”时展示所有指标。
        if (toolCallName === "requestInspectionIndicatorsModal" && isModifyIntent(lastUserText.value)) {
          const requestedIndicators = extractRequestedIndicators(lastUserText.value);
          if (requestedIndicators.length) {
            args.fields = requestedIndicators;
          } else if (isModifyAllIndicatorsIntent(lastUserText.value)) {
            delete args.fields;
            args.showAll = true;
          }
        }

        pendingFrontendTool.value = {
          id: event.toolCallId,
          name: toolCallName,
          args,
        };
      }
    },
    onRunErrorEvent({ event }) {
      error.value = event.message || "Agent 运行失败";
      messages.value.push({
        id: createId("error"),
        role: "error",
        content: error.value,
      });
    },
    onRunFinishedEvent({ messages: nextMessages }) {
      syncFromAgent(nextMessages as Message[]);
      isRunning.value = false;
    },
    onRunFailed({ error: runError }) {
      isRunning.value = false;
      error.value = runError.message;
      messages.value.push({
        id: createId("error"),
        role: "error",
        content: runError.message,
      });
    },
  };

  async function runWithMessage(message: Message) {
    agent.value.addMessage(message);
    pendingFrontendTool.value = null;
    syncFromAgent(agent.value.messages);
    isRunning.value = true;

    try {
      // tools 必须传给 runAgent，后端 agent 才能发起这些 frontend tool call。
      await agent.value.runAgent({ tools: frontendTools }, subscriber);
    } catch (runError) {
      const message = runError instanceof Error ? runError.message : "Agent 运行失败";
      error.value = message;
      messages.value.push({
        id: createId("error"),
        role: "error",
        content: message,
      });
    } finally {
      isRunning.value = false;
    }
  }

  async function sendText(content: string) {
    const text = content.trim();
    if (!text || isRunning.value) return;
    lastUserText.value = text;

    await runWithMessage({
      id: createId("user"),
      role: "user",
      content: text,
    });
  }

  async function sendWorkflowEvent(type: A2UIWorkflowEventName, detail: unknown) {
    if (isRunning.value) return;
    await runWithMessage(createWorkflowMessage(type, detail));
  }

  async function continueAgent() {
    isRunning.value = true;

    try {
      await agent.value.runAgent({ tools: frontendTools }, subscriber);
    } catch (runError) {
      const message = runError instanceof Error ? runError.message : "Agent 运行失败";
      error.value = message;
      messages.value.push({
        id: createId("error"),
        role: "error",
        content: message,
      });
    } finally {
      isRunning.value = false;
    }
  }

  function createToolResultMessage(toolCallId: string, result: unknown): Message {
    return {
      id: createId("tool"),
      role: "tool",
      toolCallId,
      content: JSON.stringify(result),
    };
  }

  function completeFrontendToolResults(pending: PendingFrontendTool, result: unknown) {
    const explicitResultByToolCallId = new Map<string, unknown>([[pending.id, result]]);
    const originalToolResultById = new Map<string, Message>();
    const usedToolResultIds = new Set<string>();
    const completedMessages: Message[] = [];

    agent.value.messages.forEach((message) => {
      if (message.role === "tool") {
        originalToolResultById.set(message.toolCallId, message);
      }
    });

    agent.value.messages.forEach((message) => {
      if (message.role === "tool") {
        return;
      }

      completedMessages.push(message);

      if (message.role !== "assistant" || !message.toolCalls?.length) return;

      message.toolCalls.forEach((toolCall) => {
        const hasExplicitResult = explicitResultByToolCallId.has(toolCall.id);
        const originalResult = originalToolResultById.get(toolCall.id);

        if (!hasExplicitResult && originalResult) {
          completedMessages.push(originalResult);
          usedToolResultIds.add(toolCall.id);
          return;
        }

        if (!hasExplicitResult && !isFrontendToolCall(toolCall)) return;

        const toolResult = hasExplicitResult
          ? explicitResultByToolCallId.get(toolCall.id)
          : {
              ok: false,
              type: "frontendToolSkipped",
              skipped: true,
              reason: "superseded_by_another_frontend_tool",
              toolName: toolCall.function.name,
            };

        completedMessages.push(createToolResultMessage(toolCall.id, toolResult));
        usedToolResultIds.add(toolCall.id);
      });
    });

    originalToolResultById.forEach((message, toolCallId) => {
      if (!usedToolResultIds.has(toolCallId)) {
        completedMessages.push(message);
      }
    });

    agent.value.setMessages(completedMessages);
  }

  async function submitFrontendToolResult(result: unknown) {
    const pending = pendingFrontendTool.value;
    if (!pending || isSubmittingFrontendTool.value || submittedFrontendToolCallIds.has(pending.id)) return;

    if (pending.name === "requestInspectionIndicatorsModal") {
      submittedIndicatorResults.value = updateSubmittedIndicatorResults(submittedIndicatorResults.value, result);
    }

    isSubmittingFrontendTool.value = true;
    submittedFrontendToolCallIds.add(pending.id);

    completeFrontendToolResults(pending, result);

    pendingFrontendTool.value = null;
    syncFromAgent(agent.value.messages);

    try {
      await continueAgent();
    } finally {
      isSubmittingFrontendTool.value = false;
    }
  }

  function clearPendingFrontendTool() {
    pendingFrontendTool.value = null;
  }

  function stop() {
    agent.value.abortRun();
    isRunning.value = false;
  }

  return {
    messages,
    isRunning,
    error,
    canSend,
    pendingFrontendTool,
    isSubmittingFrontendTool,
    sendText,
    sendWorkflowEvent,
    submitFrontendToolResult,
    clearPendingFrontendTool,
    stop,
  };
}
