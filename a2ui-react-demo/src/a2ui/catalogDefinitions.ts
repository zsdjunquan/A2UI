import type { CatalogDefinitions } from "@copilotkit/a2ui-renderer";
import { z } from "zod";

const metricStatusSchema = z
  .enum(["normal", "warning", "critical", "info"])
  .describe("指标状态，用于决定颜色和视觉强调程度。");

const answerStatusSchema = z
  .enum(["completed", "warning", "blocked", "processing"])
  .describe("节点回答当前所处的状态。");

const bloodGasMetricKeySchema = z.enum([
  "pH",
  "paCO2",
  "hco3",
  "be",
  "paO2",
  "saO2",
  "fiO2",
  "lac",
  "na",
  "k",
  "cl",
  "glucose",
]);

const bloodGasStatusSchema = z
  .enum(["normal", "low", "high", "criticalLow", "criticalHigh"])
  .describe("指标状态：正常、偏低、偏高、危急低值、危急高值。");

const bloodGasReportMetricStatusSchema = z.enum([
  "normal",
  "low",
  "high",
  "criticalLow",
  "criticalHigh",
]);


export const medicalCatalogDefinitions = {
  // 组件名必须和 medicalCatalog.tsx renderers 中的 key 完全一致。
  // 这里的 props schema 会被注入到后端模型上下文，模型只能按这个结构生成 props。
  MedicalMetricChart: {
    description:
      "精致的医疗指标可视化组件。适用于展示检验结果、生命体征、风险评分或其他数值型指标。每个指标都必须包含数值和简短的纯文本标签。",
    props: z.object({
      title: z.string().describe("简短的图表标题。"),
      subtitle: z.string().optional().describe("可选的纯文本背景说明。"),
      riskScore: z.number().min(0).max(100).optional().describe("可选的综合评分，取值范围为 0 到 100。"),
      riskLabel: z.string().optional().describe("综合评分对应的纯文本标签。"),
      metrics: z
        .array(
          z.object({
            label: z.string().describe("简短的指标名称。"),
            value: z.number().describe("指标的数值。"),
            displayValue: z.string().optional().describe("展示给用户看的格式化数值。"),
            unit: z.string().optional().describe("指标单位。"),
            referenceMin: z.number().optional().describe("可选的参考范围下限。"),
            referenceMax: z.number().optional().describe("可选的参考范围上限。"),
            status: metricStatusSchema,
            note: z.string().optional().describe("简短的纯文本说明。"),
          }),
        )
        .min(1)
        .max(8)
        .describe("1 到 8 个数值型指标。"),
    }),
  },
  // 节点回答框：适合展示一个分析节点/工作流节点的结论、依据和下一步建议。
  NodeAnswerCard: {
    description:
      "精致的流程节点或推理节点回答卡片。适用于展示节点结论、依据、置信度和推荐的下一步操作。",
    props: z.object({
      nodeTitle: z.string().describe("用户可读的节点名称。"),
      nodeType: z.string().optional().describe("可选的简短节点分类。"),
      status: answerStatusSchema,
      answer: z.string().describe("节点结论，使用纯文本表达。"),
      confidence: z.number().min(0).max(100).optional().describe("可选的置信度评分，取值范围为 0 到 100。"),
      evidence: z.array(z.string()).max(6).optional().describe("可选的支持依据列表，最多 6 条。"),
      nextSteps: z.array(z.string()).max(6).optional().describe("可选的下一步建议列表，最多 6 条。"),
      footer: z.string().optional().describe("可选的简短页脚说明。"),
    }),
  },

  PatientInfoForm: {
  description:
    "患者基础信息补充表单。适用于生成医疗报告前，要求用户补充患者姓名、性别、年龄、年龄单位和科室。所有字段都是必填项。",
  props: z.object({
    title: z.string().default("基础信息").describe("表单标题，通常为基础信息。"),
    submitText: z.string().default("提交").describe("提交按钮文本。"),
    namePlaceholder: z.string().default("请输入患者姓名").describe("患者姓名输入框占位文本。"),
    genderPlaceholder: z.string().default("请选择性别").describe("性别选择框占位文本。"),
    agePlaceholder: z.string().default("请输入年龄").describe("年龄输入框占位文本。"),
    unitPlaceholder: z.string().default("请选择单位").describe("年龄单位选择框占位文本。"),
    departmentPlaceholder: z.string().default("请输入科室").describe("科室输入框占位文本。"),
    initialPatient: z
      .object({
        patientName: z.string().optional().describe("已识别的患者姓名。"),
        gender: z.enum(["男", "女"]).optional().describe("已识别的患者性别。"),
        age: z.string().optional().describe("已识别的患者年龄，不含年龄单位。"),
        ageUnit: z.enum(["岁", "月", "周", "日"]).optional().describe("已识别的年龄单位。"),
        department: z.string().optional().describe("已识别的科室。"),
      })
      .optional()
      .describe("可选的患者信息初始值，用于只补充缺失字段时保留已知字段。"),
  }),
},

BloodGasMetricDynamicForm: {
  description:
    "血气分析指标动态补全表单。根据缺失指标列表 missingMetrics 动态显示需要用户补充的表单项，适用于生成血气报告前的数据完整性检查。",
  props: z.object({
    title: z.string().default("血气分析指标").describe("表单标题。"),
    subtitle: z
      .string()
      .optional()
      .describe("可选的表单说明，例如提示用户补充缺失的血气指标。"),
    submitText: z.string().default("提交").describe("提交按钮文本。"),
    missingMetrics: z
      .array(bloodGasMetricKeySchema)
      .min(1)
      .max(12)
      .describe(
        "缺失的血气指标 key。组件只展示这些缺失指标对应的表单项。",
      ),
  }),
},

BloodGasDataConfirmCard: {
  description:
    "血气分析数据确认卡片。用于生成报告前展示患者基础信息与血气指标结果，方便用户确认数据是否无误。患者信息只展示姓名、性别、年龄和科室。",
  props: z.object({
    title: z.string().default("数据确认").describe("卡片标题。"),
    statusText: z.string().default("待确认").describe("确认状态标签文本。"),
    patient: z
      .object({
        name: z.string().describe("患者姓名。"),
        gender: z.string().describe("患者性别，例如男、女。"),
        age: z.string().describe("患者年龄，例如65岁。"),
        department: z.string().describe("患者所在科室，例如呼吸内科。"),
      })
      .describe("患者基础信息，只展示到科室字段。"),
    metrics: z
      .array(
        z.object({
          name: z.string().describe("指标名称，例如 pH、PaCO2。"),
          result: z.string().describe("指标结果展示值。"),
          referenceRange: z.string().describe("参考范围展示文本。"),
          status: bloodGasStatusSchema.describe("指标状态。"),
        }),
      )
      .min(1)
      .max(20)
      .describe("血气分析指标列表。"),
    confirmText: z.string().default("确认无误").describe("确认按钮文本。"),
  }),
},

BloodGasAnalysisReportCard: {
  description:
    "简洁版血气分析报告卡片。用于展示患者信息、检测信息、血气指标、异常摘要、AI 初步分析和建议。顶部只展示风险等级，不展示待医生确认状态。",
  props: z.object({
    title: z.string().default("血气分析报告").describe("报告标题。"),
    conclusion: z.string().describe("初步结论，例如倾向呼吸性酸中毒，伴氧合不足。"),
    riskLabel: z.string().default("中风险").describe("风险等级标签。"),

    patient: z.object({
      name: z.string().describe("患者姓名。"),
      gender: z.string().describe("患者性别。"),
      age: z.string().describe("患者年龄，例如65岁。"),
      department: z.string().describe("科室。"),
      ward: z.string().optional().describe("病区。"),
      bedNo: z.string().optional().describe("床号。"),
      diagnosis: z.string().optional().describe("临床诊断。"),
    }).describe("患者信息。"),

    testInfo: z.object({
      sampleType: z.string().describe("标本类型，例如动脉血。"),
      samplingTime: z.string().describe("采样时间。"),
      oxygenMethod: z.string().optional().describe("吸氧方式。"),
      fiO2: z.string().optional().describe("吸入氧浓度。"),
    }).describe("检测信息。"),

    metrics: z.array(
      z.object({
        name: z.string().describe("指标名称。"),
        result: z.string().describe("结果。"),
        referenceRange: z.string().describe("参考范围。"),
        unit: z.string().optional().describe("单位。"),
        status: bloodGasReportMetricStatusSchema.describe("指标状态。"),
      }),
    ).min(1).max(20).describe("血气指标列表。"),

    abnormalSummary: z.array(z.string())
      .min(1)
      .max(8)
      .describe("异常摘要列表。"),

    aiAnalysis: z.string().describe("AI 初步分析文本。"),

    suggestions: z.array(z.string())
      .min(1)
      .max(8)
      .describe("建议列表。"),
  }),
},
} satisfies CatalogDefinitions;
