<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import A2UIRenderer from "./a2ui/A2UIRenderer.vue";
import A2UIFrontendToolModals from "./a2ui/A2UIFrontendToolModals.vue";
import MessageContentRenderer from "./MessageContentRenderer.vue";
import { useAguiAgent } from "../composables/useAguiAgent";
import type { A2UIWorkflowEventName } from "../protocol/workflowEvents";

const props = defineProps<{
  runtimeUrl?: string;
}>();

const runtimeUrl = props.runtimeUrl || "/api/copilot-agent";
const input = ref("");
const scrollEl = ref<HTMLElement | null>(null);
const {
  messages,
  isRunning,
  canSend,
  pendingFrontendTool,
  sendText,
  sendWorkflowEvent,
  submitFrontendToolResult,
  clearPendingFrontendTool,
  stop,
} = useAguiAgent(runtimeUrl);

async function handleSubmit() {
  const text = input.value;
  input.value = "";
  await sendText(text);
}

async function handleWorkflow(event: { type: A2UIWorkflowEventName; detail: unknown }) {
  await sendWorkflowEvent(event.type, event.detail);
}

watch(
  messages,
  async () => {
    await nextTick();
    scrollEl.value?.scrollTo({ top: scrollEl.value.scrollHeight, behavior: "smooth" });
  },
  { deep: true },
);
</script>

<template>
  <section class="agent-card" aria-label="医疗 AI 报告助手">
    <A2UIFrontendToolModals
      :tool="pendingFrontendTool"
      @submit="submitFrontendToolResult"
      @cancel="clearPendingFrontendTool"
    />

    <header class="agent-header">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">AI</div>
        <div>
          <h1>医疗 AI 报告助手</h1>
          <p>Vue3 · AG-UI Protocol · CopilotKit Runtime</p>
        </div>
      </div>

      <div class="status-pill">
        <span class="status-dot" />
        <span>{{ isRunning ? "分析中" : "就绪" }}</span>
      </div>
    </header>

    <div class="tip-bar">
      建议输入：请解读血气报告，患者张三男 65 岁呼吸内科，pH 7.28，PaCO2 58 mmHg，PaO2 72 mmHg。
    </div>

    <div ref="scrollEl" class="message-list">
      <article
        v-for="message in messages"
        :key="message.id"
        class="message-row"
        :class="`is-${message.role}`"
      >
        <div v-if="message.role === 'activity' && message.activity" class="activity-wrap">
          <A2UIRenderer :activity="message.activity" @workflow="handleWorkflow" />
        </div>
        <div v-else class="message-bubble">
          <MessageContentRenderer
            :content="message.content"
            :rich="message.role === 'assistant'"
          />
        </div>
      </article>

      <div v-if="isRunning" class="typing-row">
        <span />
        <span />
        <span />
      </div>
    </div>

    <form class="composer" @submit.prevent="handleSubmit">
      <textarea
        v-model="input"
        :disabled="isRunning"
        placeholder="请粘贴检查报告、指标或输入需要解读的问题..."
        rows="3"
        @keydown.enter.exact.prevent="handleSubmit"
      />
      <div class="composer-actions">
        <button v-if="isRunning" type="button" class="ghost-button" @click="stop">停止</button>
        <button type="submit" :disabled="!canSend || !input.trim()">发送</button>
      </div>
    </form>
  </section>
</template>
