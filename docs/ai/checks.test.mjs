/*
 * Break real composition guides one contract at a time. The tests protect semantic surface
 * selection and examples that consume bindings instead of recreating native hosts.
 *
 * Run: node --test docs/ai/checks.test.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { unsupportedKeywords, validateSchema } from "./checks.mjs";

const SCHEMA_DIR = join(import.meta.dirname, "schemas");
const read = (file) => JSON.parse(readFileSync(join(SCHEMA_DIR, file), "utf8"));
const meta = read("_meta.json");
const clone = (file = "button.json") => read(file);
const guideFiles = readdirSync(SCHEMA_DIR)
  .filter((file) => file.endsWith(".json") && !file.startsWith("_"));

function rulesAfter(mutate, file = "button.json") {
  const schema = clone(file);
  mutate(schema);
  return validateSchema(schema, meta).map(({ rule }) => rule);
}

function hasRule(rule, mutate, file) {
  assert.ok(rulesAfter(mutate, file).includes(rule), `expected ${rule}`);
}

test("every composition guide is valid", () => {
  for (const file of guideFiles) {
    assert.deepEqual(validateSchema(clone(file), meta), [], file);
  }
});

test("the meta-schema only uses implemented JSON Schema keywords", () => {
  assert.deepEqual(unsupportedKeywords(meta), []);
});

test("unsupported keywords are found on unexercised branches", () => {
  const broken = structuredClone(meta);
  broken.properties.rules.dependentRequired = { iconOnly: ["props"] };
  assert.deepEqual(unsupportedKeywords(broken), ["properties.rules.dependentRequired"]);
});

test("shape rejects implementation-oriented and unknown fields", () => {
  hasRule("shape", (schema) => delete schema.consume);
  hasRule("shape", (schema) => (schema.hooks = { bg: "var(--color-action-neutral)" }));
});

test("shape errors suppress composition-rule noise", () => {
  const schema = clone();
  delete schema.surfaces;
  assert.deepEqual([...new Set(validateSchema(schema, meta).map(({ rule }) => rule))], ["shape"]);
});

test("consume-preferred requires a React binding for every surface", () => {
  hasRule("consume-preferred", (schema) => delete schema.surfaces.ButtonLink.react);
});

test("surface-use selects exactly one sibling for each semantic intent", () => {
  hasRule("surface-use", (schema) => (schema.surfaces.ButtonLink.use = "action"));
});

test("surface-name keeps the JSX surface equal to its imported name", () => {
  hasRule("surface-name", (schema) => (schema.surfaces.ButtonLink.react.name = "Link"));
});

test("surface-contract rejects attributes that are both required and forbidden", () => {
  hasRule("surface-contract", (schema) => schema.surfaces.ButtonLink.forbids.push("href"));
});

test("forbid-unexplained gives the AI the sibling alternative", () => {
  hasRule("forbid-unexplained", (schema) => delete schema.rules["ButtonLink.disabled"]);
});

test("prop-type rejects mixed public prop values", () => {
  hasRule("prop-type", (schema) => schema.props.variant.push(false));
});

test("prop-boolean fixes the compact boolean form to [false, true]", () => {
  hasRule("prop-boolean", (schema) => (schema.props.iconOnly = [true, false]));
});

test("meaning-ref rejects unknown props and values", () => {
  hasRule("meaning-ref", (schema) => (schema.meanings.tone = { loud: "important" }));
  hasRule("meaning-ref", (schema) => (schema.meanings.variant.warning = "warning emphasis"));
});

test("meaning-missing explains every value when semantics are declared", () => {
  hasRule("meaning-missing", (schema) => delete schema.meanings.variant.ghost);
});

test("child-import requires every composed component to be importable", () => {
  hasRule("child-import", (schema) => delete schema.composes.Icon);
});

test("compose-name keeps the JSX child equal to its imported name", () => {
  hasRule("compose-name", (schema) => (schema.composes.Icon.name = "Glyph"));
});

test("surface-examples requires examples for every sibling and no invented sibling", () => {
  hasRule("surface-examples", (schema) => delete schema.examples.ButtonLink);
  hasRule("surface-examples", (schema) => (schema.examples.Link = { basic: "<Link />" }));
});

test("example-consumes requires the selected sibling component", () => {
  hasRule("example-consumes", (schema) => {
    schema.examples.ButtonLink.primary = '<Button href="/docs">Docs</Button>';
  });
});

test("example-recreates rejects a raw anchor when ButtonLink exists", () => {
  hasRule("example-recreates", (schema) => {
    schema.examples.ButtonLink.primary = '<a href="/docs">Docs</a>';
  });
});

test("example-required keeps href on every ButtonLink", () => {
  hasRule("example-required", (schema) => {
    schema.examples.ButtonLink.primary = "<ButtonLink>Docs</ButtonLink>";
  });
});

test("example-forbidden rejects a ButtonLink that also tries to be disabled", () => {
  // Button itself has no forbids: href switches it to <a>, same as ButtonLink, so this contract
  // now lives only on ButtonLink — a link cannot be disabled and stay a link.
  hasRule("example-forbidden", (schema) => {
    schema.examples.ButtonLink.primary = '<ButtonLink href="/docs" disabled>Docs</ButtonLink>';
  });
});

test("implementation-leak rejects copied CSS internals", () => {
  hasRule("implementation-leak", (schema) => {
    schema.examples.Button.primary = '<Button className="sk-button">Guardar</Button>';
  });
  hasRule("implementation-leak", (schema) => {
    schema.rules.iconOnly = "Override --sk-button-width.";
  });
});

test("example-prop rejects invented public values", () => {
  hasRule("example-prop", (schema) => {
    schema.examples.Button.primary = '<Button variant="warning">Guardar</Button>';
  });
});

test("vanilla remains an explicit fallback for both native hosts", () => {
  const schema = clone();
  schema.consume.prefer = "vanilla";
  assert.ok(!validateSchema(schema, meta).some(({ rule }) => rule === "consume-preferred"));
});

test("nullable first values encode an omitted default without a fake enum value", () => {
  assert.ok(!validateSchema(clone("link.json"), meta).some(({ rule }) => rule === "prop-type"));
});

test("prop-dup keeps shared and surface-specific choices separate", () => {
  hasRule("prop-dup", (schema) => {
    schema.surfaces.Button.props = {
      variant: ["neutral", "primary"],
    };
  });
});

test("example-prop validates surface-specific choices", () => {
  hasRule("example-prop", (schema) => {
    schema.examples.Tabs.basic =
      '<Tabs items={tabs} orientation="diagonal" />';
  }, "tabs.json");
});

test("Vanilla cannot be preferred when no fallback is described", () => {
  hasRule("consume-preferred", (schema) => {
    schema.consume.prefer = "vanilla";
  }, "tile.json");
});
