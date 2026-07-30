/* Validate every tree a demos module exports, and show what the first one emits. */
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { emitMarkup, emitReact } from "@skryensya/ai-compiler/emit";
import type { UsageTree } from "@skryensya/core/usage-tree";

const [, , modulePath, show] = process.argv;
const mod = await import(modulePath);

/* A stub translator: returns the key, so a missing key is visible in the emitted output. */
const t = ((key: string, vars?: Record<string, string>) => {
  const bare = key.split(".").pop() ?? key;
  return vars ? `${bare}(${Object.values(vars).join(",")})` : bare;
}) as never;

let bad = 0;
for (const [name, value] of Object.entries(mod)) {
  /* Some factories take a second argument the PAGE owns — a locale-dependent href, or a list of
   * them. Feed a stub so the tree can be built and validated here. */
  const stubHrefs = ["/a", "/b", "/c", "/d", "/e"];
  const tree: UsageTree =
    typeof value === "function"
      ? (value as never)(t, (value as Function).length > 1 ? stubHrefs : undefined)
      : (value as UsageTree);
  if (!tree || typeof tree !== "object" || !("contract" in tree)) continue;
  const r = validateUsageTree(tree);
  const errs = r.problems.filter((p) => p.severity === "error");
  const adv = r.problems.filter((p) => p.severity === "advisory");
  if (errs.length) bad++;
  console.log(`${errs.length ? "INVÁLIDO" : "válido  "} ${name}${adv.length ? `  (${adv.length} advisory)` : ""}`);
  for (const p of r.problems) console.log(`    [${p.severity}] ${p.path}: ${p.rule} — ${p.message}`);
  if (show && (show === name || show === "all")) {
    console.log("--- markup ---\n" + emitMarkup(tree));
    console.log("--- react ---\n" + emitReact(tree));
  }
}
process.exit(bad ? 1 : 0);
