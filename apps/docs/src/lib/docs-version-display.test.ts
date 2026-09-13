import { describe, expect, it } from "vitest";
import { compareVersions, majorLinesFromLedger, majorOf, tipFromLedger } from "./docs-version-display";

describe("majorOf", () => {
  it("takes the first numeric segment, ignoring prerelease tags", () => {
    expect(majorOf("0.0.1-dev")).toBe("0");
    expect(majorOf("0.2.0")).toBe("0");
    expect(majorOf("1.0.0")).toBe("1");
    expect(majorOf("10.3.1-rc.1")).toBe("10");
  });
});

describe("compareVersions", () => {
  it("compares the numbers as numbers, not as text", () => {
    expect([...["0.9.0", "0.10.0"]].sort(compareVersions)).toEqual(["0.10.0", "0.9.0"]);
  });

  it("puts a release above its own prerelease", () => {
    expect([...["0.0.1-dev", "0.0.1"]].sort(compareVersions)).toEqual(["0.0.1", "0.0.1-dev"]);
  });
});

describe("majorLinesFromLedger", () => {
  it("exposes the live tip under its major while nothing is published yet", () => {
    expect(tipFromLedger({ working: "0.0.1", releases: [] })).toBe("0.0.1-dev");
    expect(majorLinesFromLedger({ working: "0.0.1", releases: [] })).toEqual([
      { major: "0", latest: "0.0.1-dev", isCurrent: true },
    ]);
  });

  it("keeps one row per major and picks that major's newest tip", () => {
    const lines = majorLinesFromLedger({
      working: "1.1.0",
      releases: [
        { version: "1.0.0" },
        { version: "0.2.0" },
        { version: "0.1.0" },
      ],
    });
    expect(lines).toEqual([
      { major: "1", latest: "1.1.0-dev", isCurrent: true },
      { major: "0", latest: "0.2.0", isCurrent: false },
    ]);
  });

  it("treats working's major as current even when the footer tip is still the previous major", () => {
    expect(
      majorLinesFromLedger({
        working: "1.0.0",
        releases: [{ version: "0.2.0" }],
      }),
    ).toEqual([
      { major: "1", latest: "1.0.0-dev", isCurrent: true },
      { major: "0", latest: "0.2.0", isCurrent: false },
    ]);
  });
});
