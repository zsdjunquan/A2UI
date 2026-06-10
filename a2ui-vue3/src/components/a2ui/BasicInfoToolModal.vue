<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { Button as AButton, Col as ACol, Form as AForm, Input as AInput, Modal as AModal, Row as ARow, Select as ASelect } from "ant-design-vue";
import type { BasicInfoFieldKey, BasicInfoToolArgs, BasicInfoValue } from "./frontendToolTypes";
import {
  ageUnitOptions,
  defaultBasicInfoValue,
  defaultDepartmentOptions,
  fieldKeys,
} from "./frontendToolTypes";

const props = defineProps<{
  args: BasicInfoToolArgs;
}>();

const emit = defineEmits<{
  submit: [result: unknown];
  cancel: [];
}>();

const open = ref(true);
const errors = ref<Partial<Record<BasicInfoFieldKey, string>>>({});
const form = reactive<BasicInfoValue>({
  ...defaultBasicInfoValue,
  ...props.args.initialValue,
});
const initialForm = {
  ...defaultBasicInfoValue,
  ...props.args.initialValue,
};

const requiredMessages: Partial<Record<BasicInfoFieldKey, string>> = {
  medicalRecordNo: "请输入病历号",
  name: "请输入姓名",
  department: "请选择科室",
  gender: "请选择性别",
};

const departmentOptions = computed(() =>
  props.args.departmentOptions?.length ? props.args.departmentOptions : defaultDepartmentOptions,
);

const visibleFields = computed(() => {
  if (props.args.fields?.length) {
    return props.args.fields.filter((key): key is BasicInfoFieldKey => fieldKeys.includes(key));
  }

  if (props.args.initialValue && Object.keys(props.args.initialValue).length) {
    return fieldKeys.filter((key) => {
      if (key === "age") {
        return !initialForm.age || !String(initialForm.age).trim();
      }

      const value = initialForm[key];
      return value === undefined || value === null || !String(value).trim();
    });
  }

  return fieldKeys;
});

const fieldConfigs = computed(() => [
  { key: "medicalRecordNo", label: "病历号", type: "input", placeholder: "请输入" },
  { key: "department", label: "科室", type: "select", placeholder: "请选择", options: departmentOptions.value },
  { key: "name", label: "姓名", type: "input", placeholder: "请输入" },
  {
    key: "gender",
    label: "性别",
    type: "select",
    placeholder: "请选择",
    options: [
      { label: "男", value: "男" },
      { label: "女", value: "女" },
    ],
  },
  { key: "age", label: "年龄", type: "age" },
  { key: "sampleNo", label: "样本号", type: "input", placeholder: "请输入" },
  {
    key: "thrombusSymptom",
    label: "是否有出血或血栓症状",
    type: "select",
    placeholder: "请选择",
    options: [
      { label: "出血", value: "出血" },
      { label: "血栓", value: "血栓" },
      { label: "出血和血栓", value: "出血和血栓" },
      { label: "无出血且无血栓", value: "无出血且无血栓" },
    ],
  },
  {
    key: "preSampleMedication",
    label: "血栓采样前48h内是否服用抗凝药？",
    type: "select",
    placeholder: "请选择",
    options: [
      { label: "有", value: "有" },
      { label: "无", value: "无" },
      { label: "未知", value: "未知" },
    ],
  },
  {
    key: "bleedingScore",
    label: "出血评分结果",
    type: "select",
    placeholder: "请选择",
    options: [
      { label: "高危", value: "高危" },
      { label: "中危", value: "中危" },
      { label: "低危", value: "低危" },
      { label: "未进行评分", value: "未进行评分" },
    ],
  },
  { key: "diagnosis", label: "诊断", type: "input", placeholder: "请输入" },
] as Array<{
  key: BasicInfoFieldKey;
  label: string;
  type: "input" | "select" | "age";
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
}>);

function validate() {
  const next: Partial<Record<BasicInfoFieldKey, string>> = {};

  visibleFields.value.forEach((key) => {
    const requiredMessage = requiredMessages[key];
    const value = form[key];

    if (requiredMessage && (!value || !String(value).trim())) {
      next[key] = requiredMessage;
    }
  });

  errors.value = next;
  return Object.keys(next).length === 0;
}

function submit() {
  if (!validate()) return;

  emit("submit", {
    ok: true,
    type: "basicInfo",
    value: {
      ...defaultBasicInfoValue,
      ...props.args.initialValue,
      ...form,
    },
  });
  open.value = false;
}

function cancel() {
  open.value = false;
  emit("cancel");
}
</script>

<template>
  <AModal
    v-model:open="open"
    :title="args.title || '基本信息'"
    :width="920"
    :mask-closable="false"
    @cancel="cancel"
  >
    <AForm layout="vertical">
      <div v-if="!visibleFields.length" class="modal-empty-state">
        当前患者基本信息已完整，无需重复填写。如需修改，请明确指定要修改的字段。
      </div>

      <ARow v-else :gutter="[24, 18]">
        <ACol
          v-for="field in fieldConfigs.filter((item) => visibleFields.includes(item.key))"
          :key="field.key"
          :xs="24"
          :md="12"
          :xl="8"
        >
          <AForm.Item
            :label="field.label"
            :validate-status="errors[field.key] ? 'error' : undefined"
            :help="errors[field.key]"
          >
            <AInput
              v-if="field.type === 'input'"
              v-model:value="form[field.key]"
              allow-clear
              :placeholder="field.placeholder || '请输入'"
            />

            <ASelect
              v-else-if="field.type === 'select'"
              v-model:value="form[field.key]"
              allow-clear
              :options="field.options"
              :placeholder="field.placeholder || '请选择'"
            />

            <AInput.Group v-else compact>
              <AInput
                v-model:value="form.age"
                allow-clear
                style="width: calc(100% - 84px)"
                :placeholder="args.agePlaceholder || '请输入'"
              />
              <ASelect v-model:value="form.ageUnit" style="width: 84px" :options="ageUnitOptions" />
            </AInput.Group>
          </AForm.Item>
        </ACol>
      </ARow>
    </AForm>

    <template #footer>
      <AButton @click="cancel">取消</AButton>
      <AButton type="primary" :disabled="!visibleFields.length" @click="submit">{{ args.submitText || "提交" }}</AButton>
    </template>
  </AModal>
</template>
