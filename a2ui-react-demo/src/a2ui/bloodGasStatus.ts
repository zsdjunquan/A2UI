export type BloodGasStatus =
  | "normal"
  | "low"
  | "high"
  | "criticalLow"
  | "criticalHigh";

type ParsedRange = {
  min?: number;
  max?: number;
};

function parseNumber(value: string) {
  const match = value.replace(/,/g, "").match(/[+-]?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

function parseReferenceRange(referenceRange: string): ParsedRange {
  const normalized = referenceRange
    .replace(/～/g, "~")
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .trim();

  const values = normalized.match(/[+-]?\d+(?:\.\d+)?/g)?.map(Number) || [];

  if (values.length >= 2) {
    return {
      min: Math.min(values[0], values[1]),
      max: Math.max(values[0], values[1]),
    };
  }

  return {};
}

export function getBloodGasStatusByRange(
  result: string,
  referenceRange: string,
  fallback: BloodGasStatus = "normal",
): BloodGasStatus {
  const value = parseNumber(result);
  const { min, max } = parseReferenceRange(referenceRange);

  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  if (typeof min === "number" && value < min) return "low";
  if (typeof max === "number" && value > max) return "high";

  return "normal";
}
