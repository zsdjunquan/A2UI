<script setup lang="ts">
import type { FieldBaseProps } from "./types";

defineProps<FieldBaseProps>();
</script>

<template>
  <!-- 字段外壳统一处理 label、description、required 星号和错误提示，具体输入控件通过 slot 注入。 -->
  <label class="agent-field" :class="{ 'has-error': error, 'is-disabled': disabled }">
    <span v-if="label" class="agent-field__label">
      {{ label }}
      <b v-if="required">*</b>
    </span>
    <span v-if="description" class="agent-field__description">{{ description }}</span>
    <span class="agent-field__control">
      <slot />
    </span>
    <span v-if="error" class="agent-field__error">{{ error }}</span>
  </label>
</template>

<style scoped>
.agent-field {
  min-width: 0;
  display: grid;
  gap: 7px;
  color: var(--ink, #172334);
  font-size: 13px;
  font-weight: 700;
}

.agent-field__label {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  line-height: 1.35;
}

.agent-field__label b {
  color: var(--danger, #d64545);
}

.agent-field__description {
  margin-top: -2px;
  color: var(--muted, #93a3b5);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.45;
}

.agent-field__control {
  min-width: 0;
}

.agent-field__error {
  color: var(--danger, #d64545);
  font-size: 12px;
  font-weight: 400;
}

.agent-field.is-disabled {
  opacity: 0.66;
}

.agent-field :deep(.el-input__wrapper),
.agent-field :deep(.el-textarea__inner),
.agent-field :deep(.el-select__wrapper),
.agent-field :deep(.el-input-number .el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #d9e1ec inset;
}

.agent-field :deep(.el-input__wrapper.is-focus),
.agent-field :deep(.el-textarea__inner:focus),
.agent-field :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #2f7de1 inset, 0 0 0 3px rgba(47, 125, 225, 0.12);
}

.agent-field.has-error :deep(.el-input__wrapper),
.agent-field.has-error :deep(.el-textarea__inner),
.agent-field.has-error :deep(.el-select__wrapper) {
  box-shadow: 0 0 0 1px var(--danger, #d64545) inset;
}
</style>
