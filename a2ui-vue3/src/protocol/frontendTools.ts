import type { Tool } from "@ag-ui/core";

const optionSchema = {
  type: "object",
  properties: {
    label: {
      type: "string",
      description: "下拉选项展示文本。",
    },
    value: {
      type: "string",
      description: "下拉选项提交值。",
    },
  },
  required: ["label", "value"],
  additionalProperties: false,
};

const basicInfoFieldKeys = [
  "medicalRecordNo",
  "department",
  "name",
  "gender",
  "age",
  "sampleNo",
  "thrombusSymptom",
  "preSampleMedication",
  "bleedingScore",
  "diagnosis",
];

const basicInfoValueSchema = {
  type: "object",
  properties: {
    medicalRecordNo: { type: "string", description: "病历号初始值。" },
    department: { type: "string", description: "科室初始值。" },
    name: { type: "string", description: "姓名初始值。" },
    gender: { type: "string", description: "性别初始值。" },
    age: { type: "string", description: "年龄初始值。" },
    ageUnit: { type: "string", description: "年龄单位初始值。" },
    sampleNo: { type: "string", description: "样本号初始值。" },
    thrombusSymptom: { type: "string", description: "出血或血栓症状初始值。" },
    preSampleMedication: { type: "string", description: "采样前用药初始值。" },
    bleedingScore: { type: "string", description: "出血评分初始值。" },
    diagnosis: { type: "string", description: "诊断初始值。" },
  },
  additionalProperties: false,
};

const indicatorSchema = {
  type: "object",
  properties: {
    key: { type: "string", description: "指标唯一 key。" },
    project: { type: "string", description: "检测项目名称。" },
    unit: { type: "string", description: "检测项目单位。" },
    referenceRange: { type: "string", description: "参考范围文本，可包含换行。" },
    min: { type: "number", description: "参考范围下限。" },
    max: { type: "number", description: "参考范围上限。" },
  },
  required: ["key", "project", "unit", "referenceRange"],
  additionalProperties: false,
};

export const frontendTools: Tool[] = [
  {
    name: "requestBasicInfoModal",
    description:
      "弹出患者基本信息填写弹窗，等待用户填写并提交；提交后把 value 作为 tool result 返回给后端 agent。",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          default: "基本信息",
          description: "弹窗标题。",
        },
        submitText: {
          type: "string",
          default: "提交",
          description: "提交按钮文本。",
        },
        agePlaceholder: {
          type: "string",
          default: "请输入",
          description: "年龄输入框占位文本。",
        },
        fields: {
          type: "array",
          items: {
            type: "string",
            enum: basicInfoFieldKeys,
          },
          description: "可选的字段白名单；不传则展示全部基本信息字段。",
        },
        departmentOptions: {
          type: "array",
          items: optionSchema,
          default: [],
          description: "科室下拉选项。",
        },
        initialValue: {
          ...basicInfoValueSchema,
          description: "弹窗表单初始值。",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "requestInspectionIndicatorsModal",
    description:
      "弹出检测指标填写弹窗，等待用户填写并提交；提交后把 values 作为 tool result 返回给后端 agent。",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          default: "检测指标",
          description: "弹窗标题。",
        },
        submitText: {
          type: "string",
          default: "提交",
          description: "提交按钮文本。",
        },
        tableHeight: {
          type: "number",
          default: 520,
          description: "表格纵向滚动高度。",
        },
        fields: {
          type: "array",
          items: { type: "string" },
          default: [],
          description: "可选的指标白名单，可填写指标 key 或检测项目名称。",
        },
        showAll: {
          type: "boolean",
          default: false,
          description: "是否展示全部指标。用户要求修改全部指标或修改指标但未指定具体指标时应为 true。",
        },
        indicators: {
          type: "array",
          items: indicatorSchema,
          description: "可选的指标配置；不传则展示默认指标。",
        },
        initialResults: {
          type: "object",
          additionalProperties: { type: "string" },
          description: "检测结果初始值，key 为指标 key。",
        },
      },
      additionalProperties: false,
    },
  },
];
