import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Changelog, ChangelogEntry, ChangelogRelease } from "./changelog.js";

describe("Changelog", () => {
  it("renders a reversed ordered list of releases", () => {
    const ui = render(
      <Changelog aria-label="Historial">
        <ChangelogRelease version="0.2.0" date="2026-08-04" dateLabel="4 de agosto de 2026">
          <ChangelogEntry kind="feature" kindLabel="feature" title="El contrato declara el evento">
            Antes había que encontrarlo en la prosa.
          </ChangelogEntry>
        </ChangelogRelease>
        <ChangelogRelease version="0.1.0" date="2026-08-01" dateLabel="1 de agosto de 2026">
          <ChangelogEntry kind="bugfix" kindLabel="bugfix" title="La parte se busca sólo como hija directa">
            El enhancer la buscaba en cualquier descendiente.
          </ChangelogEntry>
        </ChangelogRelease>
      </Changelog>,
    );

    const list = ui.getByRole("list", { name: "Historial" });
    expect(list.tagName).toBe("OL");
    expect(list.className).toContain("sk-changelog");
    /* Newest first, so the numbers the accessibility tree reads have to count backwards. */
    expect(list.hasAttribute("reversed")).toBe(true);
    expect(ui.container.querySelectorAll(".sk-changelog__release")).toHaveLength(2);
  });

  it("carries both halves of the date: the machine one and the readable one", () => {
    const ui = render(
      <Changelog>
        <ChangelogRelease version="0.1.0" date="2026-07-29" dateLabel="29 de julio de 2026">
          <ChangelogEntry kind="feature" kindLabel="feature" title="Primera publicación">
            El contrato sale con sus tres firmas.
          </ChangelogEntry>
        </ChangelogRelease>
      </Changelog>,
    );

    const time = ui.getByText("29 de julio de 2026");
    expect(time.tagName).toBe("TIME");
    expect(time.getAttribute("datetime")).toBe("2026-07-29");
    expect(time.className).toContain("sk-changelog__date");
  });

  /*
   * The answer to "what is a version that has not shipped": a release with no date. There is no
   * second prop saying so, which is what makes the two impossible to contradict.
   */
  it("marks a release with no date as unreleased and renders no time at all", () => {
    const ui = render(
      <Changelog>
        <ChangelogRelease version="0.1.0-dev">
          <ChangelogEntry kind="feature" kindLabel="feature" title="Todavía sin publicar">
            Sale en la próxima.
          </ChangelogEntry>
        </ChangelogRelease>
      </Changelog>,
    );

    const release = ui.container.querySelector(".sk-changelog__release")!;
    expect(release.hasAttribute("data-unreleased")).toBe(true);
    expect(release.querySelector("time")).toBeNull();
    expect(ui.getByText("0.1.0-dev").className).toContain("sk-changelog__version");
  });

  it("does not mark a dated release as unreleased", () => {
    const ui = render(
      <Changelog>
        <ChangelogRelease version="0.1.0" date="2026-07-29" dateLabel="29 de julio de 2026">
          <ChangelogEntry kind="feature" kindLabel="feature" title="Publicado">
            Ya se puede instalar.
          </ChangelogEntry>
        </ChangelogRelease>
      </Changelog>,
    );

    expect(ui.container.querySelector(".sk-changelog__release")!.hasAttribute("data-unreleased")).toBe(false);
  });

  /* The headline and the reasoning are two elements, because they are read by two different people. */
  it("renders the title and the description as separate parts", () => {
    const ui = render(
      <Changelog>
        <ChangelogRelease version="0.1.0-dev">
          <ChangelogEntry kind="rework" kindLabel="rework" title="collapsible pasa a false">
            Es como se comportaba el acordeón de una sola sección.
          </ChangelogEntry>
        </ChangelogRelease>
      </Changelog>,
    );

    expect(ui.getByText("collapsible pasa a false").className).toContain("sk-changelog__title");
    expect(ui.getByText("Es como se comportaba el acordeón de una sola sección.").className).toContain(
      "sk-changelog__text",
    );
  });

  it("draws the kind as a Badge", () => {
    const ui = render(
      <Changelog>
        <ChangelogRelease version="0.1.0-dev">
          <ChangelogEntry kind="feature" kindLabel="feature" title="Algo nuevo">
            Descripción.
          </ChangelogEntry>
        </ChangelogRelease>
      </Changelog>,
    );

    const badge = ui.getByText("feature");
    expect(badge.className).toContain("sk-badge");
    expect(badge.className).toContain("sk-changelog__kind");
  });

  /*
   * THE TONES ARE WRITTEN OUT HERE, not read from `changeKindTones`, and that is deliberate: a test
   * that looked the answer up in the same table the component reads would pass no matter what the
   * table said. These five pairs ARE the spec, so recolouring a kind has to be done twice on purpose
   *, and `breaking` in particular can never quietly stop being red.
   *
   * The tone is derived rather than passed, which is the other half: there is no prop that could
   * file a breaking change under a calm badge.
   */
  it.each([
    ["breaking", "danger"],
    ["feature", "success"],
    ["bugfix", "accent"],
    ["rework", "warning"],
    ["chore", "neutral"],
  ] as const)("colours a %s entry %s", (kind, tone) => {
    const ui = render(
      <Changelog>
        <ChangelogRelease version="0.2.0-dev">
          <ChangelogEntry kind={kind} kindLabel={kind} title="El evento cambió de nombre" target="valueChange">
            El anterior ya no se emite.
          </ChangelogEntry>
        </ChangelogRelease>
      </Changelog>,
    );

    expect(ui.container.querySelector(".sk-changelog__entry")!.getAttribute("data-kind")).toBe(kind);
    expect(ui.getByText(kind).getAttribute("data-tone")).toBe(tone);
    expect(ui.getByText("valueChange").tagName).toBe("CODE");
  });

  /*
   * `chore` and not something louder: a default is what an unset field ASSERTS, and an entry whose
   * kind was forgotten must never render as a feature nobody announced.
   */
  it("defaults an unmarked entry to the same kind the contract declares", () => {
    const ui = render(
      <Changelog>
        <ChangelogRelease version="0.2.0" date="2026-08-04" dateLabel="4 de agosto de 2026">
          <ChangelogEntry kindLabel="chore" title="Algo cambió">
            Descripción.
          </ChangelogEntry>
        </ChangelogRelease>
      </Changelog>,
    );

    expect(ui.container.querySelector(".sk-changelog__entry")!.getAttribute("data-kind")).toBe("chore");
    expect(ui.getByText("chore").getAttribute("data-tone")).toBe("neutral");
  });

  it("omits the target when the entry is about the whole contract", () => {
    const ui = render(
      <Changelog>
        <ChangelogRelease version="0.1.0" date="2026-07-29" dateLabel="29 de julio de 2026">
          <ChangelogEntry kind="feature" kindLabel="feature" title="Primera publicación">
            El contrato sale con sus tres firmas.
          </ChangelogEntry>
        </ChangelogRelease>
      </Changelog>,
    );

    expect(ui.container.querySelector(".sk-changelog__target")).toBeNull();
  });
});
