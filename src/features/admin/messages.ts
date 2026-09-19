import type { Locale } from "@/lib/i18n";
import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
export type AdminMessages = { [Key in keyof typeof en]: string };
export const adminMessages: Record<Locale, AdminMessages> = { en, es, de, fr };
export const adminViews = [
  "overview",
  "datasets",
  "structure",
  "knowledge-graph",
  "ontology",
  "agents",
  "skills",
  "runtime",
] as const;
export type AdminView = (typeof adminViews)[number];
export function isAdminView(value: string): value is AdminView {
  return adminViews.some((view) => view === value);
}
