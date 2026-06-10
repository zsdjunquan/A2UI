<script setup lang="ts">
import { computed } from "vue";
import MarkdownIt from "markdown-it";

const props = defineProps<{
  content: string;
  rich?: boolean;
}>();

const markdown = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  typographer: false,
});

const renderedContent = computed(() => {
  if (!props.rich) return "";
  return markdown.render(props.content || "");
});
</script>

<template>
  <div v-if="rich" class="message-markdown" v-html="renderedContent" />
  <div v-else class="message-plain">{{ content }}</div>
</template>
