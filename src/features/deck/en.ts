import type { Slide } from "./content";
export const en: Slide[] = [
  {
    label: "01 / UNRISKOMEGA",
    title: "Portfolio context.\nReady for the conversation.",
    body: "An advisor companion that turns portfolio snapshots into concise, traceable briefings.",
    points: ["START Hack Tour St. Gallen", "19 September 2026"],
    footnote: "Hackathon demonstration using the supplied challenge dataset.",
    accent: true,
  },
  {
    label: "02 / THE PROBLEM",
    title: "The client calls.\nThe context is scattered.",
    body: "Advisors need to connect positions, allocation limits and supporting context before they can discuss the portfolio clearly.",
    points: [
      "Financial detail takes time to reconcile.",
      "Missing evidence can hide behind fluent summaries.",
    ],
    footnote: "Problem framing: supplied UnRiskOmega challenge, pages 8–10.",
  },
  {
    label: "03 / THE SOLUTION",
    title: "One portfolio.\nA considered briefing.",
    body: "Select a portfolio and review its development, health and outlook with the supporting source snapshot in view.",
    points: [
      "Inspect allocation and recorded findings.",
      "Explore follow-up questions by text or voice.",
    ],
    footnote:
      "Demo capability depends on connected services and model availability.",
  },
  {
    label: "04 / THE DIFFERENCE",
    title: "The evidence stays\nwithin reach.",
    body: "Deterministic portfolio calculations establish the facts. AI helps explain them within the selected client context.",
    points: [
      "Unavailable history remains unavailable.",
      "The advisor reviews every discussion proposal.",
    ],
    footnote:
      "No autonomous trading, suitability certification or promised investment returns.",
  },
  {
    label: "05 / CUSTOMERS",
    title: "Built around\nthe advisor’s workflow.",
    body: "The proposed first users are relationship managers and investment advisors working with portfolio platforms.",
    points: [
      "Initial buyer hypothesis: banks and advisory platforms.",
      "First validation: one preparation workflow with a small advisor group.",
    ],
    footnote:
      "Customer demand, market size and willingness to pay remain unvalidated.",
  },
  {
    label: "06 / BUSINESS MODEL",
    title: "A platform license.\nValue measured in preparation.",
    body: "Test a bank or platform subscription with an active-advisor component, priced after a scoped pilot.",
    points: [
      "Measure preparation time and accepted briefings.",
      "Include model, data, infrastructure and review costs.",
    ],
    footnote:
      "Commercial hypothesis. No pricing, revenue or signed customers are claimed.",
  },
  {
    label: "07 / ARCHITECTURE",
    title: "Clear service boundaries.\nOne controlled AI gateway.",
    body: "A Next.js workspace connects to Rust services over authenticated HTTP and WebSockets. Internal services communicate through gRPC.",
    points: [
      "AI core holds provider credentials. OpenClaw calls AI core.",
      "WebRTC carries user-started voice. Azure runs the containers.",
    ],
    footnote:
      "The browser and covenant service do not receive the provider API key.",
  },
  {
    label: "08 / POSITIONING",
    title: "A briefing layer\ninside portfolio work.",
    body: "The product hypothesis connects existing portfolio analytics with readable, inspectable client preparation.",
    points: [
      "Portfolio systems remain the source of record.",
      "Generic chat alone does not establish portfolio evidence.",
    ],
    footnote:
      "Positioning hypothesis, not a verified claim of competitive uniqueness.",
  },
  {
    label: "09 / DELIVERY & TEAM",
    title: "A working demonstration.\nA focused pilot next.",
    body: "JO leads this hackathon implementation. The next step is evaluation with an authorized partner and named review owners.",
    points: [
      "Now: challenge data, multilingual workspace and service integration.",
      "Next: held-out clients, advisor comprehension and security review.",
    ],
    footnote:
      "No partner endorsement, customer traction or production certification is claimed.",
  },
  {
    label: "10 / THE ASK",
    title: "Let’s test a better\nclient conversation.",
    body: "One partner. One approved preparation workflow. A measured pilot with clear review and exit criteria.",
    points: [
      "Compare preparation time and factual accuracy.",
      "Expand only after repeat use and quality evidence.",
    ],
    footnote: "Open the live workspace to explore the challenge demonstration.",
    accent: true,
  },
];
