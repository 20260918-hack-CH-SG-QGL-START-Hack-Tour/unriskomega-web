export type ExplorerNode = {
  id: string;
  label: string;
  group: string;
  description?: string;
  facts?: { label: string; value: string }[];
};
export type ExplorerEdge = {
  source: string;
  target: string;
  label: string;
  detail?: string;
};
export type ExplorerGroup = { id: string; label: string };
export type GraphCopy = {
  search: string;
  focus: string;
  all: string;
  local: string;
  depth: string;
  groups: string;
  labels: string;
  zoomIn: string;
  zoomOut: string;
  reset: string;
  instructions: string;
  inspector: string;
  choose: string;
  connections: string;
  nodes: string;
  edges: string;
  empty: string;
  list: string;
  fit: string;
  spread: string;
  overview: string;
  relationship: string;
};
export type Position = { x: number; y: number };
