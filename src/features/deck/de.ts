import type { Slide } from "./content";
export const de: Slide[] = [
  {
    kind: "hero",
    label: "UNRISKOMEGA · BERATERINTELLIGENZ",
    title: "Portfoliokontext.\nBereit für den Anruf.",
    body: "Ein quellenbasiertes Briefing für das nächste Kundengespräch des Beraters.",
    points: ["START Hack Tour · St. Gallen", "19. September 2026"],
    footnote:
      "Hackathon-Demonstration auf Basis der bereitgestellten UnRiskOmega-Challenge.",
    accent: true,
  },
  {
    kind: "problem",
    label: "01 / DER KUNDENANRUF",
    title: "Die Frage kommt.\nDer Kontext ist verstreut.",
    body: "Die Aufgabe: eine prägnante Kundengeschichte, die ein Berater in etwa 60 Sekunden lesen kann.",
    points: [
      "Portfolio und Positionen",
      "Marktnachrichten",
      "CIO-Sicht der Bank",
    ],
    footnote:
      "UnRiskOmega-Challenge, S. 8–12. Die Lesezeit ist ein Entwurfsziel und kein gemessenes Generierungs-SLA.",
  },
  {
    kind: "briefing",
    label: "02 / DAS BRIEFING",
    title: "Eine fundierte Antwort.\nAn einem Ort.",
    body: "Kunden auswählen. Portfolio prüfen. Das Gespräch mit den zugehörigen Quellen vorbereiten.",
    points: ["Entwicklung", "Portfoliozustand", "Ausblick und Gespräch"],
    footnote:
      "Historischer Snapshot. NAV-Änderungen sind keine verifizierten Renditen; Vorschläge bedürfen der Beraterprüfung.",
  },
  {
    kind: "conversation",
    label: "03 / DIE NACHFRAGE",
    title: "Eine Frage stellen.\nDie Erklärung sehen.",
    body: "Derselbe Dialog antwortet mit Diagrammen, Tabellen, Kennzahlen, Quellen oder einem ausdrücklich hypothetischen Szenario.",
    points: [
      "Text und vom Nutzer gestartete Sprache",
      "Visuelle Antworten mit Quellen",
      "Generierte Bilder im Gespräch",
    ],
    footnote:
      "Echte Produktaufnahme. Antworten werden vor der Anzeige geprüft; die Prüfung garantiert keine finanzielle Richtigkeit.",
    accent: true,
  },
  {
    kind: "evidence",
    label: "04 / DIE QUELLEN",
    title: "Die Quelle bleibt\nmit der Geschichte verbunden.",
    body: "Portfolioberechnungen liefern die Fakten. Das Modell erklärt sie; eine separate Prüfung kontrolliert den Entwurf.",
    points: [
      "Kundenkontext bleibt getrennt",
      "Fehlende Daten bleiben sichtbar",
      "Aktionen bleiben Gesprächsentwürfe",
    ],
    footnote:
      "Aktuelle Marktnachrichten und eine freigegebene Banksicht fehlen im Datensatz. Dies wird ausdrücklich angezeigt.",
  },
  {
    kind: "custody",
    label: "05 / DAS EXTERNE PORTFOLIO",
    title: "Ein externer Auszug.\nEin Portfoliogespräch.",
    body: "Der Bonusablauf führt ein Depot-PDF in ein geprüftes virtuelles Portfolio neben dem nativen Kontext über.",
    points: [
      "Quellseiten und Bewertungsdaten erhalten",
      "Kennungen und Beträge abgleichen",
      "Vor Nutzung des Portfolios bestätigen",
    ],
    footnote:
      "Der Import erfordert Prüfung. Ungeklärte Positionen bleiben sichtbar; es werden keine Aufträge übermittelt.",
  },
  {
    kind: "architecture",
    label: "06 / DAS SYSTEM",
    title: "Ein kontrollierter Weg\nvon Daten zur Antwort.",
    body: "Ein begrenzter Agentenablauf verbindet den Arbeitsbereich mit Portfolioquellen und Modellprüfung über ein zentrales Gateway.",
    points: [
      "Next.js-Arbeitsbereich",
      "Rust-Backend und Daten",
      "OpenClaw-Orchestrierung",
      "Rust-Kern · Modell und Prüfung",
    ],
    footnote:
      "Fünf Dienste in Azure. Zugangsdaten bleiben im Kern; prozesslokale Ergebnisse sind kein dauerhaftes Gedächtnis.",
  },
  {
    kind: "business",
    label: "07 / GESCHÄFTSHYPOTHESE",
    title: "Für Berater.\nVon Institutionen gekauft.",
    body: "Mit einem Vorbereitungsablauf in einer Bank oder Beratungsplattform beginnen.",
    points: [
      "Kundenbetreuer und Anlageberater",
      "Banken und Portfolioplattformen",
      "Plattformabonnement und aktive Berater",
      "Vorbereitungszeit und Genauigkeit messen",
    ],
    footnote:
      "Kommerzielle Hypothese. Nachfrage, Preis und Zahlungsbereitschaft erfordern einen Pilotversuch; keine Markt- oder Traktionsbehauptung.",
  },
  {
    kind: "roadmap",
    label: "08 / UMSETZUNG UND VALIDIERUNG",
    title: "Ein funktionierendes Produkt.\nEin messbarer nächster Schritt.",
    body: "JO entwickelte die Demonstration mit gelieferten Portfoliodaten, mehreren Sprachen und prüfbaren Begründungen.",
    points: [
      "Briefing, visuelle Nachfragen und Sprache",
      "Quellengraph und Laufzeitinspektion",
      "Unbekannten Testkunden mit Beratern prüfen",
      "Verständnis, Genauigkeit und Zeit messen",
    ],
    footnote:
      "Die Demonstration belegt weder Produktionsreife noch freigegebene Bankintegration oder Kundenempfehlungen.",
  },
  {
    kind: "closing",
    label: "09 / DIE LIVE-DEMO",
    title: "Bringen Sie einen Testkunden.\nBereiten wir den Anruf vor.",
    body: "Ein Partner. Ein freigegebener Ablauf. Ein Pilot mit klarer Prüfverantwortung und messbaren Ergebnissen.",
    points: [
      "Beraterarbeitsbereich öffnen",
      "Quellen hinter einer Antwort prüfen",
    ],
    footnote: "START Hack Tour St. Gallen · UnRiskOmega-Challenge · JO",
    accent: true,
  },
];
