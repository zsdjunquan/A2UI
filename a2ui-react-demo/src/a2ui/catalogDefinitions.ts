import type { CatalogDefinitions } from "@copilotkit/a2ui-renderer";
import { z } from "zod";

const metricStatusSchema = z
  .enum(["normal", "warning", "critical", "info"])
  .describe("Metric severity used for color and emphasis.");

const answerStatusSchema = z
  .enum(["completed", "warning", "blocked", "processing"])
  .describe("Current state of the node answer.");

export const medicalCatalogDefinitions = {
  // 组件名必须和 medicalCatalog.tsx renderers 中的 key 完全一致。
  // 这里的 props schema 会被注入到后端模型上下文，模型只能按这个结构生成 props。
  MedicalMetricChart: {
    description:
      "A polished medical metric visualization. Use it for laboratory values, vital signs, risk scores, or other numeric indicators. Each metric must contain a numeric value and a short plain-text label.",
    props: z.object({
      title: z.string().describe("Short chart title."),
      subtitle: z.string().optional().describe("Optional plain-text context."),
      riskScore: z.number().min(0).max(100).optional().describe("Optional overall score from 0 to 100."),
      riskLabel: z.string().optional().describe("Plain-text label for the overall score."),
      metrics: z
        .array(
          z.object({
            label: z.string().describe("Short metric name."),
            value: z.number().describe("Numeric metric value."),
            displayValue: z.string().optional().describe("Formatted value shown to the user."),
            unit: z.string().optional().describe("Metric unit."),
            referenceMin: z.number().optional().describe("Optional reference range minimum."),
            referenceMax: z.number().optional().describe("Optional reference range maximum."),
            status: metricStatusSchema,
            note: z.string().optional().describe("Short plain-text explanation."),
          }),
        )
        .min(1)
        .max(8)
        .describe("One to eight numeric metrics."),
    }),
  },
  // 节点回答框：适合展示一个分析节点/工作流节点的结论、依据和下一步建议。
  NodeAnswerCard: {
    description:
      "A polished answer box for a workflow or reasoning node. Use it to present a node conclusion, evidence, confidence, and recommended next steps.",
    props: z.object({
      nodeTitle: z.string().describe("Human-readable node name."),
      nodeType: z.string().optional().describe("Optional short node category."),
      status: answerStatusSchema,
      answer: z.string().describe("The node conclusion in plain text."),
      confidence: z.number().min(0).max(100).optional().describe("Optional confidence score from 0 to 100."),
      evidence: z.array(z.string()).max(6).optional().describe("Optional supporting evidence list."),
      nextSteps: z.array(z.string()).max(6).optional().describe("Optional recommended next steps."),
      footer: z.string().optional().describe("Optional short footer text."),
    }),
  },
} satisfies CatalogDefinitions;
