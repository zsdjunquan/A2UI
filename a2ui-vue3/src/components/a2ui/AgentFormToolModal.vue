<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ElDialog } from "element-plus";
import {
  BooleanField,
  MultiChoiceField,
  NumberField,
  SelectField,
  SingleChoiceField,
  SubmitBar,
  TextareaField,
  TextField,
} from "./fields";
import type { AgentFormFieldConfig, ChoiceValue } from "./fields";
import type { AgentFormToolArgs, AgentFormValueMap } from "./frontendToolTypes";

const props = defineProps<{
  args: AgentFormToolArgs;
}>();

const emit = defineEmits<{
  submit: [result: unknown];
  cancel: [];
}>();

const open = ref(true);
const errors = ref<Record<string, string>>({});

const fields = computed(() => props.args.fields || []);
const values = reactive<AgentFormValueMap>({});

fields.value.forEach((field) => {
  values[field.key] = getInitialValue(field);
});

function getInitialValue(field: AgentFormFieldConfig) {
  const initial = props.args.initialValue?.[field.key];
  if (initial !== undefined) return initial;

  if (field.type === "MultiChoiceField") return [];
  if (field.type === "BooleanField") return false;
  if (field.type === "NumberField") return undefined;
  return "";
}

function getTextValue(key: string) {
  const value = values[key];
  return value === undefined || value === null || Array.isArray(value) ? "" : String(value);
}

function getChoiceValue(key: string) {
  const value = values[key];
  return Array.isArray(value) ? undefined : value;
}

function getChoiceArrayValue(key: string) {
  const value = values[key];
  return Array.isArray(value) ? value : [];
}

function getNumberValue(key: string) {
  const value = values[key];
  return typeof value === "number" ? value : undefined;
}

function getBooleanValue(key: string) {
  return values[key] === true;
}

function setValue(key: string, value: ChoiceValue | ChoiceValue[] | undefined) {
  values[key] = value;
  if (errors.value[key]) {
    const next = { ...errors.value };
    delete next[key];
    errors.value = next;
  }
}

function isEmptyValue(value: ChoiceValue | ChoiceValue[] | undefined) {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "boolean") return false;
  return value === undefined || value === null || String(value).trim() === "";
}

function validate() {
  const next: Record<string, string> = {};

  fields.value.forEach((field) => {
    if (field.required && isEmptyValue(values[field.key])) {
      next[field.key] = field.error || "请补充该项";
    }
  });

  errors.value = next;
  return Object.keys(next).length === 0;
}

function cleanValues() {
  return fields.value.reduce<AgentFormValueMap>((result, field) => {
    result[field.key] = values[field.key];
    return result;
  }, {});
}

function submit() {
  if (!validate()) return;

  emit("submit", {
    ok: true,
    type: "agentForm",
    formId: props.args.formId,
    values: cleanValues(),
    submittedFields: fields.value.map((field) => field.key),
  });
  open.value = false;
}

function skip() {
  emit("submit", {
    ok: true,
    type: "agentForm",
    formId: props.args.formId,
    skipped: true,
    values: cleanValues(),
    submittedFields: fields.value.map((field) => field.key),
  });
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
    <p v-if="args.description" class="agent-form-description">{{ args.description }}</p>

    <div class="agent-form-grid">
      <template v-for="field in fields" :key="field.key">
        <TextField
          v-if="field.type === 'TextField'"
          :model-value="getTextValue(field.key)"
          v-bind="{ ...field, error: errors[field.key] }"
          @update:model-value="setValue(field.key, $event)"
        />

        <TextareaField
          v-else-if="field.type === 'TextareaField'"
          :model-value="getTextValue(field.key)"
          v-bind="{ ...field, error: errors[field.key] }"
          @update:model-value="setValue(field.key, $event)"
        />

        <SingleChoiceField
          v-else-if="field.type === 'SingleChoiceField'"
          :model-value="getChoiceValue(field.key)"
          v-bind="{ ...field, error: errors[field.key] }"
          @update:model-value="setValue(field.key, $event)"
        />

        <MultiChoiceField
          v-else-if="field.type === 'MultiChoiceField'"
          :model-value="getChoiceArrayValue(field.key)"
          v-bind="{ ...field, error: errors[field.key] }"
          @update:model-value="setValue(field.key, $event)"
        />

        <SelectField
          v-else-if="field.type === 'SelectField'"
          :model-value="getChoiceValue(field.key)"
          v-bind="{ ...field, error: errors[field.key] }"
          @update:model-value="setValue(field.key, $event)"
        />

        <NumberField
          v-else-if="field.type === 'NumberField'"
          :model-value="getNumberValue(field.key)"
          v-bind="{ ...field, error: errors[field.key] }"
          @update:model-value="setValue(field.key, $event)"
        />

        <BooleanField
          v-else-if="field.type === 'BooleanField'"
          :model-value="getBooleanValue(field.key)"
          v-bind="{ ...field, error: errors[field.key] }"
          @update:model-value="setValue(field.key, $event)"
        />
      </template>
    </div>

    <template #footer>
      <SubmitBar
        v-bind="args.submitBar"
        :show-skip="args.submitBar?.showSkip"
        @submit="submit"
        @skip="skip"
      />
    </template>
  </ElDialog>
</template>

<style scoped>
.agent-form-description {
  margin: 0 0 14px;
  color: var(--sub, #637083);
  font-size: 13px;
  line-height: 1.7;
}

.agent-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 16px;
}

.agent-form-grid :deep(.agent-field:has(.el-textarea)),
.agent-form-grid :deep(.agent-field:has(.choice-group.is-card)) {
  grid-column: 1 / -1;
}

@media (max-width: 760px) {
  .agent-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
