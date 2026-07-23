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
      files: [{ tier: "semantic", decls: [{ name: "--color-x", value: "var(--seed, oklch(50% 0 0))" }] }],
      declaredTier: new Map([["--color-x", "semantic"]]),
    }),
  );
  assert.deepEqual(problems, []);
});

test("tier-direction, a semantic token pointing up to a component hook fails", () => {
  const problems = runChecks(
    corpus({
      files: [{ tier: "semantic", decls: [{ name: "--color-x", value: "var(--ds-button-bg)" }] }],
      declaredTier: new Map([
        ["--color-x", "semantic"],
        ["--ds-button-bg", "component"],
      ]),
    }),
  );
  assert.ok(rules(problems).has("tier-direction"));
});

test("tier-skip, a component hook reaching straight into a primitive fails", () => {
  const problems = runChecks(
    corpus({
      files: [{ tier: "component", decls: [{ name: "--ds-button-bg", value: "var(--ramp-accent-600)" }] }],
      declaredTier: new Map([
        ["--ds-button-bg", "component"],
        ["--ramp-accent-600", "primitive"],
      ]),
    }),
  );
  assert.ok(rules(problems).has("tier-skip"));
});

test("mode-complete, a light-dark() with three colours fails", () => {
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
