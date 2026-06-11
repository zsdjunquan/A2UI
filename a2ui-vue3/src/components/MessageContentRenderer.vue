<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import MarkdownIt from "markdown-it";

const props = defineProps<{
  content: string;
  rich?: boolean;
}>();

const rootEl = ref<HTMLElement | null>(null);
const cleanupHandlers: Array<() => void> = [];

// assistant 消息走 markdown 渲染；普通 user/error 文本保持纯文本，避免不必要的 HTML 注入面。
const markdown = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  typographer: false,
});

function looksLikeFencedMarkdown(value: string) {
  return /```/.test(value);
}

function detectCodeLanguage(value: string) {
  const text = value.trim();

  if (/^\s*[{[][\s\S]*[}\]]\s*$/.test(text)) return "json";
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i.test(text)) return "sql";
  if (/^\s*(npm|pnpm|yarn|bun|git|cd|mkdir|curl|Invoke-WebRequest)\b/m.test(text)) return "bash";
  if (/\b(function|const|let|var|return|class|import|export|interface|type)\b/.test(text)) return "ts";
  if (/\b(def|print|import|from|class|return)\b/.test(text) && /:\s*$|^\s{4,}/m.test(text)) return "python";

  return "";
}

function looksLikeStandaloneCode(value: string) {
  const text = value.trim();
  if (!text || looksLikeFencedMarkdown(text)) return false;

  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 3) return false;

  const codeSignals = [
    /^\s*(\/\*\*?|\/\/|#|<!--)/,
    /^\s*(function|const|let|var|class|import|export|interface|type|def)\b/,
    /^\s*(if|for|while|switch|return|try|catch)\b/,
    /[{};]/,
    /^\s{2,}\S/,
  ];

  const signalCount = lines.filter((line) => codeSignals.some((pattern) => pattern.test(line))).length;
  return signalCount / lines.length >= 0.35;
}

// 有些模型会直接吐多行代码但不包 ```，这里补成 fenced code 以获得统一样式和复制按钮。
const normalizedContent = computed(() => {
  const content = props.content || "";
  if (!props.rich || !looksLikeStandaloneCode(content)) return content;

  const language = detectCodeLanguage(content);
  return `\`\`\`${language}\n${content.trim()}\n\`\`\``;
});

const renderedContent = computed(() => {
  if (!props.rich) return "";
  return markdown.render(normalizedContent.value);
});

function cleanupCodeCopyButtons() {
  while (cleanupHandlers.length) {
    cleanupHandlers.pop()?.();
  }
}

// Clipboard API 不可用时走 textarea fallback，兼容旧浏览器或受限环境。
async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

// markdown-it 只负责生成 HTML；复制按钮在 DOM 更新后手动增强，卸载时清理事件监听。
function enhanceCodeBlocks() {
  cleanupCodeCopyButtons();

  const root = rootEl.value;
  if (!root) return;

  root.querySelectorAll("pre").forEach((pre) => {
    if (pre.querySelector(".code-copy-button")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy-button";
    button.textContent = "复制";

    const handleClick = async () => {
      const code = pre.querySelector("code")?.textContent || pre.textContent || "";

      try {
        await copyText(code);
        button.textContent = "已复制";
        window.setTimeout(() => {
          button.textContent = "复制";
        }, 1200);
      } catch {
        button.textContent = "失败";
        window.setTimeout(() => {
          button.textContent = "复制";
        }, 1200);
      }
    };

    button.addEventListener("click", handleClick);
    cleanupHandlers.push(() => button.removeEventListener("click", handleClick));
    pre.appendChild(button);
  });
}

watch(
  renderedContent,
  async () => {
    await nextTick();
    enhanceCodeBlocks();
  },
  { immediate: true },
);

onBeforeUnmount(cleanupCodeCopyButtons);
</script>

<template>
  <div v-if="rich" ref="rootEl" class="message-markdown" v-html="renderedContent" />
  <div v-else class="message-plain">{{ content }}</div>
</template>
