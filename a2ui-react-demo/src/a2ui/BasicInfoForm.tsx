import { useMemo, useState } from "react";
import { Button, Col, Form, Input, Row, Select } from "antd";
import type { PropsOf } from "@copilotkit/a2ui-renderer";
import type { medicalCatalogDefinitions } from "./catalogDefinitions";

type BasicInfoFormProps = PropsOf<typeof medicalCatalogDefinitions, "BasicInfoForm">;

type BasicInfoFieldKey =
  | "medicalRecordNo"
  | "department"
  | "name"
  | "gender"
  | "age"
  | "sampleNo"
  | "thrombusSymptom"
  | "preSampleMedication"
  | "bleedingScore"
  | "diagnosis";

type BasicInfoValue = {
  medicalRecordNo: string;
  department?: string;
  name: string;
  gender?: string;
  age: string;
  ageUnit: string;
  sampleNo: string;
  thrombusSymptom?: string;
  preSampleMedication?: string;
  bleedingScore?: string;
  diagnosis: string;
};

type FieldConfig = {
  key: BasicInfoFieldKey;
  name: keyof BasicInfoValue;
  label: string;
  type: "input" | "select" | "age";
  placeholder?: string;
  options?: { label: string; value: string }[];
};

const fieldKeys: BasicInfoFieldKey[] = [
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

const requiredMessages: Partial<Record<BasicInfoFieldKey, string>> = {
  medicalRecordNo: "请输入病历号",
  name: "请输入姓名",
  department: "请选择科室",
  gender: "请选择性别",
};

const defaultValue: BasicInfoValue = {
  medicalRecordNo: "",
  department: undefined,
  name: "",
  gender: undefined,
  age: "",
  ageUnit: "岁",
  sampleNo: "",
  thrombusSymptom: undefined,
  preSampleMedication: undefined,
  bleedingScore: undefined,
  diagnosis: "",
};

const ageUnitOptions = [
  { label: "岁", value: "岁" },
  { label: "月", value: "月" },
  { label: "天", value: "天" },
  { label: "时", value: "时" },
];

// 科室默认选项：当 agent 没有下发 departmentOptions 时，科室下拉也要能直接选择。
const defaultDepartmentOptions = [
  { label: "妇科", value: "妇科" },
  { label: "产科", value: "产科" },
  { label: "内科", value: "内科" },
  { label: "外科", value: "外科" },
  { label: "儿科", value: "儿科" },
  { label: "急诊科", value: "急诊科" },
  { label: "检验科", value: "检验科" },
  { label: "呼吸内科", value: "呼吸内科" },
  { label: "心血管内科", value: "心血管内科" },
  { label: "消化内科", value: "消化内科" },
  { label: "神经内科", value: "神经内科" },
  { label: "骨科", value: "骨科" },
];

const styles = `
.basic-info-form,
.basic-info-form * {
  box-sizing: border-box;
  max-width: 100%;
}

.basic-info-form {
  width: 100%;
  min-width: 0;
  margin: 8px 0;
  padding: 18px 20px 20px;
  overflow: hidden;
  border: 1px solid #dce8ee;
  border-radius: 14px;
  background: #ffffff;
  color: #172334;
  box-shadow: 0 10px 28px rgba(26, 48, 73, 0.06);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", Arial, sans-serif;
}

.basic-info-form__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
}

.basic-info-form__mark {
  width: 4px;
  height: 15px;
  border-radius: 2px;
  background: #1d5fbf;
}

.basic-info-form__title {
  margin: 0;
  color: #172334;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.basic-info-form .ant-form-item {
  margin-bottom: 0;
}

.basic-info-form .ant-form-item-label > label {
  color: #64748b;
  font-size: 14px;
}

.basic-info-form .ant-input,
.basic-info-form .ant-select-selector {
  border-color: #cbd5e1 !important;
  border-radius: 5px !important;
}

.basic-info-form__age {
  display: flex;
  width: 100%;
}

.basic-info-form__age-value {
  flex: 1;
}

.basic-info-form__age-unit {
  width: 84px;
}

.basic-info-form__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 28px;
}
`;

export function BasicInfoForm({ props }: { props: BasicInfoFormProps }) {
  const [form] = Form.useForm<BasicInfoValue>();
  const [formValue, setFormValue] = useState<BasicInfoValue>({
    ...defaultValue,
    ...props.initialValue,
  });

  // 优先使用 agent 传入的科室；未传时使用本地默认科室，避免下拉出现 No data。
  const departmentOptions = props.departmentOptions?.length
    ? props.departmentOptions
    : defaultDepartmentOptions;

  // 根据 A2UI props 控制需要展示的字段；未传 fields 时展示 Vue 组件中的完整默认字段。
  const visibleFields = useMemo(() => {
    const requested = props.fields?.length ? props.fields : fieldKeys;
    return requested.filter((key): key is BasicInfoFieldKey =>
      fieldKeys.includes(key as BasicInfoFieldKey),
    );
  }, [props.fields]);

  // 字段配置来自原 Vue 组件，保留 label、类型、占位符和下拉选项。
  const fieldConfigs = useMemo<FieldConfig[]>(
    () => [
      {
        key: "medicalRecordNo",
        name: "medicalRecordNo",
        label: "病历号",
        type: "input",
        placeholder: "请输入",
      },
      {
        key: "department",
        name: "department",
        label: "科室",
        type: "select",
        placeholder: "请选择",
        options: departmentOptions,
      },
      { key: "name", name: "name", label: "姓名", type: "input", placeholder: "请输入" },
      {
        key: "gender",
        name: "gender",
        label: "性别",
        type: "select",
        placeholder: "请选择",
        options: [
          { label: "男", value: "男" },
          { label: "女", value: "女" },
        ],
      },
      { key: "age", name: "age", label: "年龄", type: "age" },
      {
        key: "sampleNo",
        name: "sampleNo",
        label: "样本号",
        type: "input",
        placeholder: "请输入",
      },
      {
        key: "thrombusSymptom",
        name: "thrombusSymptom",
        label: "是否有出血或血栓症状",
        type: "select",
        placeholder: "请选择",
        options: [
          { label: "出血", value: "出血" },
          { label: "血栓", value: "血栓" },
          { label: "出血和血栓", value: "出血和血栓" },
          { label: "无出血且无血栓", value: "无出血且无血栓" },
        ],
      },
      {
        key: "preSampleMedication",
        name: "preSampleMedication",
        label: "血栓采样前48h内是否服用抗凝药？",
        type: "select",
        placeholder: "请选择",
        options: [
          { label: "有", value: "有" },
          { label: "无", value: "无" },
          { label: "未知", value: "未知" },
        ],
      },
      {
        key: "bleedingScore",
        name: "bleedingScore",
        label: "出血评分结果",
        type: "select",
        placeholder: "请选择",
        options: [
          { label: "高危", value: "高危" },
          { label: "中危", value: "中危" },
          { label: "低危", value: "低危" },
          { label: "未进行评分", value: "未进行评分" },
        ],
      },
      {
        key: "diagnosis",
        name: "diagnosis",
        label: "诊断",
        type: "input",
        placeholder: "请输入",
      },
    ],
    [departmentOptions],
  );

  const displayedConfigs = fieldConfigs.filter((field) => visibleFields.includes(field.key));

  // 提交事件注册：表单通过校验后，把结构化数据抛给 A2UIEventBridge 继续驱动 agent。
  const handleFinish = (value: BasicInfoValue) => {
    const submitValue = { ...formValue, ...value };

    console.log("基础信息提交：", submitValue);

    window.dispatchEvent(
      new CustomEvent("basic-info-submit", {
        detail: {
          type: "basicInfo",
          value: submitValue,
        },
      }),
    );
  };

  return (
    <section className="basic-info-form">
      <style>{styles}</style>

      <header className="basic-info-form__header">
        <span className="basic-info-form__mark" />
        <h3 className="basic-info-form__title">{props.title || "基本信息"}</h3>
      </header>

      <Form
        form={form}
        initialValues={formValue}
        layout="vertical"
        onFinish={handleFinish}
        onValuesChange={(_, values) => setFormValue(values)}
      >
        <Row gutter={[28, 22]}>
          {displayedConfigs.map((field) => (
            <Col key={field.key} xs={24} md={12} xl={8}>
              <Form.Item
                label={field.label}
                name={field.name}
                rules={
                  requiredMessages[field.key]
                    ? [{ required: true, message: requiredMessages[field.key] }]
                    : undefined
                }
              >
                {field.type === "input" && (
                  <Input allowClear placeholder={field.placeholder || "请输入"} />
                )}

                {field.type === "select" && (
                  <Select
                    allowClear
                    options={field.options}
                    placeholder={field.placeholder || "请选择"}
                  />
                )}

                {field.type === "age" && (
                  <Input.Group compact className="basic-info-form__age">
                    <Form.Item name="age" noStyle>
                      <Input
                        allowClear
                        className="basic-info-form__age-value"
                        placeholder={props.agePlaceholder || "请输入"}
                      />
                    </Form.Item>
                    <Form.Item name="ageUnit" noStyle>
                      <Select
                        className="basic-info-form__age-unit"
                        options={ageUnitOptions}
                      />
                    </Form.Item>
                  </Input.Group>
                )}
              </Form.Item>
            </Col>
          ))}
        </Row>

        <div className="basic-info-form__actions">
          <Button type="primary" htmlType="submit">
            {props.submitText || "提交"}
          </Button>
        </div>
      </Form>
    </section>
  );
}
