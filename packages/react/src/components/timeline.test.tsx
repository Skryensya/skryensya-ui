import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "./icon.js";
import { Timeline, TimelineItem } from "./timeline.js";

describe("Timeline", () => {
  it("renders a native ordered list of events", () => {
    const ui = render(
      <Timeline aria-label="Historial del pedido">
        <TimelineItem heading="Pedido entregado" time="2026-03-14" timeLabel="14 mar 2026" />
        <TimelineItem heading="En reparto" time="2026-03-12" timeLabel="12 mar 2026" />
      </Timeline>,
    );

    const list = ui.getByRole("list", { name: "Historial del pedido" });
    expect(list.tagName).toBe("OL");
    expect(list.className).toContain("sk-timeline");
    expect(ui.getAllByRole("listitem")).toHaveLength(2);
  });

  it("splits the time into a machine value and a visible label", () => {
    // The contract's reason for two fields: `datetime` is what a parser reads, and the label is
    // copy in a language the kit does not ship.
    const ui = render(
      <Timeline>
        <TimelineItem heading="Pedido entregado" time="2026-03-14T09:30" timeLabel="14 mar, 09:30" />
      </Timeline>,
    );

    const time = ui.getByText("14 mar, 09:30");
    expect(time.tagName).toBe("TIME");
    expect(time.getAttribute("datetime")).toBe("2026-03-14T09:30");
    expect(time.className).toContain("sk-timeline__time");
  });

  it("omits the time element when neither half was given", () => {
    const ui = render(
      <Timeline>
        <TimelineItem heading="Un evento sin fecha" />
      </Timeline>,
    );
    expect(ui.getByRole("listitem").querySelector("time")).toBeNull();
  });

  it("still renders the element when only one half was given", () => {
    // The machine value alone belongs in the markup; the label alone is a legible time with no
    // parseable form. Either is a reason for the element to exist.
    const machine = render(
      <Timeline>
        <TimelineItem heading="Solo máquina" time="2026-03-14" />
      </Timeline>,
    );
    const onlyMachine = within(machine.container).getByRole("listitem").querySelector("time");
    expect(onlyMachine?.getAttribute("datetime")).toBe("2026-03-14");
    expect(onlyMachine?.textContent).toBe("");

    const label = render(
      <Timeline>
        <TimelineItem heading="Solo etiqueta" timeLabel="hace dos días" />
      </Timeline>,
    );
    const onlyLabel = within(label.container).getByText("hace dos días");
    expect(onlyLabel.tagName).toBe("TIME");
    expect(onlyLabel.hasAttribute("datetime")).toBe(false);
  });

  it("hides the dot from the accessibility tree", () => {
    // It repeats nothing: the heading beside it is the event, and a tone is emphasis on top of
    // text that already says the same.
    const ui = render(
      <Timeline>
        <TimelineItem heading="Pedido entregado" icon={<Icon name="success" />} tone="success" />
      </Timeline>,
    );

    const marker = ui.getByRole("listitem").querySelector(".sk-timeline__marker");
    expect(marker?.getAttribute("aria-hidden")).toBe("true");
    // The Icon is really in there, and the tree cannot reach it.
    expect(marker?.querySelector("[data-sk-icon], svg")).not.toBeNull();
    expect(ui.queryByRole("img")).toBeNull();
  });

  it("puts the tone on the item, where the stylesheet reads it", () => {
    const ui = render(
      <Timeline>
        <TimelineItem heading="Pago rechazado" tone="danger" />
      </Timeline>,
    );
    expect(ui.getByRole("listitem").getAttribute("data-tone")).toBe("danger");
  });

  it("writes the contract's default tone rather than leaving the attribute off", () => {
    // The emitter fills defaults so the two bindings produce the same DOM, so an omitted attribute
    // here would read as drift against the vanilla markup, which says `data-tone="neutral"`. The
    // value comes from the contract and is never restated in this package.
    const ui = render(
      <Timeline>
        <TimelineItem heading="Un evento cualquiera" />
      </Timeline>,
    );
    expect(ui.getByRole("listitem").getAttribute("data-tone")).toBe("neutral");
  });

  it("renders the detail only when there is one, as its own part", () => {
    const withBody = render(
      <Timeline>
        <TimelineItem heading="Pedido entregado">
          <p>Firmado por L. Ortiz.</p>
        </TimelineItem>
      </Timeline>,
    );
    const body = within(withBody.container).getByRole("listitem").querySelector(".sk-timeline__body");
    expect(body?.textContent).toBe("Firmado por L. Ortiz.");

    const without = render(
      <Timeline>
        <TimelineItem heading="Pedido entregado" />
      </Timeline>,
    );
    expect(within(without.container).getByRole("listitem").querySelector(".sk-timeline__body")).toBeNull();
  });

  it("keeps the three rungs in reading order: time, heading, detail", () => {
    // The hierarchy is the component, so the source order that produces it is worth pinning.
    const ui = render(
      <Timeline>
        <TimelineItem heading="Pedido entregado" time="2026-03-14" timeLabel="14 mar 2026">
          Firmado por L. Ortiz.
        </TimelineItem>
      </Timeline>,
    );

    const parts = [...ui.getByRole("listitem").children].map((el) => el.className);
    expect(parts).toEqual([
      "sk-timeline__marker",
      "sk-timeline__time",
      "sk-timeline__heading",
      "sk-timeline__body",
    ]);
  });

  it("passes through className and arbitrary attributes on both halves", () => {
    const ui = render(
      <Timeline className="mine" data-scope="orders">
        <TimelineItem className="entry" data-id="e1" heading="Pedido entregado" />
      </Timeline>,
    );

    const list = ui.getByRole("list");
    expect(list.className).toBe("sk-timeline mine");
    expect(list.getAttribute("data-scope")).toBe("orders");

    const item = ui.getByRole("listitem");
    expect(item.className).toBe("sk-timeline__item entry");
    expect(item.getAttribute("data-id")).toBe("e1");
  });
});
