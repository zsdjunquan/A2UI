import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronRight,
  CircleDotDashed,
  ClipboardCheck,
  Lightbulb,
} from "lucide-react";
import type { PropsOf } from "@copilotkit/a2ui-renderer";
import type { CSSProperties } from "react";
import type { medicalCatalogDefinitions } from "./catalogDefinitions";

type NodeAnswerCardProps = PropsOf<typeof medicalCatalogDefinitions, "NodeAnswerCard">;

const stateMeta = {
  completed: { label: "已完成", color: "#0f9f78", soft: "#e8f8f2", icon: CheckCircle2 },
  warning: { label: "需关注", color: "#d99416", soft: "#fff7df", icon: AlertTriangle },
  blocked: { label: "受阻", color: "#df4d5b", soft: "#fff0f1", icon: Ban },
  processing: { label: "处理中", color: "#3b82f6", soft: "#edf5ff", icon: CircleDotDashed },
} as const;

export function NodeAnswerCard({ props }: { props: NodeAnswerCardProps }) {
  const meta = stateMeta[props.status];
  const StateIcon = meta.icon;

  return (
    <section className="node-answer-card" style={{ "--node-accent": meta.color } as CSSProperties}>
      <header className="node-answer-header">
        <div className="node-answer-heading">
          <span className="node-answer-icon" style={{ color: meta.color, backgroundColor: meta.soft }}>
            <ClipboardCheck size={18} aria-hidden="true" />
          </span>
          <div>
            {props.nodeType && <span className="node-answer-type">{props.nodeType}</span>}
            <h3>{props.nodeTitle}</h3>
          </div>
        </div>
        <span className="node-answer-status" style={{ color: meta.color, backgroundColor: meta.soft }}>
          <StateIcon size={14} aria-hidden="true" />
          {meta.label}
        </span>
      </header>

      <div className="node-answer-content">
        <p>{props.answer}</p>
        {props.confidence != null && (
          <div className="node-confidence">
            <div className="node-confidence-label">
              <span>回答置信度</span>
              <strong>{Math.round(props.confidence)}%</strong>
            </div>
            <div className="node-confidence-track">
              <span style={{ width: `${props.confidence}%`, backgroundColor: meta.color }} />
            </div>
          </div>
        )}
      </div>

      {(props.evidence?.length || props.nextSteps?.length) && (
        <div className="node-answer-details">
          {props.evidence?.length ? (
            <div className="node-answer-section">
              <h4>
                <CheckCircle2 size={15} aria-hidden="true" />
                依据
              </h4>
              <ul>
                {props.evidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {props.nextSteps?.length ? (
            <div className="node-answer-section">
              <h4>
                <Lightbulb size={15} aria-hidden="true" />
                下一步
              </h4>
              <ul>
                {props.nextSteps.map((item) => (
                  <li key={item}>
                    <ChevronRight size={14} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {props.footer && <footer className="node-answer-footer">{props.footer}</footer>}
    </section>
  );
}
