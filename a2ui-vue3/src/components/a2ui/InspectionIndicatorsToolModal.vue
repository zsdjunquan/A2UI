<script setup lang="ts">
import { computed, h, reactive, ref } from "vue";
import { Button as AButton, Input as AInput, message, Modal as AModal, Table as ATable } from "ant-design-vue";
import type { TableColumnsType } from "ant-design-vue";
import type { Indicator, InspectionIndicatorsToolArgs } from "./frontendToolTypes";
import { defaultIndicators, getAbnormalStatus } from "./frontendToolTypes";

type IndicatorRow = Indicator & {
  result: string;
  abnormal: string;
};

const props = defineProps<{
  args: InspectionIndicatorsToolArgs;
}>();

const emit = defineEmits<{
  submit: [result: unknown];
  cancel: [];
}>();

const open = ref(true);
const resultMap = reactive<Record<string, string>>({
  ...(props.args.initialResults || {}),
});

const indicatorSource = computed(() =>
  (props.args.indicators?.length ? props.args.indicators : defaultIndicators).map((indicator) => ({
    ...indicator,
    key: indicator.key || indicator.project,
  })),
);

const displayRows = computed(() => {
  const normalizedFields = (props.args.fields || []).map((field) => String(field).toLowerCase());
  if (!normalizedFields.length) return indicatorSource.value;

  return indicatorSource.value.filter((row) => {
    const key = String(row.key).toLowerCase();
    const project = String(row.project).toLowerCase();
    return normalizedFields.includes(key) || normalizedFields.includes(project);
  });
});

const tableRows = computed<IndicatorRow[]>(() =>
  displayRows.value.map((row) => ({
    ...row,
    result: resultMap[row.key] || "",
    abnormal: getAbnormalStatus(row, resultMap[row.key]),
  })),
);

const columns: TableColumnsType<IndicatorRow> = [
  { title: "检测项目", dataIndex: "project", width: 130 },
  {
    title: "检测结果",
    dataIndex: "result",
    width: 150,
    customRender: ({ record }) =>
      h(AInput, {
        value: resultMap[record.key] || "",
        allowClear: true,
        placeholder: "请输入",
        "onUpdate:value": (value: string) => {
          resultMap[record.key] = value;
        },
      }),
  },
  {
    title: "异常情况",
    dataIndex: "abnormal",
    width: 120,
  },
  { title: "单位", dataIndex: "unit", width: 120 },
  {
    title: "参考范围",
    dataIndex: "referenceRange",
    width: 160,
    customRender: ({ text }) =>
      h("span", { style: { whiteSpace: "pre-line" } }, String(text || "")),
  },
];

function submit() {
  const hasAnyResult = displayRows.value.some((row) => {
    const value = resultMap[row.key];
    return value !== undefined && value !== null && String(value).trim() !== "";
  });

  if (!hasAnyResult) {
    message.warning("请填写检测指标，至少有一项");
    return;
  }

  emit("submit", {
    ok: true,
    type: "inspectionIndicators",
    values: displayRows.value.map((row) => ({
      project: row.project,
      result: resultMap[row.key] ?? "",
      abnormal: getAbnormalStatus(row, resultMap[row.key]),
      unit: row.unit,
      referenceRange: row.referenceRange,
    })),
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
    :title="args.title || '检测指标'"
    :width="920"
    :mask-closable="false"
    @cancel="cancel"
  >
    <ATable
      :columns="columns"
      :data-source="tableRows"
      :pagination="false"
      row-key="key"
      :scroll="{ y: args.tableHeight || 520 }"
      size="middle"
    />

    <template #footer>
      <AButton @click="cancel">取消</AButton>
      <AButton type="primary" @click="submit">{{ args.submitText || "提交" }}</AButton>
    </template>
  </AModal>
</template>
