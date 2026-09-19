import { expect, test } from "bun:test";
import { parseModelCatalogue } from "./aiModels";

test("model choices and their default come only from the server catalogue", () => {
  const catalogue = {
    defaultModel: "configured-b",
    models: [
      { id: "configured-a", label: "Analysis A" },
      { id: "configured-b", label: "Analysis B" },
    ],
  };
  expect(parseModelCatalogue(catalogue)).toEqual(catalogue);
});

test("invalid or ambiguous model catalogues cannot become selectable choices", () => {
  const model = { id: "configured-a", label: "Analysis A" };
  for (const value of [
    { defaultModel: model.id, models: [] },
    { defaultModel: "missing", models: [model] },
    { defaultModel: model.id, models: [model, model] },
    { defaultModel: model.id, models: [{ ...model, label: " " }] },
    { defaultModel: model.id, models: [{ ...model, url: "https://invalid" }] },
    { defaultModel: "../model", models: [{ ...model, id: "../model" }] },
    {
      defaultModel: "provider:model",
      models: [{ ...model, id: "provider:model" }],
    },
    { defaultModel: model.id, models: [model], providerKey: "not-allowed" },
  ])
    expect(() => parseModelCatalogue(value)).toThrow();
});
