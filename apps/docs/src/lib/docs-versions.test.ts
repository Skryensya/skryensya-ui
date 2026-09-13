import { describe, expect, it } from "vitest";
import { canonicalPath, localizePath, splitVersion, versionOf } from "../i18n";
import { archiveHref, compareVersions, frozenVersions } from "./docs-versions";

/*
 * THE VERSION AXIS (ADR-0022), tested where it is decidable: as functions.
 *
 * Everything the archive does rests on three claims, and all three are cheap to state and easy to
 * break in a refactor: a version prefix is read off the front of a path, a document's identity does
 * NOT include its version, and a link inside an archive stays inside the archive only when the
 * archive can honour it. The browser behaviour (the switcher, the banner) is the visible half; this
 * is the half that decides what the visible half says.
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
    /* Switching language inside an archive must not quietly move the reader to the live site. */
    expect(localizePath("/v0.0.1-dev/components/button", "es")).toBe("/v0.0.1-dev/es/componentes/button");
    /* And naming a version explicitly is how the version control leaves it. */
    expect(localizePath("/v0.0.1-dev/es/componentes/button", "es", null)).toBe("/es/componentes/button");
    expect(localizePath("/components/button", "en", "0.0.1-dev")).toBe("/v0.0.1-dev/components/button");
  });
});

describe("links inside an archive", () => {
  it("stays in the archive for a document the archive holds, including fallback stubs", () => {
    expect(archiveHref("/components/button", "en", "0.0.1-dev")).toBe("/v0.0.1-dev/components/button");
    expect(archiveHref("/es/componentes/button", "es", "0.0.1-dev")).toBe("/v0.0.1-dev/es/componentes/button");
    expect(archiveHref("/components/avatar", "en", "0.0.1-dev")).toBe("/v0.0.1-dev/components/avatar");
  });

  it("leaves a link the archive does not hold pointing at the living page", () => {
    /* A 404 dressed up as history is worse than an honest exit from the archive. */
    expect(archiveHref("/components/this-page-does-not-exist", "en", "0.0.1-dev")).toBe(
      "/components/this-page-does-not-exist",
    );
  });

  it("does not touch fragments, external links, or a path read outside any archive", () => {
    expect(archiveHref("#section", "en", "0.0.1-dev")).toBe("#section");
    expect(archiveHref("https://example.com/x", "en", "0.0.1-dev")).toBe("https://example.com/x");
    expect(archiveHref("/components/button", "en", null)).toBe("/components/button");
  });

  it("carries a fragment across the rewrite", () => {
    expect(archiveHref("/components/button#sizes", "en", "0.0.1-dev")).toBe("/v0.0.1-dev/components/button#sizes");
  });
});

describe("version order", () => {
  it("compares the numbers as numbers, not as text", () => {
    expect([...["0.9.0", "0.10.0"]].sort(compareVersions)).toEqual(["0.10.0", "0.9.0"]);
    expect([...["1.0.0", "0.2.0", "10.0.0"]].sort(compareVersions)).toEqual(["10.0.0", "1.0.0", "0.2.0"]);
  });

  it("puts a release above its own prerelease", () => {
    expect([...["0.0.1-dev", "0.0.1"]].sort(compareVersions)).toEqual(["0.0.1", "0.0.1-dev"]);
  });

  it("found the archive that is actually in the tree", () => {
    /* A floor, not an exact list: the glob silently matching nothing is the failure this catches. */
    expect(frozenVersions).toContain("0.0.1-dev");
  });
});
