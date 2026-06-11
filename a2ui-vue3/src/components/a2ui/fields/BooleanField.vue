<script setup lang="ts">
import { ElCheckbox, ElSwitch } from "element-plus";
import FieldFrame from "./FieldFrame.vue";
import type { BooleanFieldProps } from "./types";

const props = withDefaults(defineProps<BooleanFieldProps>(), {
  activeText: "是",
  inactiveText: "否",
  mode: "switch",
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>

<template>
  <!-- 布尔字段：开关或勾选框两种模式，适合“是否需要登录/是否支持移动端”等问题。 -->
  <FieldFrame v-bind="props">
    <ElCheckbox
      v-if="mode === 'checkbox'"
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', Boolean($event))"
    >
      {{ modelValue ? activeText : inactiveText }}
    </ElCheckbox>

    <ElSwitch
      v-else
      :model-value="modelValue"
      :disabled="disabled"
      :active-text="activeText"
      :inactive-text="inactiveText"
      @update:model-value="emit('update:modelValue', Boolean($event))"
    />
  </FieldFrame>
</template>
