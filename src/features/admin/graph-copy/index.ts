import type { Locale } from "@/lib/i18n";
import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
export const graphCopy: Record<Locale, typeof en> = { en, es, de, fr };
