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

// 后端可传自定义指标；没有传时使用默认凝血相关指标，并用默认配置补齐单位/参考范围。
const indicatorSource = computed(() =>
  (props.args.indicators?.length ? props.args.indicators : defaultIndicators).map((indicator) => {
    const key = indicator.key || indicator.project;
    const defaults = defaultIndicators.find(
      (item) =>
        item.key.toLowerCase() === String(key).toLowerCase() ||
        item.project.toLowerCase() === String(indicator.project).toLowerCase(),
    );

    return {
      ...defaults,
      ...indicator,
      key,
    };
  }),
);

function normalizeResultKey(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, "");
}

// 同一个指标可能用 key 或项目名访问，缓存时两种索引都记住，避免回填丢失。
function rememberResult(target: Record<string, string>, rawKey: unknown, rawValue: unknown) {
  const value = rawValue === undefined || rawValue === null ? "" : String(rawValue).trim();
  if (!value) return;

  const key = String(rawKey ?? "").trim();
  const normalizedKey = normalizeResultKey(key);
  if (!normalizedKey) return;

  target[key] = value;
  target[normalizedKey] = value;
}

function readIndicatorValue(indicator: Indicator) {
  const row = indicator as Indicator & Record<string, unknown>;
  return row.result ?? row.value ?? row.displayValue;
}

const initialResultMap: Record<string, string> = {};
Object.entries(props.args.initialResults || {}).forEach(([key, value]) => {
  rememberResult(initialResultMap, key, value);
});

indicatorSource.value.forEach((row) => {
  rememberResult(initialResultMap, row.key, readIndicatorValue(row));
  rememberResult(initialResultMap, row.project, readIndicatorValue(row));

  const storedValue =
    initialResultMap[row.key] ??
    initialResultMap[row.project] ??
    initialResultMap[normalizeResultKey(row.key)] ??
    initialResultMap[normalizeResultKey(row.project)];

  rememberResult(initialResultMap, row.key, storedValue);
  rememberResult(initialResultMap, row.project, storedValue);
});

const resultMap = reactive<Record<string, string>>({
  ...initialResultMap,
});

function getResult(row: Indicator) {
  return (
    resultMap[row.key] ??
    resultMap[row.project] ??
    resultMap[normalizeResultKey(row.key)] ??
    resultMap[normalizeResultKey(row.project)] ??
    ""
  );
}

function getInitialResult(row: Indicator) {
  return (
    initialResultMap[row.key] ??
    initialResultMap[row.project] ??
    initialResultMap[normalizeResultKey(row.key)] ??
    initialResultMap[normalizeResultKey(row.project)] ??
    ""
  );
}

function setResult(row: Indicator, value: string) {
  const text = String(value ?? "");
  resultMap[row.key] = text;
  resultMap[row.project] = text;
  resultMap[normalizeResultKey(row.key)] = text;
  resultMap[normalizeResultKey(row.project)] = text;
}

const displayRows = computed(() => {
  const normalizedFields = (props.args.fields || []).map((field) => normalizeResultKey(field));
  const hasExplicitFields = normalizedFields.length > 0;
  const shouldShowAll = props.args.showAll === true;

  const requestedRows = hasExplicitFields
    ? indicatorSource.value.filter((row) => {
        const key = normalizeResultKey(row.key);
        const project = normalizeResultKey(row.project);
        return normalizedFields.includes(key) || normalizedFields.includes(project);
      })
    : indicatorSource.value;

  if (hasExplicitFields) return requestedRows;
  if (shouldShowAll) return requestedRows;

  // 默认只展示还没有结果的指标；修改全部时 showAll=true 会绕过这条过滤。
  return requestedRows.filter((row) => {
    const value = getInitialResult(row);
    return value === undefined || value === null || String(value).trim() === "";
  });
});

const tableRows = computed<IndicatorRow[]>(() =>
  displayRows.value.map((row) => ({
    ...row,
    result: getResult(row),
    abnormal: getAbnormalStatus(row, getResult(row)),
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
        value: getResult(record),
        allowClear: true,
        placeholder: "请输入",
        "onUpdate:value": (value: string) => {
          setResult(record, value);
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
    const value = getResult(row);
    return value !== undefined && value !== null && String(value).trim() !== "";
  });

  if (!hasAnyResult) {
    message.warning(displayRows.value.length ? "请填写检测指标，至少有一项" : "当前没有需要补充的检测指标");
    return;
  }

  emit("submit", {
    ok: true,
    type: "inspectionIndicators",
    // values 是本次弹窗展示/编辑的结果，allValues 是当前已知的完整指标集合。
    values: displayRows.value.map((row) => ({
      project: row.project,
      result: getResult(row),
      abnormal: getAbnormalStatus(row, getResult(row)),
      unit: row.unit,
      referenceRange: row.referenceRange,
    })),
    allValues: indicatorSource.value
      .filter((row) => {
        const value = getResult(row);
        return value !== undefined && value !== null && String(value).trim() !== "";
      })
      .map((row) => ({
        project: row.project,
        result: getResult(row),
        abnormal: getAbnormalStatus(row, getResult(row)),
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
    <div v-if="!tableRows.length" class="modal-empty-state">
      当前已识别的检测指标无需重复填写。如需修改，请明确指定要修改的指标。
    </div>

    <ATable
      v-else
      :columns="columns"
      :data-source="tableRows"
      :pagination="false"
      row-key="key"
      :scroll="{ y: args.tableHeight || 520 }"
      size="middle"
    />

    <template #footer>
      <AButton @click="cancel">取消</AButton>
      <AButton type="primary" :disabled="!tableRows.length" @click="submit">{{ args.submitText || "提交" }}</AButton>
    </template>
  </AModal>
</template>
