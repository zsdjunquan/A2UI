<script setup lang="ts">
import { ElInput } from "element-plus";
import FieldFrame from "./FieldFrame.vue";
import type { TextFieldProps } from "./types";

const props = withDefaults(defineProps<TextFieldProps>(), {
  clearable: true,
  inputType: "text",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <!-- 单行文本字段：姓名、标题、关键词、URL、邮箱等都走这个组件。 -->
  <FieldFrame v-bind="props">
    <ElInput
      :model-value="modelValue"
      :type="inputType"
      :placeholder="placeholder || '请输入'"
      :disabled="disabled"
      :clearable="clearable"
      :maxlength="maxlength"
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
  </FieldFrame>
</template>
