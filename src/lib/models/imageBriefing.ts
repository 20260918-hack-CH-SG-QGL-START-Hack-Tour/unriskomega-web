import { array, object, text } from "./chatComponents";

export type ImageBriefing = {
  title: string;
  selectedClient: string | null;
  selectedPortfolio: string | null;
  asOf: string | null;
  facts: {
    label: string;
    value: string;
    unit: string | null;
    source: string;
  }[];
  warnings: string[];
};
const nullableText = (value: unknown, limit: number) =>
  value == null ? null : text(value, limit);
export function parseImageBriefing(value: unknown): ImageBriefing | undefined {
  if (value == null) return undefined;
  const v = object(value, [
    "title",
    "selectedClient",
    "selectedPortfolio",
    "asOf",
    "facts",
    "warnings",
  ]);
  return {
    title: text(v.title, 160),
    selectedClient: nullableText(v.selectedClient, 120),
    selectedPortfolio: nullableText(v.selectedPortfolio, 120),
    asOf: nullableText(v.asOf, 80),
    facts: array(v.facts, 10, 0).map((item) => {
      const fact = object(item, ["label", "value", "unit", "source"]);
      const value = text(fact.value, 80);
      const unit = nullableText(fact.unit, 80);
      const number = Number(value);
      if (
        !value.trim() ||
        !Number.isFinite(number) ||
        number < 0 ||
        (unit === "fraction" && number > 1)
      )
        throw new Error("Invalid image briefing value");
      return {
        label: text(fact.label, 120),
        value,
        unit,
        source: text(fact.source, 500),
      };
    }),
    warnings: array(v.warnings, 10, 0).map((warning) => text(warning, 2000)),
  };
}
