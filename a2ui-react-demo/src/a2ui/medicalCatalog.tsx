import { createCatalog } from "@copilotkit/a2ui-renderer";
import { medicalCatalogDefinitions } from "./catalogDefinitions";
import { MedicalMetricChart } from "./MedicalMetricChart";
import { NodeAnswerCard } from "./NodeAnswerCard";
import { BloodGasAnalysisReportCard } from "./BloodGasAnalysisReportCard";
import { BloodGasDataConfirmCard } from "./BloodGasDataConfirmCard";
import { BloodGasMetricDynamicForm } from "./BloodGasMetricDynamicForm";
import { PatientInfoForm } from "./PatientInfoForm";

export const MEDICAL_CATALOG_ID = "https://example.local/a2ui/medical-catalog/v1";

// A2UI 自定义组件注册入口：
// 1. catalogDefinitions.ts 负责声明模型可见的组件 schema。
// 2. 这里的 renderers 负责把组件名映射到真正的 React 组件。
// 3. App.tsx 还必须把同一个 medicalCatalog 同时传给 CopilotKit 和 createA2UIMessageRenderer。
export const medicalCatalog = createCatalog(
  medicalCatalogDefinitions,
  {
    MedicalMetricChart: ({ props }) => <MedicalMetricChart props={props} />,
    NodeAnswerCard: ({ props }) => <NodeAnswerCard props={props} />,
    BloodGasAnalysisReportCard: ({ props }) => <BloodGasAnalysisReportCard props={props} />,
    BloodGasDataConfirmCard: ({ props }) => <BloodGasDataConfirmCard props={props} />,
    BloodGasMetricDynamicForm: ({ props }) => <BloodGasMetricDynamicForm props={props} />,
    PatientInfoForm: ({ props }) => <PatientInfoForm props={props} />,
  },
  {
    // 后端生成 createSurface 时应使用这个 catalogId，否则会退回 Basic Catalog，无法命中自定义组件。
    catalogId: MEDICAL_CATALOG_ID,
    // 保留 Basic Catalog，模型仍可在自定义医疗组件之外使用 Column、Text、Card 等基础组件。
    includeBasicCatalog: true,
  },
);
