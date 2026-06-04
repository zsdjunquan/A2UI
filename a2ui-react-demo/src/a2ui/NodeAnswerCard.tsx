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

const styles = `
.node-answer-card,
.node-answer-card * {
  box-sizing: border-box;
  max-width: 100%;
}

.node-answer-card {
  position: relative;
  width: 100%;
  min-width: 0;
  margin: 8px 0;
  overflow: hidden;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
  border: 1px solid #dce8ee;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(26, 48, 73, 0.08);
  color: #172334;
}

.node-answer-card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--node-accent);
}

.node-answer-card .node-answer-header,
.node-answer-card .node-answer-heading,
.node-answer-card .node-confidence-label,
.node-answer-card .node-answer-status {
  display: flex;
  align-items: center;
}

.node-answer-card .node-answer-header,
.node-answer-card .node-confidence-label {
  justify-content: space-between;
}

.node-answer-card .node-answer-header {
  gap: 16px;
  padding: 16px 18px 13px 20px;
  border-bottom: 1px solid #edf3f6;
}

.node-answer-card .node-answer-heading {
  min-width: 0;
  gap: 10px;
}

.node-answer-card .node-answer-icon {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 11px;
}

.node-answer-card .node-answer-type {
  display: block;
  margin-bottom: 3px;
  color: #8a99a9;
  font-size: 11px;
  line-height: 1.2;
}

.node-answer-card .node-answer-heading h3,
.node-answer-card .node-answer-section h4 {
  margin: 0;
}

.node-answer-card .node-answer-heading h3 {
  color: #172334;
  font-size: 16px;
  line-height: 1.35;
}

.node-answer-card .node-answer-status {
  gap: 4px;
  flex: 0 0 auto;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.node-answer-card .node-answer-content {
  padding: 16px 20px;
}

.node-answer-card .node-answer-content > p {
  margin: 0;
  color: #33465a;
  font-size: 14px;
  line-height: 1.75;
}

.node-answer-card .node-confidence {
  margin-top: 14px;
}

.node-answer-card .node-confidence-label {
  margin-bottom: 7px;
  color: #7a8999;
  font-size: 11px;
}

.node-answer-card .node-confidence-label strong {
  color: #536578;
  font-size: 12px;
}

.node-answer-card .node-confidence-track {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: #edf3f6;
}

.node-answer-card .node-confidence-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.node-answer-card .node-answer-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 0 20px 17px;
}

.node-answer-card .node-answer-section {
  padding: 12px 13px;
  border-radius: 13px;
  background: #f8fbfc;
  border: 1px solid #edf3f6;
}

.node-answer-card .node-answer-section h4 {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #536578;
  font-size: 12px;
}

.node-answer-card .node-answer-section ul {
  margin: 9px 0 0;
  padding: 0;
  list-style: none;
}

.node-answer-card .node-answer-section li {
  display: flex;
  gap: 5px;
  margin-top: 6px;
  color: #6b7c8f;
  font-size: 12px;
  line-height: 1.5;
}

.node-answer-card .node-answer-section li::before {
  content: "•";
  color: var(--node-accent);
}

.node-answer-card .node-answer-section li svg {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--node-accent);
}

.node-answer-card .node-answer-section li:has(svg)::before {
  display: none;
}

.node-answer-card .node-answer-footer {
  padding: 10px 20px 11px;
  border-top: 1px solid #edf3f6;
  background: #fbfdfd;
  color: #8a99a9;
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 680px) {
  .node-answer-card .node-answer-details {
    grid-template-columns: 1fr;
  }

  .node-answer-card .node-answer-header {
    align-items: flex-start;
  }
}
`;

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
      <style>{styles}</style>
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
