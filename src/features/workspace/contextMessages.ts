import type { Locale } from "@/lib/i18n";

export const contextMessages: Record<
  Locale,
  {
    ready: string;
    gap: string;
    explanation: string;
    positions: string;
    snapshotValue: string;
    refreshedVoice: string;
    targetUnavailable: string;
  }
> = {
  en: {
    targetUnavailable:
      "The source does not contain a usable target allocation. Confirm the mandate before calculating allocation changes.",
    ready: "Selected portfolio · ready for your questions",
    gap: "Gap to target",
    explanation:
      "Target minus current allocation, using the dated portfolio value. A negative amount indicates an allocation above target.",
    positions: "Largest positions",
    snapshotValue: "Snapshot value",
    refreshedVoice:
      "Portfolio sources changed. Start voice again to use the refreshed data; your chat is preserved.",
  },
  es: {
    targetUnavailable:
      "La fuente no contiene una asignación objetivo válida. Confirme el mandato antes de calcular cambios de asignación.",
    ready: "Cartera seleccionada · lista para sus preguntas",
    gap: "Diferencia al objetivo",
    explanation:
      "Objetivo menos asignación actual, según el valor de la cartera en la fecha indicada. Un importe negativo indica una asignación superior al objetivo.",
    positions: "Mayores posiciones",
    snapshotValue: "Valor del corte",
    refreshedVoice:
      "Las fuentes de la cartera cambiaron. Reinicie la voz para usar los datos actualizados; el chat se conserva.",
  },
  de: {
    targetUnavailable:
      "Die Quelle enthält keine gültige Zielallokation. Bestätigen Sie das Mandat, bevor Allokationsänderungen berechnet werden.",
    ready: "Gewähltes Portfolio · bereit für Ihre Fragen",
    gap: "Abstand zum Ziel",
    explanation:
      "Ziel minus aktuelle Allokation, anhand des Portfoliowerts zum angegebenen Datum. Ein negativer Betrag bedeutet eine Allokation über dem Ziel.",
    positions: "Größte Positionen",
    snapshotValue: "Wert zum Stichtag",
    refreshedVoice:
      "Die Portfolioquellen wurden aktualisiert. Starten Sie die Sprachfunktion erneut; Ihr Chat bleibt erhalten.",
  },
  fr: {
    targetUnavailable:
      "La source ne contient pas d’allocation cible exploitable. Confirmez le mandat avant de calculer les changements d’allocation.",
    ready: "Portefeuille sélectionné · prêt pour vos questions",
    gap: "Écart à la cible",
    explanation:
      "Cible moins allocation actuelle, selon la valeur du portefeuille à la date indiquée. Un montant négatif indique une allocation supérieure à la cible.",
    positions: "Principales positions",
    snapshotValue: "Valeur à la date du relevé",
    refreshedVoice:
      "Les sources du portefeuille ont changé. Relancez la voix pour utiliser les données actualisées ; votre chat est conservé.",
  },
};
