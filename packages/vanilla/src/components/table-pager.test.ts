import { fireEvent } from "@testing-library/dom";
import { describe, expect, it } from "vitest";
import { mountSelect } from "./select.js";
import { mountTablePager } from "./table-pager.js";

const markup = `<div
  data-sk-table-pager
  data-page-size="2"
  data-status-template="{start}–{end} de {total}"
  data-previous-label="Página anterior"
  data-next-label="Página siguiente"
  data-page-label="Página"
>
  <table>
    <tbody>
      <tr data-sk-table-pager-row><td>1</td></tr>
      <tr data-sk-table-pager-row><td>2</td></tr>
      <tr data-sk-table-pager-row><td>3</td></tr>
      <tr data-sk-table-pager-row><td>4</td></tr>
      <tr data-sk-table-pager-row><td>5</td></tr>
    </tbody>
  </table>
  <div class="sk-select" data-sk-select data-value="2">
    <button data-sk-select-trigger type="button">
      <span data-sk-select-value>2</span>
    </button>
    <ul data-sk-select-content>
      <li data-sk-select-item data-value="2">2</li>
      <li data-sk-select-item data-value="5">5</li>
    </ul>
  </div>
  <p data-sk-table-pager-status></p>
  <nav class="sk-pagination" data-sk-table-pager-nav aria-label="Paginación"></nav>
</div>`;

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("Expected table pager root.");
  return root;
}

describe("TablePager Vanilla contracts", () => {
  it("pages rows, fills status, and builds the nav from paginationRange", () => {
    const root = mount(markup);
    expect(mountTablePager(root)).toBe(1);
    expect(mountTablePager(root)).toBe(0);

    const rows = [...root.querySelectorAll<HTMLTableRowElement>("[data-sk-table-pager-row]")];
    expect(rows.map((row) => row.hidden)).toEqual([false, false, true, true, true]);
    expect(root.querySelector("[data-sk-table-pager-status]")?.textContent).toBe("1–2 de 5");

    const nav = root.querySelector("[data-sk-table-pager-nav]");
    expect(nav?.querySelector(".sk-pagination__previous")).toBeTruthy();
    expect(nav?.querySelector(".sk-pagination__next")).toBeTruthy();
    expect(nav?.querySelector('[aria-current="page"]')?.textContent).toBe("1");
  });

  it("moves pages on item click and resets when the select changes size", () => {
    const root = mount(markup);
    mountSelect(root);
    mountTablePager(root);

    const page2 = root.querySelector<HTMLButtonElement>('[aria-label="Página 2"]');
    if (!page2) throw new Error("Expected page 2 control.");
    fireEvent.click(page2);

    const rows = [...root.querySelectorAll<HTMLTableRowElement>("[data-sk-table-pager-row]")];
    expect(rows.map((row) => row.hidden)).toEqual([true, true, false, false, true]);
    expect(root.querySelector("[data-sk-table-pager-status]")?.textContent).toBe("3–4 de 5");
    expect(root.getAttribute("data-page")).toBe("2");

    const select = root.querySelector("[data-sk-select]");
    select?.dispatchEvent(
      new CustomEvent("sk-value-change", { bubbles: true, detail: { value: ["5"] } }),
    );

    expect(root.getAttribute("data-page")).toBe("1");
    expect(root.getAttribute("data-page-size")).toBe("5");
    expect(rows.every((row) => !row.hidden)).toBe(true);
    expect(root.querySelector("[data-sk-table-pager-status]")?.textContent).toBe("1–5 de 5");
  });

  it("keeps focus on the control the reader just activated, across the render it triggers", () => {
    const root = mount(markup);
    mountTablePager(root);

    const nav = root.querySelector<HTMLElement>("[data-sk-table-pager-nav]")!;
    const next = nav.querySelector<HTMLButtonElement>(".sk-pagination__next")!;
    next.focus();
    expect(document.activeElement).toBe(next);

    // Clicking "next" runs `render()` from inside this very button's own click handler. A full
    // rebuild would destroy `next` mid-click and drop focus to <body>; reusing it is what keeps
    // the reader's position on the control they just used.
    fireEvent.click(next);

    expect(document.activeElement).toBe(next);
    expect(document.body.contains(next)).toBe(true);
  });

  it("reuses the same element for a page number across renders instead of rebuilding it", () => {
    const root = mount(markup);
    mountTablePager(root);

    const nav = root.querySelector<HTMLElement>("[data-sk-table-pager-nav]")!;
    const page2Before = nav.querySelector<HTMLButtonElement>('[aria-label="Página 2"]')!;

    fireEvent.click(nav.querySelector<HTMLButtonElement>('[aria-label="Página 2"]')!);
    fireEvent.click(nav.querySelector<HTMLButtonElement>('[aria-label="Página 1"]')!);

    const page2After = nav.querySelector<HTMLButtonElement>('[aria-label="Página 2"]');
    expect(page2After).toBe(page2Before);
  });
});
