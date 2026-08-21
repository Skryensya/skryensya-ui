import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toolbar } from "./toolbar.js";

/*
 * No test file existed for this binding before — confirmed while auditing against the WAI-ARIA APG
 * toolbar pattern (docs/aria-apg-audit.md). That gap is exactly why this binding had DIVERGED from
 * `toolbar.ts` (vanilla) without anyone noticing: no `event.defaultPrevented` guard, and no
 * `tabindex`-based filtering to treat a nested composite as ONE stop — both fixed in this same
 * session, see the file's own comment.
 */
function Fixture() {
  return (
    <Toolbar label="Formato">
      <button type="button" id="bold">B</button>
      <button type="button" id="italic">I</button>
      <button type="button" id="disabled-native" disabled>D</button>
      <div role="radiogroup" aria-label="Alineación">
        <button type="button" id="align-left" role="radio" aria-checked="true" tabIndex={0}>←</button>
        <button type="button" id="align-center" role="radio" aria-checked="false" tabIndex={-1}>↔</button>
        <button type="button" id="align-right" role="radio" aria-checked="false" tabIndex={-1}>→</button>
      </div>
      <button type="button" id="underline">U</button>
    </Toolbar>
  );
}

describe("Toolbar React contracts", () => {
  it("sets role and aria-orientation", () => {
    const ui = render(<Fixture />);
    const toolbar = ui.getByRole("toolbar", { name: "Formato" });
    expect(toolbar.getAttribute("aria-orientation")).toBe("horizontal");
  });

  it("forwards arbitrary attrs to the root, same as ToolbarGroup already did — vanilla always had this via the emitted template", () => {
    const ui = render(
      <Toolbar data-docs-example="true" label="Formato">
        <button type="button">B</button>
      </Toolbar>,
    );
    expect(ui.getByRole("toolbar").getAttribute("data-docs-example")).toBe("true");
  });

  it("Right/Left move between controls, skipping a NATIVELY disabled one", () => {
    const ui = render(<Fixture />);
    ui.getByText("B").focus();
    fireEvent.keyDown(ui.getByRole("toolbar"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(ui.getByText("I"));
    fireEvent.keyDown(ui.getByRole("toolbar"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(ui.getByText("←"));
    fireEvent.keyDown(ui.getByRole("toolbar"), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(ui.getByText("I"));
  });

  it("loops by default from the last control back to the first", () => {
    const ui = render(<Fixture />);
    ui.getByText("U").focus();
    fireEvent.keyDown(ui.getByRole("toolbar"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(ui.getByText("B"));
  });

  it("does not loop when loopFocus is false", () => {
    const ui = render(
      <Toolbar label="Formato" loopFocus={false}>
        <button type="button">B</button>
        <button type="button">I</button>
      </Toolbar>,
    );
    ui.getByText("I").focus();
    fireEvent.keyDown(ui.getByRole("toolbar"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(ui.getByText("I"));
  });

  it("Home/End jump to the first/last control", () => {
    const ui = render(<Fixture />);
    ui.getByText("I").focus();
    fireEvent.keyDown(ui.getByRole("toolbar"), { key: "Home" });
    expect(document.activeElement).toBe(ui.getByText("B"));
    fireEvent.keyDown(ui.getByRole("toolbar"), { key: "End" });
    expect(document.activeElement).toBe(ui.getByText("U"));
  });

  it("treats a nested composite (radiogroup) as a SINGLE stop — the bug this session found and fixed", () => {
    const ui = render(<Fixture />);
    ui.getByText("I").focus();
    fireEvent.keyDown(ui.getByRole("toolbar"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(ui.getByText("←")); // the radiogroup's own tabindex=0 member
    fireEvent.keyDown(ui.getByRole("toolbar"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(ui.getByText("U")); // skips ↔/→ entirely, unlike before the fix
  });

  it("defers to a composite child that already handled the key itself (defaultPrevented) — the other half of the bug", () => {
    const ui = render(<Fixture />);
    const alignCenter = ui.getByText("↔");
    alignCenter.tabIndex = 0;
    alignCenter.focus();
    alignCenter.addEventListener("keydown", (event) => event.preventDefault());
    fireEvent.keyDown(alignCenter, { key: "ArrowRight" });
    expect(document.activeElement).toBe(alignCenter);
  });
});
