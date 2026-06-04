import { Activity, AlertTriangle, CheckCircle2, CircleAlert, Gauge } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PropsOf } from "@copilotkit/a2ui-renderer";
import type { medicalCatalogDefinitions } from "./catalogDefinitions";

type MedicalMetricChartProps = PropsOf<typeof medicalCatalogDefinitions, "MedicalMetricChart">;
type Metric = MedicalMetricChartProps["metrics"][number];

const styles = `
.medical-visual-card,
.medical-visual-card * {
  box-sizing: border-box;
  max-width: 100%;
}

.medical-visual-card {
  width: 100%;
  min-width: 0;
  margin: 8px 0;
  padding: 20px;
  overflow: hidden;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
  border: 1px solid #dce8ee;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(26, 48, 73, 0.08);
  color: #172334;
}

.medical-visual-card .medical-visual-header,
.medical-visual-card .medical-visual-title,
.medical-visual-card .medical-metric-item-top,
.medical-visual-card .medical-status-chip {
  display: flex;
  align-items: center;
}

.medical-visual-card .medical-visual-header,
.medical-visual-card .medical-metric-item-top {
  justify-content: space-between;
}

.medical-visual-card .medical-visual-header {
  gap: 18px;
  margin-bottom: 12px;
}

.medical-visual-card .medical-visual-title {
  gap: 9px;
  color: #087f8c;
}

.medical-visual-card .medical-visual-title h3 {
  margin: 0;
  color: #172334;
  font-size: 16px;
  line-height: 1.35;
}

.medical-visual-card .medical-visual-header p {
  margin: 6px 0 0;
  color: #718195;
  font-size: 13px;
  line-height: 1.55;
}

.medical-visual-card .medical-risk-score {
  flex: 0 0 auto;
  min-width: 74px;
  padding: 9px 12px;
  border-radius: 14px;
  background: linear-gradient(145deg, #e9f8f7, #f6fcfc);
  border: 1px solid #d4efeb;
  text-align: center;
}

.medical-visual-card .medical-risk-score strong {
  display: block;
  color: #087f8c;
  font-size: 22px;
  line-height: 1;
}

.medical-visual-card .medical-risk-score span {
  display: block;
  margin-top: 5px;
  color: #6c7e90;
  font-size: 11px;
}

.medical-visual-card .medical-chart-area {
  margin: 4px -4px 14px;
  padding: 6px 0;
  border-radius: 14px;
  background: linear-gradient(180deg, #fbfdfd, #f7fbfc);
}

.medical-visual-card .medical-chart-area .recharts-responsive-container > div {
  width: 100% !important;
}

.medical-visual-card .medical-metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.medical-visual-card .medical-metric-item {
  min-width: 0;
  padding: 13px 14px;
  border: 1px solid #e7eff3;
  border-radius: 14px;
  background: #fbfdfd;
}

.medical-visual-card .medical-metric-item-top {
  gap: 8px;
  color: #607184;
  font-size: 12px;
}

.medical-visual-card .medical-status-chip {
  gap: 4px;
  flex: 0 0 auto;
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.medical-visual-card .medical-metric-item > strong {
  display: block;
  margin-top: 8px;
  color: #172334;
  font-size: 18px;
  line-height: 1.2;
}

.medical-visual-card .medical-metric-item small {
  display: block;
  margin-top: 6px;
  color: #8a99a9;
  font-size: 11px;
}

.medical-visual-card .medical-metric-item p {
  margin: 6px 0 0;
  color: #68798c;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 680px) {
  .medical-visual-card .medical-metric-grid {
    grid-template-columns: 1fr;
  }

  .medical-visual-card {
    padding: 16px;
  }

  .medical-visual-card .medical-visual-header {
    align-items: flex-start;
  }

  .medical-visual-card .medical-risk-score {
    min-width: 66px;
  }
}
`;

const statusMeta = {
  normal: { color: "#0f9f78", soft: "#e8f8f2", label: "正常", icon: CheckCircle2 },
  warning: { color: "#d99416", soft: "#fff7df", label: "需关注", icon: AlertTriangle },
  critical: { color: "#df4d5b", soft: "#fff0f1", label: "高风险", icon: CircleAlert },
  info: { color: "#3b82f6", soft: "#edf5ff", label: "信息", icon: Activity },
} as const;

function formatMetricValue(metric: Metric) {
  return metric.displayValue ?? `${metric.value}${metric.unit ? ` ${metric.unit}` : ""}`;
}

function getChartValue(metric: Metric) {
  const reference = metric.referenceMax ?? metric.referenceMin;
  if (reference != null && reference > 0) {
    return Math.min(Math.max((metric.value / reference) * 100, 4), 200);
  }
  return Math.max(metric.value, 0);
}

function getReferenceText(metric: Metric) {
  if (metric.referenceMin != null && metric.referenceMax != null) {
    return `参考 ${metric.referenceMin} - ${metric.referenceMax}${metric.unit ? ` ${metric.unit}` : ""}`;
  }
  if (metric.referenceMax != null) {
    return `参考 ≤ ${metric.referenceMax}${metric.unit ? ` ${metric.unit}` : ""}`;
  }
  if (metric.referenceMin != null) {
    return `参考 ≥ ${metric.referenceMin}${metric.unit ? ` ${metric.unit}` : ""}`;
  }
  return metric.note ?? statusMeta[metric.status].label;
}

export function MedicalMetricChart({ props }: { props: MedicalMetricChartProps }) {
  const chartData = props.metrics.map((metric) => ({
    ...metric,
    chartValue: getChartValue(metric),
    formattedValue: formatMetricValue(metric),
  }));

  return (
    <section className="medical-visual-card" aria-label={props.title}>
      <style>{styles}</style>
      <div className="medical-visual-header">
        <div>
          <div className="medical-visual-title">
            <Gauge size={18} aria-hidden="true" />
            <h3>{props.title}</h3>
          </div>
          {props.subtitle && <p>{props.subtitle}</p>}
        </div>

        {props.riskScore != null && (
          <div className="medical-risk-score" aria-label={`${props.riskLabel ?? "综合评分"} ${props.riskScore}`}>
            <strong>{Math.round(props.riskScore)}</strong>
            <span>{props.riskLabel ?? "综合评分"}</span>
          </div>
        )}
      </div>

      <div className="medical-chart-area" aria-hidden="true">
        <ResponsiveContainer width="100%" height={Math.max(210, props.metrics.length * 44)}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
            <CartesianGrid stroke="#e8eff3" strokeDasharray="3 5" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={88}
              tick={{ fill: "#536578", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(8, 127, 140, 0.05)" }}
              formatter={(_, __, item) => [item.payload.formattedValue, item.payload.label]}
              contentStyle={{
                border: "1px solid #dce8ee",
                borderRadius: 12,
                boxShadow: "0 12px 28px rgba(26, 48, 73, 0.12)",
              }}
            />
            <Bar dataKey="chartValue" radius={[0, 8, 8, 0]} barSize={16}>
              {chartData.map((metric) => (
                <Cell key={metric.label} fill={statusMeta[metric.status].color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="medical-metric-grid">
        {props.metrics.map((metric) => {
          const meta = statusMeta[metric.status];
          const StatusIcon = meta.icon;
          return (
            <article className="medical-metric-item" key={metric.label}>
              <div className="medical-metric-item-top">
                <span>{metric.label}</span>
                <span className="medical-status-chip" style={{ color: meta.color, backgroundColor: meta.soft }}>
                  <StatusIcon size={13} aria-hidden="true" />
                  {meta.label}
                </span>
              </div>
              <strong>{formatMetricValue(metric)}</strong>
              <small>{getReferenceText(metric)}</small>
              {metric.note && <p>{metric.note}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
