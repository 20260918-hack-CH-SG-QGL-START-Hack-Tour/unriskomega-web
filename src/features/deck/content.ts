import type { Locale } from "@/lib/i18n";
export type SlideKind =
  | "hero"
  | "problem"
  | "briefing"
  | "conversation"
  | "evidence"
  | "custody"
  | "architecture"
  | "business"
  | "roadmap"
  | "closing";
export type Slide = {
  label: string;
  title: string;
  body: string;
  points: string[];
  footnote: string;
  kind: SlideKind;
  accent?: boolean;
};

import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
export const deckContent: Record<Locale, Slide[]> = { en, es, de, fr };
export const deckLabels = {
  en: {
    screenshot: "Product capture · EN · challenge snapshot",
    reading: "reading target",
    source: "Source snapshot",
    unavailable: "Explicit when unavailable",
    result: "Advisor briefing",
    review: "Advisor review",
    pdf: "Custody PDF",
    extract: "Extract & reconcile",
    virtual: "Virtual portfolio",
    pilot: "Pilot hypothesis",
    user: "Users",
    buyer: "Buyers",
    now: "Demonstrated",
    next: "Next validation",
    team: "Built by JO",
    live: "Open live demo",
    diagram: "Product flow",
    sourceCount: "Supplied clients",
    portfolioCount: "Native portfolios",
    languages: "Languages",
  },
  es: {
    screenshot: "Captura del producto · EN · datos del reto",
    reading: "objetivo de lectura",
    source: "Instantánea de origen",
    unavailable: "Ausencias explícitas",
    result: "Resumen del asesor",
    review: "Revisión del asesor",
    pdf: "PDF de custodia",
    extract: "Extraer y conciliar",
    virtual: "Cartera virtual",
    pilot: "Hipótesis del piloto",
    user: "Usuarios",
    buyer: "Compradores",
    now: "Demostrado",
    next: "Próxima validación",
    team: "Desarrollado por JO",
    live: "Abrir demo",
    diagram: "Flujo del producto",
    sourceCount: "Clientes suministrados",
    portfolioCount: "Carteras nativas",
    languages: "Idiomas",
  },
  de: {
    screenshot: "Produktaufnahme · EN · Datensatz der Challenge",
    reading: "Leseziel",
    source: "Quell-Snapshot",
    unavailable: "Fehlende Daten sichtbar",
    result: "Beraterbriefing",
    review: "Prüfung durch Berater",
    pdf: "Depot-PDF",
    extract: "Extrahieren & abgleichen",
    virtual: "Virtuelles Portfolio",
    pilot: "Pilothypothese",
    user: "Nutzer",
    buyer: "Käufer",
    now: "Demonstriert",
    next: "Nächste Validierung",
    team: "Entwickelt von JO",
    live: "Live-Demo öffnen",
    diagram: "Produktablauf",
    sourceCount: "Gelieferte Kunden",
    portfolioCount: "Native Portfolios",
    languages: "Sprachen",
  },
  fr: {
    screenshot: "Capture du produit · EN · données du défi",
    reading: "objectif de lecture",
    source: "Instantané source",
    unavailable: "Absences explicites",
    result: "Briefing du conseiller",
    review: "Revue du conseiller",
    pdf: "PDF de conservation",
    extract: "Extraire et rapprocher",
    virtual: "Portefeuille virtuel",
    pilot: "Hypothèse de pilote",
    user: "Utilisateurs",
    buyer: "Acheteurs",
    now: "Démontré",
    next: "Prochaine validation",
    team: "Développé par JO",
    live: "Ouvrir la démo",
    diagram: "Parcours du produit",
    sourceCount: "Clients fournis",
    portfolioCount: "Portefeuilles natifs",
    languages: "Langues",
  },
};
export type DeckLabels = typeof deckLabels.en;
