import type { Locale } from "@/lib/i18n";

export const contextMessages: Record<
  Locale,
  { ready: string; gap: string; explanation: string; positions: string }
> = {
  en: {
    ready: "Selected portfolio · ready for your questions",
    gap: "Gap to target",
    explanation:
      "Target minus current allocation, using the dated portfolio value. A negative amount indicates an allocation above target.",
    positions: "Largest positions",
  },
  es: {
    ready: "Cartera seleccionada · lista para sus preguntas",
    gap: "Diferencia al objetivo",
    explanation:
      "Objetivo menos asignación actual, según el valor de la cartera en la fecha indicada. Un importe negativo indica una asignación superior al objetivo.",
    positions: "Mayores posiciones",
  },
  de: {
    ready: "Gewähltes Portfolio · bereit für Ihre Fragen",
    gap: "Abstand zum Ziel",
    explanation:
      "Ziel minus aktuelle Allokation, anhand des Portfoliowerts zum angegebenen Datum. Ein negativer Betrag bedeutet eine Allokation über dem Ziel.",
    positions: "Größte Positionen",
  },
  fr: {
    ready: "Portefeuille sélectionné · prêt pour vos questions",
    gap: "Écart à la cible",
    explanation:
      "Cible moins allocation actuelle, selon la valeur du portefeuille à la date indiquée. Un montant négatif indique une allocation supérieure à la cible.",
    positions: "Principales positions",
  },
};
