import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Popover } from "./popover.js";

/*
 * The native Popover API (`showPopover`/`hidePopover`, `:popover-open`, light-dismiss) is not
 * implemented by jsdom — `"showPopover" in document.createElement("div")` is `false` here, so there
 * is no way to actually open/close one through jsdom the way a real browser's `popovertarget` click
 * would. This is the same constraint `dialog.test.tsx` accepts for `<dialog>`'s own native
 * `showModal()`: both suites verify the STRUCTURE and ATTRIBUTES this component hands to the
 * platform (trigger/content linkage, conditional anatomy, placement) rather than the platform's own
 * open/close/dismiss behavior, which is the browser's to test, not this component's.
 *
 * jsdom's UA stylesheet also carries the real `[popover]:not(:popover-open) { display: none }`
 * rule, so the closed content is legitimately hidden from the accessibility tree by default (the
 * same as a real closed popover) — every `getByRole`/`queryByRole` reaching INTO it below passes
 * `{ hidden: true }` for exactly that reason, not to work around a test issue.
 */
describe("Popover (React)", () => {
  it("links the trigger to its content via popovertarget/id, with popover=auto", () => {
    const ui = render(<Popover trigger="Open">Content</Popover>);
    const trigger = ui.getByRole("button", { name: "Open" });
    const contentId = trigger.getAttribute("popovertarget")!;
    expect(contentId).toBeTruthy();

    const content = ui.container.querySelector(`#${contentId}`)!;
    expect(content.getAttribute("popover")).toBe("auto");
    expect(content.textContent).toContain("Content");
  });

  it("renders a title and description in the full (non-bare) anatomy", () => {
    const ui = render(
      <Popover trigger="Open" title="Filtros" description="Elegí una categoría.">
        Content
      </Popover>,
    );
    expect(ui.getByRole("heading", { name: "Filtros", hidden: true })).toBeTruthy();
    expect(ui.getByText("Elegí una categoría.")).toBeTruthy();
  });

  /*
   * `popover="auto"` grants no implicit accessible name the way `<dialog>` at least tries to —
   * same gap `Dialog` closes for its own title/body (`dialog.tsx`). Without this, a screen reader
   * focusing or announcing the popover gets nothing from its own heading.
   */
  it("links the panel to its own title/description via aria-labelledby/aria-describedby", () => {
    const ui = render(
      <Popover trigger="Open" title="Filtros" description="Elegí una categoría.">
        Content
      </Popover>,
    );
    const heading = ui.getByRole("heading", { name: "Filtros", hidden: true });
    const description = ui.getByText("Elegí una categoría.");
    const content = ui.container.querySelector("[popover]")!;

    expect(content.getAttribute("aria-labelledby")).toBe(heading.id);
    expect(content.getAttribute("aria-describedby")).toBe(description.id);
    expect(heading.id).toBeTruthy();
    expect(description.id).toBeTruthy();
  });

  it("carries neither aria-labelledby nor aria-describedby without a title/description to point at", () => {
    const ui = render(<Popover trigger="Open">Content</Popover>);
    const content = ui.container.querySelector("[popover]")!;
    expect(content.hasAttribute("aria-labelledby")).toBe(false);
    expect(content.hasAttribute("aria-describedby")).toBe(false);
  });

  it("carries neither aria-labelledby nor aria-describedby in bare mode, even with title/description given", () => {
    const ui = render(
      <Popover trigger="Open" title="Filtros" description="Elegí una categoría." bare>
        Content
      </Popover>,
    );
    const content = ui.container.querySelector("[popover]")!;
    expect(content.hasAttribute("aria-labelledby")).toBe(false);
    expect(content.hasAttribute("aria-describedby")).toBe(false);
  });

  it("renders a close button in the full anatomy, wired to popoverTargetAction=hide", () => {
    const ui = render(<Popover trigger="Open">Content</Popover>);
    const close = ui.getByRole("button", { name: "Cerrar", hidden: true });
    expect(close.getAttribute("popovertargetaction")).toBe("hide");
  });

  it("omits the title, description and close button entirely in bare mode", () => {
    const ui = render(
      <Popover trigger="Open" title="Filtros" description="Elegí una categoría." bare>
        Content
      </Popover>,
    );
    expect(ui.queryByRole("heading", { name: "Filtros", hidden: true })).toBeNull();
    expect(ui.queryByText("Elegí una categoría.")).toBeNull();
    expect(ui.queryByRole("button", { name: "Cerrar", hidden: true })).toBeNull();
  });

  it("renders no arrow by default, and one only when asked", () => {
    const ui = render(<Popover trigger="Open">Content</Popover>);
    expect(ui.container.querySelector(".sk-anchored-arrow")).toBeNull();

    const withArrow = render(
      <Popover trigger="Open" arrow>
        Content
      </Popover>,
    );
    const arrow = withArrow.container.querySelector(".sk-anchored-arrow")!;
    expect(arrow).not.toBeNull();
    expect(arrow.getAttribute("aria-hidden")).toBe("true");
  });

  it("writes the chosen placement onto the content", () => {
    const ui = render(
      <Popover trigger="Open" placement="inline-start">
        Content
      </Popover>,
    );
    const trigger = ui.getByRole("button", { name: "Open" });
    const contentId = trigger.getAttribute("popovertarget")!;
    const content = ui.container.querySelector(`#${contentId}`)!;
    expect(content.getAttribute("data-sk-placement")).toBe("inline-start");
  });

  it("names an icon-only trigger with triggerLabel", () => {
    const ui = render(
      <Popover trigger={<svg />} triggerLabel="Abrir filtros">
        Content
      </Popover>,
    );
    expect(ui.getByRole("button", { name: "Abrir filtros" })).toBeTruthy();
  });
});
