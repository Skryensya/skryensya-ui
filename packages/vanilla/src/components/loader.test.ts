import { LOADER_TICKS, loaderParts, loaderTicks } from "@skryensya/core/loader";
import { afterEach, describe, expect, it } from "vitest";
import { initComponents } from "../runtime/registry.js";
import { connectLoader } from "./loader.js";

afterEach(() => {
  document.body.innerHTML = "";
});

/** An authored root: the design named, and not one mark written by hand. */
function authored(variant?: string): HTMLElement {
  const root = document.createElement("span");
  root.className = loaderParts.root;
  if (variant !== undefined) root.setAttribute("data-variant", variant);
  document.body.append(root);
  return root;
}

const marks = (root: HTMLElement) => root.querySelectorAll(`:scope > .${loaderParts.tick}`).length;

describe("connectLoader", () => {
  it("builds the marks a staggered design needs from an empty authored root", () => {
    const built = Object.entries(LOADER_TICKS).map(([variant, expected]) => {
      const root = authored(variant);
      connectLoader(root);
      return [variant, marks(root), expected];
    });

    expect(built).toEqual([
      ["spokes", 12, 12],
      ["ticks", 8, 8],
      ["compass", 4, 4],
      ["beads", 8, 8],
    ]);
  });

  it("leaves a pseudo-element design exactly as authored", () => {
    for (const variant of ["ring", "sweep", "bars", "dots", "arc", "comet", "orbit", "clock"]) {
      const root = authored(variant);
      connectLoader(root);

      expect(loaderTicks(variant)).toBe(0);
      expect(root.children).toHaveLength(0);
    }
  });

  it("falls back to the contract's default design when the root names none", () => {
    const root = authored();
    connectLoader(root);

    // `ring` is the default and draws itself out of pseudo-elements, so there is nothing to build.
    expect(marks(root)).toBe(0);
  });

  /*
   * The case the whole "if needed" clause exists for: markup that ALREADY carries its marks, from
   * the emitter or a server render. Rebuilding those would restart twelve animations mid-cycle.
   */
  it("leaves marks that are already correct alone, rather than rebuilding them", () => {
    const root = authored("spokes");
    for (let i = 0; i < 12; i += 1) {
      const mark = document.createElement("span");
      mark.className = loaderParts.tick;
      root.append(mark);
    }
    const before = [...root.children];

    connectLoader(root);

    expect([...root.children]).toEqual(before);
  });

  it("repairs a hand-written root whose mark count is wrong", () => {
    const root = authored("spokes");
    // Eleven: the miscount nothing reports, which renders as a spinner with a gap.
    for (let i = 0; i < 11; i += 1) {
      const mark = document.createElement("span");
      mark.className = loaderParts.tick;
      root.append(mark);
    }

    connectLoader(root);

    expect(marks(root)).toBe(12);
  });

  it("rebuilds the marks when the design changes on a live root", async () => {
    const root = authored("spokes");
    connectLoader(root);
    expect(marks(root)).toBe(12);

    root.setAttribute("data-variant", "compass");
    // MutationObserver callbacks land on a microtask, so one await is enough to see the resync.
    await Promise.resolve();

    expect(marks(root)).toBe(4);
  });

  it("removes what it built when disconnected, so re-enhancing is not doubling", () => {
    const root = authored("spokes");
    const cleanup = connectLoader(root);
    expect(marks(root)).toBe(12);

    cleanup();

    expect(marks(root)).toBe(0);
  });

  /*
   * The real path, not `connectLoader` in isolation: the registry finds `[data-sk-loader]` and mounts
   * through Imperative.svelte, which puts its own anchor inside the root. The marks still have to
   * come FIRST, or `loader.css`'s `:nth-child()` angles would not start at zero.
   */
  it("builds the marks from the one-line authored markup through the auto-loader", async () => {
    document.body.innerHTML = `<span class="sk-loader" data-sk-loader data-variant="spokes" aria-hidden="true"></span>`;
    const root = document.querySelector<HTMLElement>(".sk-loader")!;

    await initComponents(document);

    expect(marks(root)).toBe(12);
    expect(root.firstElementChild?.classList.contains(loaderParts.tick)).toBe(true);
    expect([...root.children].every((child) => child.classList.contains(loaderParts.tick))).toBe(true);
  });
});

