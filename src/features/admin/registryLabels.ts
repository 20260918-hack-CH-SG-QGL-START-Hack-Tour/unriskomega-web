import type { Locale } from "@/lib/i18n";

const labels: Record<string, [string, string, string, string]> = {
  manager: [
    "Run coordinator",
    "Coordinador de ejecución",
    "Ausführungskoordination",
    "Coordination d’exécution",
  ],
  "evidence-curator": [
    "Evidence curator",
    "Curador de evidencia",
    "Belegkuratierung",
    "Gestion des preuves",
  ],
  "portfolio-analyst": [
    "Portfolio analyst",
    "Analista de carteras",
    "Portfolioanalyse",
    "Analyse de portefeuille",
  ],
  "visual-explainer": [
    "Visual explainer",
    "Explicación visual",
    "Visuelle Erklärung",
    "Explication visuelle",
  ],
  verifier: [
    "Independent verifier",
    "Verificador independiente",
    "Unabhängige Prüfung",
    "Vérification indépendante",
  ],
  "outcome-owner": [
    "Outcome recorder",
    "Registro de resultados",
    "Ergebnisprotokoll",
    "Enregistrement des résultats",
  ],
  "image-designer": [
    "Image designer",
    "Diseño de imágenes",
    "Bildgestaltung",
    "Création d’images",
  ],
  "portfolio-health": [
    "Portfolio health",
    "Salud de la cartera",
    "Portfoliozustand",
    "Santé du portefeuille",
  ],
  "allocation-check": [
    "Allocation check",
    "Comprobación de asignación",
    "Allokationsprüfung",
    "Contrôle d’allocation",
  ],
  "performance-honesty": [
    "Performance evidence",
    "Evidencia de rentabilidad",
    "Performancenachweise",
    "Preuves de performance",
  ],
  "evidence-grounding": [
    "Evidence grounding",
    "Fundamentación en evidencia",
    "Belegbasierte Aussagen",
    "Fondement des preuves",
  ],
  "visual-explanation": [
    "Visual explanation",
    "Explicación visual",
    "Visuelle Erklärung",
    "Explication visuelle",
  ],
  "image-generation": [
    "Image generation",
    "Generación de imágenes",
    "Bilderzeugung",
    "Génération d’images",
  ],
};
export function registryLabel(id: string, locale: Locale, fallback = id) {
  return labels[id]?.[{ en: 0, es: 1, de: 2, fr: 3 }[locale]] ?? fallback;
}
