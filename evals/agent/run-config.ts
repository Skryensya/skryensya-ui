import { fileURLToPath } from "node:url";
import { evalSystemPrompts, type Workflow } from "./system-prompt.js";

/*
 * WHICH SERVER AND WHICH FRAMING a run measures, set once by `run-agent.ts` and read by every
 * provider. It exists so the discovery workflow can be compared against the one it replaced on the
 * same cases: `--workflow catalog --server <path>` points at a build of the previous server (the
 * README says how to make one) with the framing its agents were given.
 */
export type RunConfig = {
  readonly workflow: Workflow;
  /** Absolute path to the stdio server entry every provider spawns. */
  readonly serverEntry: string;
};

const defaultEntry = fileURLToPath(new URL("../../packages/mcp/dist/index.js", import.meta.url));

let current: RunConfig = { workflow: "discovery", serverEntry: defaultEntry };

export function configureRun(config: Partial<RunConfig>): RunConfig {
  current = { ...current, ...config };
  return current;
}

export const runConfig = (): RunConfig => current;
export const systemPrompt = (): string => evalSystemPrompts[current.workflow];
