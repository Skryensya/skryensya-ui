import { afterEach, describe, expect, it } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountSlider } from "./slider.js";

function markup() {
  document.body.innerHTML = `<div class="sk-slider" data-sk-slider data-value="20" data-min="0" data-max="100" aria-label="Volumen">
    <div class="sk-slider__control" data-sk-slider-control>
      <div class="sk-slider__track" data-sk-slider-track><div class="sk-slider__range" data-sk-slider-range-part></div></div>
      <div class="sk-slider__thumb" data-sk-slider-thumb><input class="sk-slider__input" data-sk-slider-input type="text" hidden /></div>
    </div>
  </div>`;
  const root = document.querySelector<HTMLElement>("[data-sk-slider]")!;
  expect(mountSlider(document)).toBe(1);
  return root;
}

const thumb = () => document.querySelector<HTMLElement>("[data-sk-slider-thumb]")!;

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-slider]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
});

describe("Slider Vanilla contracts", () => {
  it("mounts the Zag slider machine over authored markup", () => {
    const root = markup();
    expect(root.getAttribute("role")).toBe(null);
    expect(thumb().getAttribute("role")).toBe("slider");
    expect(thumb().getAttribute("aria-valuenow")).toBe("20");
    expect(root.style.getPropertyValue("--slider-range-end")).toBe("80%");
  });
});
