import type { Slide } from "./content";
export const de: Slide[] = [
  {
    label: "01 / UNRISKOMEGA",
    title: "Portfoliokontext.\nBereit für das Gespräch.",
    body: "Ein Beraterbegleiter, der Portfolio-Datenstände in prägnante, nachvollziehbare Briefings übersetzt.",
    points: ["START Hack Tour St. Gallen", "19. September 2026"],
    footnote:
      "Hackathon-Demonstration mit dem bereitgestellten Challenge-Datensatz.",
    accent: true,
  },
  {
    label: "02 / DAS PROBLEM",
    title: "Der Kunde ruft an.\nDer Kontext ist verstreut.",
    body: "Berater müssen Positionen, Allokationsgrenzen und Kontext verbinden, bevor sie das Portfolio verständlich besprechen können.",
    points: [
      "Finanzielle Details abzugleichen kostet Zeit.",
      "Flüssige Zusammenfassungen können fehlende Belege verdecken.",
    ],
    footnote:
      "Problemgrundlage: bereitgestellte UnRiskOmega-Challenge, Seiten 8–10.",
  },
  {
    label: "03 / DIE LÖSUNG",
    title: "Ein Portfolio.\nEin fundiertes Briefing.",
    body: "Portfolio auswählen und Entwicklung, Zustand und Ausblick mit dem Quelldatenstand im Blick prüfen.",
    points: [
      "Allokation und erfasste Feststellungen untersuchen.",
      "Rückfragen per Text oder Sprache vertiefen.",
    ],
    footnote:
      "Die Demo hängt von verbundenen Diensten und Modellverfügbarkeit ab.",
  },
  {
    label: "04 / DER UNTERSCHIED",
    title: "Die Belege bleiben\ngreifbar.",
    body: "Deterministische Portfolioberechnungen liefern die Fakten. KI erklärt sie im Kontext des ausgewählten Kunden.",
    points: [
      "Nicht verfügbare Historie bleibt nicht verfügbar.",
      "Der Berater prüft jeden Gesprächsvorschlag.",
    ],
    footnote:
      "Kein autonomer Handel, keine Eignungszertifizierung oder Renditeversprechen.",
  },
  {
    label: "05 / KUNDEN",
    title: "Für den Alltag\nder Beratung entwickelt.",
    body: "Die ersten vorgesehenen Nutzer sind Kundenbetreuer und Anlageberater auf Portfolio-Plattformen.",
    points: [
      "Käuferhypothese: Banken und Beratungsplattformen.",
      "Erste Validierung: ein Vorbereitungsablauf mit einer kleinen Gruppe.",
    ],
    footnote:
      "Nachfrage, Marktgröße und Zahlungsbereitschaft sind noch nicht validiert.",
  },
  {
    label: "06 / GESCHÄFTSMODELL",
    title: "Eine Plattformlizenz.\nWert in der Vorbereitung.",
    body: "Ein Bank- oder Plattformabonnement mit einer Komponente je aktivem Berater nach einem begrenzten Pilot testen.",
    points: [
      "Vorbereitungszeit und akzeptierte Briefings messen.",
      "Modell-, Daten-, Infrastruktur- und Prüfungskosten einbeziehen.",
    ],
    footnote:
      "Geschäftshypothese. Keine behaupteten Preise, Umsätze oder Vertragskunden.",
  },
  {
    label: "07 / ARCHITEKTUR",
    title: "Klare Dienstgrenzen.\nEin kontrollierter KI-Zugang.",
    body: "Next.js verbindet sich per authentifiziertem HTTP und WebSockets mit Rust-Diensten. Intern kommunizieren Dienste über gRPC.",
    points: [
      "AI core verwahrt Schlüssel. OpenClaw verwendet AI core.",
      "WebRTC überträgt nutzerinitiierte Sprache. Azure betreibt Container.",
    ],
    footnote:
      "Browser und covenant erhalten keinen API-Schlüssel des Anbieters.",
  },
  {
    label: "08 / POSITIONIERUNG",
    title: "Eine Briefing-Schicht\nin der Portfolioarbeit.",
    body: "Die Produkthypothese verbindet bestehende Portfolioanalysen mit lesbarer und überprüfbarer Kundenvorbereitung.",
    points: [
      "Portfoliosysteme bleiben die führende Datenquelle.",
      "Allgemeiner Chat allein belegt keine Portfoliofakten.",
    ],
    footnote:
      "Positionierungshypothese, kein verifizierter Alleinstellungsanspruch.",
  },
  {
    label: "09 / UMSETZUNG & TEAM",
    title: "Eine funktionierende Demo.\nDanach ein gezielter Pilot.",
    body: "JO leitet diese Hackathon-Implementierung. Nächster Schritt: Evaluation mit autorisiertem Partner und benannten Prüfern.",
    points: [
      "Jetzt: Challenge-Daten, mehrsprachiger Arbeitsplatz und Integration.",
      "Danach: neue Kunden, Beraterverständnis und Sicherheitsprüfung.",
    ],
    footnote:
      "Keine behauptete Partnerschaft, Kundentraktion oder Produktionszertifizierung.",
  },
  {
    label: "10 / DIE EINLADUNG",
    title: "Ein besseres\nKundengespräch erproben.",
    body: "Ein Partner. Ein genehmigter Vorbereitungsablauf. Ein messbarer Pilot mit klaren Prüf- und Ausstiegskriterien.",
    points: [
      "Vorbereitungszeit und sachliche Richtigkeit vergleichen.",
      "Erst nach wiederholter Nutzung und Qualitätsbelegen ausweiten.",
    ],
    footnote:
      "Öffnen Sie den Arbeitsplatz und erkunden Sie die Challenge-Demo.",
    accent: true,
  },
];
