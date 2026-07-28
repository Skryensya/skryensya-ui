/*
 * GATE 1's RULES: declared artefacts exist and are importable (see _invariants.json).
 *
 * Gate 0 (checks.mjs) only proves a schema is coherent with ITSELF — its examples obey the
 * requires/forbids/props IT declares. It never opens a real .tsx file, so a schema can pass gate 0
 * forever while drifting from the component it describes (a surface renamed, a prop removed, an
 * import path that no longer resolves). This is that missing check.
 *
 * Same three-way split as checks.mjs: this file JUDGES and does no fs itself — `checkArtifacts`
 * is corpus-in (schema + World) / Problem[]-out, so it has a real test surface with a fake World
 * fixture instead of the whole repo's disk state. gate1-world.mjs is the impure shell that reads
 * package.json exports maps and source files into that World; validate.mjs wires the two together.
 *
 * What this gate does NOT claim to prove, on purpose (see the corresponding rule below for why):
 *   - that `forbids` is actually enforced — the whole point of a forbidden prop is that it's
 *     absent from the type, so there is nothing to look up. A real check would need to ask the
 *     TypeScript compiler "does this prop assignment fail to typecheck", which this gate does not
 *     attempt: it stays a fast, dependency-free text scan, same tier as checks.mjs's own
 *     example-matching regexes.
 *   - that a `requires`/`forbids` prop is required/forbidden for the RIGHT reason, only that the
 *     name still exists as a real identifier on the surface. "ButtonLink forbids href because
 *     Button now accepts it too" is a semantic drift this gate cannot see — only a human review
 *     (or a real type-checker pass) catches that class of bug.
 */

/** @typedef {{ rule: string, where: string, msg: string }} Problem */

/**
 * @typedef {object} World
 * @property {Record<string, Record<string, {types?: string, default?: string} | string>>} exportsByPackage
 *   package.json "exports" maps, keyed by package name, e.g. `{ "@skryensya/react": { ".": {...}, "./button": {...} } }`.
 * @property {Record<string, string>} sourceByFile
 *   File text keyed by `${packageName}::${exportsMapFilePath}` — an opaque id the shell assigns
 *   when it reads the file, so this module never touches a path on disk itself.
 */

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function packageNameFor(spec) {
  // "@skryensya/react/button" -> "@skryensya/react"; "@skryensya/core" -> "@skryensya/core"
  return spec.split("/").slice(0, 2).join("/");
}

function subpathFor(spec) {
  const parts = spec.split("/");
  return parts.length > 2 ? "./" + parts.slice(2).join("/") : ".";
}

/**
 * Resolve a bare specifier (e.g. "@skryensya/react/button") through the world's pre-loaded
 * exports maps — the same bare-specifier contract the docs teach a consumer. Pure lookup, no fs.
 *
 * @param {string} spec
 * @param {World} world
 */
export function resolveSpecifier(spec, world) {
  const pkgName = packageNameFor(spec);
  const exportsMap = world.exportsByPackage[pkgName];
  if (!exportsMap) return { ok: false, reason: `unknown package "${pkgName}" (not loaded into this gate's world)` };

  const subpath = subpathFor(spec);
  const entry = exportsMap[subpath];
  if (!entry) return { ok: false, reason: `no exports["${subpath}"] in ${pkgName}/package.json` };

  const file = typeof entry === "string" ? entry : (entry.default ?? entry.types);
  if (!file) return { ok: false, reason: `exports["${subpath}"] has no default/types` };

  const key = `${pkgName}::${file}`;
  const source = world.sourceByFile[key];
  if (source === undefined) return { ok: false, reason: `file not loaded into this gate's world: ${key}` };
  return { ok: true, key, source };
}

/** Every top-level export name a module's text declares — function/const/re-export. Pure string scan. */
export function exportedNames(source) {
  const names = new Set();
  for (const m of source.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g)) names.add(m[1]);
  for (const m of source.matchAll(/export\s+const\s+([A-Za-z0-9_]+)\s*=/g)) names.add(m[1]);
  for (const m of source.matchAll(/export\s+\{([^}]+)\}/g)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop().trim();
      if (name) names.add(name);
    }
  }
  return names;
}

// Native HTML attributes React's own `*HTMLAttributes<T>` types carry for free — a component built
// as `Omit<AnchorHTMLAttributes<...>, "children"> & {…}` never spells `href` out anywhere in its own
// file, so a text scan alone would call it missing. This is the finite, hand-maintained exception
// list for the host elements this repo's schemas actually name; extend it if a new one shows up as
// a false "artifact-prop-missing".
const NATIVE_HOST_ATTRS = {
  a: new Set(["href", "target", "rel", "download"]),
  button: new Set(["type", "disabled", "form", "name", "value", "autoFocus"]),
  input: new Set([
    "type", "value", "defaultValue", "disabled", "required", "placeholder",
    "name", "checked", "defaultChecked", "readOnly",
  ]),
  textarea: new Set(["value", "defaultValue", "disabled", "required", "placeholder", "name", "readOnly"]),
  select: new Set(["value", "defaultValue", "disabled", "required", "name", "multiple"]),
};

/**
 * True if `propName` is plausibly a real prop of the surface: either the identifier literally
 * appears as an object-type key somewhere in `source` (`propName:` or `propName?:`), or it is a
 * native attribute the surface's host element carries for free (see NATIVE_HOST_ATTRS above).
 *
 * A whole-file scan, not a scoped type lookup — deliberately looser than a real type-checker so
 * it survives multi-line intersections and generics, the same trade checks.mjs's own example
 * regexes already make (word-boundary substring matching over arbitrary JSX text), at the cost of
 * also passing a same-named unrelated local variable. Good enough to catch a renamed/removed prop
 * without needing the TypeScript compiler in this pipeline.
 */
export function surfaceHasProp(source, propName, hostElement) {
  if (NATIVE_HOST_ATTRS[hostElement]?.has(propName)) return true;
  const re = new RegExp(`\\b${escapeRegExp(propName)}\\s*\\??\\s*:`);
  return re.test(source);
}

/**
 * Judge one schema's declared artefacts against the real package sources loaded into `world`.
 *
 * @param {object} schema
 * @param {World} world
 * @returns {Problem[]}
 */
export function checkArtifacts(schema, world) {
  /** @type {Problem[]} */
  const problems = [];
  const fail = (rule, where, msg) => problems.push({ rule, where, msg });

  const checkImport = (where, spec, name) => {
    const resolved = resolveSpecifier(spec, world);
    if (!resolved.ok) {
      fail("artifact-missing", where, `${spec}: ${resolved.reason}`);
      return null;
    }
    if (!exportedNames(resolved.source).has(name)) {
      fail("artifact-not-exported", where, `"${name}" is not exported from ${spec}`);
      return null;
    }
    return resolved.source;
  };

  if (schema.consume?.vanilla?.init) {
    const { from, name } = schema.consume.vanilla.init;
    checkImport("consume.vanilla.init", from, name);
  }

  for (const [surfaceName, surface] of Object.entries(schema.surfaces ?? {})) {
    let source = null;
    if (surface.react) {
      source = checkImport(`surfaces.${surfaceName}.react`, surface.react.from, surface.react.name);
    }
    if (!source) continue; // nothing left to check requires/forbids against once the import itself failed

    for (const required of surface.requires ?? []) {
      if (required.includes(".")) continue; // a sub-component path (e.g. "Accordion.Item"), not a prop name
      if (!surfaceHasProp(source, required, surface.element)) {
        fail(
          "artifact-prop-missing",
          `surfaces.${surfaceName}.requires`,
          `"${required}" is not a recognizable prop of ${surface.react.name} (checked source text and native <${surface.element}> attributes) — was it renamed or removed?`,
        );
      }
    }
    // forbids is intentionally NOT checked here: the whole point of a forbidden prop is that it is
    // absent from the type, so there is no identifier to look up. Proving a forbid is real needs a
    // TypeScript assignability check, out of scope for a dependency-free text scan.
  }

  for (const [alias, compose] of Object.entries(schema.composes ?? {})) {
    checkImport(`composes.${alias}`, compose.from, compose.name);
  }

  return problems;
}
