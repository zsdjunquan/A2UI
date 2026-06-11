<script setup lang="ts">
const props = defineProps<{
  props: Record<string, unknown>;
}>();

const evidence = Array.isArray(props.props.evidence) ? props.props.evidence.map(String) : [];
const nextSteps = Array.isArray(props.props.nextSteps) ? props.props.nextSteps.map(String) : [];

// 通用流程节点卡：用于展示某个 agent 节点的结论、依据和下一步建议。
function text(key: string, fallback: string) {
  const value = props.props[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}
</script>

<template>
  <section class="node-card">
    <header>
      <h3>{{ text("nodeTitle", "分析节点") }}</h3>
      <span>{{ text("status", "completed") }}</span>
    </header>
    <p>{{ text("answer", "") }}</p>
    <div v-if="evidence.length || nextSteps.length" class="report-grid">
      <section v-if="evidence.length">
        <h4>依据</h4>
        <ul>
          <li v-for="item in evidence" :key="item">{{ item }}</li>
        </ul>
      </section>
      <section v-if="nextSteps.length">
        <h4>下一步</h4>
        <ul>
          <li v-for="item in nextSteps" :key="item">{{ item }}</li>
        </ul>
      </section>
    </div>
  </section>
</template>
