---
num: 13
title: The contract lives in core and frameworks are bindings
short: "Core is the contract"
summary: >-
  The kit is consumed by two routes (React and authored markup) and until now no authority covered both:
  core exported the classes but almost no options, React redeclared its props, and
  `docs/ai/schemas/*.json` transcribed everything by hand a third time. This decision makes core the sole
  authoring of a component's contract (signatures, options, parts, the option-to-attribute mapping and the
  accessibility owed) and turns React and Vanilla into bindings that *realize* it. An option a binding
  redeclares stops being an option: it is drift, and it breaks the build.
---

## The problem

A component in this system is consumed two ways. A React consumer writes `<Button variant="accent">`; a
vanilla layer consumer writes
`<button class="sk-button sk-interactive" data-sk-button data-variant="accent">`. They are the same thing
said twice, and until today nothing guaranteed it.

What was there, measured:

- **56 of 62** core modules export `*Parts`: the classes, that is, the skeleton of the markup contract.
- **14 of 62** export `*Options`, and React imports them in **8** components.
- `packages/react/src/components/button.tsx` **redeclares** `variant`, `size` and `iconOnly` in its own
  `ButtonAppearanceProps` instead of using `ButtonOptions`, which exists in
  [`packages/core/src/button.ts`](../../packages/core/src/button.ts) three files away.
- `docs/ai/schemas/button.json` wrote the same four variants, the same three sizes and the same import
  paths again, by hand, a third time.

Three transcriptions of the same fact and no point at which to compare them. The Gate 1 that existed
scanned with regexes and had a manual exception list for native attributes: it accused the symptom
without being able to name the cause.

## The decision

**Core exports one contract per family, and it is its sole authoring.** A contract declares:

- **Signatures**: the logical identity separated from the exported name, the HTML host it lands on and the
  value that discriminates it. `Button.action` and `Button.navigation` are two signatures of the same
  export, discriminated by `href`, with hosts `<button>` and `<a>`.
- **Options**: the types that today live loose in `*Options`, plus **the attribute each one is written
  onto**. `variant` is not only `ButtonVariant`: it is `ButtonVariant` landing on `data-variant`. That
  mapping is what was missing for the two routes to be comparable.
- **Parts and part template**: the classes `*Parts` already exported, plus the subtree each signature
  owns and where its children land. `navListParts` has eight parts and React exposes three surfaces: the
  template is what makes those two things *the same structure* rather than two.
- **Constraints and ARIA**: `requires`, `forbids`, `exactlyOneOf`, valid parents, cardinality, and the
  accessible name a signature must earn (`iconOnly` requires `aria-label`). Structured, never prose:
  `nav-list`'s composition rule (a link is always inside a group, or the markup is invalid) was a
  paragraph in a JSON file and becomes `parents: [NavListGroup]`.

**React and Vanilla are bindings.** A binding realizes the contract and does not repeat it. `ButtonProps`
stops declaring `variant?: ButtonVariant` and is derived from `ButtonOptions` instead. Redeclaring an
option is not a shortcut: it is a second truth, and it is exactly what produced the drift we had been
patching.

## Who proves it

Two gates, because they are two different claims:

1. **Binding conformance (G1).** The TypeScript Compiler API proves the React binding's public props are
   assignable to the contract's options. Its job is reduced to that single claim, which is the only thing
   only it can prove. It does not extract the catalogue: the contract is already a value, it is imported
   and serialized.
2. **Symmetry (G2).** Both routes are rendered from the same usage tree and the normalized DOM trees are
   compared: parts, mapped attributes, ARIA tree. If they differ, it breaks. This gate did not exist in
   any form and it is what makes "two bindings" mean something verifiable.

## What was rejected

**TypeScript as the single authority**, which is what the architecture document proposed. Types cannot
express parts nesting or a conditional ARIA rule without type encodings nobody is going to read. Markup
is data, not type.

**The contract in `contracts/*.yaml`, outside core.** It did not touch the kit and kept core build-free
(decision 6), but it split the truth again: core would keep exporting `*Parts` on its own side and nobody
would guarantee the YAML followed it. The same disease in another format.

**Declaring the mapping by hand in the semantic overlay**,
`{variant: {react: "variant", markup: "data-variant"}}`. That is copying props by hand, which is the habit
this decision exists to end.

**Reconciling two extractions in the compiler**, guessing that `variant` corresponds to `data-variant` by
a naming rule. It would have worked until the first irregular case, after which the exception table would
have been the real truth.

## Cost

Roughly 48 core modules that today only export `*Parts` need a complete contract, and some 50 React
components have to stop redeclaring their props. It is mechanical and the current typecheck verifies it
step by step, but it is the longest phase of the rebuild and it produces nothing visible while it lasts.
It is accepted because the alternative, continuing to maintain three copies, has already demonstrated its
cost in every drift bug this repo has carried.
