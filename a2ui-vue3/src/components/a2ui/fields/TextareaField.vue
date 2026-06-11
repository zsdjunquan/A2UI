<script setup lang="ts">
import { ElInput } from "element-plus";
import FieldFrame from "./FieldFrame.vue";
import type { TextareaFieldProps } from "./types";

const props = withDefaults(defineProps<TextareaFieldProps>(), {
  rows: 4,
  showWordLimit: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <!-- 多行文本字段：用于补充说明、需求背景、备注等长文本输入。 -->
  <FieldFrame v-bind="props">
    <ElInput
      :model-value="modelValue"
      type="textarea"
      resize="vertical"
      :rows="rows"
      :placeholder="placeholder || '还有什么要补充？'"
      :disabled="disabled"
      :maxlength="maxlength"
      :show-word-limit="Boolean(maxlength && showWordLimit)"
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
  </FieldFrame>
</template>
