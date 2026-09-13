import { describe, expect, it } from "vitest";
import { canonicalPath, localizePath, splitVersion, versionOf } from "../i18n";

/*
 * THE VERSION AXIS (ADR-0022 / VERSIONED_DOCS_PLAN §3.3), tested where it is decidable: as functions.
 *
 * Archives are mounted at deploy time under `/v<version>/`, not as routes in `src/pages/`. The helpers
 * below still parse and emit that prefix so a future cut can reuse them without relearning the rules.
 */

describe("the version prefix", () => {
  it("reads a version off the first segment, in the release's own spelling", () => {
    expect(splitVersion("/v0.0.1-dev/components/button")).toEqual({
      version: "0.0.1-dev",
      path: "/components/button",
    });
    expect(splitVersion("/v1/foundations")).toEqual({ version: "1", path: "/foundations" });
    expect(splitVersion("/v0.2.0/es/densidad")).toEqual({ version: "0.2.0", path: "/es/densidad" });
  });

  it("leaves an ordinary path alone, including one that merely starts with a v", () => {
    expect(splitVersion("/vaul")).toEqual({ version: null, path: "/vaul" });
    expect(splitVersion("/components/button")).toEqual({ version: null, path: "/components/button" });
    /* `/v/1/` is the shape this deliberately does NOT accept: the prefix is one segment. */
    expect(versionOf("/v/1/components/button")).toBe(null);
  });
});

describe("identity does not include the version", () => {
  it("canonicalises a document to the same path in every version and locale", () => {
    const canonical = "/components/button";
    expect(canonicalPath("/components/button")).toBe(canonical);
    expect(canonicalPath("/es/componentes/button")).toBe(canonical);
    expect(canonicalPath("/v0.0.1-dev/components/button")).toBe(canonical);
    expect(canonicalPath("/v0.0.1-dev/es/componentes/button")).toBe(canonical);
  });

  it("keeps the version when the locale changes, and the locale when the version changes", () => {
    expect(localizePath("/v0.0.1-dev/components/button", "es")).toBe("/v0.0.1-dev/es/componentes/button");
    expect(localizePath("/v0.0.1-dev/es/componentes/button", "es", null)).toBe("/es/componentes/button");
    expect(localizePath("/components/button", "en", "0.0.1-dev")).toBe("/v0.0.1-dev/components/button");
  });
});
