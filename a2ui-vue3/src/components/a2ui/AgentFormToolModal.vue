<script setup lang="ts">
import { computed, ref } from "vue";
import { ElDialog } from "element-plus";
import DynamicAgentForm from "./DynamicAgentForm.vue";
import type { AgentFormSchema, AgentFormSubmitResult } from "./fields";
import type { AgentFormToolArgs } from "./frontendToolTypes";

const props = defineProps<{
  args: AgentFormToolArgs;
}>();

const emit = defineEmits<{
  submit: [result: unknown];
  cancel: [];
}>();

const open = ref(true);
const schema = computed<AgentFormSchema>(() => ({
  schemaVersion: "1.0",
  formId: props.args.formId || "agentForm",
  title: props.args.title,
  description: props.args.description,
  layout: {
    columns: 2,
  },
  fields: props.args.fields || [],
  initialValues: props.args.initialValue,
  submit: props.args.submitBar,
}));

function submit(result: AgentFormSubmitResult) {
  emit("submit", result);
  open.value = false;
}

function cancel() {
  open.value = false;
  emit("cancel");
}
</script>

<template>
  <ElDialog
    v-model="open"
    :title="args.title || '补充信息'"
    width="760px"
    :close-on-click-modal="false"
    @close="cancel"
  >
    <DynamicAgentForm :schema="schema" @submit="submit" @skip="submit" />
  </ElDialog>
</template>
