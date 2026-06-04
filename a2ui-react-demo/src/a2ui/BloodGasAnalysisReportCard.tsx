import type { PropsOf } from "@copilotkit/a2ui-renderer";
import type { medicalCatalogDefinitions } from "./catalogDefinitions";
import { getBloodGasStatusByRange } from "./bloodGasStatus";

type BloodGasAnalysisReportCardProps = PropsOf<
  typeof medicalCatalogDefinitions,
  "BloodGasAnalysisReportCard"
>;

type ReportMetric = BloodGasAnalysisReportCardProps["metrics"][number];

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

function getText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function normalizeMetric(metric: ReportMetric): ReportMetric {
  const rawMetric = metric as ReportMetric & {
    value?: unknown;
    displayValue?: unknown;
    resultValue?: unknown;
  };
  const name = getText(metric.name) || "未命名指标";
  const result =
    getText(metric.result) ||
    getText(rawMetric.displayValue) ||
    getText(rawMetric.resultValue) ||
    getText(rawMetric.value) ||
    "未提供";

  return {
    ...metric,
    name,
    result,
    referenceRange: getText(metric.referenceRange) || referenceRanges[name] || "未提供",
    status: getBloodGasStatusByRange(
      result,
      getText(metric.referenceRange) || referenceRanges[name] || "",
      metric.status || "normal",
    ),
  };
}

const styles = `
.blood-gas-report,
.blood-gas-report * {
  box-sizing: border-box;
  max-width: 100%;
}

.blood-gas-report {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border: 1px solid #d6e4f5;
  border-radius: 10px;
  background: #ffffff;
  color: #16233d;
  box-shadow: 0 10px 28px rgba(26, 48, 73, 0.08);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", Arial, sans-serif;
}

.blood-gas-report-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 22px 14px;
  background: linear-gradient(135deg, #2f7de1 0%, #2867d8 55%, #1e56c7 100%);
  color: #ffffff;
}

.blood-gas-report-title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.blood-gas-report-conclusion {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  opacity: 0.95;
}

.blood-gas-report-risk {
  flex: none;
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 18px;
  border-radius: 6px;
  background: #ef4444;
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  white-space: nowrap;
}

.blood-gas-report-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  padding: 16px 22px 20px;
}

.blood-gas-report-left,
.blood-gas-report-right {
  min-width: 0;
}

.blood-gas-section {
  margin-bottom: 16px;
  min-width: 0;
}

.blood-gas-section:last-child {
  margin-bottom: 0;
}

.blood-gas-section-title {
  margin: 0 0 8px;
  color: #0f1f3d;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.4;
}

.blood-gas-info-box {
  padding: 10px 12px;
  border: 1px solid #dce8ee;
  border-radius: 6px;
  background: #fbfdff;
}

.blood-gas-info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 20px;
}

.blood-gas-info-item {
  min-width: 0;
  color: #16233d;
  font-size: 12px;
  line-height: 1.6;
}

.blood-gas-info-label {
  color: #475569;
  margin-right: 6px;
}

.blood-gas-info-value {
  color: #0f1f3d;
  font-weight: 700;
}

.blood-gas-table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e1e7ef;
  border-radius: 6px;
}

.blood-gas-table {
  width: 100%;
  min-width: 520px;
  border-collapse: collapse;
  table-layout: fixed;
  background: #ffffff;
}

.blood-gas-table th {
  height: 30px;
  padding: 0 10px;
  border-right: 1px solid #e8edf3;
  border-bottom: 1px solid #e1e7ef;
  background: #f3f7fc;
  color: #16233d;
  font-size: 12px;
  font-weight: 800;
  text-align: left;
}

.blood-gas-table td {
  height: 30px;
  padding: 0 10px;
  border-right: 1px solid #e8edf3;
  border-bottom: 1px solid #e8edf3;
  color: #16233d;
  font-size: 12px;
  font-weight: 600;
}

.blood-gas-table th:last-child,
.blood-gas-table td:last-child {
  border-right: none;
}

.blood-gas-table tr:last-child td {
  border-bottom: none;
}

.blood-gas-status {
  font-weight: 800;
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

.blood-gas-list {
  margin: 0;
  padding-left: 18px;
  color: #16233d;
  font-size: 13px;
  line-height: 1.9;
  font-weight: 600;
}

.blood-gas-ai-box {
  padding: 10px 12px;
  border-top: 1px solid #e5edf7;
  border-bottom: 1px solid #e5edf7;
  color: #16233d;
  font-size: 13px;
  line-height: 1.8;
  font-weight: 600;
}

@media (max-width: 920px) {
  .blood-gas-report-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .blood-gas-report-header {
    flex-direction: column;
  }

  .blood-gas-report-risk {
    align-self: flex-start;
  }

  .blood-gas-info-grid {
    grid-template-columns: 1fr;
  }
}
`;

function getStatusText(
  status: BloodGasAnalysisReportCardProps["metrics"][number]["status"],
) {
  const statusMap = {
    normal: "正常",
    low: "偏低",
    high: "偏高",
    criticalLow: "危急低值",
    criticalHigh: "危急高值",
  };

  return statusMap[status] || "正常";
}

export function BloodGasAnalysisReportCard({
  props,
}: {
  props: BloodGasAnalysisReportCardProps;
}) {
  const patient = props.patient || {
    name: "未提供",
    gender: "未提供",
    age: "未提供",
    department: "未提供",
  };
  const testInfo = props.testInfo || {
    sampleType: "未提供",
    samplingTime: "未提供",
  };
  const metrics = Array.isArray(props.metrics) ? props.metrics.map(normalizeMetric) : [];
  const abnormalSummary = Array.isArray(props.abnormalSummary)
    ? props.abnormalSummary
    : ["暂无可展示的异常摘要。"];
  const suggestions = Array.isArray(props.suggestions)
    ? props.suggestions
    : ["请结合原始报告和临床表现，由医生进一步判断。"];
  const aiAnalysis = getText(props.aiAnalysis);

  return (
    <section className="blood-gas-report">
      <style>{styles}</style>

      <header className="blood-gas-report-header">
        <div>
          <h2 className="blood-gas-report-title">
            {props.title || "血气分析报告"}
          </h2>
          <p className="blood-gas-report-conclusion">
            初步结论：{props.conclusion}
          </p>
        </div>

        <span className="blood-gas-report-risk">
          {props.riskLabel || "中风险"}
        </span>
      </header>

      <div className="blood-gas-report-body">
        <div className="blood-gas-report-left">
          <section className="blood-gas-section">
            <h3 className="blood-gas-section-title">一、患者信息</h3>

            <div className="blood-gas-info-box">
              <div className="blood-gas-info-grid">
                <div className="blood-gas-info-item">
                  <span className="blood-gas-info-label">姓名：</span>
                  <span className="blood-gas-info-value">{patient.name}</span>
                </div>

                <div className="blood-gas-info-item">
                  <span className="blood-gas-info-label">性别：</span>
                  <span className="blood-gas-info-value">{patient.gender}</span>
                </div>

                <div className="blood-gas-info-item">
                  <span className="blood-gas-info-label">年龄：</span>
                  <span className="blood-gas-info-value">{patient.age}</span>
                </div>

                <div className="blood-gas-info-item">
                  <span className="blood-gas-info-label">科室：</span>
                  <span className="blood-gas-info-value">
                    {patient.department}
                  </span>
                </div>

                {patient.ward ? (
                  <div className="blood-gas-info-item">
                    <span className="blood-gas-info-label">病区：</span>
                    <span className="blood-gas-info-value">{patient.ward}</span>
                  </div>
                ) : null}

                {patient.bedNo ? (
                  <div className="blood-gas-info-item">
                    <span className="blood-gas-info-label">床号：</span>
                    <span className="blood-gas-info-value">{patient.bedNo}</span>
                  </div>
                ) : null}

                {patient.diagnosis ? (
                  <div
                    className="blood-gas-info-item"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <span className="blood-gas-info-label">临床诊断：</span>
                    <span className="blood-gas-info-value">
                      {patient.diagnosis}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="blood-gas-section">
            <h3 className="blood-gas-section-title">二、检测信息</h3>

            <div className="blood-gas-info-box">
              <div className="blood-gas-info-grid">
                <div className="blood-gas-info-item">
                  <span className="blood-gas-info-label">标本类型：</span>
                  <span className="blood-gas-info-value">
                    {testInfo.sampleType}
                  </span>
                </div>

                <div className="blood-gas-info-item">
                  <span className="blood-gas-info-label">采样时间：</span>
                  <span className="blood-gas-info-value">
                    {testInfo.samplingTime}
                  </span>
                </div>

                {testInfo.oxygenMethod ? (
                  <div className="blood-gas-info-item">
                    <span className="blood-gas-info-label">吸氧方式：</span>
                    <span className="blood-gas-info-value">
                      {testInfo.oxygenMethod}
                    </span>
                  </div>
                ) : null}

                {testInfo.fiO2 ? (
                  <div className="blood-gas-info-item">
                    <span className="blood-gas-info-label">FiO₂：</span>
                    <span className="blood-gas-info-value">{testInfo.fiO2}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="blood-gas-section">
            <h3 className="blood-gas-section-title">三、血气指标</h3>

            <div className="blood-gas-table-wrap">
              <table className="blood-gas-table">
                <thead>
                  <tr>
                    <th>指标</th>
                    <th>结果</th>
                    <th>参考范围</th>
                    <th>单位</th>
                    <th>状态</th>
                  </tr>
                </thead>

                <tbody>
                  {metrics.map((metric, index) => (
                    <tr key={`${metric.name}-${index}`}>
                      <td>{metric.name}</td>
                      <td>{metric.result}</td>
                      <td>{metric.referenceRange}</td>
                      <td>{metric.unit || "—"}</td>
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
          </section>
        </div>

        <div className="blood-gas-report-right">
          <section className="blood-gas-section">
            <h3 className="blood-gas-section-title">四、异常摘要</h3>

            <ul className="blood-gas-list">
              {abnormalSummary.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="blood-gas-section">
            <h3 className="blood-gas-section-title">五、AI 初步分析</h3>

            <div className="blood-gas-ai-box">{aiAnalysis}</div>
          </section>

          <section className="blood-gas-section">
            <h3 className="blood-gas-section-title">六、建议</h3>

            <ol className="blood-gas-list">
              {suggestions.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </section>
  );
}
