// src/a2ui/A2Renderer.tsx
// 历史简易渲染器：当前 CopilotKit A2UI 流程不走这里，真正的自定义组件注册见 medicalCatalog.tsx。
import type { ComponentType, ReactNode } from "react";

type A2Action = unknown;
type RendererComponentProps = Record<string, unknown> & {
  children?: ReactNode;
  onAction?: (action: A2Action) => void;
};

type A2Node = {
  type: string;
  props?: Record<string, unknown>;
  children?: A2Node[];
};

const Card = ({ title, description, children }: RendererComponentProps) => (
  <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
    <h3>{String(title ?? "")}</h3>
    <p>{String(description ?? "")}</p>
    {children}
  </div>
);

const Button = ({ label, action, onAction }: RendererComponentProps) => (
  <button onClick={() => onAction?.(action)}>{String(label ?? "")}</button>
);

const componentMap: Record<string, ComponentType<RendererComponentProps>> = {
  card: Card,
  button: Button,
};

export default function A2Renderer({
  node,
  onAction,
}: {
  node: A2Node;
  onAction?: (action: A2Action) => void;
}) {
  const Component = componentMap[node.type];

  if (!Component) {
    return <div>未知组件：{node.type}</div>;
  }

  return (
    <Component {...node.props} onAction={onAction}>
      {node.children?.map((child, index) => (
        <A2Renderer key={index} node={child} onAction={onAction} />
      ))}
    </Component>
  );
}
