import { fireEvent, render, waitFor, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { Rating, RatingDisplay } from "./rating.js";

/* Scoped to each render's own container: this suite renders more than one rating. */
const inside = (result: ReturnType<typeof render>) => within(result.container);

describe("Rating input", () => {
  it("is a radio group with one radio per step, named by its label", () => {
    const ui = render(<Rating label="Tu puntuación" name="score" />);
    const group = inside(ui).getByRole("radiogroup", { name: "Tu puntuación" });

    expect(within(group).getAllByRole("radio")).toHaveLength(5);
  });

  it("takes the scale it is given", () => {
    const ui = render(<Rating label="Score" max={10} name="score" />);
    expect(inside(ui).getAllByRole("radio")).toHaveLength(10);
  });

  it("checks the step the value sits on, and only that one", () => {
    const ui = render(<Rating defaultValue={3} label="Score" name="score" />);
    const radios = inside(ui).getAllByRole("radio");

    expect(radios.map((radio) => radio.getAttribute("aria-checked"))).toEqual([
      "false",
      "false",
      "true",
      "false",
      "false",
    ]);
  });

  it("reports a pick through onValueChange and the DOM event alike", async () => {
    const onValueChange = vi.fn();
    const onEvent = vi.fn();
    const ui = render(<Rating label="Score" name="score" onValueChange={onValueChange} />);
    /* On the container, not on the radiogroup: the contract dispatches from the ROOT, and the
       group is a descendant of it, so a listener there would never see the event bubble past. */
    ui.container.addEventListener("sk:ratingvaluechange", onEvent);

    fireEvent.click(inside(ui).getAllByRole("radio")[3]);

    /* Zag commits a bindable's change on a later tick, so the callback lands after the click
       rather than inside it. Asserting synchronously here reads the value before the machine
       has published it. */
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith({ value: 4 }));
    expect(onEvent.mock.lastCall?.[0].detail).toEqual({ value: 4 });
    await waitFor(() =>
      expect(inside(ui).getAllByRole("radio")[3].getAttribute("aria-checked")).toBe("true"),
    );
  });

  it("keeps one tab stop, which is what makes it a group and not five controls", () => {
    const ui = render(<Rating defaultValue={2} label="Score" name="score" />);
    const tabbable = inside(ui)
      .getAllByRole("radio")
      .filter((radio) => radio.getAttribute("tabindex") === "0");

    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].getAttribute("aria-checked")).toBe("true");
  });

  it("carries the value in a hidden input, so a plain form submit gets it", () => {
    const ui = render(<Rating defaultValue={4} label="Score" name="score" />);
    const hidden = ui.container.querySelector<HTMLInputElement>('input[name="score"]');

    expect(hidden).not.toBeNull();
    expect(hidden?.value).toBe("4");
  });

  it("refuses to change while read-only", async () => {
    const onValueChange = vi.fn();
    const ui = render(<Rating defaultValue={2} label="Score" name="score" onValueChange={onValueChange} readOnly />);

    fireEvent.click(inside(ui).getAllByRole("radio")[4]);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(inside(ui).getAllByRole("radio")[1].getAttribute("aria-checked")).toBe("true");
  });

  /* Distinct titles on purpose: `artifacts/test-results.json` keys by `[file][it-title]`, so two
     tests sharing one title collapse into a single row in the docs' Tests tab. */
  it("the input has no accessibility violations", async () => {
    const ui = render(<Rating defaultValue={3} label="Tu puntuación" name="score" />);
    const results = await axe.run(ui.container);
    expect(results.violations).toEqual([]);
  });
});

describe("RatingDisplay", () => {
  it("announces the whole reading once, as one image", () => {
    const ui = render(<RatingDisplay label="4,3 de 5" value={4.3} />);
    const image = inside(ui).getByRole("img", { name: "4,3 de 5" });

    /* Every symbol hidden: five separate images would make a reader add them up. */
    expect(image.querySelectorAll("[aria-hidden='true']").length).toBeGreaterThan(0);
    expect(within(image).queryAllByRole("img")).toHaveLength(0);
  });

  it("fills the exact fraction rather than rounding to a whole symbol", () => {
    const ui = render(<RatingDisplay label="4,3 de 5" value={4.3} />);
    const strip = ui.container.querySelector<HTMLElement>(".sk-rating__symbols");

    expect(strip?.style.getPropertyValue("--sk-rating-fill")).toBe("86%");
  });

  it("paints the end of the scale instead of overflowing it", () => {
    const ui = render(<RatingDisplay label="Perfecto" value={9} />);
    expect(
      ui.container.querySelector<HTMLElement>(".sk-rating__symbols")?.style.getPropertyValue("--sk-rating-fill"),
    ).toBe("100%");
  });

  it("paints the number and the count only when they were written", () => {
    const bare = render(<RatingDisplay label="4,3 de 5" value={4.3} />);
    expect(bare.container.querySelector(".sk-rating__value")).toBeNull();
    expect(bare.container.querySelector(".sk-rating__count")).toBeNull();

    const full = render(<RatingDisplay count="128 reseñas" label="4,3 de 5" value={4.3} valueText="4,3" />);
    expect(full.container.querySelector(".sk-rating__value")?.textContent).toBe("4,3");
    expect(full.container.querySelector(".sk-rating__count")?.textContent).toBe("128 reseñas");
  });

  it("the display has no accessibility violations", async () => {
    const ui = render(<RatingDisplay count="128 reseñas" label="4,3 de 5" value={4.3} valueText="4,3" />);
    const results = await axe.run(ui.container);
    expect(results.violations).toEqual([]);
  });
});
