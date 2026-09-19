import type { RuntimeCopy } from "./types";
export const en: RuntimeCopy = {
  agents: {
    manager:
      "Selects a bounded advisor or visual explanation workflow for the current evidence snapshot.",
    "evidence-curator":
      "Assigns run-local identifiers and JSON pointers to supplied evidence; never retrieves external instructions.",
    "portfolio-analyst":
      "Explains allocation, reported suitability findings, snapshot risk and unavailable performance in the requested language.",
    "visual-explainer":
      "Selects evidence-linked cards, tables and charts or clearly conceptual diagrams for the conversation.",
    verifier:
      "A separate model request checks the draft against the same evidence after deterministic component and citation validation.",
    "outcome-owner":
      "Records bounded run summaries and verification status without retaining client evidence or conversation text.",
    "image-designer":
      "Calls the configured image provider for an explicitly requested illustration without forwarding portfolio evidence.",
  },
  skills: {
    "portfolio-health": [
      "Prioritize reported suitability findings and data quality warnings; preserve the supplied severity and never certify suitability.",
      "Selected portfolio snapshot, reported violations, risk values and as-of labels",
      "Source-linked discussion points for advisor review",
    ],
    "allocation-check": [
      "Compare supplied weights and targets without mixing units, taxonomies or currencies.",
      "Allocation rows with weight, target, min, max and gap",
      "Evidence-linked allocation table or chart",
    ],
    "performance-honesty": [
      "Distinguish changes in the supplied NAV series from investment returns and unavailable attribution.",
      "Supplied history, as-of and data-gap records",
      "Precisely labelled observations or explicit unavailable states",
    ],
    "evidence-grounding": [
      "Keep claims in the selected evidence scope with identifiable sources and visible limitations.",
      "Run-local evidence records and a proposed answer",
      "Validated identifiers, deterministic checks and an independent model review",
    ],
    "visual-explanation": [
      "Choose bounded semantic UI components to explain real supplied data without executable markup.",
      "Question plus run-local evidence",
      "Metric, table, chart, evidence, conceptual diagram or explicit hypothetical projection",
    ],
    "image-generation": [
      "Generate a user-requested conceptual image within the conversation using the configured image provider.",
      "Explicit visual prompt and language; no portfolio evidence",
      "PNG image marked illustrative",
    ],
  },
  steps: {
    manager:
      "Select the advisor or visual specialist using the question, with no external tools.",
    "evidence-curator":
      "Create run-scoped evidence IDs from the server-supplied snapshot.",
    "portfolio-analyst":
      "Generate a schema-constrained answer; visual-explainer replaces this role for explicit visual requests.",
    verifier:
      "Check shape, source membership and numeric components, then independently review the remaining draft with a separate model request.",
    "outcome-owner":
      "Return accepted or needs_review and retain only a bounded anonymous run summary.",
  },
};
