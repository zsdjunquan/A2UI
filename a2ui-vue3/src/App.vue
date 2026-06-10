<script setup lang="ts">
import AgentChat from "./components/AgentChat.vue";
</script>

<template>
  <main class="app-shell">
    <AgentChat runtime-url="/api/copilot-agent" />
  </main>
</template>
