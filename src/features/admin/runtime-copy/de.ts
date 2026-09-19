import type { RuntimeCopy } from "./types";
export const de: RuntimeCopy = {
  agents: {
    manager:
      "Wählt einen begrenzten Beratungs- oder Visualisierungsablauf für den aktuellen Belegstand.",
    "evidence-curator":
      "Vergibt ausführungsbezogene Kennungen und JSON-Pfade für gelieferte Belege; ruft niemals externe Anweisungen ab.",
    "portfolio-analyst":
      "Erklärt Allokation, gemeldete Eignungsfeststellungen, Stichtagsrisiken und nicht verfügbare Performance in der angeforderten Sprache.",
    "visual-explainer":
      "Wählt beleggebundene Karten, Tabellen und Diagramme oder eindeutig konzeptionelle Darstellungen für das Gespräch.",
    verifier:
      "Eine separate Modellanfrage prüft den Entwurf anhand derselben Belege nach der deterministischen Komponenten- und Quellenprüfung.",
    "outcome-owner":
      "Protokolliert begrenzte Ausführungszusammenfassungen und den Prüfstatus, ohne Kundenbelege oder Gesprächstext zu speichern.",
    "image-designer":
      "Ruft den konfigurierten Bildanbieter für eine ausdrücklich angeforderte Illustration auf, ohne Portfoliobelege zu übertragen.",
  },
  skills: {
    "portfolio-health": [
      "Priorisiert gemeldete Eignungsfeststellungen und Datenqualitätshinweise; bewahrt den Schweregrad und bestätigt niemals die Eignung.",
      "Ausgewählter Portfoliostand, gemeldete Feststellungen, Risikowerte und Stichtage",
      "Quellenbezogene Gesprächspunkte zur Prüfung durch den Berater",
    ],
    "allocation-check": [
      "Vergleicht gelieferte Gewichte und Ziele, ohne Einheiten, Klassifikationen oder Währungen zu vermischen.",
      "Allokationszeilen mit Gewicht, Ziel, Minimum, Maximum und Abweichung",
      "Beleggebundene Allokationstabelle oder Grafik",
    ],
    "performance-honesty": [
      "Unterscheidet Veränderungen der gelieferten NAV-Reihe von Anlagerenditen und nicht verfügbarer Attribution.",
      "Gelieferter Verlauf, Stichtage und Datenlücken",
      "Präzise bezeichnete Beobachtungen oder ausdrücklich nicht verfügbare Werte",
    ],
    "evidence-grounding": [
      "Begrenzt Aussagen auf die ausgewählten Belege mit identifizierbaren Quellen und sichtbaren Einschränkungen.",
      "Belege dieser Ausführung und ein Antwortentwurf",
      "Validierte Kennungen, deterministische Prüfungen und eine unabhängige Modellprüfung",
    ],
    "visual-explanation": [
      "Wählt begrenzte semantische Oberflächenelemente, um gelieferte Daten ohne ausführbares Markup zu erklären.",
      "Frage und Belege dieser Ausführung",
      "Kennzahl, Tabelle, Grafik, Beleg, konzeptionelles Diagramm oder ausdrücklich hypothetische Projektion",
    ],
    "image-generation": [
      "Erzeugt ein vom Nutzer angefordertes konzeptionelles Bild im Gespräch über den konfigurierten Anbieter.",
      "Ausdrücklicher Bildwunsch und Sprache; keine Portfoliobelege",
      "Als Illustration gekennzeichnetes PNG-Bild",
    ],
  },
  steps: {
    manager:
      "Den Beratungs- oder Visualisierungsspezialisten anhand der Frage auswählen, ohne externe Werkzeuge.",
    "evidence-curator":
      "Ausführungsbezogene Belegkennungen aus dem vom Server gelieferten Datenstand erzeugen.",
    "portfolio-analyst":
      "Eine schema-konforme Antwort erzeugen; bei ausdrücklichen Visualisierungswünschen übernimmt der visuelle Spezialist diese Rolle.",
    verifier:
      "Struktur, Quellenzugehörigkeit und numerische Komponenten prüfen; anschließend den Entwurf mit einer separaten Modellanfrage unabhängig begutachten.",
    "outcome-owner":
      "Akzeptiert oder prüfbedürftig zurückgeben und nur eine begrenzte anonyme Ausführungszusammenfassung aufbewahren.",
  },
};
