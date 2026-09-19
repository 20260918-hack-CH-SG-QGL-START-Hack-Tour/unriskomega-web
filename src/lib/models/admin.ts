import { list, number, record, string } from "@/lib/api/client";
export type DatasetField = {
  name: string;
  types: string[];
  present: number;
  nullable: boolean;
};
export type Dataset = {
  id: string;
  sourceId: string;
  locator: string;
  records: number;
  fields: DatasetField[];
};
export type GraphNode = {
  id: string;
  label: string;
  kind: string;
  count: number;
};
export type GraphEdge = { from: string; to: string; relation: string };
export type AdminCatalog = {
  access: "demo-readonly";
  checkedAt: string;
  counts: {
    clients: number;
    portfolios: number;
    holdings: number;
    violations: number;
    missingPerformanceYtd: number;
  };
  valuationRange: { from: string | null; to: string | null };
  source: {
    generatedAt: string;
    sources: { id: string; file: string; sha256: string }[];
    datasets: Dataset[];
    documents: { id: string; topic: string; languages: string[] }[];
  };
  graph: { nodes: GraphNode[]; edges: GraphEdge[]; scope: string };
  ontology: {
    id: string;
    from: string;
    to: string;
    join: string;
    rule: string;
  }[];
};
export type RuntimeAgent = {
  id: string;
  name: string;
  role: string;
  description: string;
  skillIds: string[];
  mode: string;
};
export type RuntimeSkill = {
  id: string;
  name: string;
  description: string;
  status: string;
  input: string;
  output: string;
  sourceReferences: string[];
};
export type RuntimeRegistry = {
  version: string;
  profile: {
    id: string;
    name: string;
    tools: string[];
    deniedActions: string[];
  };
  agents: RuntimeAgent[];
  skills: RuntimeSkill[];
  workflow: {
    id: string;
    mode: string;
    steps: { agentId: string; action: string }[];
  };
  capabilities: Record<string, boolean>;
};
export type RuntimeOutcome = {
  id: string;
  status: string;
  agentIds: string[];
  skillIds: string[];
  verification: { status: string; checks: string[] };
  warnings: string[];
};
const strings = (value: unknown) => list(value).map(string);
const nullableString = (value: unknown) =>
  value === null ? null : string(value);
function boolean(value: unknown): boolean {
  if (typeof value !== "boolean") throw new Error("Invalid response boolean");
  return value;
}
function parseDataset(value: unknown): Dataset {
  const d = record(value);
  return {
    id: string(d.id),
    sourceId: string(d.sourceId),
    locator: string(d.locator),
    records: number(d.records),
    fields: list(d.fields).map((item) => {
      const f = record(item);
      return {
        name: string(f.name),
        types: strings(f.types),
        present: number(f.present),
        nullable: boolean(f.nullable),
      };
    }),
  };
}
export function parseAdminCatalog(value: unknown): AdminCatalog {
  const c = record(value),
    counts = record(c.counts),
    source = record(c.source),
    graph = record(c.graph),
    range = record(c.valuationRange);
  if (c.access !== "demo-readonly")
    throw new Error("Unexpected admin access scope");
  const nodes = list(graph.nodes).map((item) => {
    const n = record(item);
    return {
      id: string(n.id),
      label: string(n.label),
      kind: string(n.kind),
      count: number(n.count),
    };
  });
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = list(graph.edges).map((item) => {
    const e = record(item);
    const edge = {
      from: string(e.from),
      to: string(e.to),
      relation: string(e.relation),
    };
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to))
      throw new Error("Graph edge has no node");
    return edge;
  });
  return {
    access: c.access,
    checkedAt: string(c.checkedAt),
    counts: {
      clients: number(counts.clients),
      portfolios: number(counts.portfolios),
      holdings: number(counts.holdings),
      violations: number(counts.violations),
      missingPerformanceYtd: number(counts.missingPerformanceYtd),
    },
    valuationRange: {
      from: nullableString(range.from),
      to: nullableString(range.to),
    },
    source: {
      generatedAt: string(source.generatedAt),
      sources: list(source.sources).map((item) => {
        const s = record(item);
        return {
          id: string(s.id),
          file: string(s.file),
          sha256: string(s.sha256),
        };
      }),
      datasets: list(source.datasets).map(parseDataset),
      documents: list(source.documents).map((item) => {
        const d = record(item);
        return {
          id: string(d.id),
          topic: string(d.topic),
          languages: strings(d.languages),
        };
      }),
    },
    graph: { nodes, edges, scope: string(graph.scope) },
    ontology: list(c.ontology).map((item) => {
      const o = record(item);
      return {
        id: string(o.id),
        from: string(o.from),
        to: string(o.to),
        join: string(o.join),
        rule: string(o.rule),
      };
    }),
  };
}
export function parseRuntime(value: unknown): RuntimeRegistry {
  const r = record(value),
    profile = record(r.profile),
    workflow = record(r.workflow);
  return {
    version: string(r.version),
    profile: {
      id: string(profile.id),
      name: string(profile.name),
      tools: strings(profile.tools),
      deniedActions: strings(profile.deniedActions),
    },
    agents: list(r.agents).map((item) => {
      const a = record(item);
      return {
        id: string(a.id),
        name: string(a.name),
        role: string(a.role),
        description: string(a.description),
        skillIds: strings(a.skillIds),
        mode: string(a.mode),
      };
    }),
    skills: list(r.skills).map((item) => {
      const s = record(item);
      return {
        id: string(s.id),
        name: string(s.name),
        description: string(s.description),
        status: string(s.status),
        input: string(s.input),
        output: string(s.output),
        sourceReferences: strings(s.sourceReferences),
      };
    }),
    workflow: {
      id: string(workflow.id),
      mode: string(workflow.mode),
      steps: list(workflow.steps).map((item) => {
        const s = record(item);
        return { agentId: string(s.agentId), action: string(s.action) };
      }),
    },
    capabilities: Object.fromEntries(
      Object.entries(record(r.capabilities)).map(([key, value]) => [
        key,
        boolean(value),
      ]),
    ),
  };
}
export function parseOutcomes(value: unknown): RuntimeOutcome[] {
  return list(record(value).outcomes).map((item) => {
    const o = record(item),
      v = record(o.verification);
    return {
      id: string(o.id),
      status: string(o.status),
      agentIds: strings(o.agentIds),
      skillIds: strings(o.skillIds),
      warnings: strings(o.warnings),
      verification: { status: string(v.status), checks: strings(v.checks) },
    };
  });
}
