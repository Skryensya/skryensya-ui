import { chat } from "@tanstack/ai";
import type { EvalCase } from "../case.js";
import type { ProviderConfig } from "./providers.js";
import { connectServerTools } from "./mcp-tools.js";
import { scoreCase, type CaseScore } from "./scoring.js";

/*
 * THE FIRST REAL SLICE OF G6: a model, wired to the actual three MCP tools over the actual stdio
 * server, given nothing but one case's prompt. `run.ts` (the other half of F7) re-validates a tree
 * that was already composed by hand; this is the harness that README named as missing: it never
 * reads `evalCase.tree` before scoring, only after, to check what the agent independently arrived
 * at against it.
 *
 * A mismatch against the reference tree never fails a case (see `scoring.ts`): the reference is ONE
 * composition that passes G0-G3, not the only one a correct agent could produce. Only `valid` does:
 * whether the agent's own last `validate_ui` call came back valid. That is the one thing
 * G6 actually asks: did it arrive at A correct composition, not THE one already on file.
 */

export interface RunOptions {
  provider: ProviderConfig;
  model: string;
  verbose?: boolean;
}

export async function runCase(
  evalCase: EvalCase,
  lang: "es" | "en",
  options: RunOptions,
): Promise<CaseScore> {
  const { tools, calls, close } = await connectServerTools();

  try {
    const adapter = options.provider.createAdapter(options.model);
    await chat({
      adapter,
      messages: [{ role: "user", content: evalCase.prompt[lang] }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- MCP tools are discovered at
      // runtime from the server's own schemas; there is no static type to bind them to here.
      tools: tools as any,
      stream: false,
    });

    if (options.verbose) {
      console.log(`  [${evalCase.id}/${lang}] tools called: ${calls.map((c) => c.name).join(" -> ") || "(none)"}`);
    }

    return scoreCase(evalCase, lang, calls);
  } finally {
    await close();
  }
}
