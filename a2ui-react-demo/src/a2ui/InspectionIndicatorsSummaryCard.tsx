import type { PropsOf } from "@copilotkit/a2ui-renderer";
import type { medicalCatalogDefinitions } from "./catalogDefinitions";

type InspectionIndicatorsSummaryCardProps = PropsOf<
  typeof medicalCatalogDefinitions,
  "InspectionIndicatorsSummaryCard"
>;

type InspectionMetric = InspectionIndicatorsSummaryCardProps["metrics"][number];

const styles = `
.inspection-summary-card,
.inspection-summary-card * {
  box-sizing: border-box;
  max-width: 100%;
}

.inspection-summary-card {
  width: 100%;
  min-width: 0;
  margin: 8px 0;
  padding: 16px 18px 18px;
  overflow: hidden;
  border: 1px solid #dce8ee;
  border-radius: 12px;
  background: #ffffff;
  color: #172334;
  box-shadow: 0 10px 28px rgba(26, 48, 73, 0.06);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", Arial, sans-serif;
}

.inspection-summary-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.inspection-summary-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.inspection-summary-card__mark {
  flex: none;
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: #1d5fbf;
}

.inspection-summary-card__title {
  margin: 0;
  color: #172334;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
}

.inspection-summary-card__status {
  flex: none;
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border: 1px solid #b7dfc9;
  border-radius: 5px;
  background: #eefbf3;
  color: #138a4d;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.inspection-summary-card__table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e1e7ef;
}

.inspection-summary-card__table {
  width: 100%;
  min-width: 660px;
  border-collapse: collapse;
  table-layout: fixed;
  background: #ffffff;
}

.inspection-summary-card__table th {
  height: 36px;
  padding: 0 12px;
  border-bottom: 1px solid #e1e7ef;
  background: #f8fafc;
  color: #172334;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
}

.inspection-summary-card__table td {
  min-height: 36px;
  padding: 9px 12px;
  border-bottom: 1px solid #e8edf3;
  color: #243247;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
  vertical-align: top;
}

.inspection-summary-card__table tr:last-child td {
  border-bottom: none;
}

.inspection-summary-card__range {
  white-space: pre-line;
}

.inspection-summary-card__badge {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 5px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.inspection-summary-card__badge.is-normal {
  background: #eefbf3;
  color: #138a4d;
}

.inspection-summary-card__badge.is-high,
.inspection-summary-card__badge.is-low {
  background: #fff1f2;
  color: #dc2626;
}

.inspection-summary-card__badge.is-pending {
  background: #fff7ed;
  color: #d97706;
}

.inspection-summary-card__next {
  margin: 12px 0 0;
  color: #5f6f82;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .inspection-summary-card {
    padding: 14px;
  }

  .inspection-summary-card__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
`;

function getStatusClass(abnormal: string | undefined) {
  const value = abnormal?.trim();

  if (value === "正常") return "is-normal";
  if (value === "偏高") return "is-high";
  if (value === "偏低") return "is-low";
  if (value === "待判断") return "is-pending";

  return "";
}

function getDisplayValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized || "未填写";
}

export function InspectionIndicatorsSummaryCard({
  props,
}: {
  props: InspectionIndicatorsSummaryCardProps;
}) {
  // 汇总表格接收 tool result 后的结构化指标，避免模型把检测结果再拼成 Markdown 表。
  const metrics: InspectionMetric[] = Array.isArray(props.metrics) ? props.metrics : [];

  return (
    <section className="inspection-summary-card">
      <style>{styles}</style>

      <header className="inspection-summary-card__header">
        <div className="inspection-summary-card__title-wrap">
          <span className="inspection-summary-card__mark" aria-hidden="true" />
          <h3 className="inspection-summary-card__title">
            {props.title || "检测指标已提交"}
          </h3>
        </div>

        <span className="inspection-summary-card__status">
          {props.statusText || "已记录"}
        </span>
      </header>

      <div className="inspection-summary-card__table-wrap">
        <table className="inspection-summary-card__table">
          <thead>
            <tr>
              <th>检测项目</th>
              <th>结果</th>
              <th>异常情况</th>
              <th>单位</th>
              <th>参考范围</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, index) => (
              <tr key={`${metric.project}-${index}`}>
                <td>{metric.project}</td>
                <td>{getDisplayValue(metric.result)}</td>
                <td>
                  <span
                    className={`inspection-summary-card__badge ${getStatusClass(
                      metric.abnormal,
                    )}`}
                  >
                    {getDisplayValue(metric.abnormal)}
                  </span>
                </td>
                <td>{getDisplayValue(metric.unit)}</td>
                <td className="inspection-summary-card__range">
                  {getDisplayValue(metric.referenceRange)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {props.nextPrompt ? (
        <p className="inspection-summary-card__next">{props.nextPrompt}</p>
      ) : null}
    </section>
  );
}
