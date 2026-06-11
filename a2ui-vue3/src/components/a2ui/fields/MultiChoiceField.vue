<script setup lang="ts">
import { computed } from "vue";
import type { ChoiceOption, ChoiceValue, MultiChoiceFieldProps } from "./types";
import FieldFrame from "./FieldFrame.vue";

const props = withDefaults(defineProps<MultiChoiceFieldProps>(), {
  variant: "capsule",
});

const emit = defineEmits<{
  "update:modelValue": [value: ChoiceValue[]];
}>();

const selectedValues = computed(() => props.modelValue || []);

function isSelected(option: ChoiceOption) {
  return selectedValues.value.includes(option.value);
}

function toggle(option: ChoiceOption) {
  if (props.disabled || option.disabled) return;

  const next = isSelected(option)
    ? selectedValues.value.filter((value) => value !== option.value)
    : [...selectedValues.value, option.value];

  emit("update:modelValue", next);
}
</script>

<template>
  <!-- 多选字段：返回数组，适合目标平台、功能模块、页面范围等可组合选项。 -->
  <FieldFrame v-bind="props">
    <div class="choice-group" :class="`is-${variant}`">
      <button
        v-for="option in options"
        :key="String(option.value)"
        class="choice-option"
        :class="{ 'is-selected': isSelected(option) }"
        type="button"
        :disabled="disabled || option.disabled"
        @click="toggle(option)"
      >
        <span>{{ option.label }}</span>
        <small v-if="option.description">{{ option.description }}</small>
      </button>
    </div>
  </FieldFrame>
</template>

<style scoped>
.choice-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.choice-group.is-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
}

.choice-option {
  min-width: 0;
  height: auto;
  min-height: 34px;
  padding: 7px 12px;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  border: 1px solid #d9e6ed;
  border-radius: 999px;
  background: #fff;
  color: #344657;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  box-shadow: none;
}

.is-card .choice-option {
  min-height: 68px;
  border-radius: 8px;
}

.choice-option small {
  margin-top: 3px;
  color: var(--muted, #93a3b5);
  font-size: 12px;
  font-weight: 400;
}

.choice-option:hover:not(:disabled),
.choice-option.is-selected {
  border-color: var(--primary, #087f8c);
  background: var(--primary-soft, #e6f7f7);
  color: var(--primary-strong, #075e68);
}
</style>
