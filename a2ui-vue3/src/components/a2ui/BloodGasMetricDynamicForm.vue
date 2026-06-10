<script setup lang="ts">
import { computed, reactive, ref } from "vue";

const props = defineProps<{
  props: Record<string, unknown>;
}>();

const emit = defineEmits<{
  submit: [detail: unknown];
}>();

const metricLabels: Record<string, string> = {
  pH: "pH",
  paCO2: "PaCO2",
  hco3: "HCO3-",
  be: "BE",
  paO2: "PaO2",
  saO2: "SaO2",
  fiO2: "FiO2",
  lac: "Lactate",
};

const metricUnits: Record<string, string> = {
  paCO2: "mmHg",
  hco3: "mmol/L",
  be: "mmol/L",
  paO2: "mmHg",
  saO2: "%",
  fiO2: "%",
  lac: "mmol/L",
};

const missingMetrics = computed(() => {
  const value = props.props.missingMetrics;
  return Array.isArray(value) ? value.map(String) : [];
});
const values = reactive<Record<string, string>>({});
const errors = ref<Record<string, string>>({});

function text(key: string, fallback: string) {
  const value = props.props[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function handleSubmit() {
  const next: Record<string, string> = {};
  missingMetrics.value.forEach((key) => {
    if (!values[key]?.trim()) next[key] = "请输入指标结果";
  });

  errors.value = next;
  if (Object.keys(next).length) return;

  const detailValues = missingMetrics.value.map((key) => ({
    key,
    name: metricLabels[key] || key,
    value: values[key].trim(),
    unit: metricUnits[key] || "",
  }));

  emit("submit", {
    type: "bloodGasMetrics",
    values: detailValues,
  });
}
</script>

<template>
  <section class="medical-form">
    <h3>{{ text("title", "血气分析指标") }}</h3>
    <p v-if="text('subtitle', '')" class="form-subtitle">{{ text("subtitle", "") }}</p>

    <div class="form-grid">
      <label v-for="key in missingMetrics" :key="key">
        <span>{{ metricLabels[key] || key }} <b>*</b></span>
        <input v-model="values[key]" :placeholder="`请输入${metricLabels[key] || key}`" />
        <small v-if="metricUnits[key]">{{ metricUnits[key] }}</small>
        <em v-if="errors[key]">{{ errors[key] }}</em>
      </label>
    </div>

    <div class="form-actions">
      <button type="button" @click="handleSubmit">{{ text("submitText", "提交") }}</button>
    </div>
  </section>
</template>
