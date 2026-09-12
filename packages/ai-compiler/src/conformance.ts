import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import type { ComponentContract } from "@skryensya/core/contract";
import { contracts } from "@skryensya/core/registry";

/*
 * G1, and the one job left to the TypeScript Compiler API: proving a binding REALIZES its contract
 * rather than restating it (decision 28).
 *
 * The contract is a value, so the catalogue needs no extraction: this file does not read shapes out
 * of the type system. It asks one question the type system alone can answer: does a binding
 * re-declare an option Core already owns?
 *
 * "A binding" used to mean only the React `.tsx` file, which left a one-hop blind spot: a hand-copied
 * enum lived one file upstream, inside the contract's OWN file in core, with the react binding merely
 * importing it by name (fine, by this file's own rule. A `TypeReferenceNode` cannot drift). Core is
 * a source, not a binding, but it can still restate itself: `AccordionType = "single" | "multiple"`
 * sitting beside `accordionContract.options.type` is the same copy this file exists to catch, just
 * with the contract and its restatement in one file instead of two. So every contract's own file is
 * scanned too, with the identical check: core is allowed to name an option's type, never to write its
 * values out a second time.
 *
 * Drift is not *naming* an option; it is restating its VALUE SET, because that is the thing that can
 * go stale. So the check looks for literal types written by hand:
 *
 *   variant?: "neutral" | "accent"   drift: the contract's enum, copied, and now one short
 *   size?: ButtonSize                 fine:  ButtonSize is derived FROM the contract
 *   href: string                      fine:  narrowing a string option to required in one branch of
 *                                             a discriminated union is how the tag switch is typed
 *   href?: undefined                  fine:  the other branch of that same discriminant
 *   children, onClick, ref, className fine:  React's and the host element's, never the contract's
 */

export type ConformanceProblem = {
  readonly contract: string;
  readonly option: string;
  readonly file: string;
  readonly line: number;
  readonly message: string;
};

export function checkBindingConformance(repoRoot: string): readonly ConformanceProblem[] {
  const problems: ConformanceProblem[] = [];
  const coreFiles = coreContractFiles(repoRoot);

  for (const [id, contract] of Object.entries(contracts)) {
    const files = [bindingFile(repoRoot, contract), coreFiles.get(`${camel(id)}Contract`)].filter(
      (file): file is { path: string; text: string } => file !== undefined,
    );

    for (const file of files) {
      const source = ts.createSourceFile(
        file.path,
        file.text,
        ts.ScriptTarget.ES2022,
        /* setParentNodes */ true,
        ts.ScriptKind.TSX,
      );

      problems.push(...redeclaredOptions(source, id, contract, file.path));
    }
  }

  return problems;
}

/** Every binding of a contract lives in one file: its signatures all name the same React module. */
function bindingFile(
  repoRoot: string,
  contract: ComponentContract,
): { path: string; text: string } | undefined {
  const specifier = Object.values(contract.signatures)[0]?.react.from;
  if (!specifier) return undefined;

  // "@skryensya/react/button" → packages/react/src/components/button.tsx
  const name = specifier.split("/").pop();
  const path = join(repoRoot, "packages", "react", "src", "components", `${name}.tsx`);

  try {
    return { path, text: readFileSync(path, "utf8") };
  } catch {
    return undefined;
  }
}

/**
 * Every contract's own file in core, indexed by its exported symbol (`buttonContract`,
 * `accordionContract`, …). Read once, not once per contract: several contracts share one file
 * (`selection.ts` declares three), so a plain `join(repoRoot, "packages/core/src", id + ".ts")`
 * would miss those and silently skip the check for them.
 */
function coreContractFiles(repoRoot: string): Map<string, { path: string; text: string }> {
  const dir = join(repoRoot, "packages", "core", "src");
  const index = new Map<string, { path: string; text: string }>();

  let entries: readonly string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return index;
  }

  for (const name of entries) {
    if (!name.endsWith(".ts") || name.endsWith(".test.ts")) continue;
    const path = join(dir, name);
    const text = readFileSync(path, "utf8");

    for (const match of text.matchAll(/export const (\w+Contract)\s*=/g)) {
      index.set(match[1], { path, text });
    }
  }

  return index;
}

/**
 * A property signature naming a contract option, written inside a type the binding declares. The
 * binding is expected to *derive* those (`SignatureOptionsOf<…>`), never to write them again.
 */
function redeclaredOptions(
  source: ts.SourceFile,
  id: string,
  contract: ComponentContract,
  path: string,
): readonly ConformanceProblem[] {
  const options = new Set(Object.keys(contract.options));
  const problems: ConformanceProblem[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isPropertySignature(node) && node.name && ts.isIdentifier(node.name)) {
      const name = node.name.text;

      if (options.has(name) && node.type && restatesValues(node.type)) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        problems.push({
          contract: id,
          option: name,
          file: path,
          line: line + 1,
          message:
            `"${name}" is an option of the ${id} contract and its values are written out again here. ` +
            `Derive them (SignatureOptionsOf<typeof ${camel(id)}Contract, "…">) so Core stays the only ` +
            `place they are defined.`,
        });
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(source);
  return problems;
}

/**
 * Whether a type node writes out values by hand. A literal (`"primary"`, `true`) is a copy of
 * something the contract owns; a keyword (`string`) or a reference (`ButtonSize`) is not: the
 * reference points at a type that is itself derived, so it cannot drift.
 */
function restatesValues(type: ts.TypeNode): boolean {
  if (ts.isLiteralTypeNode(type)) {
    // `undefined` and `null` say "absent here", which is how a discriminated union is written.
    return (
      type.literal.kind !== ts.SyntaxKind.NullKeyword &&
      type.literal.kind !== ts.SyntaxKind.UndefinedKeyword
    );
  }

  if (ts.isUnionTypeNode(type)) return type.types.some(restatesValues);
  if (ts.isParenthesizedTypeNode(type)) return restatesValues(type.type);

  return false;
}

function camel(id: string): string {
  return id.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}
