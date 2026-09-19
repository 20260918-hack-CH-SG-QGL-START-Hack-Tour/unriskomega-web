import type { Locale } from "@/lib/i18n";

const en = {
  label: "Analysis model",
  loading: "Loading models…",
  serverDefault: "Server default",
  unavailable:
    "Model catalogue unavailable. Your existing choice is kept; otherwise the server default applies.",
  unavailableChoice: "Unavailable — choose another model",
  retry: "Reload models",
  next: "Applies to the next request. Your conversation and attachments stay in place.",
  modalities:
    "Images and live speech use dedicated models. This choice also applies to voice-generated analysis cards.",
  rejected:
    "This model is unavailable. Choose another model and try again; your conversation is preserved.",
  reviewRequired:
    "This draft did not pass verification. Review the source information or ask a more focused question. Your conversation is preserved.",
  analysisResult: "Analysis model",
};
export type ModelCopy = typeof en;
export const modelMessages: Record<Locale, ModelCopy> = {
  en,
  es: {
    label: "Modelo de análisis",
    loading: "Cargando modelos…",
    serverDefault: "Predeterminado del servidor",
    unavailable:
      "El catálogo de modelos no está disponible. Se conserva tu elección; si no existe, se usa el predeterminado del servidor.",
    unavailableChoice: "No disponible — elige otro modelo",
    retry: "Recargar modelos",
    next: "Se aplica a la próxima solicitud. Se conservan la conversación y los archivos adjuntos.",
    modalities:
      "Las imágenes y la voz en directo usan modelos específicos. Esta elección también se aplica a las tarjetas de análisis generadas por voz.",
    rejected:
      "Este modelo no está disponible. Elige otro y vuelve a intentarlo; la conversación se conserva.",
    reviewRequired:
      "Este borrador no superó la verificación. Revisa la información de origen o haz una pregunta más concreta. La conversación se conserva.",
    analysisResult: "Modelo de análisis",
  },
  de: {
    label: "Analysemodell",
    loading: "Modelle werden geladen…",
    serverDefault: "Serverstandard",
    unavailable:
      "Der Modellkatalog ist nicht verfügbar. Ihre Auswahl bleibt erhalten; ohne Auswahl gilt der Serverstandard.",
    unavailableChoice: "Nicht verfügbar — anderes Modell wählen",
    retry: "Modelle neu laden",
    next: "Gilt für die nächste Anfrage. Gespräch und Anhänge bleiben erhalten.",
    modalities:
      "Bilder und Live-Sprache verwenden eigene Modelle. Diese Auswahl gilt auch für per Sprache erzeugte Analysekarten.",
    rejected:
      "Dieses Modell ist nicht verfügbar. Wählen Sie ein anderes und versuchen Sie es erneut; das Gespräch bleibt erhalten.",
    reviewRequired:
      "Dieser Entwurf hat die Prüfung nicht bestanden. Prüfen Sie die Quelldaten oder stellen Sie eine gezieltere Frage. Das Gespräch bleibt erhalten.",
    analysisResult: "Analysemodell",
  },
  fr: {
    label: "Modèle d’analyse",
    loading: "Chargement des modèles…",
    serverDefault: "Modèle par défaut du serveur",
    unavailable:
      "Le catalogue des modèles est indisponible. Votre choix est conservé ; sans choix, le modèle par défaut du serveur s’applique.",
    unavailableChoice: "Indisponible — choisissez un autre modèle",
    retry: "Recharger les modèles",
    next: "S’applique à la prochaine demande. La conversation et les pièces jointes sont conservées.",
    modalities:
      "Les images et la voix en direct utilisent des modèles dédiés. Ce choix s’applique aussi aux cartes d’analyse générées par la voix.",
    rejected:
      "Ce modèle est indisponible. Choisissez-en un autre et réessayez ; la conversation est conservée.",
    reviewRequired:
      "Ce brouillon n’a pas passé la vérification. Examinez les données sources ou posez une question plus précise. La conversation est conservée.",
    analysisResult: "Modèle d’analyse",
  },
};
