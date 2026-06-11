<script setup lang="ts">
import { ElOption, ElSelect } from "element-plus";
import FieldFrame from "./FieldFrame.vue";
import type { ChoiceValue, SelectFieldProps } from "./types";

const props = withDefaults(defineProps<SelectFieldProps>(), {
  clearable: true,
  filterable: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: ChoiceValue | undefined];
}>();
</script>

<template>
  <FieldFrame v-bind="props">
    <ElSelect
      :model-value="modelValue"
      :placeholder="placeholder || '请选择'"
      :disabled="disabled"
      :clearable="clearable"
      :filterable="filterable"
      style="width: 100%"
      @update:model-value="emit('update:modelValue', $event as ChoiceValue | undefined)"
    >
      <ElOption
        v-for="option in options"
        :key="String(option.value)"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      >
        <div class="select-option">
          <span>{{ option.label }}</span>
          <small v-if="option.description">{{ option.description }}</small>
        </div>
      </ElOption>
    </ElSelect>
  </FieldFrame>
</template>

<style scoped>
.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.select-option small {
  color: var(--muted, #93a3b5);
  font-size: 12px;
}
</style>
