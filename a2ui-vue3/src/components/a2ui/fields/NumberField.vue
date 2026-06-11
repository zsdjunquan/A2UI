<script setup lang="ts">
import { ElInputNumber } from "element-plus";
import FieldFrame from "./FieldFrame.vue";
import type { NumberFieldProps } from "./types";

const props = withDefaults(defineProps<NumberFieldProps>(), {
  step: 1,
});

const emit = defineEmits<{
  "update:modelValue": [value: number | undefined];
}>();
</script>

<template>
  <!-- 数字字段：预算、数量、时长、页数、阈值等数值型输入。 -->
  <FieldFrame v-bind="props">
    <div class="number-field">
      <ElInputNumber
        :model-value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        :precision="precision"
        :placeholder="placeholder || '请输入数字'"
        :disabled="disabled"
        controls-position="right"
        style="width: 100%"
        @update:model-value="emit('update:modelValue', typeof $event === 'number' ? $event : undefined)"
      />
      <span v-if="unit" class="number-field__unit">{{ unit }}</span>
    </div>
  </FieldFrame>
</template>

<style scoped>
.number-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.number-field__unit {
  color: var(--sub, #637083);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
</style>
