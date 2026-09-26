/*
 * What a client is told once, at connect time. Kept short on purpose: the per-tool descriptions
 * carry the detail, and every sentence here is paid for in every session that loads the server.
 *
 * The previous version made two things mandatory: reading the whole catalogue first, and calling
 * get_examples before every composition. ADR-0026 replaced the first with deterministic discovery
 * (get_catalog stays as the exhaustive fallback), and discovery now surfaces the examples related to
 * its candidates, so the second is a step to take when one fits rather than a ritual.
 *
 * `docs.test.ts` checks that every public tool is named here.
 */
export const instructions = [
  "Compose UI with @skryensya/ui by proposing a usage tree (data) and letting validate_ui emit the code.",
  "",
  "1. discover_ui: describe the UI (`query`, or `intents`, `category`, `host`, `parent`). Candidates come",
  "   with useWhen, avoidWhen and `matched` evidence. Matching is lexical, not semantic: you choose.",
  "   If `coverage` is none or partial and nothing fits, page through get_catalog, the exhaustive list.",
  "2. If a related example fits, read it with get_examples(id) and adapt its content, not just its shape.",
  "3. get_contract(id) for each family you chose.",
  "4. Build the tree. Four fields, easily confused:",
  "   - options:  values the signature declares, mapped to attributes by the contract (variant, href).",
  "   - attrs:    passed to the host element untouched (aria-label, id, rel, target).",
  "   - slots:    named content (label, icon) or a collection (items: [{ options, slots }]).",
  "   - children: the children slot, written directly.",
  "5. validate_ui(tree). Invalid: fix the problems and validate again; nothing is emitted. Valid: use the",
  "   returned markup, React source, reactData file and css as-is; never retype them.",
  "",
  "Prefer a signature whose useWhen fits over one whose avoidWhen names your case. When nothing named",
  "fits a shape, use a layout primitive (Stack, Inline, Grid, Box) with an intentional gap. Give every",
  "icon-only control an accessible name. validate_ui proves contract conformance, not appearance: when",
  "the task is visual, render the result and look at it.",
].join("\n");
