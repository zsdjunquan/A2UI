import BooleanField from "./BooleanField.vue";
import MultiChoiceField from "./MultiChoiceField.vue";
import NumberField from "./NumberField.vue";
import SelectField from "./SelectField.vue";
import SingleChoiceField from "./SingleChoiceField.vue";
import SubmitBar from "./SubmitBar.vue";
import TextareaField from "./TextareaField.vue";
import TextField from "./TextField.vue";
import type { FieldComponentRegistry } from "./types";

// 字段库统一出口：动态表单、工具弹窗或其它 A2UI 组件都从这里拿字段组件和协议类型。
export { BooleanField, MultiChoiceField, NumberField, SelectField, SingleChoiceField, SubmitBar, TextareaField, TextField };

export type {
  AgentFormSchema,
  AgentFormFieldConfig,
  AgentFormFieldKind,
  AgentFormSubmitResult,
  AgentFormValueMap,
  BooleanFieldProps,
  ChoiceOption,
  ChoiceValue,
  FieldMessages,
  FieldBaseProps,
  FieldComponentRegistry,
  MultiChoiceFieldProps,
  NumberFieldProps,
  SelectFieldProps,
  SingleChoiceFieldProps,
  SubmitBarProps,
  TextareaFieldProps,
  TextFieldProps,
} from "./types";

export const agentFieldComponents: FieldComponentRegistry = {
  TextField,
  TextareaField,
  SingleChoiceField,
  MultiChoiceField,
  SelectField,
  NumberField,
  BooleanField,
};
