import { afterEach, describe, expect, it, vi } from "vitest";
import { setPresent } from "./presence.js";

/* jsdom resolves no transition at all, so the exit length is whatever the test says the sheet has. */
function stubExit(duration: string) {
  /* Only the four timings `presenceExitMs` reads; a real declaration refuses to be extended. */
  vi.spyOn(window, "getComputedStyle").mockReturnValue({
    transitionDuration: duration,
    transitionDelay: "0s",
    animationDuration: "0s",
    animationDelay: "0s",
  } as CSSStyleDeclaration);
}

function presence(hidden = false) {
  const element = document.createElement("div");
  element.className = "sk-presence";
  element.hidden = hidden;
  element.setAttribute("data-state", hidden ? "closed" : "open");
  return element;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("setPresent", () => {
  it("writes hidden and data-state together, the markup React renders", async () => {
    const element = presence();
    await setPresent(element, false);
    expect(element.hidden).toBe(true);
    expect(element.getAttribute("data-state")).toBe("closed");

    await setPresent(element, true);
    expect(element.hidden).toBe(false);
    expect(element.getAttribute("data-state")).toBe("open");
  });

  it("resolves a close only once the exit has had time to paint", async () => {
    vi.useFakeTimers();
    stubExit("0.15s");
    const element = presence();
    const done = vi.fn();
    void setPresent(element, false).then(done);

    await vi.advanceTimersByTimeAsync(100);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(50);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("does not wait on an element that was already hidden", async () => {
    stubExit("0.15s");
    const element = presence(true);
    await expect(setPresent(element, false)).resolves.toBeUndefined();
  });

  it("resolves an interrupted close at the reopen, leaving the element shown", async () => {
    vi.useFakeTimers();
    stubExit("0.15s");
    const element = presence();
    const closed = vi.fn();
    void setPresent(element, false).then(closed);

    await vi.advanceTimersByTimeAsync(50);
    await setPresent(element, true);
    expect(closed).toHaveBeenCalledTimes(1);
    expect(element.hidden).toBe(false);
  });
});
