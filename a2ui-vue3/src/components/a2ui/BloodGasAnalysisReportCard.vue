<script setup lang="ts">
const props = defineProps<{
  props: Record<string, unknown>;
}>();

const patient = (props.props.patient || {}) as Record<string, string>;
const testInfo = (props.props.testInfo || {}) as Record<string, string>;
const metrics = Array.isArray(props.props.metrics) ? (props.props.metrics as Record<string, string>[]) : [];
const abnormalSummary = Array.isArray(props.props.abnormalSummary) ? props.props.abnormalSummary.map(String) : [];
const suggestions = Array.isArray(props.props.suggestions) ? props.props.suggestions.map(String) : [];

// 报告卡是只读 activity，所有内容由后端 props 控制，前端只负责结构化展示。
function text(key: string, fallback: string) {
  const value = props.props[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}
</script>

<template>
  <section class="report-card">
    <header>
      <div>
        <h3>{{ text("title", "血气分析报告") }}</h3>
        <p>{{ text("conclusion", "已生成初步分析。") }}</p>
      </div>
      <span>{{ text("riskLabel", "中风险") }}</span>
    </header>

    <div class="info-strip">
      <span>{{ patient.name }}</span>
      <span>{{ patient.gender }}</span>
      <span>{{ patient.age }}</span>
      <span>{{ patient.department }}</span>
      <span v-if="testInfo.sampleType">{{ testInfo.sampleType }}</span>
    </div>

    <table>
      <thead>
        <tr>
          <th>指标</th>
          <th>结果</th>
          <th>参考范围</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="metric in metrics" :key="`${metric.name}-${metric.result}`">
          <td>{{ metric.name }}</td>
          <td>{{ metric.result }}</td>
          <td>{{ metric.referenceRange }}</td>
          <td>{{ metric.status }}</td>
        </tr>
      </tbody>
    </table>

    <div class="report-grid">
      <section>
        <h4>异常摘要</h4>
        <ul>
          <li v-for="item in abnormalSummary" :key="item">{{ item }}</li>
        </ul>
      </section>
      <section>
        <h4>建议</h4>
        <ul>
          <li v-for="item in suggestions" :key="item">{{ item }}</li>
        </ul>
      </section>
    </div>

    <section class="analysis-block">
      <h4>AI 初步分析</h4>
      <p>{{ text("aiAnalysis", "") }}</p>
    </section>
  </section>
</template>
