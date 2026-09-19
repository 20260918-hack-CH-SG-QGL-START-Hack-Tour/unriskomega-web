# AnswerBlocks

Displays validated metric, table, chart, evidence, diagram and projection components. Receives `components`, source `evidence`, `locale` and translated `copy` through props. No networking or feature state is used.

Charts preserve negative and zero values, expose every number as text and use locale-aware formatting. Projections carry assumptions and an illustrative-scenario disclosure. Diagrams show both connections and a readable relation list. Source references expand with native keyboard-accessible details controls. All model strings remain escaped React children; source locators are text, never executable links, HTML or SVG.
