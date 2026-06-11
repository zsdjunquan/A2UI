<script setup lang="ts">
import { computed } from "vue";
import type { ActivityMessage } from "@ag-ui/core";
import PatientInfoForm from "./PatientInfoForm.vue";
import BloodGasMetricDynamicForm from "./BloodGasMetricDynamicForm.vue";
import BloodGasDataConfirmCard from "./BloodGasDataConfirmCard.vue";
import BloodGasAnalysisReportCard from "./BloodGasAnalysisReportCard.vue";
import NodeAnswerCard from "./NodeAnswerCard.vue";
import { extractA2UIPayload } from "../../protocol/a2uiPayload";
import type { A2UIWorkflowEventName } from "../../protocol/workflowEvents";

const props = defineProps<{
  activity: ActivityMessage;
}>();

const emit = defineEmits<{
  workflow: [event: { type: A2UIWorkflowEventName; detail: unknown }];
}>();

// activity.content 由后端发送，先归一化成 { component, props } 再按 component 名分发到具体卡片。
const payload = computed(() => extractA2UIPayload(props.activity.content));

function forward(type: A2UIWorkflowEventName, detail: unknown) {
  // 子组件提交的数据不直接调用 agent，而是交给 AgentChat 转成 workflow message。
  emit("workflow", { type, detail });
}
</script>

<template>
  <div class="a2ui-surface">
    <PatientInfoForm
      v-if="payload?.component === 'PatientInfoForm'"
      :props="payload.props"
      @submit="forward('patient-info-submit', $event)"
    />

    <BloodGasMetricDynamicForm
      v-else-if="payload?.component === 'BloodGasMetricDynamicForm'"
      :props="payload.props"
      @submit="forward('blood-gas-metrics-submit', $event)"
    />

    <BloodGasDataConfirmCard
      v-else-if="payload?.component === 'BloodGasDataConfirmCard'"
      :props="payload.props"
      @confirm="forward('blood-gas-data-confirm', $event)"
    />

    <BloodGasAnalysisReportCard
      v-else-if="payload?.component === 'BloodGasAnalysisReportCard'"
      :props="payload.props"
    />

    <NodeAnswerCard
      v-else-if="payload?.component === 'NodeAnswerCard'"
      :props="payload.props"
    />

    <!-- 未识别的 A2UI payload 保留 JSON 兜底，方便调试后端返回结构。 -->
    <pre v-else class="unknown-a2ui">{{ JSON.stringify(activity.content, null, 2) }}</pre>
  </div>
</template>
