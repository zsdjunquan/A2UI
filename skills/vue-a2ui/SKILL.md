---
name: vue-a2ui
description: Convert Vue 2 or Vue 3 single-file components into React + TypeScript CopilotKit A2UI / AG-UI catalog components. Use when the user asks to migrate Vue components, Vue forms, Ant Design Vue / Element Plus tables, submit buttons, v-model state, emits, validation rules, or scoped styles into React A2UI components with catalogDefinitions.ts Zod props, PropsOf types, renderer registration, event bridge registration, and agent component JSON examples.
---

# Vue A2UI

Use this skill to turn Vue SFC code into A2UI-ready React components, not ordinary React business components. Prefer the repo's existing A2UI catalog, renderer, event bridge, styling, and design system patterns.

## Required Output

For every Vue component converted to A2UI, include or edit all of these unless the user explicitly asks for only one part:

1. `catalogDefinitions.ts` Zod schema entry.
2. Full `ComponentName.tsx` React component.
3. Renderer registration in the existing catalog file, usually `medicalCatalog.tsx` or similar.
4. Event registration in the existing bridge file when the Vue component has `emit`, submit, confirm, click, or workflow actions.
5. Agent output JSON example using `{ "component": "...", "props": { ... } }`.
6. Build or type-check verification.

## Read First

Before writing code:

- Read the source Vue SFCs.
- Read existing A2UI files: `catalogDefinitions.ts`, catalog renderer file, event bridge file, nearby A2UI components, and entry CSS imports.
- If Ant Design Vue components are used and React `antd` is not installed, install `antd` and import `antd/dist/reset.css` in the React entry file.
- Preserve existing project naming and domain style. For this medical project, use Chinese schema descriptions and a restrained medical UI style.

## Component Contract

Every generated component must accept exactly one parameter named `props`:

```tsx
export function BasicInfoForm({ props }: { props: BasicInfoFormProps }) {
  return ...
}
```

Derive props from the catalog schema:

```tsx
import type { PropsOf } from "@copilotkit/a2ui-renderer";
import type { medicalCatalogDefinitions } from "./catalogDefinitions";

type BasicInfoFormProps = PropsOf<typeof medicalCatalogDefinitions, "BasicInfoForm">;
```

The component name string must exactly match the key in `catalogDefinitions.ts` and the renderer key.

Do not generate:

```tsx
export function BasicInfoForm(props: BasicInfoFormProps) {}
export function BasicInfoForm({ title, data }) {}
export default function BasicInfoForm() {}
```

## Vue Mapping Rules

Translate Vue concepts as follows:

- `defineProps` / `props`: convert to Zod props in `catalogDefinitions.ts`; use `.default()` where Vue has defaults.
- `defineEmits`: convert to `window.dispatchEvent(new CustomEvent(...))` for workflow submissions, plus event bridge validation.
- `v-model`: convert to React local state, `Form.useForm`, or controlled inputs.
- `computed`: convert to `useMemo`.
- `watch`: convert to `useEffect` only when external prop changes must resync local state.
- `reactive`: convert to `useState` object state or Ant Design Form state.
- `v-for`: convert to `.map`.
- `v-if` / `v-else-if`: convert to conditional JSX or renderer functions.
- `scoped style`: convert to a local `styles` string rendered inside the root element, or follow the existing component style approach.
- Ant Design Vue `a-form`, `a-table`, `a-input`, `a-select`, `a-button`: use React `antd` `Form`, `Table`, `Input`, `Select`, `Button`.
- Element Plus `el-form`, `el-table`, `el-input`, `el-select`, `el-button`: use existing React UI library if present; otherwise use `antd` only after installing it.
- Slots: convert simple default slots into a label/text prop; for complex slots, ask only if the expected A2UI payload cannot be represented as JSON props.

## Zod Schema Rules

Add a matching Zod schema entry. Every schema field must have `.describe(...)`, including nested object fields.

Use Chinese descriptions unless surrounding code uses another language:

```ts
BasicInfoForm: {
  description:
    "患者基本信息表单。适用于补充病历号、科室、姓名、性别、年龄、样本号和诊断信息。提交后会注册 basic-info-submit 工作流事件。",
  props: z.object({
    title: z.string().default("基本信息").describe("表单标题。"),
    submitText: z.string().default("提交").describe("提交按钮文本。"),
    fields: z.array(z.string()).optional().describe("可选的字段白名单。"),
    initialValue: z.record(z.string()).optional().describe("表单初始值。"),
  }),
},
```

For option lists:

```ts
const optionSchema = z.object({
  label: z.string().describe("下拉选项展示文本。"),
  value: z.string().describe("下拉选项提交值。"),
});
```

For table rows:

```ts
const indicatorSchema = z.object({
  key: z.string().describe("指标唯一 key。"),
  project: z.string().describe("检测项目名称。"),
  unit: z.string().describe("单位。"),
  referenceRange: z.string().describe("参考范围文本。"),
  min: z.number().optional().describe("参考范围下限。"),
  max: z.number().optional().describe("参考范围上限。"),
});
```

## Event Registration

If the Vue component uses `emit("submit", value)`, `emit("confirm", value)`, or a submit/click handler that affects workflow, register a browser event and bridge it to the agent.

In the component:

```tsx
const handleSubmit = () => {
  if (!validate()) return;

  const value = {
    name: form.name.trim(),
    gender: form.gender,
  };

  console.log("基本信息提交：", value);

  // A2UI 工作流事件：由 A2UIEventBridge 监听并转发给 agent。
  window.dispatchEvent(
    new CustomEvent("basic-info-submit", {
      detail: {
        type: "basicInfo",
        value,
      },
    }),
  );
};
```

In the event bridge:

```ts
type A2UIWorkflowEventName =
  | "basic-info-submit"
  | "inspection-indicators-submit";

const workflowEventLabels: Record<A2UIWorkflowEventName, string> = {
  "basic-info-submit": "基本信息表单已提交",
  "inspection-indicators-submit": "检测指标已提交",
};
```

Add validation helpers for each event. Validate enough required fields to avoid sending empty workflow messages:

```ts
function hasValidBasicInfo(detail: unknown) {
  if (!detail || typeof detail !== "object") return false;
  const value = "value" in detail ? detail.value : undefined;
  if (!value || typeof value !== "object") return false;

  return (
    hasText("name" in value ? value.name : undefined) &&
    hasText("gender" in value ? value.gender : undefined)
  );
}
```

Then add a switch case in `isValidWorkflowEvent`.

## Form Conversion Checklist

For form Vue components, implement:

- Local state or `antd` `Form.useForm`.
- Initial values from props.
- Required validation copied from Vue rules.
- `fields` prop support when the Vue component supports configurable visible fields.
- Input/select placeholders.
- Submit button.
- `handleSubmit` or `handleFinish`.
- Structured `console.log` output on success.
- `window.dispatchEvent(new CustomEvent(...))` and bridge registration.
- Chinese comments explaining field mapping, validation, and event registration.

## Table Conversion Checklist

For table Vue components, implement:

- Source rows from props with Vue defaults preserved.
- Optional field/key filtering if present in Vue.
- Controlled input map for editable cells.
- Derived status/abnormal/result helpers copied from Vue logic.
- Submit validation, such as "at least one result".
- Submit payload shaped as an array of row objects.
- `window.dispatchEvent(new CustomEvent(...))` and bridge registration.
- Preserve line breaks in reference ranges with CSS `white-space: pre-line`.

## Renderer Registration

Register every converted component in the existing catalog:

```tsx
import { BasicInfoForm } from "./BasicInfoForm";

export const medicalCatalog = createCatalog(
  medicalCatalogDefinitions,
  {
    BasicInfoForm: ({ props }) => <BasicInfoForm props={props} />,
  },
  options,
);
```

The renderer key must exactly match the schema key and the component payload name.

## Agent JSON

Always provide an example payload:

```json
{
  "component": "BasicInfoForm",
  "props": {
    "title": "基本信息",
    "submitText": "提交"
  }
}
```

Do not output JSX as the agent payload. Do not flatten props into the top level.

## Validation

After edits:

- Run the repo's type check or build, usually `npm run build`.
- If a dev server is available and approval permits, open the local app and smoke-check rendering.
- Report any build warnings separately from failures.

## Final Checklist

Before finishing, verify:

- Source Vue fields, defaults, options, validation, and submit behavior were mapped.
- `catalogDefinitions.ts` has a Zod entry for every component.
- Every schema field has `.describe`.
- Component accepts only `{ props }`.
- Type uses `PropsOf<typeof medicalCatalogDefinitions, "ComponentName">`.
- Renderer registration exists.
- Event bridge registration exists for submit/confirm/click workflow events.
- Agent JSON examples exist.
- `antd` is installed and reset CSS imported if Ant Design React components are used.
- Build or type check passed, or the reason it could not run is clearly stated.
