import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import type { ComponentContract } from "@skryensya/core/contract";
import { contracts } from "./registry.js";

/*
 * G1, and the one job left to the TypeScript Compiler API: proving a binding REALIZES its contract
 * rather than restating it (decision 28).
 *
 * The contract is a value, so the catalogue needs no extraction — this file does not read shapes out
 * of the type system. It asks one question the type system alone can answer: does the React binding
 * re-declare an option Core already owns?
 *
 * Drift is not *naming* an option — it is restating its VALUE SET, because that is the thing that can
 * go stale. So the check looks for literal types written by hand:
 *
 *   variant?: "neutral" | "primary"   drift — the contract's enum, copied, and now one short
 *   size?: ButtonSize                 fine  — ButtonSize is derived FROM the contract
 *   href: string                      fine  — narrowing a string option to required in one branch of
 *                                             a discriminated union is how the tag switch is typed
 *   href?: undefined                  fine  — the other branch of that same discriminant
 *   children, onClick, ref, className fine  — React's and the host element's, never the contract's
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

  for (const [id, contract] of Object.entries(contracts)) {
    const file = bindingFile(repoRoot, contract);
    if (!file) continue;

    const source = ts.createSourceFile(
      file.path,
      file.text,
      ts.ScriptTarget.ES2022,
      /* setParentNodes */ true,
      ts.ScriptKind.TSX,
    );

    problems.push(...redeclaredOptions(source, id, contract, file.path));
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
 * something the contract owns; a keyword (`string`) or a reference (`ButtonSize`) is not — the
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
