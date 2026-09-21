import { fireEvent, waitFor, within } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";
import { mountRating } from "./rating.js";

/*
 * The vanilla half of Rating. Every assertion here has a twin in
 * `packages/react/src/components/rating.test.tsx`: the two bindings drive the SAME machine, so a
 * suite that checked only one would let the pair drift where the contract promises it cannot.
 *
 * The markup is what `emitMarkup` produces for the canonical tree, not markup invented here.
 */
function mount(options: { defaultValue?: number; readOnly?: boolean; disabled?: boolean } = {}): HTMLElement {
  const defaultValue = options.defaultValue === undefined ? "" : ` data-default-value="${options.defaultValue}"`;
  const readOnly = options.readOnly ? " data-readonly" : "";
  const disabled = options.disabled ? " data-disabled" : "";
  const items = Array.from(
    { length: 5 },
    (_, index) =>
      `<span class="sk-rating__item sk-button sk-interactive" data-sk-rating-item role="radio" data-icon-only data-size="sm" data-variant="ghost"${
        options.defaultValue === index + 1 ? ' aria-checked="true"' : ""
      }><span class="sk-rating__symbol" aria-hidden="true"></span></span>`,
  ).join("");

  document.body.innerHTML = `<div class="sk-rating" data-sk-rating${defaultValue} data-name="score" data-size="md" data-item-label="{value}"${readOnly}${disabled} style="--sk-rating-max: 5;">
    <div class="sk-rating__control" data-sk-rating-control aria-label="Tu puntuación" role="radiogroup">${items}</div>
    <input class="sk-rating__input" data-sk-rating-input type="text" hidden>
  </div>`;

  return document.body.firstElementChild as HTMLElement;
}

const radios = (root: HTMLElement) => within(root).getAllByRole("radio");

describe("Rating enhancer", () => {
  it("enhances an authored root, once", () => {
    const root = mount();
    expect(mountRating(root)).toBe(1);
    expect(mountRating(root)).toBe(0);
  });

  it("keeps the authored accessible name on the group the machine owns", () => {
    const root = mount();
    mountRating(root);

    /* The machine points `aria-labelledby` at a label element this layer never renders. Restoring
       the authored name is what stops the group from losing it on mount. */
    expect(within(root).getByRole("radiogroup", { name: "Tu puntuación" })).toBeTruthy();
  });

  it("checks the step the value sits on, and only that one", () => {
    const root = mount({ defaultValue: 3 });
    mountRating(root);

    expect(radios(root).map((radio) => radio.getAttribute("aria-checked"))).toEqual([
      "false",
      "false",
      "true",
      "false",
      "false",
    ]);
  });

  it("names each step with the contract's pattern, not with Zag's English default", () => {
    const root = mount();
    mountRating(root);

    /* `"{value}"`, so a step is called "3" rather than "3 stars" in a language nobody chose. */
    expect(radios(root).map((radio) => radio.getAttribute("aria-label"))).toEqual(["1", "2", "3", "4", "5"]);
    expect(radios(root)[0].getAttribute("aria-roledescription")).toBeNull();
  });

  it("reports a pick through the DOM event React also dispatches", async () => {
    const root = mount();
    mountRating(root);
    const heard = vi.fn();
    document.body.addEventListener("sk:ratingvaluechange", heard);

    fireEvent.click(radios(root)[3]);

    /* Zag commits a bindable on a later tick, so the detail lands after the click. */
    await waitFor(() => expect(heard.mock.lastCall?.[0].detail).toEqual({ value: 4 }));
    await waitFor(() => expect(radios(root)[3].getAttribute("aria-checked")).toBe("true"));
  });

  it("carries the value in the authored hidden input, so a plain form submit gets it", async () => {
    const root = mount({ defaultValue: 4 });
    mountRating(root);

    const hidden = root.querySelector<HTMLInputElement>("[data-sk-rating-input]");
    await waitFor(() => expect(hidden?.value).toBe("4"));
    expect(hidden?.name).toBe("score");
  });

  it("keeps one tab stop, which is what makes it a group and not five controls", () => {
    const root = mount({ defaultValue: 2 });
    mountRating(root);

    expect(radios(root).filter((radio) => radio.getAttribute("tabindex") === "0")).toHaveLength(1);
  });

  it("refuses to change while read-only", async () => {
    const root = mount({ defaultValue: 2, readOnly: true });
    mountRating(root);
    const heard = vi.fn();
    document.body.addEventListener("sk:ratingvaluechange", heard);

    fireEvent.click(radios(root)[4]);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(heard).not.toHaveBeenCalled();
    expect(radios(root)[1].getAttribute("aria-checked")).toBe("true");
  });

  it("leaves a RatingDisplay alone, because it has no machine to run", () => {
    document.body.innerHTML = `<span class="sk-rating" role="img" aria-label="4,3 de 5" style="--sk-rating-value: 4.3; --sk-rating-max: 5;">
      <span class="sk-rating__symbols" aria-hidden="true"></span>
    </span>`;
    expect(mountRating(document.body.firstElementChild as HTMLElement)).toBe(0);
  });
});
