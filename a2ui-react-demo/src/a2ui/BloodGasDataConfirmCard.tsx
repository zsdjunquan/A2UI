import type { PropsOf } from "@copilotkit/a2ui-renderer";
import type { medicalCatalogDefinitions } from "./catalogDefinitions";
import { getBloodGasStatusByRange } from "./bloodGasStatus";

type BloodGasDataConfirmCardProps = PropsOf<
  typeof medicalCatalogDefinitions,
  "BloodGasDataConfirmCard"
>;

type ConfirmMetric = BloodGasDataConfirmCardProps["metrics"][number];

const referenceRanges: Record<string, string> = {
  pH: "7.35-7.45",
  PaCO2: "35-45 mmHg",
  PaO2: "80-100 mmHg",
  "HCO3-": "22-27 mmol/L",
  SaO2: "95-100%",
  Lactate: "0.5-2.2 mmol/L",
  BE: "-3~+3 mmol/L",
  FiO2: "21-100%",
  "Na+": "135-145 mmol/L",
  "K+": "3.5-5.5 mmol/L",
  "Cl-": "98-106 mmol/L",
  Glucose: "3.9-6.1 mmol/L",
};

const metricNameMap: Record<string, string> = {
  pH: "pH",
  paCO2: "PaCO2",
  paO2: "PaO2",
  hco3: "HCO3-",
  saO2: "SaO2",
  lac: "Lactate",
  be: "BE",
  fiO2: "FiO2",
  na: "Na+",
  k: "K+",
  cl: "Cl-",
  glucose: "Glucose",
};

function getText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function getMetricFallbackValue(metric: ConfirmMetric) {
  const rawMetric = metric as ConfirmMetric & {
    value?: unknown;
    displayValue?: unknown;
    resultValue?: unknown;
  };

  return (
    getText(rawMetric.result) ||
    getText(rawMetric.displayValue) ||
    getText(rawMetric.resultValue) ||
    getText(rawMetric.value)
  );
}

function normalizeMetric(metric: ConfirmMetric): ConfirmMetric {
  const rawMetric = metric as ConfirmMetric & {
    key?: string;
    label?: string;
    unit?: string;
  };
  const name = getText(metric.name) || metricNameMap[rawMetric.key || ""] || getText(rawMetric.label) || "未命名指标";
  const result = getMetricFallbackValue(metric);
  const unit = getText(rawMetric.unit);

  return {
    ...metric,
    name,
    result: result && unit && !result.includes(unit) ? `${result} ${unit}` : result || "未提供",
    referenceRange: getText(metric.referenceRange) || referenceRanges[name] || "未提供",
    status: getBloodGasStatusByRange(
      result || "",
      getText(metric.referenceRange) || referenceRanges[name] || "",
      metric.status || "normal",
    ),
  };
}

const styles = `
.blood-gas-confirm-card,
.blood-gas-confirm-card * {
  box-sizing: border-box;
  max-width: 100%;
}

.blood-gas-confirm-card {
  width: 100%;
  min-width: 0;
  padding: 14px 14px 16px;
  overflow: hidden;
  border: 1px solid #dce8ee;
  border-radius: 12px;
  background: #ffffff;
  color: #172334;
  box-shadow: 0 10px 28px rgba(26, 48, 73, 0.06);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", Arial, sans-serif;
}

.blood-gas-confirm-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.blood-gas-confirm-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: #1d5fbf;
}

.blood-gas-confirm-title {
  margin: 0;
  color: #172334;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
}

.blood-gas-confirm-status {
  display: inline-flex;
  align-items: center;
  height: 24px;
  margin-left: 6px;
  padding: 0 10px;
  border: 1px solid #f4c36a;
  border-radius: 5px;
  background: #fff8e8;
  color: #d48300;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.blood-gas-patient-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  width: fit-content;
  max-width: 100%;
  margin-bottom: 14px;
  padding: 8px 12px;
  border-radius: 5px;
  background: #eef4ff;
  color: #1f2d3d;
}

.blood-gas-patient-item {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  margin-right: 26px;
  color: #172334;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.blood-gas-patient-item:last-child {
  margin-right: 0;
}

.blood-gas-patient-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 17px;
  height: 17px;
  margin-right: 7px;
  color: #2f6fe4;
}

.blood-gas-table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e1e7ef;
  border-radius: 0;
}

.blood-gas-empty {
  padding: 16px 14px;
  border: 1px solid #dce8ee;
  border-radius: 6px;
  background: #fbfdff;
  color: #6b7785;
  font-size: 13px;
  line-height: 1.6;
}

.blood-gas-table {
  width: 100%;
  min-width: 620px;
  border-collapse: collapse;
  table-layout: fixed;
  background: #ffffff;
}

.blood-gas-table th {
  height: 34px;
  padding: 0 12px;
  border-right: 1px solid #e8edf3;
  border-bottom: 1px solid #e1e7ef;
  background: #f8fafc;
  color: #172334;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
}

.blood-gas-table th:last-child {
  border-right: none;
}

.blood-gas-table td {
  height: 34px;
  padding: 0 12px;
  border-right: 1px solid #e8edf3;
  border-bottom: 1px solid #e8edf3;
  color: #243247;
  font-size: 13px;
  font-weight: 500;
  vertical-align: middle;
}

.blood-gas-table td:last-child {
  border-right: none;
}

.blood-gas-table tr:last-child td {
  border-bottom: none;
}

.blood-gas-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  white-space: nowrap;
}

.blood-gas-status.normal {
  color: #15905c;
}

.blood-gas-status.low,
.blood-gas-status.criticalLow,
.blood-gas-status.high,
.blood-gas-status.criticalHigh {
  color: #d93025;
}

.blood-gas-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.blood-gas-confirm-button {
  height: 34px;
  min-width: 96px;
  padding: 0 18px;
  border: none;
  border-radius: 6px;
  background: #1d5fbf;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s ease, box-shadow 0.18s ease;
}

.blood-gas-confirm-button:hover {
  background: #1754ad;
  box-shadow: 0 6px 14px rgba(29, 95, 191, 0.22);
}

.blood-gas-confirm-button:active {
  background: #134a99;
}

.blood-gas-confirm-button:disabled {
  cursor: not-allowed;
  background: #9bb7dd;
  box-shadow: none;
}

@media (max-width: 680px) {
  .blood-gas-patient-strip {
    width: 100%;
    gap: 10px 16px;
  }

  .blood-gas-patient-item {
    margin-right: 0;
  }

  .blood-gas-actions {
    justify-content: stretch;
  }

  .blood-gas-confirm-button {
    width: 100%;
  }
}
`;

function getStatusText(status: BloodGasDataConfirmCardProps["metrics"][number]["status"]) {
  const statusMap = {
    normal: "正常",
    low: "↓ 偏低",
    high: "↑ 偏高",
    criticalLow: "↓ 危急低值",
    criticalHigh: "↑ 危急高值",
  };

  return statusMap[status] || "正常";
}

export function BloodGasDataConfirmCard({
  props,
}: {
  props: BloodGasDataConfirmCardProps;
}) {
  const metrics = Array.isArray(props.metrics) ? props.metrics.map(normalizeMetric) : [];

  const handleConfirm = () => {
    if (!metrics.length) return;

    const payload = {
      type: "bloodGasDataConfirm",
      confirmed: true,
      patient: props.patient,
      metrics,
    };

    console.log("血气数据确认：", payload);

    /**
     * 预留 AG-UI / A2UI action 接入位置：
     * 外层 renderer / chat 容器可监听该事件，
     * 然后通知 agent 继续生成血气分析报告。
     */
    window.dispatchEvent(
      new CustomEvent("blood-gas-data-confirm", {
        detail: payload,
      }),
    );
  };

  return (
    <section className="blood-gas-confirm-card">
      <style>{styles}</style>

      <div className="blood-gas-confirm-header">
        <span className="blood-gas-confirm-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path
              d="M8 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20h11A2.5 2.5 0 0 0 20 17.5V16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M9 12.5l2.1 2.1L20 5.7"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 8h6M8 16h3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <h3 className="blood-gas-confirm-title">{props.title || "数据确认"}</h3>

        <span className="blood-gas-confirm-status">
          {props.statusText || "待确认"}
        </span>
      </div>

      <div className="blood-gas-patient-strip">
        <div className="blood-gas-patient-item">
          <span className="blood-gas-patient-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
              <path
                d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M4.5 21a7.5 7.5 0 0 1 15 0"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          {props.patient.name}
        </div>

        <div className="blood-gas-patient-item">
          <span className="blood-gas-patient-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
              <path
                d="M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M5 21a7 7 0 0 1 14 0"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </span>
          {props.patient.gender} / {props.patient.age}
        </div>

        <div className="blood-gas-patient-item">
          <span className="blood-gas-patient-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
              <path
                d="M4 20V6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5V20"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M2.8 20h18.4M8 8h4M8 12h4M8 16h4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                d="M16 10h1.5A2.5 2.5 0 0 1 20 12.5V20"
                stroke="currentColor"
                strokeWidth="1.7"
              />
            </svg>
          </span>
          {props.patient.department}
        </div>
      </div>

      {metrics.length ? (
        <div className="blood-gas-table-wrap">
          <table className="blood-gas-table">
            <thead>
              <tr>
                <th>指标</th>
                <th>结果</th>
                <th>参考范围</th>
                <th>状态</th>
              </tr>
            </thead>

            <tbody>
              {metrics.map((metric, index) => (
                <tr key={`${metric.name}-${index}`}>
                  <td>{metric.name}</td>
                  <td>{metric.result}</td>
                  <td>{metric.referenceRange}</td>
                  <td>
                    <span className={`blood-gas-status ${metric.status}`}>
                      {getStatusText(metric.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="blood-gas-empty">
          当前确认数据为空，请先补充缺失的血气指标后再确认。
        </div>
      )}

      <div className="blood-gas-actions">
        <button
          className="blood-gas-confirm-button"
          type="button"
          onClick={handleConfirm}
          disabled={!metrics.length}
        >
          {props.confirmText || "确认无误"}
        </button>
      </div>
    </section>
  );
}
