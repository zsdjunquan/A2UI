import type { MedicalComponentName } from "./a2uiCatalog";

export type A2UIPayload = {
  component: MedicalComponentName | string;
  props: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeComponentPayload(value: unknown): A2UIPayload | null {
  if (!isRecord(value)) return null;

  const component = value.component ?? value.name ?? value.type;
  const props = value.props ?? value.properties ?? {};

  if (typeof component === "string" && isRecord(props)) {
    return { component, props };
  }

  return null;
}

export function extractA2UIPayload(content: unknown): A2UIPayload | null {
  const direct = normalizeComponentPayload(content);
  if (direct) return direct;

  if (!isRecord(content)) return null;

  const candidates = [
    content.surface,
    content.root,
    content.node,
    content.ui,
    content.a2ui,
    content.value,
    content.snapshot,
  ];

  for (const candidate of candidates) {
    const payload = normalizeComponentPayload(candidate);
    if (payload) return payload;
  }

  const activities = content.activities;
  if (Array.isArray(activities)) {
    for (const item of activities) {
      const payload = extractA2UIPayload(item);
      if (payload) return payload;
    }
  }

  return null;
}
