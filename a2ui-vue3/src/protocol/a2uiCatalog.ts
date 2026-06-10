import { z } from "zod";

export const MEDICAL_CATALOG_ID = "https://example.local/a2ui/medical-catalog/v1";

export const medicalCatalogDefinitions = {
  PatientInfoForm: {
    description: "患者基础信息补充表单。",
    props: z.object({
      title: z.string().default("基础信息").describe("表单标题。"),
      submitText: z.string().default("提交").describe("提交按钮文本。"),
      namePlaceholder: z.string().default("请输入患者姓名").describe("患者姓名占位文本。"),
      genderPlaceholder: z.string().default("请选择性别").describe("性别占位文本。"),
      agePlaceholder: z.string().default("请输入年龄").describe("年龄占位文本。"),
      unitPlaceholder: z.string().default("请选择单位").describe("年龄单位占位文本。"),
      departmentPlaceholder: z.string().default("请输入科室").describe("科室占位文本。"),
      initialPatient: z
        .object({
          patientName: z.string().optional().describe("已识别患者姓名。"),
          gender: z.enum(["男", "女"]).optional().describe("已识别患者性别。"),
          age: z.string().optional().describe("已识别患者年龄。"),
          ageUnit: z.enum(["岁", "月", "周", "日"]).optional().describe("已识别年龄单位。"),
          department: z.string().optional().describe("已识别科室。"),
        })
        .optional()
        .describe("患者信息初始值。"),
    }),
  },
  BloodGasMetricDynamicForm: {
    description: "血气分析指标动态补全表单。",
    props: z.object({
      title: z.string().default("血气分析指标").describe("表单标题。"),
      subtitle: z.string().optional().describe("补充说明。"),
      submitText: z.string().default("提交").describe("提交按钮文本。"),
      missingMetrics: z.array(z.string()).min(1).describe("缺失指标 key 列表。"),
    }),
  },
  BloodGasDataConfirmCard: {
    description: "血气分析数据确认卡片。",
    props: z.object({
      title: z.string().default("数据确认").describe("卡片标题。"),
      statusText: z.string().default("待确认").describe("状态文本。"),
      confirmText: z.string().default("确认无误").describe("确认按钮文本。"),
      patient: z.object({
        name: z.string().describe("患者姓名。"),
        gender: z.string().describe("患者性别。"),
        age: z.string().describe("患者年龄。"),
        department: z.string().describe("科室。"),
      }),
      metrics: z.array(
        z.object({
          name: z.string().describe("指标名称。"),
          result: z.string().describe("指标结果。"),
          referenceRange: z.string().describe("参考范围。"),
          status: z.string().describe("指标状态。"),
        }),
      ),
    }),
  },
  BloodGasAnalysisReportCard: {
    description: "血气分析报告卡片。",
    props: z.object({
      title: z.string().default("血气分析报告").describe("报告标题。"),
      conclusion: z.string().describe("初步结论。"),
      riskLabel: z.string().default("中风险").describe("风险等级。"),
      patient: z.record(z.string()).describe("患者信息。"),
      testInfo: z.record(z.string()).describe("检测信息。"),
      metrics: z.array(z.record(z.string())).describe("血气指标列表。"),
      abnormalSummary: z.array(z.string()).describe("异常摘要。"),
      aiAnalysis: z.string().describe("AI 初步分析。"),
      suggestions: z.array(z.string()).describe("建议列表。"),
    }),
  },
  NodeAnswerCard: {
    description: "流程节点回答卡片。",
    props: z.object({
      nodeTitle: z.string().describe("节点标题。"),
      status: z.string().describe("节点状态。"),
      answer: z.string().describe("节点结论。"),
      evidence: z.array(z.string()).optional().describe("依据列表。"),
      nextSteps: z.array(z.string()).optional().describe("下一步建议。"),
    }),
  },
};

export type MedicalComponentName = keyof typeof medicalCatalogDefinitions;
