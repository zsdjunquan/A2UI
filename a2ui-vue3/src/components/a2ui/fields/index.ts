import BooleanField from "./BooleanField.vue";
import MultiChoiceField from "./MultiChoiceField.vue";
import NumberField from "./NumberField.vue";
import SelectField from "./SelectField.vue";
import SingleChoiceField from "./SingleChoiceField.vue";
import SubmitBar from "./SubmitBar.vue";
import TextareaField from "./TextareaField.vue";
import TextField from "./TextField.vue";
import type { FieldComponentRegistry } from "./types";

export { BooleanField, MultiChoiceField, NumberField, SelectField, SingleChoiceField, SubmitBar, TextareaField, TextField };

export type {
  AgentFormFieldConfig,
  AgentFormFieldKind,
  BooleanFieldProps,
  ChoiceOption,
  ChoiceValue,
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
