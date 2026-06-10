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

const payload = computed(() => extractA2UIPayload(props.activity.content));

function forward(type: A2UIWorkflowEventName, detail: unknown) {
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

    <pre v-else class="unknown-a2ui">{{ JSON.stringify(activity.content, null, 2) }}</pre>
  </div>
</template>
