<script setup lang="ts">
const props = defineProps<{
  props: Record<string, unknown>;
}>();

const emit = defineEmits<{
  confirm: [detail: unknown];
}>();

const patient = (props.props.patient || {}) as Record<string, string>;
const metrics = Array.isArray(props.props.metrics) ? (props.props.metrics as Record<string, string>[]) : [];

// 确认卡不编辑数据，只把后端整理后的 patient/metrics 展示给用户做最终确认。
function text(key: string, fallback: string) {
  const value = props.props[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function confirm() {
  // 用户确认后把原始 patient/metrics 回传，后端继续生成分析报告。
  emit("confirm", {
    confirmed: true,
    patient,
    metrics,
  });
}
</script>

<template>
  <section class="confirm-card">
    <header>
      <div>
        <h3>{{ text("title", "数据确认") }}</h3>
        <p>{{ patient.name }} · {{ patient.gender }} · {{ patient.age }} · {{ patient.department }}</p>
      </div>
      <span>{{ text("statusText", "待确认") }}</span>
    </header>

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
          <td>
            <span class="metric-status" :data-status="metric.status">{{ metric.status }}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="form-actions">
      <button type="button" @click="confirm">{{ text("confirmText", "确认无误") }}</button>
    </div>
  </section>
</template>
