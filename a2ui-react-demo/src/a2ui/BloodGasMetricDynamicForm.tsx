import { useMemo, useState } from "react";
import type { PropsOf } from "@copilotkit/a2ui-renderer";
import type { medicalCatalogDefinitions } from "./catalogDefinitions";

type BloodGasMetricDynamicFormProps = PropsOf<
  typeof medicalCatalogDefinitions,
  "BloodGasMetricDynamicForm"
>;

type MetricKey =
  | "pH"
  | "paCO2"
  | "hco3"
  | "be"
  | "paO2"
  | "saO2"
  | "fiO2"
  | "lac"
  | "na"
  | "k"
  | "cl"
  | "glucose";

type MetricGroupKey = "acidBase" | "oxygenation" | "electrolyte";

type MetricMeta = {
  key: MetricKey;
  label: string;
  unit?: string;
  group: MetricGroupKey;
  min?: number;
  max?: number;
};

const REFERENCE_RANGES: Record<MetricKey, string> = {
  pH: "7.35-7.45",
  paCO2: "35-45 mmHg",
  hco3: "22-27 mmol/L",
  be: "-3~+3 mmol/L",
  paO2: "80-100 mmHg",
  saO2: "95-100%",
  fiO2: "21-100%",
  lac: "0.5-2.2 mmol/L",
  na: "135-145 mmol/L",
  k: "3.5-5.5 mmol/L",
  cl: "98-106 mmol/L",
  glucose: "3.9-6.1 mmol/L",
};

const METRIC_GROUPS: Record<MetricGroupKey, string> = {
  acidBase: "酸碱平衡",
  oxygenation: "氧合状态",
  electrolyte: "代谢与电解质",
};

const BLOOD_GAS_METRICS: MetricMeta[] = [
  {
    key: "pH",
    label: "pH",
    group: "acidBase",
    min: 0,
    max: 14,
  },
  {
    key: "paCO2",
    label: "PaCO2",
    unit: "mmHg",
    group: "acidBase",
    min: 0,
    max: 200,
  },
  {
    key: "hco3",
    label: "HCO3-",
    unit: "mmol/L",
    group: "acidBase",
    min: 0,
    max: 80,
  },
  {
    key: "be",
    label: "BE",
    unit: "mmol/L",
    group: "acidBase",
    min: -50,
    max: 50,
  },
  {
    key: "paO2",
    label: "PaO2",
    unit: "mmHg",
    group: "oxygenation",
    min: 0,
    max: 700,
  },
  {
    key: "saO2",
    label: "SaO2",
    unit: "%",
    group: "oxygenation",
    min: 0,
    max: 100,
  },
  {
    key: "fiO2",
    label: "FiO2",
    unit: "%",
    group: "oxygenation",
    min: 0,
    max: 100,
  },
  {
    key: "lac",
    label: "Lactate",
    unit: "mmol/L",
    group: "electrolyte",
    min: 0,
    max: 30,
  },
  {
    key: "na",
    label: "Na+",
    unit: "mmol/L",
    group: "electrolyte",
    min: 80,
    max: 200,
  },
  {
    key: "k",
    label: "K+",
    unit: "mmol/L",
    group: "electrolyte",
    min: 0,
    max: 20,
  },
  {
    key: "cl",
    label: "Cl-",
    unit: "mmol/L",
    group: "electrolyte",
    min: 50,
    max: 180,
  },
  {
    key: "glucose",
    label: "Glucose",
    unit: "mmol/L",
    group: "electrolyte",
    min: 0,
    max: 60,
  },
];

const styles = `
.blood-gas-form,
.blood-gas-form * {
  box-sizing: border-box;
  max-width: 100%;
}

.blood-gas-form {
  width: 100%;
  min-width: 0;
  padding: 12px 14px 16px;
  overflow: hidden;
  border: 1px solid #dce8ee;
  border-radius: 12px;
  background: #ffffff;
  color: #172334;
  box-shadow: 0 10px 28px rgba(26, 48, 73, 0.06);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", Arial, sans-serif;
}

.blood-gas-title {
  margin: 0 0 10px;
  color: #1d5fbf;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
}

.blood-gas-subtitle {
  margin: -4px 0 10px;
  color: #6b7785;
  font-size: 12px;
  line-height: 1.5;
}

.blood-gas-notice {
  margin: 0 0 12px;
  padding: 8px 10px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #eff6ff;
  color: #1e4f9a;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}

.blood-gas-group {
  margin-top: 8px;
  padding: 10px 10px 12px;
  border: 1px solid #dce8ee;
  border-radius: 8px;
  background: #fbfdff;
}

.blood-gas-group:first-of-type {
  margin-top: 0;
}

.blood-gas-group-title {
  margin: 0 0 8px;
  color: #1d5fbf;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
}

.blood-gas-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px 14px;
}

.blood-gas-field {
  min-width: 0;
}

.blood-gas-label {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 7px;
  color: #172334;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.blood-gas-required {
  color: #e5484d;
  font-size: 12px;
  font-weight: 700;
}

.blood-gas-input-wrap {
  display: flex;
  width: 100%;
  height: 32px;
  overflow: hidden;
  border: 1px solid #d9e1ec;
  border-radius: 5px;
  background: #ffffff;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.blood-gas-input-wrap:focus-within {
  border-color: #2f7de1;
  box-shadow: 0 0 0 3px rgba(47, 125, 225, 0.12);
}

.blood-gas-input {
  flex: 1;
  min-width: 0;
  height: 30px;
  padding: 0 10px;
  border: none;
  outline: none;
  background: transparent;
  color: #172334;
  font-size: 13px;
  line-height: 30px;
}

.blood-gas-input::placeholder {
  color: #a9b4c2;
}

.blood-gas-unit {
  flex: none;
  min-width: 42px;
  padding: 0 8px;
  border-left: 1px solid #e4ebf2;
  color: #334155;
  background: #fafcff;
  font-size: 12px;
  line-height: 30px;
  text-align: center;
  white-space: nowrap;
}

.blood-gas-error {
  margin-top: 5px;
  color: #e5484d;
  font-size: 12px;
  line-height: 1.35;
}

.blood-gas-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.blood-gas-submit {
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

.blood-gas-submit:hover {
  background: #1754ad;
  box-shadow: 0 6px 14px rgba(29, 95, 191, 0.22);
}

.blood-gas-submit:active {
  background: #134a99;
}

@media (max-width: 920px) {
  .blood-gas-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .blood-gas-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 460px) {
  .blood-gas-grid {
    grid-template-columns: 1fr;
  }

  .blood-gas-actions {
    justify-content: stretch;
  }

  .blood-gas-submit {
    width: 100%;
  }
}
`;

export function BloodGasMetricDynamicForm({
  props,
}: {
  props: BloodGasMetricDynamicFormProps;
}) {
  const visibleMetrics = useMemo(() => {
    const missingMetricSet = new Set<MetricKey>(props.missingMetrics as MetricKey[]);

    return BLOOD_GAS_METRICS.filter((metric) => missingMetricSet.has(metric.key));
  }, [props.missingMetrics]);

  const [form, setForm] = useState<Record<MetricKey, string>>({
    pH: "",
    paCO2: "",
    hco3: "",
    be: "",
    paO2: "",
    saO2: "",
    fiO2: "",
    lac: "",
    na: "",
    k: "",
    cl: "",
    glucose: "",
  });

  const [errors, setErrors] = useState<Partial<Record<MetricKey, string>>>({});

  const updateField = (key: MetricKey, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<MetricKey, string>> = {};

    visibleMetrics.forEach((metric) => {
      const rawValue = form[metric.key].trim();

      if (!rawValue) {
        nextErrors[metric.key] = `请输入${metric.label}`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const groupedMetrics = useMemo(() => {
    return visibleMetrics.reduce<Record<MetricGroupKey, MetricMeta[]>>(
      (result, metric) => {
        result[metric.group].push(metric);
        return result;
      },
      {
        acidBase: [],
        oxygenation: [],
        electrolyte: [],
      },
    );
  }, [visibleMetrics]);

  const handleSubmit = () => {
    if (!validate()) return;

    const metrics = visibleMetrics.map((metric) => {
      const value = form[metric.key].trim();
      const result = metric.unit ? `${value} ${metric.unit}` : value;

      return {
        key: metric.key,
        name: metric.label,
        result,
        value,
        unit: metric.unit,
        referenceRange: REFERENCE_RANGES[metric.key],
        status: "normal" as const,
      };
    });

    const values = visibleMetrics.reduce<
      Partial<Record<MetricKey, { value: string; unit?: string }>>
    >((result, metric) => {
      result[metric.key] = {
        value: form[metric.key].trim(),
        unit: metric.unit,
      };
      return result;
    }, {});

    const payload = {
      type: "bloodGasMetrics",
      values,
      metrics,
    };

    console.log("血气指标补全数据：", payload);

    /**
     * 预留 AG-UI / A2UI action 接入位置：
     * 你的 renderer 或外层 chat 容器可以监听这个事件，
     * 然后把结构化数据提交给 agent，继续生成报告。
     */
    window.dispatchEvent(
      new CustomEvent("blood-gas-metrics-submit", {
        detail: payload,
      }),
    );
  };

  return (
    <section className="blood-gas-form">
      <style>{styles}</style>

      <h3 className="blood-gas-title">{props.title || "血气分析指标"}</h3>

      {props.subtitle ? (
        <p className="blood-gas-subtitle">{props.subtitle}</p>
      ) : null}

      <p className="blood-gas-notice">
        生成血气分析报告前，请先补全下方缺失指标；提交后会进入数据确认。
      </p>

      {(Object.keys(METRIC_GROUPS) as MetricGroupKey[]).map((groupKey) => {
        const metrics = groupedMetrics[groupKey];

        if (!metrics.length) return null;

        return (
          <div className="blood-gas-group" key={groupKey}>
            <h4 className="blood-gas-group-title">{METRIC_GROUPS[groupKey]}</h4>

            <div className="blood-gas-grid">
              {metrics.map((metric) => (
                <div className="blood-gas-field" key={metric.key}>
                  <label className="blood-gas-label">
                    {metric.label}
                    <span className="blood-gas-required">*</span>
                  </label>

                  <div className="blood-gas-input-wrap">
                    <input
                      className="blood-gas-input"
                      value={form[metric.key]}
                      placeholder="——"
                      onChange={(event) =>
                        updateField(metric.key, event.target.value)
                      }
                    />

                    {metric.unit ? (
                      <span className="blood-gas-unit">{metric.unit}</span>
                    ) : null}
                  </div>

                  {errors[metric.key] ? (
                    <div className="blood-gas-error">{errors[metric.key]}</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="blood-gas-actions">
        <button className="blood-gas-submit" type="button" onClick={handleSubmit}>
          {props.submitText || "提交"}
        </button>
      </div>
    </section>
  );
}
