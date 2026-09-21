import { describe, expect, it } from "vitest";
import { contractSourceUrl } from "./contract-source";

describe("contractSourceUrl", () => {
  it("links an independently declared contract to its Core source", () => {
    expect(contractSourceUrl("separator")).toBe(
      "https://github.com/Skryensya/skryensya-ui/blob/main/packages/core/src/separator.ts",
    );
  });

  it("links contracts declared together to their shared Core module", () => {
    expect(contractSourceUrl("box")).toBe(
      "https://github.com/Skryensya/skryensya-ui/blob/main/packages/core/src/layout.ts",
    );
    expect(contractSourceUrl("radio-group")).toBe(
      "https://github.com/Skryensya/skryensya-ui/blob/main/packages/core/src/selection.ts",
    );
    expect(contractSourceUrl("table-pager")).toBe(
      "https://github.com/Skryensya/skryensya-ui/blob/main/packages/core/src/pagination.ts",
    );
  });
});
