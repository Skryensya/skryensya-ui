import type { ComponentContract } from "@skryensya/core/contract";
import { parseTokens, CSS_DIR } from "@skryensya/core/parse";

/*
 * What the manifest DERIVES about a contract rather than copying it: the bindings each signature has,
 * and where each styling hook comes from. Both used to be answered by reading source; neither needs
 * an author to restate what the code already says.
 */

export type SignatureBindings = {
  /** Authored markup the emitter writes. Every signature has it. */
  readonly markup: true;
  /** The React export, `module#Name`. */
  readonly react: string;
  /** The attribute a Vanilla enhancer mounts on, or null for markup that needs no script. */
  readonly enhancer: string | null;
  /** Floating content leaves the subtree in React (portal) while Vanilla keeps it in place. */
  readonly portals: boolean;
};

export function bindingsOf(contract: ComponentContract): Readonly<Record<string, SignatureBindings>> {
  return Object.fromEntries(
    Object.entries(contract.signatures).map(([name, signature]) => [
      name,
      {
        markup: true,
        react: `${signature.react.from}#${signature.react.name}`,
        enhancer: signature.mount ?? null,
        portals: Boolean(signature.portals),
      },
    ]),
  );
}

export type HookDetail = {
  /** The value the stylesheet gives it where it is first declared, as written. */
  readonly default: string | null;
  /** The sheet that first declares it. */
  readonly sheet: string | null;
  /** The contract part whose class that declaring rule selects, when one does. */
  readonly part: string | null;
  /** Written at runtime by a binding (`outputHooks`): read it, do not set it. */
  readonly output: boolean;
};

let corpus: ReturnType<typeof parseTokens> | undefined;

export function hookDetailsOf(contract: ComponentContract): Readonly<Record<string, HookDetail>> {
  corpus ??= parseTokens(CSS_DIR);
  const rels = [contract.css, ...(contract.hookSheets ?? [])].map((sheet) => sheet.replace(/^@skryensya\/core\//, ""));
  const files = rels.map((rel) => corpus!.files.find((file) => file.rel === rel)).filter((file) => file !== undefined);
  const output = new Set(contract.outputHooks ?? []);

  return Object.fromEntries(
    (contract.hooks ?? []).map((hook) => {
      for (const file of files) {
        const css = (file as { css?: string }).css ?? "";
        for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
          const declaration = rule[2]!.match(new RegExp(`${hook.replace(/-/g, "\\-")}\\s*:\\s*([^;]+);`));
          if (!declaration) continue;
          const selector = rule[1]!.replace(/\/\*[\s\S]*?\*\//g, "").trim();
          const part =
            Object.entries(contract.parts)
              .filter(([, className]) => new RegExp(`\\.${className}(?![\\w-])`).test(selector))
              .sort(([, a], [, b]) => b.length - a.length)[0]?.[0] ?? null;
          return [hook, { default: declaration[1]!.trim(), sheet: `@skryensya/core/${(file as { rel: string }).rel}`, part, output: output.has(hook) }];
        }
      }
      return [hook, { default: null, sheet: null, part: null, output: output.has(hook) }];
    }),
  );
}
