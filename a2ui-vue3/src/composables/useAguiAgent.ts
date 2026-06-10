import { computed, ref, shallowRef } from "vue";
import { HttpAgent, type AgentSubscriber } from "@ag-ui/client";
import type {
  ActivityMessage,
  BaseEvent,
  Message,
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

export function useAguiAgent(runtimeUrl: string) {
  const messages = ref<ChatMessage[]>([]);
  const isRunning = ref(false);
  const error = ref("");
  const pendingFrontendTool = ref<PendingFrontendTool | null>(null);
  const agent = shallowRef(
    new HttpAgent({
      url: runtimeUrl,
      threadId: createId("thread"),
      debug: false,
    }),
  );

  const canSend = computed(() => !isRunning.value);

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
        toolCallName === "requestInspectionIndicatorsModal"
      ) {
        pendingFrontendTool.value = {
          id: event.toolCallId,
          name: toolCallName,
          args: toolCallArgs,
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

  async function submitFrontendToolResult(result: unknown) {
    const pending = pendingFrontendTool.value;
    if (!pending) return;

    pendingFrontendTool.value = null;

    agent.value.addMessage({
      id: createId("tool"),
      role: "tool",
      toolCallId: pending.id,
      content: JSON.stringify(result),
    });

    syncFromAgent(agent.value.messages);
    await continueAgent();
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
    sendText,
    sendWorkflowEvent,
    submitFrontendToolResult,
    clearPendingFrontendTool,
    stop,
  };
}
