import type { Tool } from "@ag-ui/core";

const optionSchema = {
  type: "object",
  properties: {
    label: {
      type: "string",
      description: "选项展示文本。",
    },
    value: {
      anyOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }],
      description: "选项提交值。",
    },
    description: {
      type: "string",
      description: "选项补充说明。",
    },
    disabled: {
      type: "boolean",
      default: false,
      description: "是否禁用该选项。",
    },
  },
  required: ["label", "value"],
  additionalProperties: false,
};

const choiceValueSchema = {
  anyOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }],
};

const agentFormFieldSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [
        "TextField",
        "TextareaField",
        "SingleChoiceField",
        "MultiChoiceField",
        "SelectField",
        "NumberField",
        "BooleanField",
      ],
      description: "字段组件类型。",
    },
    key: {
      type: "string",
      description: "字段唯一 key，会作为提交 values 的属性名。",
    },
    label: { type: "string", description: "字段标题。" },
    description: { type: "string", description: "字段说明。" },
    placeholder: { type: "string", description: "占位文本。" },
    error: { type: "string", description: "字段错误提示，一般由前端校验生成。" },
    disabled: { type: "boolean", default: false, description: "是否禁用字段。" },
    required: { type: "boolean", default: false, description: "是否必填。" },
    clearable: { type: "boolean", default: true, description: "是否允许清空。" },
    maxlength: { type: "number", description: "最大输入长度。" },
    rows: { type: "number", description: "Textarea 行数。" },
    showWordLimit: { type: "boolean", default: true, description: "是否展示字数限制。" },
    inputType: {
      type: "string",
      enum: ["text", "email", "url"],
      description: "TextField 输入类型。为避免和字段组件 type 冲突，schema 中使用 inputType。",
    },
    options: {
      type: "array",
      items: optionSchema,
      description: "单选、多选、下拉字段选项。",
    },
    variant: {
      type: "string",
      enum: ["capsule", "card"],
      description: "选择项展示形态。",
    },
    filterable: { type: "boolean", default: false, description: "SelectField 是否支持搜索。" },
    min: { type: "number", description: "NumberField 最小值。" },
    max: { type: "number", description: "NumberField 最大值。" },
    step: { type: "number", default: 1, description: "NumberField 步长。" },
    precision: { type: "number", description: "NumberField 小数精度。" },
    unit: { type: "string", description: "NumberField 单位。" },
    activeText: { type: "string", description: "BooleanField 开启文案。" },
    inactiveText: { type: "string", description: "BooleanField 关闭文案。" },
    mode: {
      type: "string",
      enum: ["switch", "checkbox"],
      description: "BooleanField 展示模式。",
    },
  },
  required: ["type", "key"],
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
    name: "requestAgentFormModal",
    description:
      "弹出通用动态表单弹窗，支持 TextField、TextareaField、SingleChoiceField、MultiChoiceField、SelectField、NumberField、BooleanField 和 SubmitBar；提交后返回结构化 values 给后端 agent。",
    parameters: {
      type: "object",
      properties: {
        formId: {
          type: "string",
          description: "表单语义 ID，用于 agent 区分本次收集的信息类型。",
        },
        title: {
          type: "string",
          default: "补充信息",
          description: "弹窗标题。",
        },
        description: {
          type: "string",
          description: "弹窗内说明文字。",
        },
        fields: {
          type: "array",
          items: agentFormFieldSchema,
          description: "要展示的字段配置。",
        },
        initialValue: {
          type: "object",
          additionalProperties: {
            anyOf: [choiceValueSchema, { type: "array", items: choiceValueSchema }],
          },
          description: "表单初始值，key 与 fields[].key 对应。",
        },
        submitBar: {
          type: "object",
          properties: {
            submitText: { type: "string", default: "提交", description: "提交按钮文本。" },
            skipText: { type: "string", default: "跳过", description: "跳过按钮文本。" },
            defaultHint: { type: "string", description: "提交区默认值提示。" },
            loading: { type: "boolean", default: false, description: "提交按钮 loading 状态。" },
            disabled: { type: "boolean", default: false, description: "是否禁用提交。" },
            showSkip: { type: "boolean", default: false, description: "是否展示跳过按钮。" },
          },
          additionalProperties: false,
          description: "提交区配置。",
        },
      },
      required: ["fields"],
      additionalProperties: false,
    },
  },
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
