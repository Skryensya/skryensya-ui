/*
 * The validator's RULES, the judging, pulled out of the shell.
 *
 * Everything about *reading* CSS lives in parse.mjs; everything about *judging* it lives here; and
 * everything about *running* it (reading the pairs file, printing, exiting) lives in lint.mjs. That
 * three-way split is the whole point of this file: `runChecks` is a pure function, corpus in,
 * `Problem[]` out, so the rules the whole tier system rests on finally have a test surface. Import
 * this module and it does nothing; call it and it judges. No fs, no process.exit, no import-time work.
 *
 * The reading helpers it borrows from parse.mjs (`varRefs`, `splitTopLevel`, `contrastRatio`, the tier
 * ranks) are themselves pure, so importing them here keeps `runChecks` pure too.
 *
 * Checks:
 *   1. refs-resolve     every var(--x) points at a declared custom property
 *   2. tier-direction   references point down or sideways; component never skips to a ramp
 *   3. mode-complete    base light-dark() token set == hc override set; every light-dark()
 *                       has exactly two colors; the two hc blocks don't drift
 *   4. contrast         every contrast pair clears its WCAG ratio, per brand
 *   5. name-shape       declared names are lowercase kebab
 */

import { TIER_RANK, contrastRatio, splitTopLevel, varRefs } from "./parse.mjs";

/**
 * @typedef {{ rule: string, where: string, msg: string }} Problem
 */

/**
 * Judge a parsed corpus against every rule and return the problems it found, empty when clean.
 *
 * `corpus` is exactly what {@link parseTokens} returns. `pairs` is the parsed `contrast-pairs.json`
 * array, or `null`/`undefined` to skip the contrast check (as the shell does when the file is absent).
 *
 * @param {ReturnType<import("./parse.mjs").parseTokens>} corpus
 * @param {Array<{fg:string,bg:string,min:number,modes:string[]}> | null} [pairs]
 * @returns {Problem[]}
 */
export function runChecks({ files, declaredTier, baseSemantic, hcByName, rampMap, resolveColor }, pairs = null) {
  /** @type {Problem[]} */
  const problems = [];
  const fail = (rule, where, msg) => problems.push({ rule, where, msg });

  // ── 1 + 2: refs-resolve and tier-direction ─────────────────────────────────
  for (const f of files) {
    if (!f.tier) continue;
    for (const d of f.decls) {
      for (const { ref, hasFallback } of varRefs(d.value)) {
        const toTier = declaredTier.get(ref);
        if (!toTier) {
          if (hasFallback) continue; // var(--x, fallback) resolves without --x, valid CSS (ADR-22)
          fail("refs-resolve", d.name, `references undeclared ${ref}`);
          continue;
        }
        if (TIER_RANK[toTier] > TIER_RANK[f.tier]) {
          fail("tier-direction", d.name,
            `${f.tier} token references higher-tier ${toTier} ${ref}, references may only point down or sideways`);
        }
        if (f.tier === "component" && toTier === "primitive") {
          fail("tier-skip", d.name,
            `component hook reaches past the semantic layer into primitive ${ref}, bypasses mode switching, breaks dark mode for this component alone`);
        }
      }
    }
  }

  // ── 3: mode completeness ────────────────────────────────────────────────────

  // every light-dark() must have exactly two color args
  for (const [name, value] of baseSemantic) {
    /* `[\s\S]`, not `.`: token values can span lines, and `.` stops at the newline — this check
     * would silently skip exactly the multi-line values most worth checking. */
    const ld = value.match(/light-dark\(([\s\S]*)\)/);
    if (ld && splitTopLevel(ld[1]).length !== 2) {
      fail("mode-complete", name, `light-dark() must take exactly two colors, got: ${value}`);
    }
  }

  // the two hc blocks (attribute + prefers-contrast) must be byte-identical per token
  for (const [name, values] of hcByName) {
    if (values.size > 1) {
      fail("mode-complete", name, `high-contrast blocks disagree for ${name}, the two copies have drifted`);
    }
  }

  // base mode-aware (light-dark) set must equal the hc COLOUR override set
  const baseModeAware = new Set([...baseSemantic].filter(([, v]) => v.includes("light-dark(")).map(([n]) => n));
  const hcColorSet = new Set([...hcByName].filter(([, vs]) => [...vs][0].includes("light-dark(")).map(([n]) => n));
  for (const name of baseModeAware) {
    if (!hcColorSet.has(name)) fail("mode-complete", name, `mode-aware token has no high-contrast override in modes/hc.scss`);
  }
  for (const name of hcColorSet) {
    if (!baseModeAware.has(name)) fail("mode-complete", name, `high-contrast overrides ${name}, which is not a mode-aware base token`);
  }
  // non-color hc overrides (e.g. state-layer opacity / focus-ring bumps) are allowed, but must
  // target a token that actually exists in the base, you can't bump what isn't declared.
  for (const name of hcByName.keys()) {
    if (!hcColorSet.has(name) && !baseSemantic.has(name)) {
      fail("mode-complete", name, `high-contrast bumps ${name}, which is not declared in semantic.scss`);
    }
  }

  // ── 4: contrast ─────────────────────────────────────────────────────────────
  if (pairs) {
    const ramps = rampMap();
    for (const pair of pairs) {
      for (const mode of pair.modes) {
        const fg = resolveColor(pair.fg, mode, ramps);
        const bg = resolveColor(pair.bg, mode, ramps);
        if (!fg || !bg) {
          fail("contrast", `${pair.fg} on ${pair.bg}`, `[${mode}] could not resolve to a color`);
          continue;
        }
        const ratio = contrastRatio(fg, bg);
        if (ratio < pair.min) {
          fail("contrast", `${pair.fg} on ${pair.bg}`,
            `[${mode}] ${ratio.toFixed(2)}:1 < required ${pair.min}:1  (${fg} on ${bg})`);
        }
      }
    }
  }

  // ── 5: name shape ───────────────────────────────────────────────────────────
  for (const [name] of declaredTier) {
    const bare = name.slice(2);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(bare)) {
      fail("name-shape", name, `must be lowercase kebab (got "${bare}")`);
    }
  }

  // ── 6: component sheets ship the class, not just the hooks ──────────────────
  //
  // A components/ sheet has to produce a working component on import. This rule exists because its
  // absence is what let the corpus drift: the system's written rule was "components ship hooks only,
  // the consumer writes the structure", nothing checked it, and 22 of 36 sheets quietly shipped
  // structure anyway while 14 did not. Half a system either way is worse than either whole one.
  //
  // The exemption is COMPOSITION, not size. A sheet that re-declares another component's or
  // pattern's hooks (drawer.css assigning --sk-vaul-* from --sk-drawer-*) is saying "I am that
  // thing, tuned"; its structure belongs to what it composes, and re-implementing it there would be
  // the duplication the pattern exists to prevent. That is a different claim from "I ship nothing".
  for (const f of files) {
    if (!f.rel?.startsWith("components/")) continue;

    const structural = [...(f.css ?? "").matchAll(/(^|[;{])\s*([a-z-]+)\s*:/g)].filter(
      (m) => !m[2].startsWith("--"),
    ).length;
    if (structural > 0) continue;

    const own = `--sk-${f.rel.slice("components/".length).replace(/\.css$/, "")}-`;
    const composes = f.decls.some((d) => d.name.startsWith("--sk-") && !d.name.startsWith(own));
    if (composes) continue;

    fail("component-ships-structure", f.rel,
      "component sheet declares hooks but no structure, so importing it paints nothing; ship the class too, or compose another component's hooks the way drawer.css composes vaul's");
  }

  // ── 7: every component exposes styling hooks ────────────────────────────────
  //
  // The inverse of rule 6, and the other half of "ship the class AND its hooks" (ADR-8). A sheet
  // that paints structure but declares NO `--sk-*` custom property has no public restyle surface:
  // the only way to change it from outside is to out-specify its rules, which is exactly what the
  // hook layer exists to avoid. It also shows up as an empty table on the component's docs page.
  //
  // Same COMPOSITION exemption as rule 6, by the same test: a sheet that re-declares another
  // component's hooks (theme-toggle onto --sk-button-*, toast onto --sk-alert-*) exposes ITS hooks,
  // tuned, so it counts. "At least one --sk-* declaration" is what both halves turn on.
  for (const f of files) {
    if (!f.rel?.startsWith("components/")) continue;
    const declaresHook = f.decls.some((d) => d.name.startsWith("--sk-"));
    if (declaresHook) continue;

    fail("component-ships-hooks", f.rel,
      "component sheet paints structure but declares no --sk-* hook, so it has no public restyle surface (and its docs styling-hooks table is empty); lift its themeable values to --sk-<name>-* hooks");
  }

  return problems;
}
