import { describe, expect, it } from "vitest";
import { mountMeter } from "./meter.js";

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("Expected meter root.");
  return root;
}

describe("Meter Vanilla contract", () => {
  it("sets --sk-meter-fill from value/min/max, honoring a non-zero min", () => {
    const root = mount(
      `<div data-sk-meter aria-valuenow="4" aria-valuemin="1" aria-valuemax="5" aria-label="Calificación">
        <div class="sk-meter__bar"></div>
      </div>`,
    );

    expect(mountMeter(root)).toBe(1);
    expect(root.style.getPropertyValue("--sk-meter-fill")).toBe("75%");
    // Idempotent: a second pass over an already-mounted root does nothing.
    expect(mountMeter(root)).toBe(0);
  });

  it("defaults min/max to 0/100 when absent, matching the contract's own defaults", () => {
    const root = mount(`<div data-sk-meter aria-valuenow="92" aria-label="Uso de disco"></div>`);

    mountMeter(root);
    expect(root.style.getPropertyValue("--sk-meter-fill")).toBe("92%");
  });
});
