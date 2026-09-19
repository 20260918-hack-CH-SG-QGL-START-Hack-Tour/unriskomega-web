import {
  array,
  type ChatComponent,
  type Evidence,
  object,
  parseComponent,
  parseEvidence,
  text,
} from "./chatComponents";

export type ChatOutcome = {
  id: string;
  status: "accepted" | "needs_review";
  agentIds: string[];
  skillIds: string[];
  verification: { status: string; checks: string[]; humanReviewed?: boolean };
  warnings: string[];
};
export type ChatAnswer = {
  text: string;
  model: string;
  components: ChatComponent[];
  evidence: Evidence[];
  warnings: string[];
  outcome?: ChatOutcome;
};
export type GeneratedImage = { src: string; model: string };
export type ChatMessage = Partial<ChatAnswer> & {
  id: string;
  role: "user" | "assistant";
  text: string;
  image?: GeneratedImage;
};
function parseOutcome(value: unknown): ChatOutcome | undefined {
  if (value == null) return undefined;
  const v = object(value, [
    "id",
    "status",
    "agentIds",
    "skillIds",
    "verification",
    "warnings",
  ]);
  if (v.status !== "accepted" && v.status !== "needs_review")
    throw new Error("Invalid outcome status");
  const verification = object(v.verification, [
    "status",
    "checks",
    "humanReviewed",
  ]);
  if (
    verification.humanReviewed !== undefined &&
    typeof verification.humanReviewed !== "boolean"
  )
    throw new Error("Invalid human review status");
  return {
    id: text(v.id, 160),
    status: v.status,
    agentIds: array(v.agentIds, 30, 0).map((item) => text(item, 160)),
    skillIds: array(v.skillIds, 30, 0).map((item) => text(item, 160)),
    verification: {
      status: text(verification.status, 80),
      checks: array(verification.checks, 30, 0).map((item) => text(item)),
      humanReviewed: verification.humanReviewed as boolean | undefined,
    },
    warnings: array(v.warnings, 30, 0).map((item) => text(item)),
  };
}
export function parseChatAnswer(value: unknown): ChatAnswer {
  const v = object(value, [
    "text",
    "model",
    "source",
    "components",
    "evidence",
    "outcome",
    "sourceIds",
    "warnings",
    "orchestrator",
  ]);
  const evidence = parseEvidence(v.evidence);
  const sourceIds = array(v.sourceIds ?? [], 80, 0).map((id) => text(id, 16));
  if (sourceIds.some((id) => !evidence.some((item) => item.id === id)))
    throw new Error("Unresolved answer evidence");
  return {
    text: text(v.text, 30000),
    model: typeof v.model === "string" ? v.model.slice(0, 160) : "",
    components: array(v.components ?? [], 6, 0).map((item) =>
      parseComponent(item, evidence),
    ),
    evidence,
    warnings: array(v.warnings ?? [], 30, 0).map((item) => text(item)),
    outcome: parseOutcome(v.outcome),
  };
}
export function parseGeneratedImage(value: unknown): GeneratedImage {
  if (!value || typeof value !== "object")
    throw new Error("Invalid image response");
  const v = value as Record<string, unknown>;
  const mime = text(v.mimeType, 40);
  const image = text(v.image, 30_000_000);
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(mime) ||
    image.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(image)
  )
    throw new Error("Invalid image encoding");
  return { src: `data:${mime};base64,${image}`, model: text(v.model, 160) };
}

// Only explicit opening commands select the paid image capability. Mentions of
// images, negations and questions about charts remain normal portfolio chat.
const imageCommand =
  /^(?:\/image(?:\s+|$)|(?:(?:please\s+)?(?:generate|create|draw)\s+(?:me\s+)?(?:an?\s+)?(?:image|illustration|picture)\b|(?:por favor\s+)?(?:genera|generar|crea|crear|dibuja)\s+(?:una?\s+)?(?:imagen|ilustración)\b|(?:bitte\s+)?(?:erstelle|generiere|zeichne)\s+(?:mir\s+)?(?:ein(?:e)?\s+)?(?:bild|illustration)\b|(?:s'il vous plaît\s+)?(?:génère|générer|crée|créer|dessine)\s+(?:une?\s+)?(?:image|illustration)\b))/iu;
export function imagePrompt(input: string): string | null {
  const prompt = input.trim();
  if (!imageCommand.test(prompt)) return null;
  return prompt.startsWith("/image") ? prompt.slice(6).trim() : prompt;
}
