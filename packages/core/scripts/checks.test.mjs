/*
 * The validator's rules, tested through their interface.
 *
 * This is the test surface that didn't exist while the rules ran at import time and exited the
 * process: `runChecks(corpus) → Problem[]` is a pure function, so a rule is exercised by feeding it a
 * corpus and asserting the problems it returns. The first test proves the REAL system is clean (the
 * same judgement `lint.mjs` makes); the rest are negative fixtures, one per rule, that a hand-built
 * corpus violating exactly one thing lights up exactly that rule.
 *
 * Run: `node --test scripts/checks.test.mjs`
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CSS_DIR, parseTokens } from "./parse.mjs";
import { runChecks } from "./checks.mjs";

const PKG_ROOT = join(import.meta.dirname, "..");

/** A minimal corpus with every field runChecks destructures, so a fixture sets only what it tests. */
function corpus({ files = [], declaredTier = new Map(), baseSemantic = new Map(), hcByName = new Map() } = {}) {
  return {
    files,
    declaredTier,
    baseSemantic,
    hcByName,
    rampMap: () => new Map(),
    resolveColor: () => null,
  };
}

const rules = (problems) => new Set(problems.map((p) => p.rule));

test("the real corpus is clean, same judgement lint.mjs makes", () => {
  const pairs = JSON.parse(readFileSync(join(PKG_ROOT, "contrast-pairs.json"), "utf8")).pairs;
  const problems = runChecks(parseTokens(CSS_DIR), pairs);
  assert.deepEqual(problems, [], `expected a clean system, got:\n${JSON.stringify(problems, null, 2)}`);
});

test("refs-resolve, a var() with no declaration and no fallback fails", () => {
  const problems = runChecks(
    corpus({
      files: [{ tier: "semantic", decls: [{ name: "--color-x", value: "var(--nope)" }] }],
      declaredTier: new Map([["--color-x", "semantic"]]),
    }),
  );
  assert.ok(rules(problems).has("refs-resolve"));
});

test("refs-resolve, a var() with a fallback resolves and does NOT fail (ADR-22)", () => {
  const problems = runChecks(
    corpus({
      files: [{ tier: "semantic", decls: [{ name: "--color-x", value: "var(--missing, oklch(50% 0 0))" }] }],
      declaredTier: new Map([["--color-x", "semantic"]]),
    }),
  );
  assert.deepEqual(problems, []);
});

test("tier-direction, a semantic token pointing up to a component hook fails", () => {
  const problems = runChecks(
    corpus({
      files: [{ tier: "semantic", decls: [{ name: "--color-x", value: "var(--sk-button-bg)" }] }],
      declaredTier: new Map([
        ["--color-x", "semantic"],
        ["--sk-button-bg", "component"],
      ]),
    }),
  );
  assert.ok(rules(problems).has("tier-direction"));
});

test("tier-skip, a component hook reaching straight into a primitive fails", () => {
  const problems = runChecks(
    corpus({
      files: [{ tier: "component", decls: [{ name: "--sk-button-bg", value: "var(--ramp-accent-600)" }] }],
      declaredTier: new Map([
        ["--sk-button-bg", "component"],
        ["--ramp-accent-600", "primitive"],
      ]),
    }),
  );
  assert.ok(rules(problems).has("tier-skip"));
});

test("mode-complete, a light-dark() with three colors fails", () => {
  const problems = runChecks(
    corpus({
      baseSemantic: new Map([["--color-x", "light-dark(var(--a), var(--b), var(--c))"]]),
    }),
  );
  assert.ok(rules(problems).has("mode-complete"));
});

test("mode-complete, a mode-aware base token with no hc override fails", () => {
  const problems = runChecks(
    corpus({
      baseSemantic: new Map([["--color-x", "light-dark(var(--a), var(--b))"]]),
      // hcByName empty → no override for --color-x
    }),
  );
  assert.ok(rules(problems).has("mode-complete"));
});

test("name-shape, a non-kebab declared name fails", () => {
  const problems = runChecks(
    corpus({
      declaredTier: new Map([["--Color_X", "semantic"]]),
    }),
  );
  assert.ok(rules(problems).has("name-shape"));
});

test("component-ships-structure, a component sheet with hooks and no structure fails", () => {
  const problems = runChecks(
    corpus({
      files: [
        {
          tier: "component",
          rel: "components/button.css",
          css: "@layer components { .sk-button { --sk-button-bg: var(--color-action-neutral); } }",
          decls: [{ name: "--sk-button-bg", value: "var(--color-action-neutral)" }],
        },
      ],
    }),
  );
  assert.ok(rules(problems).has("component-ships-structure"));
});

test("component-ships-structure, a sheet that ships the class passes", () => {
  const problems = runChecks(
    corpus({
      files: [
        {
          tier: "component",
          rel: "components/button.css",
          css: "@layer components { .sk-button { --sk-button-bg: red; background: var(--sk-button-bg); } }",
          decls: [{ name: "--sk-button-bg", value: "red" }],
        },
      ],
    }),
  );
  assert.ok(!rules(problems).has("component-ships-structure"));
});

/* The drawer's case: no structure of its own, because every line it could write belongs to the
 * pattern it composes. That is a claim about ownership, not an excuse for an empty sheet. */
test("component-ships-structure, a composition over another component's hooks is exempt", () => {
  const problems = runChecks(
    corpus({
      files: [
        {
          tier: "component",
          rel: "components/drawer.css",
          css: "@layer components { .sk-drawer { --sk-drawer-bg: var(--color-bg-surface); --sk-vaul-bg: var(--sk-drawer-bg); } }",
          decls: [
            { name: "--sk-drawer-bg", value: "var(--color-bg-surface)" },
            { name: "--sk-vaul-bg", value: "var(--sk-drawer-bg)" },
          ],
        },
      ],
    }),
  );
  assert.ok(!rules(problems).has("component-ships-structure"));
});

test("component-ships-hooks, a component sheet with structure and no hooks fails", () => {
  const problems = runChecks(
    corpus({
      files: [
        {
          tier: "component",
          rel: "components/toolbar.css",
          css: "@layer components { .sk-toolbar { padding: 4px; background: var(--color-bg-surface); } }",
          decls: [],
        },
      ],
    }),
  );
  assert.ok(rules(problems).has("component-ships-hooks"));
});

test("component-ships-hooks, a sheet that declares its own hook passes", () => {
  const problems = runChecks(
    corpus({
      files: [
        {
          tier: "component",
          rel: "components/toolbar.css",
          css: "@layer components { .sk-toolbar { --sk-toolbar-bg: var(--color-bg-surface); background: var(--sk-toolbar-bg); } }",
          decls: [{ name: "--sk-toolbar-bg", value: "var(--color-bg-surface)" }],
        },
      ],
    }),
  );
  assert.ok(!rules(problems).has("component-ships-hooks"));
});

/* theme-toggle onto --sk-button-*: re-declaring another component's hook is exposing yours, tuned. */
test("component-ships-hooks, a composition over another component's hooks passes", () => {
  const problems = runChecks(
    corpus({
      files: [
        {
          tier: "component",
          rel: "components/theme-toggle.css",
          css: "@layer components { .sk-theme-toggle { --sk-button-padding-x: 0; padding-inline: var(--sk-button-padding-x); } }",
          decls: [{ name: "--sk-button-padding-x", value: "0" }],
        },
      ],
    }),
  );
  assert.ok(!rules(problems).has("component-ships-hooks"));
});

test("a corpus that breaks nothing returns no problems", () => {
  const problems = runChecks(
    corpus({
      files: [{ tier: "semantic", decls: [{ name: "--color-x", value: "var(--ramp-accent-600)" }] }],
      declaredTier: new Map([
        ["--color-x", "semantic"],
        ["--ramp-accent-600", "primitive"],
      ]),
    }),
  );
  assert.deepEqual(problems, []);
});
