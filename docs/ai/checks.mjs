/*
 * GATE 0's RULES, the judging, pulled out of the shell.
 *
 * Gate 0 runs before anything is generated: a schema that is not internally valid cannot be an
 * oracle for the code, and a generator fed a broken schema produces broken code confidently.
 *
 * Same three-way split as the CSS validator (ADR-7's reasoning, one tier up): validate.mjs READS
 * and REPORTS, this file JUDGES, and it does nothing on import. No fs, no process.exit, no
 * import-time work, so `validateSchema` is corpus-in / Problem[]-out and has a test surface.
 * See checks.test.mjs, which is where every rule below is proven to actually fire.
 *
 * Two passes, in order:
 *   SHAPE   the guide against _meta.json
 *   RULES   consumer coherence: prefer an available binding, explain avoided uses, and make every
 *           example consume the preferred component instead of recreating its markup.
 *
 * Dependency-free on purpose: it implements the subset of JSON Schema _meta.json actually uses.
 */

/** @typedef {{ rule: string, where: string, msg: string }} Problem */

// ── the JSON Schema subset ────────────────────────────────────────────────────
// Only the keywords _meta.json uses. An unsupported keyword is a SILENT PASS, which is the worst
// failure a validator has: the rule reads as enforced and checks nothing. So the meta document is
// swept for unknown keywords up front (`unsupportedKeywords`), not just on the branches an instance
// happens to reach — a keyword added to a branch no current schema exercises would otherwise go
// unnoticed until the schema that needs it silently passes.
const SUPPORTED = new Set([
  "$schema", "$id", "$ref", "$defs", "$comment", "title", "description",
  "type", "const", "enum", "required", "properties", "additionalProperties",
  "patternProperties", "minProperties", "items", "minItems", "uniqueItems",
  "minLength", "pattern", "oneOf", "anyOf",
]);

function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function resolveRef(ref, root) {
  if (!ref.startsWith("#/")) throw new Error(`only local $ref supported, got ${ref}`);
  return ref.slice(2).split("/").reduce((acc, k) => acc?.[k], root);
}

/**
 * Every keyword in the meta document that this validator does not implement.
 *
 * Walks the whole schema, not the path an instance takes, so a keyword sitting on an unexercised
 * branch is reported before it can silently pass. Exported for the test that pins it empty.
 *
 * @param {object} meta
 * @returns {string[]} dotted paths, e.g. "properties.axes.items.dependentRequired"
 */
export function unsupportedKeywords(meta) {
  const found = [];
  // Keys under these are author-chosen names, not keywords, so their keys are never checked —
  // only the sub-schemas they hold.
  const NAME_HOLDERS = new Set(["properties", "$defs", "patternProperties"]);

  const walk = (node, path, inNameHolder) => {
    if (node === null || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${path}[${i}]`, false));

    for (const [key, value] of Object.entries(node)) {
      const here = path ? `${path}.${key}` : key;
      if (!inNameHolder && !SUPPORTED.has(key)) {
        // Report the keyword and stop: its interior is only meaningful under a keyword we understand,
        // so descending would report every child as unsupported too and bury the one real finding.
        found.push(here);
        continue;
      }
      // `enum` and `const` hold DATA, not sub-schemas; descending would read values as keywords.
      if (key === "enum" || key === "const") continue;
      walk(value, here, NAME_HOLDERS.has(key));
    }
  };

  walk(meta, "", false);
  return found;
}

/**
 * Validate `value` against `schema`. Pure; pushes onto `problems`.
 * @param {Problem[]} problems
 */
function checkShape(value, schema, path, root, problems) {
  const fail = (msg) => problems.push({ rule: "shape", where: path || "(root)", msg });

  if (schema.$ref) return checkShape(value, resolveRef(schema.$ref, root), path, root, problems);

  if (schema.const !== undefined && value !== schema.const) {
    fail(`must be ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
    return;
  }
  if (schema.enum && !schema.enum.includes(value)) {
    fail(`must be one of ${schema.enum.map((v) => JSON.stringify(v)).join(", ")}, got ${JSON.stringify(value)}`);
    return;
  }
  if (schema.oneOf || schema.anyOf) {
    const branches = schema.oneOf ?? schema.anyOf;
    const passing = branches.filter((b) => {
      const sub = [];
      checkShape(value, b, path, root, sub);
      return sub.length === 0;
    });
    if (passing.length === 0) fail(`matches none of the ${branches.length} allowed forms`);
    else if (schema.oneOf && passing.length > 1) fail(`matches ${passing.length} forms, oneOf allows exactly 1`);
    return;
  }

  if (schema.type) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = typeOf(value);
    // JSON has no integer type; treat it as a number that is whole.
    const ok = allowed.some((t) => (t === "integer" ? actual === "number" && Number.isInteger(value) : t === actual));
    if (!ok) {
      fail(`must be ${allowed.join(" or ")}, got ${actual}`);
      return;
    }
  }

  const t = typeOf(value);

  if (t === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) fail(`must not be empty`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) fail(`"${value}" does not match /${schema.pattern}/`);
  }

  if (t === "array") {
    if (schema.minItems !== undefined && value.length < schema.minItems) fail(`needs at least ${schema.minItems} item(s), has ${value.length}`);
    if (schema.uniqueItems) {
      const seen = new Set(value.map((v) => JSON.stringify(v)));
      if (seen.size !== value.length) fail(`items must be unique`);
    }
    if (schema.items) value.forEach((v, i) => checkShape(v, schema.items, `${path}[${i}]`, root, problems));
  }

  if (t === "object") {
    for (const req of schema.required ?? []) {
      if (!(req in value)) fail(`missing required property "${req}"`);
    }
    if (schema.minProperties !== undefined && Object.keys(value).length < schema.minProperties) {
      fail(`needs at least ${schema.minProperties} propert(ies)`);
    }
    for (const [k, v] of Object.entries(value)) {
      const sub = schema.properties?.[k];
      if (sub) {
        checkShape(v, sub, path ? `${path}.${k}` : k, root, problems);
        continue;
      }
      let matched = false;
      for (const [pat, ps] of Object.entries(schema.patternProperties ?? {})) {
        if (new RegExp(pat).test(k)) {
          checkShape(v, ps, path ? `${path}.${k}` : k, root, problems);
          matched = true;
        }
      }
      if (matched) continue;
      if (schema.additionalProperties === false) {
        fail(`unknown property "${k}"`);
      } else if (typeOf(schema.additionalProperties) === "object") {
        checkShape(v, schema.additionalProperties, path ? `${path}.${k}` : k, root, problems);
      }
    }
  }
}

// ── composition-guide rules ───────────────────────────────────────────────────

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Judge one AI composition guide against the meta-schema.
 *
 * @param {object} schema
 * @param {object} meta
 * @returns {Problem[]}
 */
export function validateSchema(schema, meta) {
  /** @type {Problem[]} */
  const problems = [];
  const fail = (rule, where, msg) => problems.push({ rule, where, msg });

  checkShape(schema, meta, "", meta, problems);
  if (problems.length) return problems;

  const sharedProps = schema.props ?? {};
  const surfaces = Object.entries(schema.surfaces);
  const preferred = schema.consume.prefer;
  const uses = new Set();

  if (preferred === "vanilla" && !schema.consume.vanilla) {
    fail("consume-preferred", "consume.vanilla", `preferred Vanilla contract is missing`);
  }

  for (const [name, surface] of surfaces) {
    if (uses.has(surface.use)) {
      fail("surface-use", `surfaces.${name}.use`, `"${surface.use}" already selects another surface`);
    }
    uses.add(surface.use);

    if (preferred === "react" && !surface.react) {
      fail("consume-preferred", `surfaces.${name}.react`, `preferred React binding is missing`);
    }
    if (surface.react && surface.react.name !== name) {
      fail("surface-name", `surfaces.${name}.react.name`, `must import "${name}"`);
    }

    const required = new Set(surface.requires ?? []);
    for (const forbidden of surface.forbids ?? []) {
      if (required.has(forbidden)) {
        fail("surface-contract", `surfaces.${name}`, `"${forbidden}" cannot be required and forbidden`);
      }
      if (!schema.rules?.[`${name}.${forbidden}`]) {
        fail("forbid-unexplained", `surfaces.${name}.forbids`, `must explain the alternative to "${forbidden}"`);
      }
    }
    for (const prop of Object.keys(surface.props ?? {})) {
      if (prop in sharedProps) {
        fail("prop-dup", `surfaces.${name}.props.${prop}`, `is already declared as a shared prop`);
      }
    }
  }

  // First value = default. `null` in first position means omission is the default, which keeps
  // optional one-value unions exact without inventing a fake value such as "inherit".
  const validateProps = (propMap, path) => {
    for (const [name, values] of Object.entries(propMap)) {
      const concrete = values[0] === null ? values.slice(1) : values;
      if (values.slice(1).includes(null)) {
        fail("prop-type", `${path}.${name}`, `null is only allowed as the first, omitted default`);
      }
      const valueType = typeof concrete[0];
      if (concrete.some((value) => typeof value !== valueType)) {
        fail("prop-type", `${path}.${name}`, `all concrete values must have the same type`);
      }
      if (
        valueType === "boolean" &&
        (concrete.length !== 2 || concrete[0] !== false || concrete[1] !== true)
      ) {
        fail("prop-boolean", `${path}.${name}`, `a boolean prop must expose [false, true]`);
      }
    }
  };

  validateProps(sharedProps, "props");
  for (const [name, surface] of surfaces) {
    validateProps(surface.props ?? {}, `surfaces.${name}.props`);
  }

  for (const [prop, meanings] of Object.entries(schema.meanings ?? {})) {
    const values = sharedProps[prop];
    if (!values) {
      fail("meaning-ref", `meanings.${prop}`, `names an undeclared prop`);
      continue;
    }
    for (const value of Object.keys(meanings)) {
      if (!values.some((candidate) => String(candidate) === value)) {
        fail("meaning-ref", `meanings.${prop}.${value}`, `is not a value of prop "${prop}"`);
      }
    }
    for (const value of values) {
      if (value !== null && !(String(value) in meanings)) {
        fail("meaning-missing", `meanings.${prop}`, `does not explain ${JSON.stringify(value)}`);
      }
    }
  }

  const composed = schema.composes ?? {};
  for (const child of schema.children ?? []) {
    if (/^[A-Z]/.test(child) && !composed[child]) {
      fail("child-import", `children.${child}`, `component children need an import in composes`);
    }
  }
  for (const [alias, binding] of Object.entries(composed)) {
    if (alias !== binding.name) {
      fail("compose-name", `composes.${alias}`, `alias and imported name must match`);
    }
  }

  for (const [name, surface] of surfaces) {
    const examples = schema.examples[name];
    if (!examples) {
      fail("surface-examples", `examples.${name}`, `surface needs at least one example`);
      continue;
    }

    for (const [exampleName, example] of Object.entries(examples)) {
      const where = `examples.${name}.${exampleName}`;
      if (preferred === "react" && surface.react) {
        if (!example.includes(`<${surface.react.name}`)) {
          fail("example-consumes", where, `must compose <${surface.react.name}>`);
        }
        if (new RegExp(`<${escapeRegExp(surface.element)}(?:\\s|>)`).test(example)) {
          fail("example-recreates", where, `uses raw <${surface.element}> while ${surface.react.name} exists`);
        }
      }
      if (/--sk-|var\(|packages\/|className=["'][^"']*\bsk-/.test(example)) {
        fail("implementation-leak", where, `contains implementation details instead of the public interface`);
      }

      for (const required of surface.requires ?? []) {
        if (!new RegExp(`\\b${escapeRegExp(required)}(?:\\s*=|\\s|>)`).test(example)) {
          fail("example-required", where, `must include "${required}"`);
        }
      }
      for (const forbidden of surface.forbids ?? []) {
        if (new RegExp(`\\b${escapeRegExp(forbidden)}(?:\\s*=|\\s|>)`).test(example)) {
          fail("example-forbidden", where, `must not include "${forbidden}"`);
        }
      }
      const availableProps = { ...sharedProps, ...(surface.props ?? {}) };
      for (const [prop, values] of Object.entries(availableProps)) {
        const concrete = values.filter((value) => value !== null);
        if (typeof concrete[0] !== "string") continue;
        const match = example.match(new RegExp(`\\b${prop}=["']([^"']+)["']`));
        if (match && !concrete.includes(match[1])) {
          fail("example-prop", where, `${prop}=${JSON.stringify(match[1])} is not public`);
        }
      }
    }
  }

  for (const name of Object.keys(schema.examples)) {
    if (!schema.surfaces[name]) {
      fail("surface-examples", `examples.${name}`, `names no declared surface`);
    }
  }

  // Vanilla is the only place classes and data attributes belong. Guidance and examples stay on
  // the public composition interface.
  const guidance = JSON.stringify({
    surfaces: schema.surfaces,
    props: schema.props,
    meanings: schema.meanings,
    rules: schema.rules,
  });
  if (/--sk-|var\(|packages\/|\bsk-[a-z]/.test(guidance)) {
    fail("implementation-leak", "(guide)", `guidance contains CSS or repository internals`);
  }

  return problems;
}

