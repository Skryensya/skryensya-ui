import { describe, expect, it } from "vitest";
import { presenceExitMs, type PresenceTiming } from "./presence.js";

const timing = (partial: Partial<PresenceTiming>): PresenceTiming => ({
  transitionDuration: "",
  transitionDelay: "",
  animationDuration: "",
  animationDelay: "",
  ...partial,
});

/*
 * Both bindings settle an exit on this number, so a wrong reading is content that either vanishes
 * mid-fade or lingers after it. The cases are the shapes a computed style actually comes back in.
 */
describe("presenceExitMs", () => {
  it("reads an unresolved style as nothing to wait for", () => {
    expect(presenceExitMs(timing({}))).toBe(0);
    expect(presenceExitMs(timing({ transitionDuration: "0s", transitionDelay: "0s" }))).toBe(0);
  });

  it("takes the longest of a comma-separated list, in seconds or milliseconds", () => {
    expect(presenceExitMs(timing({ transitionDuration: "0.15s, 200ms, 0.1s", transitionDelay: "0s" }))).toBe(200);
  });

  it("adds each duration's own delay, repeating the delay list the way CSS does", () => {
    expect(presenceExitMs(timing({ transitionDuration: "0.1s, 0.2s, 0.1s", transitionDelay: "0.3s, 0s" }))).toBe(400);
  });

  it("counts a consumer's keyframe exit when it outlasts the transition", () => {
    expect(
      presenceExitMs(
        timing({ transitionDuration: "0.15s", transitionDelay: "0s", animationDuration: "0.5s", animationDelay: "0s" }),
      ),
    ).toBe(500);
  });

  it("never returns a negative wait for a negative delay", () => {
    expect(presenceExitMs(timing({ transitionDuration: "0.1s", transitionDelay: "-1s" }))).toBe(0);
  });
});
