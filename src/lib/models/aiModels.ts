import { array, object, text } from "./chatComponents";

export type AnalysisModel = { id: string; label: string };
export type ModelCatalogue = {
  defaultModel: string;
  models: AnalysisModel[];
};

export function parseModelCatalogue(value: unknown): ModelCatalogue {
  const source = object(value, ["defaultModel", "models"]);
  const models = array(source.models, 32).map((value) => {
    const model = object(value, ["id", "label"]);
    const id = text(model.id, 128);
    const label = text(model.label, 128);
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/.test(id) || !label.trim())
      throw new Error("Invalid analysis model");
    return { id, label };
  });
  const defaultModel = text(source.defaultModel, 128);
  if (
    !models.length ||
    new Set(models.map((model) => model.id)).size !== models.length ||
    !models.some((model) => model.id === defaultModel)
  )
    throw new Error("Invalid analysis model catalogue");
  return { defaultModel, models };
}
