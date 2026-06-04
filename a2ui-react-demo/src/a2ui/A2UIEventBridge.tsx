import { useEffect, useRef } from "react";
import type { Message } from "@ag-ui/core";
import { useAgent } from "@copilotkit/react-core/v2";

type A2UIWorkflowEventName =
  | "patient-info-submit"
  | "blood-gas-metrics-submit"
  | "blood-gas-data-confirm";

const workflowEventLabels: Record<A2UIWorkflowEventName, string> = {
  "patient-info-submit": "患者基础信息已提交",
  "blood-gas-metrics-submit": "血气指标补全已提交",
  "blood-gas-data-confirm": "血气数据已确认",
};

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasValidPatientInfo(detail: unknown) {
  if (!detail || typeof detail !== "object") return false;

  const value = "value" in detail ? detail.value : undefined;
  if (!value || typeof value !== "object") return false;

  return (
    hasText("patientName" in value ? value.patientName : undefined) &&
    hasText("gender" in value ? value.gender : undefined) &&
    hasText("age" in value ? value.age : undefined) &&
    hasText("ageUnit" in value ? value.ageUnit : undefined) &&
    hasText("department" in value ? value.department : undefined)
  );
}

function hasValidBloodGasMetrics(detail: unknown) {
  if (!detail || typeof detail !== "object") return false;

  const values = "values" in detail ? detail.values : undefined;
  if (!values || typeof values !== "object") return false;

  return Object.values(values).some((metric) => {
    if (!metric || typeof metric !== "object") return false;
    const value = "value" in metric ? metric.value : undefined;
    return (
      (typeof value === "number" && Number.isFinite(value)) ||
      hasText(value)
    );
  });
}

function hasValidConfirmation(detail: unknown) {
  return Boolean(
    detail &&
      typeof detail === "object" &&
      "confirmed" in detail &&
      detail.confirmed === true,
  );
}

function isValidWorkflowEvent(type: A2UIWorkflowEventName, detail: unknown) {
  switch (type) {
    case "patient-info-submit":
      return hasValidPatientInfo(detail);
    case "blood-gas-metrics-submit":
      return hasValidBloodGasMetrics(detail);
    case "blood-gas-data-confirm":
      return hasValidConfirmation(detail);
  }
}

function createMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `a2ui-event-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEventMessage(type: A2UIWorkflowEventName, detail: unknown): Message {
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
      "不要调用 AGUISendStateDelta；请直接根据本消息中的 JSON 继续判断流程。如果必须同步 state，只能用 AGUISendStateSnapshot 写完整对象。",
      metricHint,
      JSON.stringify(
        {
          event: type,
          detail,
        },
        null,
        2,
      ),
    ].join("\n"),
  };
}

export function A2UIEventBridge() {
  const { agent } = useAgent();
  const runningRef = useRef(false);

  useEffect(() => {
    const handleWorkflowEvent = async (event: Event) => {
      const type = event.type as A2UIWorkflowEventName;
      const detail = event instanceof CustomEvent ? event.detail : undefined;

      if (!isValidWorkflowEvent(type, detail)) {
        console.warn("Invalid A2UI workflow event ignored.", { type, detail });
        return;
      }

      if (runningRef.current || agent.isRunning) {
        console.warn("A2UI workflow event ignored because the agent is already running.", {
          type,
          detail,
        });
        return;
      }

      runningRef.current = true;

      try {
        agent.addMessage(createEventMessage(type, detail));
        await agent.runAgent();
      } catch (error) {
        console.error("Failed to continue A2UI workflow.", error);
      } finally {
        runningRef.current = false;
      }
    };

    const eventNames = Object.keys(workflowEventLabels) as A2UIWorkflowEventName[];

    eventNames.forEach((eventName) => {
      window.addEventListener(eventName, handleWorkflowEvent);
    });

    return () => {
      eventNames.forEach((eventName) => {
        window.removeEventListener(eventName, handleWorkflowEvent);
      });
    };
  }, [agent]);

  return null;
}
