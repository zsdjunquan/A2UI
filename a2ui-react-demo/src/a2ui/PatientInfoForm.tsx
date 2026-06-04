import { useState } from "react";
import type { PropsOf } from "@copilotkit/a2ui-renderer";
import type { medicalCatalogDefinitions } from "./catalogDefinitions";

type PatientInfoFormProps = PropsOf<typeof medicalCatalogDefinitions, "PatientInfoForm">;

type PatientFormValue = {
  patientName: string;
  gender: "男" | "女" | "";
  age: string;
  ageUnit: "岁" | "月" | "周" | "日" | "";
  department: string;
};

const styles = `
.patient-info-form,
.patient-info-form * {
  box-sizing: border-box;
  max-width: 100%;
}

.patient-info-form {
  width: 100%;
  min-width: 0;
  margin: 8px 0;
  padding: 14px 16px 16px;
  overflow: hidden;
  border: 1px solid #dce8ee;
  border-radius: 14px;
  background: #ffffff;
  color: #172334;
  box-shadow: 0 10px 28px rgba(26, 48, 73, 0.06);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", Arial, sans-serif;
}

.patient-info-title {
  margin: 0 0 12px;
  color: #1d5fbf;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
}

.patient-info-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.8fr 0.7fr 1fr;
  gap: 18px;
  align-items: start;
}

.patient-info-item {
  min-width: 0;
}

.patient-info-label {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 8px;
  color: #172334;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}

.patient-info-required {
  color: #e5484d;
  font-size: 13px;
  font-weight: 700;
}

.patient-info-input,
.patient-info-select {
  width: 100%;
  height: 34px;
  padding: 0 12px;
  border: 1px solid #d9e1ec;
  border-radius: 5px;
  outline: none;
  background-color: #ffffff;
  color: #172334;
  font-size: 13px;
  line-height: 34px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.patient-info-input::placeholder {
  color: #a9b4c2;
}

.patient-info-select {
  appearance: none;
  padding-right: 32px;
  cursor: pointer;
  background-image:
    linear-gradient(45deg, transparent 50%, #7b8794 50%),
    linear-gradient(135deg, #7b8794 50%, transparent 50%);
  background-position:
    calc(100% - 18px) 14px,
    calc(100% - 13px) 14px;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}

.patient-info-select.is-placeholder {
  color: #a9b4c2;
}

.patient-info-input:focus,
.patient-info-select:focus {
  border-color: #2f7de1;
  box-shadow: 0 0 0 3px rgba(47, 125, 225, 0.12);
}

.patient-info-error {
  margin-top: 6px;
  color: #e5484d;
  font-size: 12px;
  line-height: 1.3;
}

.patient-info-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.patient-info-submit {
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

.patient-info-submit:hover {
  background: #1754ad;
  box-shadow: 0 6px 14px rgba(29, 95, 191, 0.22);
}

.patient-info-submit:active {
  background: #134a99;
}

@media (max-width: 820px) {
  .patient-info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .patient-info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .patient-info-actions {
    justify-content: stretch;
  }

  .patient-info-submit {
    width: 100%;
  }
}
`;

export function PatientInfoForm({ props }: { props: PatientInfoFormProps }) {
  const [form, setForm] = useState<PatientFormValue>({
    patientName: props.initialPatient?.patientName || "",
    gender: props.initialPatient?.gender || "",
    age: props.initialPatient?.age || "",
    ageUnit: props.initialPatient?.ageUnit || "岁",
    department: props.initialPatient?.department || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormValue, string>>>({});

  const updateField = <K extends keyof PatientFormValue>(
    key: K,
    value: PatientFormValue[K],
  ) => {
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
    const nextErrors: Partial<Record<keyof PatientFormValue, string>> = {};

    if (!form.patientName.trim()) {
      nextErrors.patientName = "请输入患者姓名";
    }

    if (!form.gender) {
      nextErrors.gender = "请选择性别";
    }

    if (!form.age.trim()) {
      nextErrors.age = "请输入年龄";
    }

    if (!form.ageUnit) {
      nextErrors.ageUnit = "请选择年龄单位";
    }

    if (!form.department.trim()) {
      nextErrors.department = "请输入科室";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const value = {
      patientName: form.patientName.trim(),
      gender: form.gender,
      age: form.age.trim(),
      ageUnit: form.ageUnit,
      department: form.department.trim(),
    };

    console.log("患者基础信息：", value);

    window.dispatchEvent(
      new CustomEvent("patient-info-submit", {
        detail: {
          type: "patientInfo",
          value,
        },
      }),
    );
  };

  return (
    <section className="patient-info-form">
      <style>{styles}</style>

      <h3 className="patient-info-title">{props.title || "基础信息"}</h3>

      <div className="patient-info-grid">
        <div className="patient-info-item">
          <label className="patient-info-label">
            患者姓名 <span className="patient-info-required">*</span>
          </label>
          <input
            className="patient-info-input"
            value={form.patientName}
            placeholder={props.namePlaceholder || "请输入患者姓名"}
            onChange={(event) => updateField("patientName", event.target.value)}
          />
          {errors.patientName && (
            <div className="patient-info-error">{errors.patientName}</div>
          )}
        </div>

        <div className="patient-info-item">
          <label className="patient-info-label">
            性别 <span className="patient-info-required">*</span>
          </label>
          <select
            className={`patient-info-select ${form.gender ? "" : "is-placeholder"}`}
            value={form.gender}
            onChange={(event) =>
              updateField("gender", event.target.value as PatientFormValue["gender"])
            }
          >
            <option value="">{props.genderPlaceholder || "请选择性别"}</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
          {errors.gender && <div className="patient-info-error">{errors.gender}</div>}
        </div>

        <div className="patient-info-item">
          <label className="patient-info-label">
            年龄 <span className="patient-info-required">*</span>
          </label>
          <input
            className="patient-info-input"
            value={form.age}
            placeholder={props.agePlaceholder || "请输入年龄"}
            onChange={(event) => updateField("age", event.target.value)}
          />
          {errors.age && <div className="patient-info-error">{errors.age}</div>}
        </div>

        <div className="patient-info-item">
          <label className="patient-info-label">
            年龄单位 <span className="patient-info-required">*</span>
          </label>
          <select
            className={`patient-info-select ${form.ageUnit ? "" : "is-placeholder"}`}
            value={form.ageUnit}
            onChange={(event) =>
              updateField("ageUnit", event.target.value as PatientFormValue["ageUnit"])
            }
          >
            <option value="">{props.unitPlaceholder || "请选择单位"}</option>
            <option value="岁">岁</option>
            <option value="月">月</option>
            <option value="周">周</option>
            <option value="日">日</option>
          </select>
          {errors.ageUnit && <div className="patient-info-error">{errors.ageUnit}</div>}
        </div>

        <div className="patient-info-item">
          <label className="patient-info-label">
            科室 <span className="patient-info-required">*</span>
          </label>
          <input
            className="patient-info-input"
            value={form.department}
            placeholder={props.departmentPlaceholder || "请输入科室"}
            onChange={(event) => updateField("department", event.target.value)}
          />
          {errors.department && (
            <div className="patient-info-error">{errors.department}</div>
          )}
        </div>
      </div>

      <div className="patient-info-actions">
        <button className="patient-info-submit" type="button" onClick={handleSubmit}>
          {props.submitText || "提交"}
        </button>
      </div>
    </section>
  );
}
