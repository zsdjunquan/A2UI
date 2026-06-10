import { useMemo, useState } from "react";
import { Button, Col, Form, Input, Modal, Row, Select, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

type Option = {
  label: string;
  value: string;
};

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

type BasicInfoToolArgs = {
  title?: string;
  submitText?: string;
  agePlaceholder?: string;
  fields?: BasicInfoFieldKey[];
  departmentOptions?: Option[];
  initialValue?: Partial<BasicInfoValue>;
};

type Indicator = {
  key: string;
  project: string;
  unit: string;
  referenceRange: string;
  min?: number;
  max?: number;
};

type IndicatorRow = Indicator & {
  result: string;
  abnormal: string;
};

type InspectionIndicatorsToolArgs = {
  title?: string;
  submitText?: string;
  tableHeight?: number;
  fields?: string[];
  indicators?: Indicator[];
  initialResults?: Record<string, string>;
};

type HumanInTheLoopRenderProps<TArgs> = {
  args: Partial<TArgs>;
  status: "inProgress" | "executing" | "complete";
  result?: string;
  respond?: (result: unknown) => Promise<void>;
};

const optionSchema = z.object({
  label: z.string().describe("下拉选项展示文本。"),
  value: z.string().describe("下拉选项提交值。"),
});

const basicInfoFieldKeySchema = z.enum([
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
]);

const basicInfoToolSchema = z.object({
  title: z.string().default("基本信息").describe("弹窗标题。"),
  submitText: z.string().default("提交").describe("提交按钮文本。"),
  agePlaceholder: z.string().default("请输入").describe("年龄输入框占位文本。"),
  fields: z
    .array(basicInfoFieldKeySchema)
    .optional()
    .describe("可选的字段白名单；不传则展示全部基本信息字段。"),
  departmentOptions: z.array(optionSchema).default([]).describe("科室下拉选项。"),
  initialValue: z
    .object({
      medicalRecordNo: z.string().optional().describe("病历号初始值。"),
      department: z.string().optional().describe("科室初始值。"),
      name: z.string().optional().describe("姓名初始值。"),
      gender: z.string().optional().describe("性别初始值。"),
      age: z.string().optional().describe("年龄初始值。"),
      ageUnit: z.string().optional().describe("年龄单位初始值。"),
      sampleNo: z.string().optional().describe("样本号初始值。"),
      thrombusSymptom: z.string().optional().describe("出血或血栓症状初始值。"),
      preSampleMedication: z.string().optional().describe("采样前用药初始值。"),
      bleedingScore: z.string().optional().describe("出血评分初始值。"),
      diagnosis: z.string().optional().describe("诊断初始值。"),
    })
    .optional()
    .describe("弹窗表单初始值。"),
});

const indicatorSchema = z.object({
  key: z.string().describe("指标唯一 key。"),
  project: z.string().describe("检测项目名称。"),
  unit: z.string().describe("检测项目单位。"),
  referenceRange: z.string().describe("参考范围文本，可包含换行。"),
  min: z.number().optional().describe("参考范围下限。"),
  max: z.number().optional().describe("参考范围上限。"),
});

const inspectionIndicatorsToolSchema = z.object({
  title: z.string().default("检测指标").describe("弹窗标题。"),
  submitText: z.string().default("提交").describe("提交按钮文本。"),
  tableHeight: z.number().default(520).describe("表格纵向滚动高度。"),
  fields: z
    .array(z.string())
    .default([])
    .describe("可选的指标白名单，可填写指标 key 或检测项目名称。"),
  indicators: z
    .array(indicatorSchema)
    .optional()
    .describe("可选的指标配置；不传则展示默认指标。"),
  initialResults: z
    .record(z.string())
    .optional()
    .describe("检测结果初始值，key 为指标 key。"),
});

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

const defaultBasicInfoValue: BasicInfoValue = {
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

const ageUnitOptions: Option[] = [
  { label: "岁", value: "岁" },
  { label: "月", value: "月" },
  { label: "天", value: "天" },
  { label: "时", value: "时" },
];

// 科室默认选项：tool 调用时如果模型没有传 departmentOptions，弹窗里也要有常用科室可选。
const defaultDepartmentOptions: Option[] = [
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

const defaultIndicators: Indicator[] = [
  { key: "tat", project: "TAT", unit: "ng/mL", referenceRange: "4~9", min: 4, max: 9 },
  { key: "pic", project: "PIC", unit: "ug/L", referenceRange: "0~0.85", min: 0, max: 0.85 },
  { key: "t-paic", project: "t-PAIC", unit: "ng/mL", referenceRange: "男性:0~17.13\n女性:0~10.52" },
  { key: "tm", project: "TM", unit: "Tu/ml", referenceRange: "3.82~13.35", min: 3.82, max: 13.35 },
  { key: "pt", project: "PT", unit: "s", referenceRange: "9.4~12.5", min: 9.4, max: 12.5 },
  { key: "aptt", project: "APTT", unit: "s", referenceRange: "22.2~37.9", min: 22.2, max: 37.9 },
  { key: "tt", project: "TT", unit: "s", referenceRange: "14~20", min: 14, max: 20 },
  { key: "fib", project: "FIB", unit: "g/L", referenceRange: "2.0~4.0", min: 2, max: 4 },
  { key: "d-dimer", project: "D-dimer", unit: "ng/mL", referenceRange: "0~0.5", min: 0, max: 0.5 },
  { key: "fdp", project: "FDP", unit: "ug/mL", referenceRange: "0~5.0", min: 0, max: 5 },
  { key: "plt", project: "PLT", unit: "10^9/L", referenceRange: "125~350", min: 125, max: 350 },
  { key: "hb", project: "Hb", unit: "g/L", referenceRange: "115~150", min: 115, max: 150 },
  { key: "hct", project: "HCT", unit: "%", referenceRange: "35.0~45.0", min: 35, max: 45 },
];

function getAbnormalStatus(record: Indicator, rawValue: string | undefined) {
  if (rawValue === undefined || rawValue === null || rawValue.trim() === "") {
    return { text: "", className: "" };
  }

  const value = Number(rawValue);

  if (Number.isNaN(value) || record.min === undefined || record.max === undefined) {
    return { text: "待判断", className: "is-pending" };
  }

  if (value < record.min) return { text: "偏低", className: "is-low" };
  if (value > record.max) return { text: "偏高", className: "is-high" };

  return { text: "正常", className: "is-normal" };
}

function BasicInfoToolModal({
  args,
  status,
  respond,
}: HumanInTheLoopRenderProps<BasicInfoToolArgs>) {
  const [form] = Form.useForm<BasicInfoValue>();
  const [open, setOpen] = useState(status !== "complete");

  const visibleFields = useMemo(() => {
    const requested = args.fields?.length ? args.fields : fieldKeys;
    return requested.filter((key): key is BasicInfoFieldKey =>
      fieldKeys.includes(key as BasicInfoFieldKey),
    );
  }, [args.fields]);

  // 优先使用 tool 参数中的科室；未传时回退到常用科室列表，避免 Antd Select 空数据。
  const departmentOptions = args.departmentOptions?.length
    ? args.departmentOptions
    : defaultDepartmentOptions;

  const fieldConfigs = useMemo(
    () => [
      { key: "medicalRecordNo", name: "medicalRecordNo", label: "病历号", type: "input", placeholder: "请输入" },
      { key: "department", name: "department", label: "科室", type: "select", placeholder: "请选择", options: departmentOptions },
      { key: "name", name: "name", label: "姓名", type: "input", placeholder: "请输入" },
      { key: "gender", name: "gender", label: "性别", type: "select", placeholder: "请选择", options: [{ label: "男", value: "男" }, { label: "女", value: "女" }] },
      { key: "age", name: "age", label: "年龄", type: "age" },
      { key: "sampleNo", name: "sampleNo", label: "样本号", type: "input", placeholder: "请输入" },
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
      { key: "diagnosis", name: "diagnosis", label: "诊断", type: "input", placeholder: "请输入" },
    ],
    [departmentOptions],
  );

  const handleFinish = async (value: BasicInfoValue) => {
    const submitValue = { ...defaultBasicInfoValue, ...args.initialValue, ...value };

    // tool 返回值：respond 会把用户填写的数据作为 tool result 传回 agent 后端。
    await respond?.({
      ok: true,
      type: "basicInfo",
      value: submitValue,
    });
    setOpen(false);
  };

  if (status === "complete") return null;

  return (
    <Modal
      open={open}
      title={args.title || "基本信息"}
      width={920}
      maskClosable={false}
      onCancel={() => setOpen(false)}
      footer={[
        <Button key="cancel" onClick={() => setOpen(false)}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          {args.submitText || "提交"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        initialValues={{ ...defaultBasicInfoValue, ...args.initialValue }}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Row gutter={[24, 18]}>
          {fieldConfigs
            .filter((field) => visibleFields.includes(field.key as BasicInfoFieldKey))
            .map((field) => (
              <Col key={field.key} xs={24} md={12} xl={8}>
                <Form.Item
                  label={field.label}
                  name={field.name as keyof BasicInfoValue}
                  rules={
                    requiredMessages[field.key as BasicInfoFieldKey]
                      ? [{ required: true, message: requiredMessages[field.key as BasicInfoFieldKey] }]
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
                    <Input.Group compact>
                      <Form.Item name="age" noStyle>
                        <Input
                          allowClear
                          style={{ width: "calc(100% - 84px)" }}
                          placeholder={args.agePlaceholder || "请输入"}
                        />
                      </Form.Item>
                      <Form.Item name="ageUnit" noStyle>
                        <Select style={{ width: 84 }} options={ageUnitOptions} />
                      </Form.Item>
                    </Input.Group>
                  )}
                </Form.Item>
              </Col>
            ))}
        </Row>
      </Form>
    </Modal>
  );
}

function InspectionIndicatorsToolModal({
  args,
  status,
  respond,
}: HumanInTheLoopRenderProps<InspectionIndicatorsToolArgs>) {
  const [open, setOpen] = useState(status !== "complete");
  const [resultMap, setResultMap] = useState<Record<string, string>>(
    args.initialResults || {},
  );

  const indicatorSource = useMemo(
    () =>
      (args.indicators?.length ? args.indicators : defaultIndicators).map((indicator) => ({
        ...indicator,
        key: indicator.key || indicator.project,
      })),
    [args.indicators],
  );

  const displayRows = useMemo(() => {
    const normalizedFields = (args.fields || []).map((field) => String(field).toLowerCase());
    if (!normalizedFields.length) return indicatorSource;

    return indicatorSource.filter((row) => {
      const key = String(row.key).toLowerCase();
      const project = String(row.project).toLowerCase();
      return normalizedFields.includes(key) || normalizedFields.includes(project);
    });
  }, [args.fields, indicatorSource]);

  const tableRows: IndicatorRow[] = displayRows.map((row) => {
    const result = resultMap[row.key] || "";
    const statusValue = getAbnormalStatus(row, result);
    return { ...row, result, abnormal: statusValue.text };
  });

  const updateResult = (key: string, value: string) => {
    setResultMap((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const columns: ColumnsType<IndicatorRow> = [
    { title: "检测项目", dataIndex: "project", width: 130 },
    {
      title: "检测结果",
      dataIndex: "result",
      width: 150,
      render: (_, record) => (
        <Input
          allowClear
          placeholder="请输入"
          value={resultMap[record.key] || ""}
          onChange={(event) => updateResult(record.key, event.target.value)}
        />
      ),
    },
    {
      title: "异常情况",
      dataIndex: "abnormal",
      width: 120,
      render: (_, record) => getAbnormalStatus(record, resultMap[record.key]).text,
    },
    { title: "单位", dataIndex: "unit", width: 120 },
    {
      title: "参考范围",
      dataIndex: "referenceRange",
      width: 160,
      render: (value: string) => <span style={{ whiteSpace: "pre-line" }}>{value}</span>,
    },
  ];

  const handleSubmit = async () => {
    const hasAnyResult = displayRows.some((row) => {
      const value = resultMap[row.key];
      return value !== undefined && value !== null && String(value).trim() !== "";
    });

    if (!hasAnyResult) {
      message.warning("请填写检测指标，至少有一项");
      return;
    }

    const values = displayRows.map((row) => ({
      project: row.project,
      result: resultMap[row.key] ?? "",
      abnormal: getAbnormalStatus(row, resultMap[row.key]).text,
      unit: row.unit,
      referenceRange: row.referenceRange,
    }));

    // tool 返回值：respond 会把检测指标数组作为 tool result 传回 agent 后端。
    await respond?.({
      ok: true,
      type: "inspectionIndicators",
      values,
    });
    setOpen(false);
  };

  if (status === "complete") return null;

  return (
    <Modal
      open={open}
      title={args.title || "检测指标"}
      width={920}
      maskClosable={false}
      onCancel={() => setOpen(false)}
      footer={[
        <Button key="cancel" onClick={() => setOpen(false)}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {args.submitText || "提交"}
        </Button>,
      ]}
    >
      <Table
        columns={columns}
        dataSource={tableRows}
        pagination={false}
        rowKey="key"
        scroll={{ y: args.tableHeight || 520 }}
        size="middle"
      />
    </Modal>
  );
}

export function A2UIFrontendToolModals() {
  useHumanInTheLoop<BasicInfoToolArgs>({
    name: "requestBasicInfoModal",
    description:
      "弹出患者基本信息填写弹窗，等待用户填写并提交；提交后把 value 作为 tool result 返回给后端 agent。",
    parameters: basicInfoToolSchema,
    render: BasicInfoToolModal,
  });

  useHumanInTheLoop<InspectionIndicatorsToolArgs>({
    name: "requestInspectionIndicatorsModal",
    description:
      "弹出检测指标填写弹窗，等待用户填写并提交；提交后把 values 作为 tool result 返回给后端 agent。",
    parameters: inspectionIndicatorsToolSchema,
    render: InspectionIndicatorsToolModal,
  });

  return null;
}
