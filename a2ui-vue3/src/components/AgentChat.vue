<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { ArrowUpOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons-vue";
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
const inputEl = ref<HTMLTextAreaElement | null>(null);
const scrollEl = ref<HTMLElement | null>(null);
const hasStarted = ref(false);

// useAguiAgent 封装了 AG-UI HttpAgent、消息同步、frontend tool 弹窗和工作流事件续跑。
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

// 输入框按内容自动增高，最大高度限制在 180px，避免长文本撑破聊天布局。
function resizeInput(event?: Event) {
  const target = event?.target instanceof HTMLTextAreaElement ? event.target : null;
  if (!target) return;

  target.style.height = "auto";
  const nextHeight = Math.min(target.scrollHeight, 180);
  target.style.height = `${nextHeight}px`;
  target.style.overflowY = target.scrollHeight > 180 ? "auto" : "hidden";
}

// 用户发送普通文本后交给 AG-UI agent；后续 assistant 文本、activity、tool call 都由 subscriber 同步回来。
async function handleSubmit() {
  const text = input.value;
  if (!text.trim() || isRunning.value) return;

  hasStarted.value = true;
  input.value = "";
  await nextTick();
  if (inputEl.value) {
    inputEl.value.style.height = "34px";
    inputEl.value.style.overflowY = "hidden";
  }
  await sendText(text);
}

// A2UI activity 组件里的按钮会发 workflow 事件，这里转成一条 user message 继续驱动 agent。
async function handleWorkflow(event: { type: A2UIWorkflowEventName; detail: unknown }) {
  await sendWorkflowEvent(event.type, event.detail);
}

watch(
  messages,
  async () => {
    await nextTick();
    // 新消息到达后自动滚到底部，让 streamed text / activity 卡片保持可见。
    scrollEl.value?.scrollTo({ top: scrollEl.value.scrollHeight, behavior: "smooth" });
  },
  { deep: true },
);
</script>

<template>
  <section
    class="agent-card"
    :class="{ 'is-landing': !hasStarted, 'is-chatting': hasStarted }"
    aria-label="医疗 AI 报告助手"
  >
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
          <p>报告解读 · 指标异常 · 风险提示 · 复查建议</p>
        </div>
      </div>

      <div class="status-pill" aria-label="服务状态">
        <span class="status-dot" />
        <span>{{ isRunning ? "辅助分析中" : "就绪待命" }}</span>
      </div>
    </header>

    <div class="tip-bar">
      <span class="tip-label">提示</span>
      <span>建议输入：血常规、凝血功能、D-二聚体、尿蛋白、血压记录或影像摘要</span>
    </div>

    <div v-if="!hasStarted" class="landing-content">
      <div class="landing-panel">
        <h1>欢迎使用医疗 AI 报告助手，请输入报告内容开始分析。</h1>

        <form class="composer" @submit.prevent="handleSubmit">
          <button class="composer-tool" type="button" aria-label="添加内容">
            <PlusOutlined />
          </button>

          <textarea
            ref="inputEl"
            v-model="input"
            :disabled="isRunning"
            placeholder="请粘贴检查报告、指标或输入需要解读的问题..."
            rows="1"
            @input="resizeInput"
            @keydown.enter.exact.prevent="handleSubmit"
          />

          <button
            v-if="isRunning"
            class="composer-send is-running"
            type="button"
            aria-label="停止生成"
            @click="stop"
          >
            <StopOutlined />
          </button>
          <button
            v-else
            class="composer-send"
            type="submit"
            aria-label="发送"
            :disabled="!canSend || !input.trim()"
          >
            <ArrowUpOutlined />
          </button>
        </form>

        <p class="landing-disclaimer">
          AI 分析仅供临床参考，请结合医生判断与原始报告核实。
        </p>
      </div>
    </div>

    <template v-else>
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

      <form class="composer is-compact" @submit.prevent="handleSubmit">
        <button class="composer-tool" type="button" aria-label="添加内容">
          <PlusOutlined />
        </button>

        <textarea
          ref="inputEl"
          v-model="input"
          :disabled="isRunning"
          placeholder="请粘贴检查报告、指标或输入需要解读的问题..."
          rows="1"
          @input="resizeInput"
          @keydown.enter.exact.prevent="handleSubmit"
        />

        <button
          v-if="isRunning"
          class="composer-send is-running"
          type="button"
          aria-label="停止生成"
          @click="stop"
        >
          <StopOutlined />
        </button>
        <button
          v-else
          class="composer-send"
          type="submit"
          aria-label="发送"
          :disabled="!canSend || !input.trim()"
        >
          <ArrowUpOutlined />
        </button>
      </form>
    </template>
  </section>
</template>
