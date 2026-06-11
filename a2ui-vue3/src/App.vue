<script setup lang="ts">
import AgentChat from "./components/AgentChat.vue";
</script>

<template>
  <!-- 根页面只负责提供全屏壳子，实际聊天、A2UI 渲染和工具弹窗都在 AgentChat 内部。 -->
  <main class="app-shell">
    <AgentChat runtime-url="/api/copilotkit" />
  </main>
</template>
