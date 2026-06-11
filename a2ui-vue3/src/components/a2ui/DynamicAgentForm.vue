<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
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
import type {
  AgentFormFieldConfig,
  AgentFormSchema,
  AgentFormSubmitResult,
  AgentFormValueMap,
  ChoiceValue,
} from "./fields";

const props = defineProps<{
  schema: AgentFormSchema;
}>();

const emit = defineEmits<{
  submit: [result: AgentFormSubmitResult];
  skip: [result: AgentFormSubmitResult];
}>();

const errors = ref<Record<string, string>>({});
const values = reactive<AgentFormValueMap>({});

// columns 由后端 schema 控制，但限制在 1-4 列，避免异常 JSON 破坏布局。
const fields = computed(() => props.schema.fields || []);
const columns = computed(() => {
  const value = Number(props.schema.layout?.columns || 1);
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(Math.floor(value), 1), 4);
});

watch(
  () => props.schema,
  () => {
    resetValues();
  },
  { immediate: true, deep: true },
);

// schema 变化通常意味着 agent 返回了新表单；重置值和错误，避免旧表单状态串到新表单。
function resetValues() {
  Object.keys(values).forEach((key) => {
    delete values[key];
  });

  fields.value.forEach((field) => {
    values[field.key] = getInitialValue(field);
  });

  errors.value = {};
}

function getInitialValue(field: AgentFormFieldConfig) {
  // 初始值优先级：后端回填 initialValues > 字段 defaultValue > 按字段类型生成空值。
  const initial = props.schema.initialValues?.[field.key];
  if (initial !== undefined) return initial;
  if (field.defaultValue !== undefined) return field.defaultValue;

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

// 当前只做必填校验；messages 里已预留 invalid/min/max/maxlength，后续可继续扩展规则。
function isEmptyValue(value: ChoiceValue | ChoiceValue[] | undefined) {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "boolean") return false;
  return value === undefined || value === null || String(value).trim() === "";
}

function validate() {
  const next: Record<string, string> = {};

  fields.value.forEach((field) => {
    if (field.required && isEmptyValue(values[field.key])) {
      next[field.key] = field.messages?.required || "请补充该项";
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

function createResult(skipped = false): AgentFormSubmitResult {
  // 提交结果保持稳定结构，后端可通过 formId + values 继续需求拆解。
  return {
    ok: true,
    type: "agentForm",
    formId: props.schema.formId,
    schemaVersion: props.schema.schemaVersion,
    values: cleanValues(),
    submittedFields: fields.value.map((field) => field.key),
    ...(skipped ? { skipped: true } : {}),
  };
}

function handleSubmit() {
  if (!validate()) return;
  emit("submit", createResult());
}

function handleSkip() {
  emit("skip", createResult(true));
}
</script>

<template>
  <!-- 后端/agent 完全控制 title、description、layout、fields、submit 文案；组件只解释 schema。 -->
  <section class="dynamic-agent-form" :style="{ '--dynamic-agent-form-columns': columns }">
    <header v-if="schema.title || schema.description" class="dynamic-agent-form__header">
      <h3 v-if="schema.title">{{ schema.title }}</h3>
      <p v-if="schema.description">{{ schema.description }}</p>
    </header>

    <div class="dynamic-agent-form__grid">
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

    <SubmitBar
      v-bind="schema.submit"
      :show-skip="schema.submit?.showSkip"
      @submit="handleSubmit"
      @skip="handleSkip"
    />
  </section>
</template>

<style scoped>
.dynamic-agent-form {
  width: 100%;
  min-width: 0;
}

.dynamic-agent-form__header {
  margin-bottom: 14px;
}

.dynamic-agent-form__header h3 {
  margin: 0;
  color: #172334;
  font-size: 15px;
  line-height: 1.35;
}

.dynamic-agent-form__header p {
  margin: 8px 0 0;
  color: var(--sub, #637083);
  font-size: 13px;
  line-height: 1.7;
}

.dynamic-agent-form__grid {
  display: grid;
  grid-template-columns: repeat(var(--dynamic-agent-form-columns), minmax(0, 1fr));
  gap: 14px 16px;
}

.dynamic-agent-form__grid :deep(.agent-field:has(.el-textarea)),
.dynamic-agent-form__grid :deep(.agent-field:has(.choice-group.is-card)) {
  grid-column: 1 / -1;
}

@media (max-width: 760px) {
  .dynamic-agent-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>
