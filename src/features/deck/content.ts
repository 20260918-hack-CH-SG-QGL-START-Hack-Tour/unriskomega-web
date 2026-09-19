import type { Locale } from "@/lib/i18n";
export type Slide = {
  label: string;
  title: string;
  body: string;
  points: string[];
  footnote: string;
  accent?: boolean;
};

import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";

export const deckContent: Record<Locale, Slide[]> = { en, es, de, fr };
