import type { Locale } from "./index";

const en = {
  intro:
    "Ask a question, compare evidence, or request a chart, table or illustration in this conversation.",
  chartPrompt:
    "Show the portfolio allocation as a chart and explain the largest concentration with sources.",
  tablePrompt:
    "Compare the recorded allocation findings in a table with their source evidence.",
  diagramPrompt:
    "Draw a conceptual diagram showing how holdings, allocation checks and the advisor review relate.",
  chart: "Allocation chart",
  table: "Evidence table",
  diagram: "Explain visually",
  imageHelp:
    "Generate an illustration in this conversation. Describe it after /image. Images are not financial evidence.",
  imagePlaceholder: "/image Describe the illustration…",
  imageGenerating: "Generating your illustration…",
  imageRequired: "Add a description after /image before sending.",
  imageTooLong: "Please shorten the image description to 2,000 characters.",
  sendHelp: "Send your question. Enter sends; Shift+Enter adds a new line.",
  voiceHelp: "Start a live voice conversation about the selected portfolio.",
  dictateHelp: "Dictate into the composer, then review and send your message.",
  scopeHelp:
    "Answers use the selected portfolio snapshot. Switching portfolios starts a new conversation.",
  sources: "Source evidence",
  chartData: "View chart values",
  conceptual: "Conceptual diagram",
  hypothetical: "Illustrative scenario · not a forecast",
  assumptions: "Scenario assumptions",
  review: "Review required",
  checks: "Verification checks",
  verified: "Evidence checks passed",
  evidenceHelp:
    "Inspect the source references behind the answer. A passed check is not a guarantee of correctness.",
  cancel: "Cancel request",
  emptySource: "No source evidence supplied",
  checkShape: "The answer uses supported visual components.",
  checkSources: "References belong to the selected portfolio evidence.",
  checkValues: "Metrics and chart values were checked against the source.",
  checkReview: "A separate review checked the answer against the evidence.",
  answerWithheld:
    "The answer could not be verified. Try a more specific question about the available snapshot.",
  componentsRemoved:
    "Visual elements without sufficient evidence were omitted.",
};
export type ChatCopy = typeof en;
export const chatMessages: Record<Locale, ChatCopy> = {
  en,
  es: {
    intro:
      "Haz una pregunta, compara pruebas o pide un gráfico, una tabla o una ilustración en esta conversación.",
    chartPrompt:
      "Muestra la asignación de la cartera en un gráfico y explica la mayor concentración con fuentes.",
    tablePrompt:
      "Compara los hallazgos de asignación registrados en una tabla con sus fuentes.",
    diagramPrompt:
      "Dibuja un diagrama conceptual que relacione las posiciones, los controles de asignación y la revisión del asesor.",
    chart: "Gráfico de asignación",
    table: "Tabla de pruebas",
    diagram: "Explicar visualmente",
    imageHelp:
      "Genera una ilustración en esta conversación. Descríbela después de /image. Las imágenes no son pruebas financieras.",
    imagePlaceholder: "/image Describe la ilustración…",
    imageGenerating: "Generando tu ilustración…",
    imageRequired: "Añade una descripción después de /image antes de enviar.",
    imageTooLong: "Reduce la descripción de la imagen a 2.000 caracteres.",
    sendHelp: "Envía tu pregunta. Intro envía; Mayús+Intro añade una línea.",
    voiceHelp:
      "Inicia una conversación de voz en directo sobre la cartera seleccionada.",
    dictateHelp:
      "Dicta en el cuadro de texto y después revisa y envía tu mensaje.",
    scopeHelp:
      "Las respuestas usan la instantánea de la cartera seleccionada. Cambiar de cartera inicia otra conversación.",
    sources: "Fuentes",
    chartData: "Ver valores del gráfico",
    conceptual: "Diagrama conceptual",
    hypothetical: "Escenario ilustrativo · no es una previsión",
    assumptions: "Supuestos del escenario",
    review: "Revisión necesaria",
    checks: "Comprobaciones",
    verified: "Comprobaciones de evidencia superadas",
    evidenceHelp:
      "Inspecciona las fuentes de la respuesta. Superar una comprobación no garantiza la exactitud.",
    cancel: "Cancelar solicitud",
    emptySource: "No se aportaron fuentes",
    checkShape: "La respuesta utiliza componentes visuales compatibles.",
    checkSources: "Las referencias pertenecen a la cartera seleccionada.",
    checkValues:
      "Las métricas y los valores del gráfico se contrastaron con la fuente.",
    checkReview:
      "Una revisión independiente contrastó la respuesta con las pruebas.",
    answerWithheld:
      "No se pudo verificar la respuesta. Prueba una pregunta más concreta sobre la instantánea disponible.",
    componentsRemoved:
      "Se omitieron los elementos visuales sin pruebas suficientes.",
  },
  de: {
    intro:
      "Stelle eine Frage, vergleiche Belege oder fordere hier ein Diagramm, eine Tabelle oder eine Illustration an.",
    chartPrompt:
      "Zeige die Portfolioallokation als Diagramm und erkläre die grösste Konzentration mit Quellen.",
    tablePrompt:
      "Vergleiche die erfassten Allokationsbefunde in einer Tabelle mit ihren Quellenbelegen.",
    diagramPrompt:
      "Zeichne ein konzeptionelles Diagramm der Beziehungen zwischen Positionen, Allokationsprüfungen und Beraterprüfung.",
    chart: "Allokationsdiagramm",
    table: "Belegtabelle",
    diagram: "Visuell erklären",
    imageHelp:
      "Erstelle hier eine Illustration. Beschreibe sie nach /image. Bilder sind keine Finanzbelege.",
    imagePlaceholder: "/image Beschreibe die Illustration…",
    imageGenerating: "Deine Illustration wird erstellt…",
    imageRequired: "Ergänze vor dem Senden eine Beschreibung nach /image.",
    imageTooLong: "Kürze die Bildbeschreibung auf 2.000 Zeichen.",
    sendHelp:
      "Sende deine Frage. Enter sendet; Umschalt+Enter fügt eine Zeile ein.",
    voiceHelp: "Starte ein Live-Sprachgespräch über das ausgewählte Portfolio.",
    dictateHelp:
      "Diktiere in das Textfeld und prüfe die Nachricht vor dem Senden.",
    scopeHelp:
      "Antworten verwenden den ausgewählten Portfoliostand. Ein Portfoliowechsel startet ein neues Gespräch.",
    sources: "Quellenbelege",
    chartData: "Diagrammwerte anzeigen",
    conceptual: "Konzeptionelles Diagramm",
    hypothetical: "Illustratives Szenario · keine Prognose",
    assumptions: "Szenarioannahmen",
    review: "Prüfung erforderlich",
    checks: "Verifikationsprüfungen",
    verified: "Belegprüfungen bestanden",
    evidenceHelp:
      "Prüfe die Quellen der Antwort. Eine bestandene Prüfung garantiert keine Richtigkeit.",
    cancel: "Anfrage abbrechen",
    emptySource: "Keine Quellenbelege übermittelt",
    checkShape: "Die Antwort verwendet unterstützte visuelle Komponenten.",
    checkSources:
      "Die Referenzen gehören zu den Belegen des ausgewählten Portfolios.",
    checkValues:
      "Kennzahlen und Diagrammwerte wurden mit der Quelle abgeglichen.",
    checkReview:
      "Eine unabhängige Prüfung hat die Antwort mit den Belegen verglichen.",
    answerWithheld:
      "Die Antwort konnte nicht verifiziert werden. Stelle eine konkretere Frage zum vorhandenen Portfoliostand.",
    componentsRemoved:
      "Visuelle Elemente ohne ausreichende Belege wurden ausgelassen.",
  },
  fr: {
    intro:
      "Posez une question, comparez des preuves ou demandez un graphique, un tableau ou une illustration ici.",
    chartPrompt:
      "Montre l’allocation du portefeuille dans un graphique et explique la plus grande concentration avec des sources.",
    tablePrompt:
      "Compare les constats d’allocation dans un tableau avec leurs sources.",
    diagramPrompt:
      "Dessine un schéma conceptuel reliant les positions, les contrôles d’allocation et la revue du conseiller.",
    chart: "Graphique d’allocation",
    table: "Tableau des preuves",
    diagram: "Expliquer visuellement",
    imageHelp:
      "Générez une illustration ici. Décrivez-la après /image. Les images ne sont pas des preuves financières.",
    imagePlaceholder: "/image Décrivez l’illustration…",
    imageGenerating: "Création de votre illustration…",
    imageRequired: "Ajoutez une description après /image avant l’envoi.",
    imageTooLong: "Réduisez la description de l’image à 2 000 caractères.",
    sendHelp:
      "Envoyez votre question. Entrée envoie ; Maj+Entrée ajoute une ligne.",
    voiceHelp:
      "Lancez une conversation vocale en direct sur le portefeuille sélectionné.",
    dictateHelp: "Dictez dans le champ, puis relisez et envoyez votre message.",
    scopeHelp:
      "Les réponses utilisent l’instantané du portefeuille sélectionné. Changer de portefeuille démarre une nouvelle conversation.",
    sources: "Sources justificatives",
    chartData: "Voir les valeurs du graphique",
    conceptual: "Schéma conceptuel",
    hypothetical: "Scénario illustratif · pas une prévision",
    assumptions: "Hypothèses du scénario",
    review: "Revue requise",
    checks: "Contrôles de vérification",
    verified: "Contrôles des preuves réussis",
    evidenceHelp:
      "Examinez les sources de la réponse. Un contrôle réussi ne garantit pas l’exactitude.",
    cancel: "Annuler la demande",
    emptySource: "Aucune source fournie",
    checkShape: "La réponse utilise des composants visuels pris en charge.",
    checkSources:
      "Les références appartiennent aux preuves du portefeuille sélectionné.",
    checkValues:
      "Les indicateurs et valeurs du graphique ont été comparés à la source.",
    checkReview: "Une revue indépendante a comparé la réponse aux preuves.",
    answerWithheld:
      "La réponse n’a pas pu être vérifiée. Posez une question plus précise sur l’instantané disponible.",
    componentsRemoved:
      "Les éléments visuels insuffisamment étayés ont été omis.",
  },
};

export function chatNotice(value: string, copy: ChatCopy): string {
  const notices: Record<string, string> = {
    "component-schema": copy.checkShape,
    "run-local-source-membership": copy.checkSources,
    "metric-and-chart-values": copy.checkValues,
    "independent-model-review": copy.checkReview,
    "draft-rejected-before-model-review": copy.answerWithheld,
    ANSWER_WITHHELD_BY_VERIFICATION: copy.answerWithheld,
    UNSUPPORTED_COMPONENTS_REMOVED: copy.componentsRemoved,
  };
  return notices[value] ?? value;
}
