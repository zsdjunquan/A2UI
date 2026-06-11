<script setup lang="ts">
import type { PendingFrontendTool } from "../../composables/useAguiAgent";
import AgentFormToolModal from "./AgentFormToolModal.vue";
import BasicInfoToolModal from "./BasicInfoToolModal.vue";
import InspectionIndicatorsToolModal from "./InspectionIndicatorsToolModal.vue";
import type { AgentFormToolArgs, BasicInfoToolArgs, InspectionIndicatorsToolArgs } from "./frontendToolTypes";

defineProps<{
  tool: PendingFrontendTool | null;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  submit: [result: unknown];
  cancel: [];
}>();
</script>

<template>
  <!-- 根据 AG-UI toolCallName 选择对应前端弹窗；提交结果会写回 role=tool 消息。 -->
  <BasicInfoToolModal
    v-if="tool?.name === 'requestBasicInfoModal'"
    :args="tool.args as BasicInfoToolArgs"
    :submitting="submitting"
    @submit="emit('submit', $event)"
    @cancel="emit('cancel')"
  />

  <InspectionIndicatorsToolModal
    v-else-if="tool?.name === 'requestInspectionIndicatorsModal'"
    :args="tool.args as InspectionIndicatorsToolArgs"
    :submitting="submitting"
    @submit="emit('submit', $event)"
    @cancel="emit('cancel')"
  />

  <AgentFormToolModal
    v-else-if="tool?.name === 'requestAgentFormModal'"
    :args="tool.args as AgentFormToolArgs"
    :submitting="submitting"
    @submit="emit('submit', $event)"
    @cancel="emit('cancel')"
  />
</template>
