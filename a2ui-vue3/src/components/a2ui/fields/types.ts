import type { Component } from "vue";

export type ChoiceValue = string | number | boolean;

export type ChoiceOption = {
  label: string;
  value: ChoiceValue;
  description?: string;
  disabled?: boolean;
};

export type FieldMessages = {
  required?: string;
  invalid?: string;
  min?: string;
  max?: string;
  maxlength?: string;
};

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
