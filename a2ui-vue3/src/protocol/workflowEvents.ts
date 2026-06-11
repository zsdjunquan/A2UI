import type { Message } from "@ag-ui/core";

export type A2UIWorkflowEventName =
  | "patient-info-submit"
  | "blood-gas-metrics-submit"
  | "blood-gas-data-confirm";

export const workflowEventLabels: Record<A2UIWorkflowEventName, string> = {
  "patient-info-submit": "患者基础信息已提交",
  "blood-gas-metrics-submit": "血气指标补全已提交",
  "blood-gas-data-confirm": "血气数据已确认",
};

function createMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `a2ui-event-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createWorkflowMessage(type: A2UIWorkflowEventName, detail: unknown): Message {
  // Activity 组件的按钮本质上不是用户直接输入文本；这里把结构化事件转成 user message，让 agent 接着当前流程跑。
  const metricHint =
    type === "blood-gas-metrics-submit"
      ? "如果 detail.metrics 存在，下一步数据确认卡必须直接使用 detail.metrics 作为 metrics 数据源。"
      : "";

  return {
    id: createMessageId(),
    role: "user",
    content: [
      `A2UI 工作流事件：${workflowEventLabels[type]}`,
      "请把下面的结构化数据合并进当前血气报告 graph state，然后从下一个节点继续执行。",
      "不要调用 AGUISendStateDelta；请直接根据本消息中的 JSON 继续判断流程。",
      metricHint,
      JSON.stringify({ event: type, detail }, null, 2),
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
