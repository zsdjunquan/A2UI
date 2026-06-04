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
