import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Treegrid,
  TreegridBody,
  TreegridCell,
  TreegridColumnHeader,
  TreegridHead,
  TreegridHeadRow,
  TreegridRow,
} from "./treegrid.js";

/*
 * Same fixture as the core (`treegrid.test.ts`) and vanilla (`treegrid.test.ts`) suites: Inbox
 * (expanded, two children), Drafts (collapsed, one child that stays hidden), Sent (a top-level leaf).
 */
function Fixture({ onActivate, onExpandedChange }: {
  onActivate?: (details: { value: string }) => void;
  onExpandedChange?: (details: { value: string; expanded: boolean }) => void;
}) {
  return (
    <Treegrid label="Mensajes" onActivate={onActivate} onExpandedChange={onExpandedChange}>
      <TreegridHead>
        <TreegridHeadRow>
          <TreegridColumnHeader>Asunto</TreegridColumnHeader>
          <TreegridColumnHeader>De</TreegridColumnHeader>
        </TreegridHeadRow>
      </TreegridHead>
      <TreegridBody>
        <TreegridRow value="inbox" level={1} setSize={3} posInset={1} expanded>
          <TreegridCell>Inbox</TreegridCell>
          <TreegridCell>—</TreegridCell>
        </TreegridRow>
        <TreegridRow value="alice" level={2} setSize={2} posInset={1}>
          <TreegridCell>Reunión</TreegridCell>
          <TreegridCell>Alice</TreegridCell>
        </TreegridRow>
        <TreegridRow value="bob" level={2} setSize={2} posInset={2}>
          <TreegridCell>Almuerzo</TreegridCell>
          <TreegridCell>Bob</TreegridCell>
        </TreegridRow>
        <TreegridRow value="drafts" level={1} setSize={3} posInset={2} expanded={false}>
          <TreegridCell>Drafts</TreegridCell>
          <TreegridCell>—</TreegridCell>
        </TreegridRow>
        <TreegridRow value="untitled" level={2} setSize={1} posInset={1}>
          <TreegridCell>Sin título</TreegridCell>
          <TreegridCell>Yo</TreegridCell>
        </TreegridRow>
        <TreegridRow value="sent" level={1} setSize={3} posInset={3}>
          <TreegridCell>Sent</TreegridCell>
          <TreegridCell>—</TreegridCell>
        </TreegridRow>
      </TreegridBody>
    </Treegrid>
  );
}

const row = (ui: ReturnType<typeof render>, value: string) =>
  ui.container.querySelector<HTMLTableRowElement>(`[data-value="${value}"]`)!;

describe("Treegrid React contracts", () => {
  it("names the grid, sets role=treegrid, and reads each row's authored hierarchy attributes", () => {
    const ui = render(<Fixture />);
    const grid = ui.getByRole("treegrid", { name: "Mensajes" });
    expect(grid.tagName).toBe("TABLE");
    expect(row(ui, "alice").getAttribute("aria-level")).toBe("2");
    expect(row(ui, "alice").getAttribute("aria-setsize")).toBe("2");
    expect(row(ui, "alice").getAttribute("aria-posinset")).toBe("1");
  });

  it("honors each row's own initial `expanded`, and hides only a collapsed branch's descendant", () => {
    const ui = render(<Fixture />);
    expect(row(ui, "inbox").getAttribute("aria-expanded")).toBe("true");
    expect(row(ui, "drafts").getAttribute("aria-expanded")).toBe("false");
    expect(row(ui, "alice").hidden).toBe(false);
    expect(row(ui, "untitled").hidden).toBe(true);
  });

  it("gives exactly one row a tab stop initially — the first row", () => {
    const ui = render(<Fixture />);
    const rows = ui.container.querySelectorAll<HTMLTableRowElement>("[role='row']");
    const stops = Array.from(rows).filter((element) => element.tabIndex === 0);
    expect(stops).toEqual([row(ui, "inbox")]);
  });

  it("Right Arrow on a collapsed branch expands it and reveals the child, without moving focus", async () => {
    const onExpandedChange = vi.fn();
    const ui = render(<Fixture onExpandedChange={onExpandedChange} />);
    row(ui, "drafts").focus();
    fireEvent.keyDown(row(ui, "drafts"), { key: "ArrowRight" });
    await waitFor(() => {
      expect(row(ui, "drafts").getAttribute("aria-expanded")).toBe("true");
      expect(row(ui, "untitled").hidden).toBe(false);
      expect(onExpandedChange).toHaveBeenCalledWith({ value: "drafts", expanded: true });
    });
  });

  it("Left Arrow on an expanded branch collapses it and hides its children", async () => {
    const ui = render(<Fixture />);
    row(ui, "inbox").focus();
    fireEvent.keyDown(row(ui, "inbox"), { key: "ArrowLeft" });
    await waitFor(() => {
      expect(row(ui, "inbox").getAttribute("aria-expanded")).toBe("false");
      expect(row(ui, "alice").hidden).toBe(true);
      expect(row(ui, "bob").hidden).toBe(true);
    });
  });

  it("Down Arrow from a collapsed branch's row skips its hidden child entirely", async () => {
    const ui = render(<Fixture />);
    row(ui, "drafts").focus();
    fireEvent.keyDown(row(ui, "drafts"), { key: "ArrowDown" });
    await waitFor(() => expect(document.activeElement).toBe(row(ui, "sent")));
  });

  it("Enter activates a focused leaf row", async () => {
    const onActivate = vi.fn();
    const ui = render(<Fixture onActivate={onActivate} />);
    row(ui, "sent").focus();
    fireEvent.keyDown(row(ui, "sent"), { key: "Enter" });
    await waitFor(() => expect(onActivate).toHaveBeenCalledWith({ value: "sent" }));
  });

  it("clicking a branch's first cell toggles it and reports the row's own value", async () => {
    const onExpandedChange = vi.fn();
    const ui = render(<Fixture onExpandedChange={onExpandedChange} />);
    const firstCell = row(ui, "drafts").querySelectorAll("td")[0]!;
    fireEvent.click(firstCell);
    await waitFor(() => {
      expect(row(ui, "drafts").getAttribute("aria-expanded")).toBe("true");
      expect(onExpandedChange).toHaveBeenCalledWith({ value: "drafts", expanded: true });
    });
  });

  it("clicking a non-first cell just moves focus, without toggling", async () => {
    const ui = render(<Fixture />);
    const secondCell = row(ui, "inbox").querySelectorAll("td")[1]!;
    fireEvent.click(secondCell);
    await waitFor(() => {
      expect(document.activeElement).toBe(secondCell);
      expect(row(ui, "inbox").getAttribute("aria-expanded")).toBe("true");
    });
  });

  it("never puts `sk-interactive` on the <tr> itself — its state layer breaks table column alignment", () => {
    const ui = render(<Fixture />);
    expect(row(ui, "inbox").classList.contains("sk-interactive")).toBe(false);
  });

  it("renders a decorative disclosure button in a branch row's first cell, never a leaf's", () => {
    const ui = render(<Fixture />);
    const inboxButton = row(ui, "inbox").querySelector<HTMLButtonElement>(":first-child > button");
    expect(inboxButton).not.toBeNull();
    expect(inboxButton!.getAttribute("aria-hidden")).toBe("true");
    expect(inboxButton!.tabIndex).toBe(-1);
    expect(row(ui, "sent").querySelector("button")).toBeNull();
  });

  it("clicking the disclosure button itself toggles the row, same as clicking the cell", async () => {
    const onExpandedChange = vi.fn();
    const ui = render(<Fixture onExpandedChange={onExpandedChange} />);
    const draftsButton = row(ui, "drafts").querySelector<HTMLButtonElement>(":first-child > button")!;
    fireEvent.click(draftsButton);
    await waitFor(() => {
      expect(row(ui, "drafts").getAttribute("aria-expanded")).toBe("true");
      expect(onExpandedChange).toHaveBeenCalledWith({ value: "drafts", expanded: true });
    });
  });

  it("never renders a column resizer unless `resizableColumns` is on", () => {
    const ui = render(<Fixture />);
    expect(ui.container.querySelector("[data-sk-treegrid-column-resizer]")).toBeNull();
  });
});

/** Three columns, so "no resizer after the LAST column" is distinguishable from "no resizer at all" —
 * same shape as the vanilla suite's own `resizableMarkup`. */
function ResizableFixture() {
  return (
    <Treegrid label="Mensajes" resizableColumns resizeLabel="Redimensionar columna">
      <TreegridHead>
        <TreegridHeadRow>
          <TreegridColumnHeader>Asunto</TreegridColumnHeader>
          <TreegridColumnHeader>De</TreegridColumnHeader>
          <TreegridColumnHeader>Fecha</TreegridColumnHeader>
        </TreegridHeadRow>
      </TreegridHead>
      <TreegridBody>
        <TreegridRow value="inbox" level={1} setSize={1} posInset={1}>
          <TreegridCell>Inbox</TreegridCell>
          <TreegridCell>—</TreegridCell>
          <TreegridCell>Hoy</TreegridCell>
        </TreegridRow>
      </TreegridBody>
    </Treegrid>
  );
}

describe("Treegrid column resize", () => {
  const resizers = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>("[data-sk-treegrid-column-resizer]"));
  const colWidths = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLTableColElement>("col")).map((c) => Number.parseFloat(c.style.width));

  /*
   * jsdom lays nothing out (`getBoundingClientRect` is always 0,0,0,0), so the mount-time seed
   * (`measured width ÷ colCount`) would clamp every column straight to `MIN_COLUMN_WIDTH` — a real,
   * but degenerate, 0-length travel range that cannot demonstrate a resize at all. The component
   * measures its OWN PARENT (the scroll wrapper's width, not the table's own — see `Treegrid`'s own
   * comment on why), so the stub is on the generic `Element` prototype, not a table-specific one:
   * this fixture renders unwrapped (no `TreegridScroll`), so what gets measured is RTL's own
   * container div, not a `<table>`.
   */
  const stubTableWidth = (px: number) => {
    const spy = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockReturnValue({ width: px, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) });
    return () => spy.mockRestore();
  };

  it("renders one resizer per column boundary — never after the last column", () => {
    const restore = stubTableWidth(600);
    const ui = render(<ResizableFixture />);
    const handles = resizers(ui.container);
    expect(handles).toHaveLength(2); // three columns, two boundaries
    for (const handle of handles) {
      expect(handle.getAttribute("role")).toBe("separator");
      expect(handle.getAttribute("aria-orientation")).toBe("vertical");
      expect(handle.tabIndex).toBe(0);
    }
    restore();
  });

  it("names each resizer from the shared label plus its OWN column header", () => {
    const restore = stubTableWidth(600);
    const ui = render(<ResizableFixture />);
    const handles = resizers(ui.container);
    expect(handles[0]!.getAttribute("aria-label")).toBe("Redimensionar columna: Asunto");
    expect(handles[1]!.getAttribute("aria-label")).toBe("Redimensionar columna: De");
    restore();
  });

  it("Left/Right resize by a step, Shift+Left/Right by the coarse step", () => {
    const restore = stubTableWidth(600);
    const ui = render(<ResizableFixture />);
    const handle = resizers(ui.container)[0]!;
    const before = colWidths(ui.container)[0]!;
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(colWidths(ui.container)[0]).toBeCloseTo(before + 16);
    fireEvent.keyDown(handle, { key: "ArrowLeft", shiftKey: true });
    expect(colWidths(ui.container)[0]).toBeCloseTo(before + 16 - 64);
    restore();
  });

  it("Home/End jump to the resized pair's min/max extent, total conserved", () => {
    const restore = stubTableWidth(600);
    const ui = render(<ResizableFixture />);
    const handle = resizers(ui.container)[0]!;
    const [w0, w1, w2] = colWidths(ui.container);
    const total = w0! + w1!;

    fireEvent.keyDown(handle, { key: "End" });
    expect(colWidths(ui.container)[0]).toBeCloseTo(total - 60); // 60 = TREEGRID_MIN_COLUMN_WIDTH
    expect(colWidths(ui.container)[2]).toBe(w2); // the untouched third column never moves

    fireEvent.keyDown(handle, { key: "Home" });
    expect(colWidths(ui.container)[0]).toBeCloseTo(60);
    restore();
  });

  it("Enter (and double-click) resets the pair to an even split", () => {
    const restore = stubTableWidth(600);
    const ui = render(<ResizableFixture />);
    const handle = resizers(ui.container)[0]!;

    fireEvent.keyDown(handle, { key: "End" });
    fireEvent.keyDown(handle, { key: "Enter" });
    const [w0, w1] = colWidths(ui.container);
    expect(w0).toBeCloseTo(w1!);

    fireEvent.keyDown(handle, { key: "End" });
    fireEvent.dblClick(handle);
    const [r0, r1] = colWidths(ui.container);
    expect(r0).toBeCloseTo(r1!);
    restore();
  });

  it("reports its position as a percentage of the pair's travel, not a raw pixel count", () => {
    const restore = stubTableWidth(600);
    const ui = render(<ResizableFixture />);
    const handle = resizers(ui.container)[0]!;
    expect(handle.getAttribute("aria-valuemin")).toBe("0");
    expect(handle.getAttribute("aria-valuemax")).toBe("100");
    fireEvent.keyDown(handle, { key: "End" });
    expect(handle.getAttribute("aria-valuenow")).toBe("100");
    fireEvent.keyDown(handle, { key: "Home" });
    expect(handle.getAttribute("aria-valuenow")).toBe("0");
    restore();
  });
});
