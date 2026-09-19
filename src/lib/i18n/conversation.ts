import type { Locale } from "./index";

const en = {
  preview: "Open image preview",
  fullImage: "Full-size illustration",
  download: "Download image",
  closePreview: "Close image preview",
  session: "Conversation ID",
  copySession: "Copy conversation ID",
  copiedSession: "Conversation ID copied",
  sessionHint:
    "A reference for this conversation. It does not grant access to your account.",
  selectedContext: "Selected context",
  client: "Client",
  portfolio: "Portfolio",
  mute: "Mute microphone",
  unmute: "Unmute microphone",
  endCall: "End voice call",
  muted: "Microphone muted · audio continues",
  listening: "Listening",
  speaking: "Speaking",
  voiceBudget: "Call time remaining",
  voiceLimit:
    "Calls stop at the displayed limit. You can start another call with the same conversation context.",
  visualPending: "Preparing visual evidence…",
  visualError:
    "Visual evidence is unavailable for this turn. The spoken conversation can continue.",
  sourceTranscript: "Spoken response",
  voiceRecoverable:
    "This voice turn could not complete. The call is still connected; please try again.",
  documents: "Documents",
  continueCall:
    "Voice conversation stays connected while you type or create an image.",
};
export type ConversationCopy = typeof en;
export const conversationMessages: Record<Locale, ConversationCopy> = {
  en,
  es: {
    preview: "Abrir vista previa",
    fullImage: "Ilustración a tamaño completo",
    download: "Descargar imagen",
    closePreview: "Cerrar vista previa",
    session: "ID de conversación",
    copySession: "Copiar ID de conversación",
    copiedSession: "ID de conversación copiado",
    sessionHint:
      "Una referencia de esta conversación. No da acceso a tu cuenta.",
    selectedContext: "Contexto seleccionado",
    client: "Cliente",
    portfolio: "Cartera",
    mute: "Silenciar micrófono",
    unmute: "Activar micrófono",
    endCall: "Finalizar llamada",
    muted: "Micrófono silenciado · el audio continúa",
    listening: "Escuchando",
    speaking: "Hablando",
    voiceBudget: "Tiempo de llamada restante",
    voiceLimit:
      "Las llamadas terminan en el límite indicado. Puedes iniciar otra con el mismo contexto.",
    visualPending: "Preparando pruebas visuales…",
    visualError:
      "No hay pruebas visuales disponibles para este turno. La conversación de voz puede continuar.",
    sourceTranscript: "Respuesta hablada",
    voiceRecoverable:
      "Este turno no pudo completarse. La llamada sigue conectada; inténtalo de nuevo.",
    documents: "Documentos",
    continueCall:
      "La conversación de voz sigue conectada mientras escribes o creas una imagen.",
  },
  de: {
    preview: "Bildvorschau öffnen",
    fullImage: "Illustration in voller Grösse",
    download: "Bild herunterladen",
    closePreview: "Bildvorschau schliessen",
    session: "Gesprächs-ID",
    copySession: "Gesprächs-ID kopieren",
    copiedSession: "Gesprächs-ID kopiert",
    sessionHint:
      "Eine Referenz für dieses Gespräch. Sie gewährt keinen Zugriff auf dein Konto.",
    selectedContext: "Ausgewählter Kontext",
    client: "Kunde",
    portfolio: "Portfolio",
    mute: "Mikrofon stummschalten",
    unmute: "Mikrofon einschalten",
    endCall: "Sprachgespräch beenden",
    muted: "Mikrofon stumm · Audio läuft weiter",
    listening: "Hört zu",
    speaking: "Spricht",
    voiceBudget: "Verbleibende Gesprächszeit",
    voiceLimit:
      "Gespräche enden am angezeigten Limit. Ein neues Gespräch kann denselben Kontext verwenden.",
    visualPending: "Visuelle Belege werden vorbereitet…",
    visualError:
      "Für diesen Beitrag sind keine visuellen Belege verfügbar. Das Sprachgespräch kann weitergehen.",
    sourceTranscript: "Gesprochene Antwort",
    voiceRecoverable:
      "Dieser Beitrag konnte nicht abgeschlossen werden. Das Gespräch bleibt verbunden; bitte erneut versuchen.",
    documents: "Dokumente",
    continueCall:
      "Das Sprachgespräch bleibt beim Tippen oder Erstellen eines Bildes verbunden.",
  },
  fr: {
    preview: "Ouvrir l’aperçu",
    fullImage: "Illustration en taille réelle",
    download: "Télécharger l’image",
    closePreview: "Fermer l’aperçu",
    session: "ID de conversation",
    copySession: "Copier l’ID de conversation",
    copiedSession: "ID de conversation copié",
    sessionHint:
      "Une référence pour cette conversation. Elle ne donne pas accès à votre compte.",
    selectedContext: "Contexte sélectionné",
    client: "Client",
    portfolio: "Portefeuille",
    mute: "Couper le microphone",
    unmute: "Activer le microphone",
    endCall: "Terminer l’appel",
    muted: "Microphone coupé · l’audio continue",
    listening: "À l’écoute",
    speaking: "Parle",
    voiceBudget: "Temps d’appel restant",
    voiceLimit:
      "Les appels s’arrêtent à la limite affichée. Un nouvel appel peut utiliser le même contexte.",
    visualPending: "Préparation des preuves visuelles…",
    visualError:
      "Les preuves visuelles sont indisponibles pour ce tour. La conversation vocale peut continuer.",
    sourceTranscript: "Réponse vocale",
    voiceRecoverable:
      "Ce tour n’a pas pu se terminer. L’appel reste connecté ; veuillez réessayer.",
    documents: "Documents",
    continueCall:
      "La conversation vocale reste connectée pendant la saisie ou la création d’une image.",
  },
};
