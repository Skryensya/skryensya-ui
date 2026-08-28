import { evalCases } from "./index.js";
import { detectProvider, isProviderId, providers, type ProviderId } from "./agent/providers.js";
import { newRunId, writeRunReport } from "./agent/report.js";
import type { CaseScore } from "./agent/scoring.js";

/*
 * THE SECOND HALF OF F7, opt-in and separate from `pnpm check` on purpose: this spends real usage
 * against a real model (API-metered for `anthropic`/`openai`, subscription-metered for
 * `claude-code`) and is not deterministic, so it does not belong in the static gate `run.ts`
 * already runs on every check. Run it by hand:
 *
 *   pnpm --filter @skryensya/evals agent [--provider anthropic|openai|claude-code|codex-cli]
 *                                        [--model <id>] [--lang es|en|both] [--case <id>]
 *                                        [--concurrency <n>] [--verbose]
 *
 * See evals/README.md for what this does and does not prove, and `agent/providers.ts` for what each
 * provider actually is.
 *
 * DEFAULTS TO ENGLISH ONLY. The corpus HAS both languages (each case's `tree` still has to hold for
 * both  -  that's what `run.ts` checks on every `pnpm check`), but the live-agent measurement this file
 * runs is real, metered usage per call: doubling every run for a language pass that isn't the thing
 * under test is exactly the unnecessary spend to avoid. Pass `--lang both` (or `--lang es`) to
 * deliberately check the other language, e.g. after a prompt-wording change.
 *
 * DEFAULT CONCURRENCY IS 3, not sequential. Isolation lives in each `Provider.run()` call itself
 * (`claude-code-provider.ts`'s per-call `mkdtemp`, TanStack's own process-per-call MCP connection in
 * `mcp-tools.ts`), not in running one call at a time  -  running several in parallel doesn't weaken
 * that, it's what waiting for 24 sequential CLI spawns was costing for no reason. `--concurrency 1`
 * restores the old sequential behavior if a provider's rate limit needs it.
 */

function parseArgs(argv: string[]): {
  provider?: string;
  model?: string;
  lang: "es" | "en" | "both";
  caseId?: string;
  concurrency: number;
  verbose: boolean;
} {
  const args = { lang: "en" as const, concurrency: 3, verbose: false } as {
    provider?: string;
    model?: string;
    lang: "es" | "en" | "both";
    caseId?: string;
    concurrency: number;
    verbose: boolean;
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--provider") args.provider = argv[++i];
    else if (arg === "--model") args.model = argv[++i];
    else if (arg === "--lang") args.lang = argv[++i] as "es" | "en" | "both";
    else if (arg === "--case") args.caseId = argv[++i];
    else if (arg === "--concurrency") args.concurrency = Number(argv[++i]);
    else if (arg === "--verbose") args.verbose = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(args.concurrency) || args.concurrency < 1) {
    throw new Error(`--concurrency must be a positive integer, got: ${args.concurrency}`);
  }
  return args;
}

/** Runs `items` through `worker` with at most `limit` in flight, preserving each result's index. */
async function runWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function runOne(): Promise<void> {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runOne));
  return results;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const providerId: ProviderId | null = args.provider
    ? isProviderId(args.provider)
      ? args.provider
      : (() => {
          throw new Error(`Unknown provider "${args.provider}". Known: ${Object.keys(providers).join(", ")}`);
        })()
    : detectProvider();

  if (!providerId) {
    console.error("  No provider is available right now:");
    for (const provider of Object.values(providers)) {
      const availability = provider.availability();
      console.error(`    ${provider.id}: ${availability.ok ? "ok" : availability.reason}`);
    }
    process.exitCode = 1;
    return;
  }

  const provider = providers[providerId];
  const availability = provider.availability();
  if (!availability.ok) {
    console.error(`  --provider ${providerId} is not available: ${availability.reason}`);
    process.exitCode = 1;
    return;
  }

  const model = args.model ?? provider.defaultModel;
  const langs: Array<"es" | "en"> = args.lang === "both" ? ["es", "en"] : [args.lang];
  const cases = args.caseId ? evalCases.filter((c) => c.id === args.caseId) : evalCases;

  if (cases.length === 0) {
    console.error(`  No case matches --case ${args.caseId}`);
    process.exitCode = 1;
    return;
  }

  const runs = cases.flatMap((evalCase) => langs.map((lang) => ({ evalCase, lang })));

  console.log(`  provider: ${provider.label} (${model})`);
  console.log(
    `  running ${cases.length} case(s) x ${langs.length} lang(s) = ${runs.length} run(s), concurrency ${args.concurrency}\n`,
  );

  // Order of PRINTED lines follows completion, not `runs` order: with concurrency > 1, that is the
  // only honest order  -  a case that finishes first is not necessarily the first one listed.
  const scores = await runWithConcurrency(runs, args.concurrency, async ({ evalCase, lang }) => {
    const score = await provider.run(evalCase, lang, model, args.verbose);
    const mark = score.valid ? "PASS" : "FAIL";
    const note = score.valid
      ? score.matchesReferenceMarkup === false
        ? " (valid, differs from reference tree)"
        : ""
      : `: ${score.reason}`;
    console.log(`  ${mark}  ${score.caseId} [${lang}]${note}`);
    return score;
  });

  const runId = newRunId();
  const runDir = await writeRunReport({ runId, provider: providerId, model }, scores);

  const failed = scores.filter((score) => !score.valid);
  const divergent = scores.filter((score) => score.valid && score.matchesReferenceMarkup === false);

  console.log(
    `\n  ${scores.length - failed.length}/${scores.length} valid` +
      (divergent.length > 0 ? `, ${divergent.length} valid but different from the reference tree` : ""),
  );
  console.log(`  report: ${runDir}`);
  console.log(`  view it: pnpm --filter @skryensya/eval-viewer dev`);

  if (failed.length > 0) {
    console.error(`\n  ${failed.length} case(s) never reached a valid composition:`);
    for (const score of failed) console.error(`    ${score.caseId} [${score.lang}]: ${score.reason}`);
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
