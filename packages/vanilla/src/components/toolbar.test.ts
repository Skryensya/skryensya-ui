import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountToolbar } from "./toolbar.js";

/*
 * No test file existed for this enhancer before — confirmed while auditing against the WAI-ARIA
 * APG toolbar pattern (docs/aria-apg-audit.md). That gap is exactly how a real divergence between
 * this file and the React binding went unnoticed (see toolbar.test.tsx for the bug it caused there).
 */
function markup({ loop = true }: { loop?: boolean } = {}) {
  document.body.innerHTML = `<div class="sk-toolbar" data-sk-toolbar aria-label="Formato" role="toolbar" data-orientation="horizontal" ${loop ? 'data-loop-focus=""' : ""}>
    <button type="button" id="bold">B</button>
    <button type="button" id="italic">I</button>
    <button type="button" id="disabled-native" disabled>D</button>
    <div role="radiogroup" aria-label="Alineación">
      <button type="button" id="align-left" role="radio" aria-checked="true" tabindex="0">←</button>
      <button type="button" id="align-center" role="radio" aria-checked="false" tabindex="-1">↔</button>
      <button type="button" id="align-right" role="radio" aria-checked="false" tabindex="-1">→</button>
    </div>
    <button type="button" id="underline">U</button>
  </div>`;
  const root = document.querySelector<HTMLElement>("[data-sk-toolbar]")!;
  expect(mountToolbar(document)).toBe(1);
  return root;
}

const byId = (id: string) => document.getElementById(id)!;

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-toolbar]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
});

describe("Toolbar vanilla enhancer", () => {
  it("sets role and aria-orientation on mount", () => {
    const root = markup();
    expect(root.getAttribute("role")).toBe("toolbar");
    expect(root.getAttribute("aria-orientation")).toBe("horizontal");
  });

  it("Right/Left move between controls, skipping a NATIVELY disabled one (the browser refuses it focus regardless)", () => {
    const root = markup();
    byId("bold").focus();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(document.activeElement).toBe(byId("italic"));
    fireEvent.keyDown(root, { key: "ArrowRight" });
    // "disabled-native" is skipped — it never matches `:not([disabled])`.
    expect(document.activeElement).toBe(byId("align-left"));
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(byId("italic"));
  });

  it("loops from the last control back to the first when data-loop-focus is set", () => {
    const root = markup({ loop: true });
    byId("underline").focus();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(document.activeElement).toBe(byId("bold"));
  });

  it("does not loop when data-loop-focus is absent", () => {
    const root = markup({ loop: false });
    byId("underline").focus();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(document.activeElement).toBe(byId("underline"));
  });

  it("Home/End jump to the first/last control", () => {
    const root = markup();
    byId("italic").focus();
    fireEvent.keyDown(root, { key: "Home" });
    expect(document.activeElement).toBe(byId("bold"));
    fireEvent.keyDown(root, { key: "End" });
    expect(document.activeElement).toBe(byId("underline"));
  });

  /*
   * WAI's own toolbar example nests a radiogroup and treats it as ONE stop for Left/Right — "moving
   * focus inside the group does not automatically change which button is checked", and only the
   * member with the group's own roving tabindex is a toolbar stop. Confirmed against
   * `@zag-js`-style roving tabindex convention: exactly one member carries tabindex="0".
   */
  it("treats a nested composite (radiogroup) as a SINGLE stop, landing on whichever member currently owns tabindex=0", () => {
    const root = markup();
    byId("italic").focus();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(document.activeElement).toBe(byId("align-left")); // the radiogroup's own tabindex=0 member
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(document.activeElement).toBe(byId("underline")); // skips align-center/align-right entirely
  });

  it("defers to a composite child that already handled the key itself (defaultPrevented)", () => {
    const root = markup();
    const alignCenter = byId("align-center");
    alignCenter.tabIndex = 0;
    alignCenter.focus();
    // Target-phase listeners run before the event bubbles to `root`'s own — simulates a nested
    // composite (a real Segmented/RadioGroup machine) that already moved focus itself and called
    // preventDefault() before the toolbar's ancestor listener ever sees it.
    alignCenter.addEventListener("keydown", (event) => event.preventDefault());
    fireEvent.keyDown(alignCenter, { key: "ArrowRight" });
    // Focus does not move to the toolbar's next control — the child owned this keystroke.
    expect(document.activeElement).toBe(alignCenter);
  });
});
