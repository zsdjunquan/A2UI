<script setup lang="ts">
import type { PendingFrontendTool } from "../../composables/useAguiAgent";
import BasicInfoToolModal from "./BasicInfoToolModal.vue";
import InspectionIndicatorsToolModal from "./InspectionIndicatorsToolModal.vue";
import type { BasicInfoToolArgs, InspectionIndicatorsToolArgs } from "./frontendToolTypes";

defineProps<{
  tool: PendingFrontendTool | null;
}>();

const emit = defineEmits<{
  submit: [result: unknown];
  cancel: [];
}>();
</script>

<template>
  <BasicInfoToolModal
    v-if="tool?.name === 'requestBasicInfoModal'"
    :args="tool.args as BasicInfoToolArgs"
    @submit="emit('submit', $event)"
    @cancel="emit('cancel')"
  />

  <InspectionIndicatorsToolModal
    v-else-if="tool?.name === 'requestInspectionIndicatorsModal'"
    :args="tool.args as InspectionIndicatorsToolArgs"
    @submit="emit('submit', $event)"
    @cancel="emit('cancel')"
  />
</template>
