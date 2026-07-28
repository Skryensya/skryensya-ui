/*
 * Prove gate1.mjs actually catches drift, one artefact at a time, against a fake World instead
 * of the real repo disk — fast and deterministic, same reason checks.test.mjs mutates schemas
 * in memory rather than editing files on disk.
 *
 * Run: node --test docs/ai/gate1.test.mjs
 */

import test from "node:test";
import assert from "node:assert/strict";
import { checkArtifacts, exportedNames, resolveSpecifier, surfaceHasProp } from "./gate1.mjs";

const BUTTON_SOURCE = `
export type ButtonProps = {
  variant?: string;
  iconOnly?: boolean;
};
export function Button(props: ButtonProps) {}

export type ButtonLinkProps = {
  href: string;
  variant?: string;
};
export function ButtonLink(props: ButtonLinkProps) {}
`;

const ICON_SOURCE = `
export function Icon(props: { name: string }) {}
export { Icon as StableIcon };
`;

function makeWorld() {
  return {
    exportsByPackage: {
      "@skryensya/react": {
        "./button": { default: "./src/components/button.tsx" },
        "./icon": { default: "./src/components/icon.tsx" },
      },
    },
    sourceByFile: {
      "@skryensya/react::./src/components/button.tsx": BUTTON_SOURCE,
      "@skryensya/react::./src/components/icon.tsx": ICON_SOURCE,
    },
  };
}

test("resolveSpecifier finds a loaded file through the exports map", () => {
  const result = resolveSpecifier("@skryensya/react/button", makeWorld());
  assert.equal(result.ok, true);
  assert.match(result.source, /export function Button/);
});

test("resolveSpecifier reports an unknown subpath", () => {
  const result = resolveSpecifier("@skryensya/react/does-not-exist", makeWorld());
  assert.equal(result.ok, false);
  assert.match(result.reason, /no exports\["\.\/does-not-exist"\]/);
});

test("resolveSpecifier reports an unknown package", () => {
  const result = resolveSpecifier("@skryensya/nope/thing", makeWorld());
  assert.equal(result.ok, false);
  assert.match(result.reason, /unknown package/);
});

test("exportedNames finds function, const and re-export forms", () => {
  assert.deepEqual(exportedNames(BUTTON_SOURCE), new Set(["Button", "ButtonLink"]));
  assert.deepEqual(exportedNames(ICON_SOURCE), new Set(["Icon", "StableIcon"]));
});

test("surfaceHasProp finds a prop spelled out in the source", () => {
  assert.equal(surfaceHasProp(BUTTON_SOURCE, "iconOnly", "button"), true);
  assert.equal(surfaceHasProp(BUTTON_SOURCE, "href", "a"), true); // required, not optional — still found
});

test("surfaceHasProp falls back to native host attributes never spelled out in source", () => {
  // ButtonProps never writes "type" itself; a real Button still accepts it via ButtonHTMLAttributes.
  assert.equal(surfaceHasProp(BUTTON_SOURCE, "type", "button"), true);
});

test("surfaceHasProp is false for a prop that is neither in source nor a native attribute", () => {
  assert.equal(surfaceHasProp(BUTTON_SOURCE, "thisPropDoesNotExist", "button"), false);
});

function baseSchema() {
  return {
    id: "button",
    surfaces: {
      Button: { use: "action", element: "button", react: { from: "@skryensya/react/button", name: "Button" } },
      ButtonLink: {
        use: "navigation",
        element: "a",
        react: { from: "@skryensya/react/button", name: "ButtonLink" },
        requires: ["href"],
      },
    },
    composes: { Icon: { from: "@skryensya/react/icon", name: "Icon" } },
  };
}

test("checkArtifacts passes a schema whose artefacts are all real", () => {
  assert.deepEqual(checkArtifacts(baseSchema(), makeWorld()), []);
});

test("checkArtifacts flags an import path that does not resolve", () => {
  const schema = baseSchema();
  schema.surfaces.Button.react.from = "@skryensya/react/does-not-exist";
  const problems = checkArtifacts(schema, makeWorld());
  assert.equal(problems.length, 1);
  assert.equal(problems[0].rule, "artifact-missing");
});

test("checkArtifacts flags a name that is not exported from a resolving file", () => {
  const schema = baseSchema();
  schema.composes.Icon.from = "@skryensya/react/button"; // real file, but it never exports "Icon"
  const problems = checkArtifacts(schema, makeWorld());
  assert.equal(problems.length, 1);
  assert.equal(problems[0].rule, "artifact-not-exported");
});

test("checkArtifacts flags a required prop that no longer exists on the surface", () => {
  const schema = baseSchema();
  schema.surfaces.ButtonLink.requires = ["href", "thisPropDoesNotExist"];
  const problems = checkArtifacts(schema, makeWorld());
  assert.equal(problems.length, 1);
  assert.equal(problems[0].rule, "artifact-prop-missing");
  assert.match(problems[0].msg, /thisPropDoesNotExist/);
});

test("checkArtifacts skips a sub-component path in requires (e.g. Accordion.Item)", () => {
  const schema = baseSchema();
  schema.surfaces.ButtonLink.requires = ["href", "Accordion.Item"];
  assert.deepEqual(checkArtifacts(schema, makeWorld()), []);
});

test("checkArtifacts never checks forbids against source — nothing to look up for an absent prop", () => {
  const schema = baseSchema();
  schema.surfaces.Button.forbids = ["somePropThatIsTotallyMadeUp"];
  assert.deepEqual(checkArtifacts(schema, makeWorld()), []);
});

test("checkArtifacts stops checking requires once the import itself failed, avoiding double-reporting", () => {
  const schema = baseSchema();
  schema.surfaces.ButtonLink.react.from = "@skryensya/react/does-not-exist";
  schema.surfaces.ButtonLink.requires = ["href", "thisPropDoesNotExist"];
  const problems = checkArtifacts(schema, makeWorld());
  assert.equal(problems.length, 1);
  assert.equal(problems[0].rule, "artifact-missing");
});
