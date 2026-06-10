export type Option = {
  label: string;
  value: string;
};

export type BasicInfoFieldKey =
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

export type BasicInfoValue = {
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

export type BasicInfoToolArgs = {
  title?: string;
  submitText?: string;
  agePlaceholder?: string;
  fields?: BasicInfoFieldKey[];
  departmentOptions?: Option[];
  initialValue?: Partial<BasicInfoValue>;
};

export type Indicator = {
  key: string;
  project: string;
  unit: string;
  referenceRange: string;
  min?: number;
  max?: number;
};

export type InspectionIndicatorsToolArgs = {
  title?: string;
  submitText?: string;
  tableHeight?: number;
  fields?: string[];
  indicators?: Indicator[];
  initialResults?: Record<string, string>;
};

export const fieldKeys: BasicInfoFieldKey[] = [
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

export const defaultBasicInfoValue: BasicInfoValue = {
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

export const ageUnitOptions: Option[] = [
  { label: "岁", value: "岁" },
  { label: "月", value: "月" },
  { label: "天", value: "天" },
  { label: "时", value: "时" },
];

export const defaultDepartmentOptions: Option[] = [
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

export const defaultIndicators: Indicator[] = [
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

export function getAbnormalStatus(record: Indicator, rawValue: string | undefined) {
  if (rawValue === undefined || rawValue === null || rawValue.trim() === "") {
    return "";
  }

  const value = Number(rawValue);

  if (Number.isNaN(value) || record.min === undefined || record.max === undefined) {
    return "待判断";
  }

  if (value < record.min) return "偏低";
  if (value > record.max) return "偏高";

  return "正常";
}
