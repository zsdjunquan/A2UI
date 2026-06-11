import type { Component } from "vue";

export type ChoiceValue = string | number | boolean;

export type ChoiceOption = {
  label: string;
  value: ChoiceValue;
  description?: string;
  disabled?: boolean;
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
  | ({ type: "TextField"; key: string } & Omit<TextFieldProps, "modelValue">)
  | ({ type: "TextareaField"; key: string } & Omit<TextareaFieldProps, "modelValue">)
  | ({ type: "SingleChoiceField"; key: string } & Omit<SingleChoiceFieldProps, "modelValue">)
  | ({ type: "MultiChoiceField"; key: string } & Omit<MultiChoiceFieldProps, "modelValue">)
  | ({ type: "SelectField"; key: string } & Omit<SelectFieldProps, "modelValue">)
  | ({ type: "NumberField"; key: string } & Omit<NumberFieldProps, "modelValue">)
  | ({ type: "BooleanField"; key: string } & Omit<BooleanFieldProps, "modelValue">);

export type FieldComponentRegistry = Record<AgentFormFieldKind, Component>;
