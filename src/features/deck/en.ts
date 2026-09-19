import type { Slide } from "./content";
export const en: Slide[] = [
  {
    kind: "hero",
    label: "UNRISKOMEGA · ADVISOR INTELLIGENCE",
    title: "Portfolio context.\nReady for the call.",
    body: "An evidence-grounded briefing assistant for the advisor’s next client conversation.",
    points: ["START Hack Tour · St. Gallen", "19 September 2026"],
    footnote:
      "Hackathon demonstration built around the supplied UnRiskOmega challenge.",
    accent: true,
  },
  {
    kind: "problem",
    label: "01 / THE CLIENT CALL",
    title: "The question arrives.\nThe context is scattered.",
    body: "The challenge: one concise client story an advisor can read in about 60 seconds.",
    points: ["Portfolio & positions", "Market news", "Bank CIO view"],
    footnote:
      "UnRiskOmega challenge, pp. 8–12. Reading time is a design target, not a measured generation SLA.",
  },
  {
    kind: "briefing",
    label: "02 / THE BRIEFING",
    title: "A considered answer.\nIn one place.",
    body: "Select the client. Review the portfolio. Prepare the conversation with the supporting evidence in reach.",
    points: ["Development", "Portfolio health", "Outlook & discussion"],
    footnote:
      "Historical snapshot. NAV changes are not verified investment returns; proposals remain subject to advisor review.",
  },
  {
    kind: "conversation",
    label: "03 / THE FOLLOW-UP",
    title: "Ask a question.\nSee the explanation.",
    body: "The same conversation can answer with a chart, table, metric, diagram, evidence or an explicit scenario.",
    points: [
      "Text and user-started voice",
      "Visual answers with sources",
      "Generated images in the conversation",
    ],
    footnote:
      "Actual product capture. Provider answers are reviewed before display; that review is not a guarantee of financial correctness.",
    accent: true,
  },
  {
    kind: "evidence",
    label: "04 / WHY TRUST THE BRIEFING",
    title: "The source stays\nattached to the story.",
    body: "Portfolio calculations establish the facts. The model explains them; a separate review checks the draft.",
    points: [
      "Client scope is preserved",
      "Missing data stays visible",
      "Every action stays a discussion draft",
    ],
    footnote:
      "Current market news and an approved house view are not supplied. Their absence is shown explicitly.",
  },
  {
    kind: "custody",
    label: "05 / THE EXTERNAL PORTFOLIO",
    title: "An outside statement.\nOne portfolio conversation.",
    body: "The bonus workflow brings a custody PDF into a reviewed virtual portfolio, alongside native portfolio context.",
    points: [
      "Keep source pages and valuation dates",
      "Reconcile identifiers and amounts",
      "Confirm before using the portfolio",
    ],
    footnote:
      "Custody import is a review workflow. Unresolved positions must remain visible; no trades are submitted.",
  },
  {
    kind: "architecture",
    label: "06 / THE SYSTEM",
    title: "A controlled path\nfrom data to answer.",
    body: "A bounded agent workflow connects the workspace to portfolio evidence and a model review through one provider gateway.",
    points: [
      "Next.js workspace",
      "Rust backend & data",
      "OpenClaw orchestration",
      "Rust core · model & review",
    ],
    footnote:
      "Five services on Azure. Provider credentials stay in core; process-local outcomes are inspection records, not persistent memory.",
  },
  {
    kind: "business",
    label: "07 / THE BUSINESS HYPOTHESIS",
    title: "Used by advisors.\nBought by institutions.",
    body: "Start with one preparation workflow inside a bank or advisory platform.",
    points: [
      "Relationship managers & investment advisors",
      "Banks & portfolio platforms",
      "Platform subscription + active advisors",
      "Measure preparation time and briefing accuracy",
    ],
    footnote:
      "Commercial hypothesis. Demand, pricing and willingness to pay require a pilot; no market size or traction is claimed.",
  },
  {
    kind: "roadmap",
    label: "08 / DELIVERY & VALIDATION",
    title: "A working product.\nA measurable next step.",
    body: "JO built the demonstration around supplied portfolio data, multilingual access and inspectable reasoning.",
    points: [
      "Briefing, visual follow-up & voice",
      "Source graph and runtime inspection",
      "Evaluate a held-out client with advisors",
      "Measure comprehension, accuracy and time",
    ],
    footnote:
      "Demonstration evidence does not establish production readiness, bank integration approval or customer endorsement.",
  },
  {
    kind: "closing",
    label: "09 / THE LIVE DEMO",
    title: "Bring a test client.\nLet’s prepare the call.",
    body: "One partner. One approved workflow. A pilot with clear review owners and measurable outcomes.",
    points: [
      "Open the advisor workspace",
      "Inspect the evidence behind an answer",
    ],
    footnote: "START Hack Tour St. Gallen · UnRiskOmega challenge · JO",
    accent: true,
  },
];
