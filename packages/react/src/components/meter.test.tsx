import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Meter } from "./meter.js";

describe("Meter React contracts", () => {
  it("sets role=meter with the three required aria-value attributes", () => {
    const ui = render(<Meter label="Uso de disco" max={100} min={0} value={72} />);
    const meter = ui.getByRole("meter", { name: "Uso de disco" });
    expect(meter.getAttribute("aria-valuenow")).toBe("72");
    expect(meter.getAttribute("aria-valuemin")).toBe("0");
    expect(meter.getAttribute("aria-valuemax")).toBe("100");
  });

  it("honors a non-zero min when painting the fill, unlike Progress", () => {
    const ui = render(<Meter label="Temperatura" max={40} min={-10} value={15} />);
    const meter = ui.getByRole("meter", { name: "Temperatura" });
    // -10..40, value 15 is exactly halfway.
    expect(meter.style.getPropertyValue("--sk-meter-fill")).toBe("50%");
  });

  it("passes through aria-valuetext when given", () => {
    const ui = render(<Meter label="Batería" value={50} valueText="50% (6 horas) restantes" />);
    expect(ui.getByRole("meter").getAttribute("aria-valuetext")).toBe("50% (6 horas) restantes");
  });

  it("applies the tone data attribute, defaulting to accent", () => {
    const ui = render(<Meter label="Batería" tone="danger" value={5} />);
    expect(ui.getByRole("meter").getAttribute("data-tone")).toBe("danger");
  });

  it("paints label and valueText beside the bar, not just announces them", () => {
    const ui = render(
      <Meter label="Uso de disco" value={92} valueText="92% usado" />,
    );
    expect(ui.getByText("Uso de disco")).toBeTruthy();
    expect(ui.getByText("92% usado")).toBeTruthy();
  });

  it("paints no value text when valueText is omitted, unlike the label", () => {
    const ui = render(<Meter label="Batería" value={50} />);
    expect(ui.getByText("Batería")).toBeTruthy();
    expect(ui.queryByText("50%")).toBeNull();
  });
});
