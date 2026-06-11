import type { Component } from "vue";

export type ChoiceValue = string | number | boolean;

// 后端动态表单 schema 中所有选择类字段共用这个选项结构。
export type ChoiceOption = {
  label: string;
  value: ChoiceValue;
  description?: string;
  disabled?: boolean;
};

// 字段级提示文案。当前实现了 required，其他字段为后续校验能力预留。
export type FieldMessages = {
  required?: string;
  invalid?: string;
  min?: string;
  max?: string;
  maxlength?: string;
};

// 所有字段共享的展示属性：标题、说明、占位符、禁用和必填状态都由后端 schema 控制。
export type FieldBaseProps = {
  label?: string;
  description?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
};

export type TextFieldProps = FieldBaseProps & {
  modelValue: string;
  clearable?: boolean;
  maxlength?: number;
  inputType?: "text" | "email" | "url";
};

export type TextareaFieldProps = FieldBaseProps & {
  modelValue: string;
  rows?: number;
  maxlength?: number;
  showWordLimit?: boolean;
};

export type SingleChoiceFieldProps = FieldBaseProps & {
  modelValue?: ChoiceValue;
  options: ChoiceOption[];
  variant?: "capsule" | "card";
};

export type MultiChoiceFieldProps = FieldBaseProps & {
  modelValue: ChoiceValue[];
  options: ChoiceOption[];
  variant?: "capsule" | "card";
};

export type SelectFieldProps = FieldBaseProps & {
  modelValue?: ChoiceValue;
  options: ChoiceOption[];
  clearable?: boolean;
  filterable?: boolean;
};

export type NumberFieldProps = FieldBaseProps & {
  modelValue?: number;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  unit?: string;
};

export type BooleanFieldProps = FieldBaseProps & {
  modelValue: boolean;
  activeText?: string;
  inactiveText?: string;
  mode?: "switch" | "checkbox";
};

export type SubmitBarProps = {
  submitText?: string;
  skipText?: string;
  defaultHint?: string;
  loadingText?: string;
  loading?: boolean;
  disabled?: boolean;
  showSkip?: boolean;
};

// 动态表单支持的字段类型枚举；type 名称必须和组件注册名保持一致。
export type AgentFormFieldKind =
  | "TextField"
  | "TextareaField"
  | "SingleChoiceField"
  | "MultiChoiceField"
  | "SelectField"
  | "NumberField"
  | "BooleanField";

export type AgentFormFieldConfig =
  | ({ type: "TextField"; key: string; defaultValue?: string; messages?: FieldMessages } & Omit<TextFieldProps, "modelValue" | "error">)
  | ({ type: "TextareaField"; key: string; defaultValue?: string; messages?: FieldMessages } & Omit<TextareaFieldProps, "modelValue" | "error">)
  | ({ type: "SingleChoiceField"; key: string; defaultValue?: ChoiceValue; messages?: FieldMessages } & Omit<SingleChoiceFieldProps, "modelValue" | "error">)
  | ({ type: "MultiChoiceField"; key: string; defaultValue?: ChoiceValue[]; messages?: FieldMessages } & Omit<MultiChoiceFieldProps, "modelValue" | "error">)
  | ({ type: "SelectField"; key: string; defaultValue?: ChoiceValue; messages?: FieldMessages } & Omit<SelectFieldProps, "modelValue" | "error">)
  | ({ type: "NumberField"; key: string; defaultValue?: number; messages?: FieldMessages } & Omit<NumberFieldProps, "modelValue" | "error">)
  | ({ type: "BooleanField"; key: string; defaultValue?: boolean; messages?: FieldMessages } & Omit<BooleanFieldProps, "modelValue" | "error">);

export type AgentFormValueMap = Record<string, ChoiceValue | ChoiceValue[] | undefined>;

// 后端/agent 返回的完整动态表单协议。DynamicAgentForm 只解释这个 schema，不内置业务字段。
export type AgentFormSchema = {
  schemaVersion: "1.0" | string;
  formId: string;
  title?: string;
  description?: string;
  layout?: {
    columns?: 1 | 2 | 3 | 4 | number;
  };
  fields: AgentFormFieldConfig[];
  initialValues?: AgentFormValueMap;
  submit?: SubmitBarProps;
};

// 用户提交动态表单后前端返回给 agent 的稳定结果结构。
export type AgentFormSubmitResult = {
  ok: true;
  type: "agentForm";
  formId: string;
  schemaVersion: string;
  values: AgentFormValueMap;
  submittedFields: string[];
  skipped?: boolean;
};

export type FieldComponentRegistry = Record<AgentFormFieldKind, Component>;
