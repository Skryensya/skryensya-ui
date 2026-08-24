import { evalCases } from "./index.js";
import { runCase } from "./agent/harness.js";
import { detectProvider, isProviderId, providers, type ProviderId } from "./agent/providers.js";
import type { CaseScore } from "./agent/scoring.js";

/*
 * THE SECOND HALF OF F7, opt-in and separate from `pnpm check` on purpose: this spends real API
 * calls against a real model and is not deterministic, so it does not belong in the static gate
 * `run.ts` already runs on every check. Run it by hand:
 *
 *   pnpm --filter @skryensya/evals agent [--provider anthropic|openai] [--model <id>]
 *                                        [--lang es|en|both] [--case <id>] [--verbose]
 *
 * See evals/README.md for what this does and does not prove.
 */

function parseArgs(argv: string[]): {
  provider?: string;
  model?: string;
  lang: "es" | "en" | "both";
  caseId?: string;
  verbose: boolean;
} {
  const args = { lang: "both" as const, verbose: false } as {
    provider?: string;
    model?: string;
    lang: "es" | "en" | "both";
    caseId?: string;
    verbose: boolean;
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--provider") args.provider = argv[++i];
    else if (arg === "--model") args.model = argv[++i];
    else if (arg === "--lang") args.lang = argv[++i] as "es" | "en" | "both";
    else if (arg === "--case") args.caseId = argv[++i];
    else if (arg === "--verbose") args.verbose = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
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
    console.error(
      "  No provider configured: set one of\n" +
        Object.entries(providers)
          .map(([id, config]) => `    ${config.envVar} (for --provider ${id})`)
          .join("\n"),
    );
    process.exitCode = 1;
    return;
  }

  const provider = providers[providerId];
  if (!process.env[provider.envVar]) {
    console.error(`  --provider ${providerId} needs ${provider.envVar} set.`);
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

  console.log(`  provider: ${providerId} (${model})`);
  console.log(`  running ${cases.length} case(s) x ${langs.length} lang(s)\n`);

  const scores: CaseScore[] = [];
  for (const evalCase of cases) {
    for (const lang of langs) {
      const score = await runCase(evalCase, lang, { provider, model, verbose: args.verbose });
      scores.push(score);
      const mark = score.valid ? "PASS" : "FAIL";
      const note = score.valid
        ? score.matchesReferenceMarkup === false
          ? " (valid, differs from reference tree)"
          : ""
        : `: ${score.reason}`;
      console.log(`  ${mark}  ${score.caseId} [${lang}]${note}`);
    }
  }

  const failed = scores.filter((score) => !score.valid);
  const divergent = scores.filter((score) => score.valid && score.matchesReferenceMarkup === false);

  console.log(
    `\n  ${scores.length - failed.length}/${scores.length} valid` +
      (divergent.length > 0 ? `, ${divergent.length} valid but different from the reference tree` : ""),
  );

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
