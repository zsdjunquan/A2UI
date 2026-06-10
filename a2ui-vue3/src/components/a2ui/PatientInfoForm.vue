<script setup lang="ts">
import { reactive, ref } from "vue";

const props = defineProps<{
  props: Record<string, unknown>;
}>();

const emit = defineEmits<{
  submit: [detail: unknown];
}>();

const initial = (props.props.initialPatient || {}) as Record<string, string>;
const form = reactive({
  patientName: initial.patientName || "",
  gender: initial.gender || "",
  age: initial.age || "",
  ageUnit: initial.ageUnit || "岁",
  department: initial.department || "",
});
const errors = ref<Record<string, string>>({});

function label(key: string, fallback: string) {
  const value = props.props[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function validate() {
  const next: Record<string, string> = {};
  if (!form.patientName.trim()) next.patientName = "请输入患者姓名";
  if (!form.gender) next.gender = "请选择性别";
  if (!form.age.trim()) next.age = "请输入年龄";
  if (!form.ageUnit) next.ageUnit = "请选择年龄单位";
  if (!form.department.trim()) next.department = "请输入科室";
  errors.value = next;
  return Object.keys(next).length === 0;
}

function handleSubmit() {
  if (!validate()) return;

  emit("submit", {
    type: "patientInfo",
    value: {
      patientName: form.patientName.trim(),
      gender: form.gender,
      age: form.age.trim(),
      ageUnit: form.ageUnit,
      department: form.department.trim(),
    },
  });
}
</script>

<template>
  <section class="medical-form">
    <h3>{{ label("title", "基础信息") }}</h3>

    <div class="form-grid five">
      <label>
        <span>患者姓名 <b>*</b></span>
        <input v-model="form.patientName" :placeholder="label('namePlaceholder', '请输入患者姓名')" />
        <em v-if="errors.patientName">{{ errors.patientName }}</em>
      </label>

      <label>
        <span>性别 <b>*</b></span>
        <select v-model="form.gender">
          <option value="">{{ label("genderPlaceholder", "请选择性别") }}</option>
          <option value="男">男</option>
          <option value="女">女</option>
        </select>
        <em v-if="errors.gender">{{ errors.gender }}</em>
      </label>

      <label>
        <span>年龄 <b>*</b></span>
        <input v-model="form.age" :placeholder="label('agePlaceholder', '请输入年龄')" />
        <em v-if="errors.age">{{ errors.age }}</em>
      </label>

      <label>
        <span>年龄单位 <b>*</b></span>
        <select v-model="form.ageUnit">
          <option value="岁">岁</option>
          <option value="月">月</option>
          <option value="周">周</option>
          <option value="日">日</option>
        </select>
        <em v-if="errors.ageUnit">{{ errors.ageUnit }}</em>
      </label>

      <label>
        <span>科室 <b>*</b></span>
        <input v-model="form.department" :placeholder="label('departmentPlaceholder', '请输入科室')" />
        <em v-if="errors.department">{{ errors.department }}</em>
      </label>
    </div>

    <div class="form-actions">
      <button type="button" @click="handleSubmit">{{ label("submitText", "提交") }}</button>
    </div>
  </section>
</template>
