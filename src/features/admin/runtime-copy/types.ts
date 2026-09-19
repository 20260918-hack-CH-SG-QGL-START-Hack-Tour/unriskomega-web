export type RuntimeCopy = {
  agents: Record<string, string>;
  skills: Record<string, [string, string, string]>;
  steps: Record<string, string>;
};
