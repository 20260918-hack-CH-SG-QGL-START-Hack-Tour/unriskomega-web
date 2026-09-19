import type { Locale } from "@/lib/i18n";
import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import type { RuntimeCopy } from "./types";
export const runtimeCopy: Record<Locale, RuntimeCopy> = { en, es, de, fr };
