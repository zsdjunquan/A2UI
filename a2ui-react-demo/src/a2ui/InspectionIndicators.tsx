import { useMemo, useState } from "react";
import { Button, Input, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PropsOf } from "@copilotkit/a2ui-renderer";
import type { medicalCatalogDefinitions } from "./catalogDefinitions";

type InspectionIndicatorsProps = PropsOf<
  typeof medicalCatalogDefinitions,
  "InspectionIndicators"
>;

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

const styles = `
.inspection-indicators,
.inspection-indicators * {
  box-sizing: border-box;
  max-width: 100%;
}

.inspection-indicators {
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

.inspection-indicators__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
}

.inspection-indicators__mark {
  width: 4px;
  height: 15px;
  border-radius: 2px;
  background: #1d5fbf;
}

.inspection-indicators__title {
  margin: 0;
  color: #172334;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.inspection-indicators .ant-table-thead > tr > th {
  color: #64748b;
  font-weight: 500;
  background: #f8fafc !important;
}

.inspection-indicators__input {
  width: 132px;
}

.inspection-indicators__range {
  white-space: pre-line;
}

.inspection-indicators__status {
  color: #64748b;
}

.inspection-indicators__status.is-normal {
  color: #16a34a;
}

.inspection-indicators__status.is-high,
.inspection-indicators__status.is-low {
  color: #dc2626;
}

.inspection-indicators__status.is-pending {
  color: #d97706;
}

.inspection-indicators__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
`;

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

export function InspectionIndicators({ props }: { props: InspectionIndicatorsProps }) {
  const [resultMap, setResultMap] = useState<Record<string, string>>(
    props.initialResults || {},
  );

  // props.indicators 可由模型指定；未指定时使用 Vue 组件中的凝血/血栓默认指标。
  const indicatorSource = (props.indicators?.length ? props.indicators : defaultIndicators).map(
    (indicator) => ({
      ...indicator,
      key: indicator.key || indicator.project,
    }),
  );

  // fields 支持按 key 或 project 过滤，方便 agent 只要求用户补充缺失项目。
  const displayRows = useMemo(() => {
    const normalizedFields = (props.fields || []).map((field) => String(field).toLowerCase());

    if (!normalizedFields.length) return indicatorSource;

    return indicatorSource.filter((row) => {
      const key = String(row.key).toLowerCase();
      const project = String(row.project).toLowerCase();
      return normalizedFields.includes(key) || normalizedFields.includes(project);
    });
  }, [indicatorSource, props.fields]);

  const tableRows: IndicatorRow[] = displayRows.map((row) => {
    const result = resultMap[row.key] || "";
    const status = getAbnormalStatus(row, result);
    return { ...row, result, abnormal: status.text };
  });

  const updateResult = (key: string, value: string) => {
    setResultMap((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const columns: ColumnsType<IndicatorRow> = [
    { title: "检测项目", dataIndex: "project", width: 150 },
    {
      title: "检测结果",
      dataIndex: "result",
      width: 170,
      render: (_, record) => (
        <Input
          allowClear
          className="inspection-indicators__input"
          placeholder="请输入"
          value={resultMap[record.key] || ""}
          onChange={(event) => updateResult(record.key, event.target.value)}
        />
      ),
    },
    {
      title: "异常情况",
      dataIndex: "abnormal",
      width: 150,
      render: (_, record) => {
        const status = getAbnormalStatus(record, resultMap[record.key]);
        return (
          <span className={`inspection-indicators__status ${status.className}`}>
            {status.text}
          </span>
        );
      },
    },
    { title: "单位", dataIndex: "unit", width: 150 },
    {
      title: "参考范围",
      dataIndex: "referenceRange",
      width: 170,
      render: (value: string) => (
        <span className="inspection-indicators__range">{value}</span>
      ),
    },
  ];

  // 提交事件注册：至少填写一项后，把表格行转为结构化数组交给 A2UIEventBridge。
  const handleSubmit = () => {
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

    console.log("检测指标提交：", values);

    window.dispatchEvent(
      new CustomEvent("inspection-indicators-submit", {
        detail: {
          type: "inspectionIndicators",
          values,
        },
      }),
    );
  };

  return (
    <section className="inspection-indicators">
      <style>{styles}</style>

      <header className="inspection-indicators__header">
        <span className="inspection-indicators__mark" />
        <h3 className="inspection-indicators__title">{props.title || "检测指标"}</h3>
      </header>

      <Table
        columns={columns}
        dataSource={tableRows}
        pagination={false}
        rowKey="key"
        scroll={{ y: props.tableHeight || 520 }}
        size="middle"
      />

      <div className="inspection-indicators__actions">
        <Button type="primary" onClick={handleSubmit}>
          {props.submitText || "提交"}
        </Button>
      </div>
    </section>
  );
}
