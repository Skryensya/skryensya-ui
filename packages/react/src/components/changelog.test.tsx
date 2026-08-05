import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Changelog, ChangelogEntry } from "./changelog.js";

describe("Changelog", () => {
  it("renders a reversed ordered list of dated entries", () => {
    const ui = render(
      <Changelog aria-label="Historial">
        <ChangelogEntry date="2026-08-04" dateLabel="4 de agosto de 2026" kind="added" kindLabel="Añadido">
          El contrato declara el evento.
        </ChangelogEntry>
        <ChangelogEntry date="2026-08-01" dateLabel="1 de agosto de 2026" kind="fixed" kindLabel="Corregido">
          El enhancer buscaba la parte en cualquier descendiente.
        </ChangelogEntry>
      </Changelog>,
    );

    const list = ui.getByRole("list", { name: "Historial" });
    expect(list.tagName).toBe("OL");
    expect(list.className).toContain("sk-changelog");
    /* Newest first, so the numbers the accessibility tree reads have to count backwards. */
    expect(list.hasAttribute("reversed")).toBe(true);
    expect(ui.getAllByRole("listitem")).toHaveLength(2);
  });

  it("carries both halves of the date: the machine one and the readable one", () => {
    const ui = render(
      <Changelog>
        <ChangelogEntry date="2026-07-29" dateLabel="29 de julio de 2026" kind="added" kindLabel="Añadido">
          Primera publicación del contrato.
        </ChangelogEntry>
      </Changelog>,
    );

    const time = ui.getByText("29 de julio de 2026");
    expect(time.tagName).toBe("TIME");
    expect(time.getAttribute("datetime")).toBe("2026-07-29");
    expect(time.className).toContain("sk-changelog__date");
  });

  it("marks the kind on the entry and spells it out beside the date", () => {
    const ui = render(
      <Changelog>
        <ChangelogEntry
          date="2026-08-04"
          dateLabel="4 de agosto de 2026"
          kind="breaking"
          kindLabel="Ruptura"
          target="valueChange"
        >
          Cambió el nombre del evento.
        </ChangelogEntry>
      </Changelog>,
    );

    const entry = ui.getByRole("listitem");
    expect(entry.getAttribute("data-kind")).toBe("breaking");
    /* The word, so the kind is never the dot's colour alone. */
    expect(ui.getByText("Ruptura").className).toContain("sk-changelog__kind");
    expect(ui.getByText("valueChange").tagName).toBe("CODE");
  });

  it("defaults an unmarked entry to the same kind the contract declares", () => {
    const ui = render(
      <Changelog>
        <ChangelogEntry date="2026-08-04" dateLabel="4 de agosto de 2026" kindLabel="Cambiado">
          Algo cambió.
        </ChangelogEntry>
      </Changelog>,
    );

    expect(ui.getByRole("listitem").getAttribute("data-kind")).toBe("changed");
  });

  it("omits the target when the entry is about the whole contract", () => {
    const ui = render(
      <Changelog>
        <ChangelogEntry date="2026-07-29" dateLabel="29 de julio de 2026" kind="added" kindLabel="Añadido">
          Primera publicación del contrato.
        </ChangelogEntry>
      </Changelog>,
    );

    expect(ui.container.querySelector(".sk-changelog__target")).toBeNull();
  });
});
