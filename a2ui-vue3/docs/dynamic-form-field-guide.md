# 动态表单字段类型使用与新增指南

这份文档给后续维护 `DynamicAgentForm` 用。重点是：后端 agent 返回 JSON，前端根据 JSON 渲染字段，用户提交后前端把 `values` 回给 agent。

你这次要补 `CheckboxField`，建议按本文流程自己动手改。我只把路线图写清楚。

## 1. 业务位置

动态表单的核心组件：

```text
src/components/a2ui/DynamicAgentForm.vue
```

它接收后端返回的表单协议：

```json
{
  "schemaVersion": "1.0",
  "formId": "requirementBreakdown",
  "title": "需求拆解信息",
  "description": "请补充以下信息，便于继续拆解页面和功能。",
  "layout": { "columns": 2 },
  "fields": [],
  "initialValues": {},
  "submit": {}
}
```

前端不关心业务语义，只看每个字段的 `type`，然后分发到对应字段组件。

## 2. 当前字段类型

字段组件在这里：

```text
src/components/a2ui/fields
```

当前已有字段：

```text
TextField           单行输入
TextareaField       多行输入
SingleChoiceField   单选胶囊/卡片
MultiChoiceField    多选胶囊/卡片
SelectField         下拉选择
NumberField         数字输入
BooleanField        开关/勾选
SubmitBar           提交区
```

字段协议类型在：

```text
src/components/a2ui/fields/types.ts
```

统一导出在：

```text
src/components/a2ui/fields/index.ts
```

动态渲染分发在：

```text
src/components/a2ui/DynamicAgentForm.vue
```

## 3. CheckboxField 和 BooleanField 的区别

项目里已经有 `BooleanField`，它表示一个 true/false 问题：

```json
{
  "key": "needLogin",
  "type": "BooleanField",
  "label": "是否需要登录",
  "defaultValue": true
}
```

你要新增的 `CheckboxField` 建议定位为“复选框组”，也就是多个选项里勾选多个，提交数组。

适合这些业务：

```text
功能模块：登录、权限、报表、消息通知
权限角色：管理员、医生、护士、患者
页面范围：首页、列表页、详情页、配置页
交付内容：原型、UI、前端代码、接口文档
```

也就是说：

```text
BooleanField   -> 一个是否问题，返回 boolean
CheckboxField  -> 多个勾选项，返回数组
```

如果只是视觉上想要 Element Plus checkbox 组，也可以让 `CheckboxField` 和 `MultiChoiceField` 共享同样的数据结构，只是展示方式不同。

## 4. CheckboxField 建议 JSON 格式

后端 agent 返回：

```json
{
  "key": "modules",
  "type": "CheckboxField",
  "label": "功能模块",
  "description": "请选择本次需要包含的模块",
  "required": true,
  "defaultValue": ["login", "permission"],
  "messages": {
    "required": "请至少选择一个功能模块"
  },
  "options": [
    { "label": "登录注册", "value": "login" },
    { "label": "权限管理", "value": "permission" },
    { "label": "数据报表", "value": "report" },
    { "label": "消息通知", "value": "notification", "disabled": true }
  ]
}
```

提交后 `values` 里应该是：

```json
{
  "modules": ["login", "permission"]
}
```

## 5. 新增字段类型的完整流程

以 `CheckboxField` 为例，按这个顺序改。

### 第一步：新增组件文件

新建：

```text
src/components/a2ui/fields/CheckboxField.vue
```

建议参考：

```text
src/components/a2ui/fields/MultiChoiceField.vue
src/components/a2ui/fields/BooleanField.vue
src/components/a2ui/fields/FieldFrame.vue
```

组件要求：

```text
1. 使用 <script setup lang="ts">
2. props 使用 CheckboxFieldProps
3. modelValue 是 ChoiceValue[]
4. emit 使用 "update:modelValue"
5. 外层使用 FieldFrame
6. 内部使用 Element Plus 的 ElCheckboxGroup / ElCheckbox
```

你写的时候可以按这个骨架：

```vue
<script setup lang="ts">
import { ElCheckbox, ElCheckboxGroup } from "element-plus";
import FieldFrame from "./FieldFrame.vue";
import type { CheckboxFieldProps, ChoiceValue } from "./types";

const props = defineProps<CheckboxFieldProps>();

const emit = defineEmits<{
  "update:modelValue": [value: ChoiceValue[]];
}>();
</script>

<template>
  <FieldFrame v-bind="props">
    <ElCheckboxGroup
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', $event as ChoiceValue[])"
    >
      <ElCheckbox
        v-for="option in options"
        :key="String(option.value)"
        :label="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </ElCheckbox>
    </ElCheckboxGroup>
  </FieldFrame>
</template>
```

注意：这只是骨架，样式可以后面再慢慢调。

### 第二步：补类型

修改：

```text
src/components/a2ui/fields/types.ts
```

要做三件事。

新增 props 类型：

```ts
export type CheckboxFieldProps = FieldBaseProps & {
  modelValue: ChoiceValue[];
  options: ChoiceOption[];
};
```

把枚举加进去：

```ts
export type AgentFormFieldKind =
  | "TextField"
  | "TextareaField"
  | "SingleChoiceField"
  | "MultiChoiceField"
  | "CheckboxField"
  | "SelectField"
  | "NumberField"
  | "BooleanField";
```

把配置 union 加进去：

```ts
| ({
    type: "CheckboxField";
    key: string;
    defaultValue?: ChoiceValue[];
    messages?: FieldMessages;
  } & Omit<CheckboxFieldProps, "modelValue" | "error">)
```

### 第三步：统一导出

修改：

```text
src/components/a2ui/fields/index.ts
```

要做四件事。

导入组件：

```ts
import CheckboxField from "./CheckboxField.vue";
```

导出组件：

```ts
export { CheckboxField, ... };
```

导出类型：

```ts
export type { CheckboxFieldProps, ... } from "./types";
```

注册到映射：

```ts
export const agentFieldComponents: FieldComponentRegistry = {
  TextField,
  TextareaField,
  SingleChoiceField,
  MultiChoiceField,
  CheckboxField,
  SelectField,
  NumberField,
  BooleanField,
};
```

### 第四步：动态表单渲染分发

修改：

```text
src/components/a2ui/DynamicAgentForm.vue
```

导入组件：

```ts
import { CheckboxField } from "./fields";
```

在模板里加一个分支，建议放在 `MultiChoiceField` 后面：

```vue
<CheckboxField
  v-else-if="field.type === 'CheckboxField'"
  :model-value="getChoiceArrayValue(field.key)"
  v-bind="{ ...field, error: errors[field.key] }"
  @update:model-value="setValue(field.key, $event)"
/>
```

不用新增 `getCheckboxValue`，因为它和多选一样，都是数组。

### 第五步：初始值不用额外改

当前 `getInitialValue` 里有：

```ts
if (field.type === "MultiChoiceField") return [];
```

加完 Checkbox 后，要改成：

```ts
if (field.type === "MultiChoiceField" || field.type === "CheckboxField") return [];
```

因为 CheckboxField 没有 `initialValues` 和 `defaultValue` 时，也应该返回空数组。

### 第六步：后端 tool schema 暂时可以不动

如果你只是先让 `DynamicAgentForm` 支持 `CheckboxField`，不接 `requestAgentFormModal`，那可以先不动：

```text
src/protocol/frontendTools.ts
```

后面如果要让 agent 通过 tool 正式调用这个字段，再把 `agentFormFieldSchema.type.enum` 加上 `"CheckboxField"`。

## 6. 添加完成后的测试 JSON

你可以临时找一个页面或弹窗传入这个 schema 测试：

```json
{
  "schemaVersion": "1.0",
  "formId": "checkboxDemo",
  "title": "CheckboxField 测试",
  "description": "测试多选复选框字段是否能正常展示和提交。",
  "layout": { "columns": 2 },
  "fields": [
    {
      "key": "modules",
      "type": "CheckboxField",
      "label": "功能模块",
      "description": "请选择需要的模块",
      "required": true,
      "defaultValue": ["login"],
      "messages": {
        "required": "请至少选择一个功能模块"
      },
      "options": [
        { "label": "登录注册", "value": "login" },
        { "label": "权限管理", "value": "permission" },
        { "label": "数据报表", "value": "report" },
        { "label": "消息通知", "value": "notification" }
      ]
    }
  ],
  "initialValues": {},
  "submit": {
    "submitText": "提交",
    "skipText": "跳过",
    "showSkip": true,
    "defaultHint": "不确定的内容可以先跳过"
  }
}
```

预期提交：

```json
{
  "ok": true,
  "type": "agentForm",
  "formId": "checkboxDemo",
  "schemaVersion": "1.0",
  "values": {
    "modules": ["login", "report"]
  },
  "submittedFields": ["modules"]
}
```

## 7. 验证清单

写完后按顺序检查。

```bash
npm run build
```

检查点：

```text
1. CheckboxField.vue 没有 TS 报错
2. types.ts 里的 AgentFormFieldKind 包含 CheckboxField
3. AgentFormFieldConfig 包含 CheckboxField 分支
4. fields/index.ts 已导出 CheckboxField 和 CheckboxFieldProps
5. DynamicAgentForm.vue 已 import CheckboxField
6. DynamicAgentForm.vue 模板里有 CheckboxField 分支
7. getInitialValue 给 CheckboxField 默认空数组
8. required 时空数组能触发 messages.required
9. 提交 values[key] 是数组
```

## 8. 常见错误

### 错误一：忘记加 AgentFormFieldKind

表现：

```text
field.type === "CheckboxField" 报类型不兼容
```

处理：

```text
把 "CheckboxField" 加进 AgentFormFieldKind。
```

### 错误二：忘记在 index.ts 导出

表现：

```text
DynamicAgentForm.vue import { CheckboxField } from "./fields" 报错
```

处理：

```text
在 fields/index.ts 导入并导出 CheckboxField。
```

### 错误三：默认值不是数组

表现：

```text
ElCheckboxGroup 选中状态不正常
```

处理：

```text
CheckboxField 的 modelValue 必须是 ChoiceValue[]。
```

### 错误四：把 CheckboxField 做成 boolean

表现：

```text
只能返回 true/false，无法表达多个选项
```

处理：

```text
单个是否问题用 BooleanField；多个勾选项用 CheckboxField。
```

## 9. 推荐提交说明

如果你后面自己提交 commit，可以这样写：

```text
feat: add checkbox field support for dynamic agent forms
```

或者中文：

```text
feat: 动态表单支持 CheckboxField 字段
```
