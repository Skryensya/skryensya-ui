import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button.js";

describe("Button", () => {
  it("renders a native button that does not submit forms by default", () => {
    const onSubmit = vi.fn();
    const ui = render(
      <form onSubmit={onSubmit}>
        <Button>Save</Button>
      </form>,
    );

    const button = ui.getByRole("button", { name: "Save" });
    expect(button.getAttribute("type")).toBe("button");

    fireEvent.click(button);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("encodes both default appearance axes and the interaction contract", () => {
    const ui = render(
      <>
        <Button>Implicit defaults</Button>
        <Button size="md" variant="neutral">Explicit defaults</Button>
      </>,
    );

    for (const name of ["Implicit defaults", "Explicit defaults"]) {
      const button = ui.getByRole("button", { name });
      expect(button.classList.contains("sk-interactive")).toBe(true);
      expect(button.getAttribute("data-size")).toBe("md");
      expect(button.getAttribute("data-variant")).toBe("neutral");
    }
  });

  it("exposes disabled state to both native controls and assistive technology", () => {
    const onClick = vi.fn();
    const ui = render(<Button disabled onClick={onClick}>Archive</Button>);
    const button = ui.getByRole("button", { name: "Archive" }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("carries a leading icon alongside its label", () => {
    const ui = render(
      <Button variant="primary">
        <svg className="sk-icon" data-icon="check" aria-hidden="true" />
        Guardar
      </Button>,
    );
    const button = ui.getByRole("button", { name: "Guardar" });

    // the decorative icon is present but does not contribute to the accessible name
    expect(button.querySelector("svg.sk-icon")).not.toBeNull();
  });

  it("renders an icon-only button as a named square", () => {
    const ui = render(
      <Button iconOnly aria-label="Cerrar">
        <svg className="sk-icon" data-icon="close" aria-hidden="true" />
      </Button>,
    );
    const button = ui.getByRole("button", { name: "Cerrar" });

    expect(button.getAttribute("data-icon-only")).toBe("");
    expect(button.textContent).toBe(""); // the name is the label, not visible text
  });

  it("warns in development when an icon-only button has no accessible name", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Button iconOnly>
        <svg className="sk-icon" data-icon="close" aria-hidden="true" />
      </Button>,
    );

    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/accessible name/i));
    spy.mockRestore();
  });
});

describe("Button.navigation", () => {
  it("renders navigation with Button appearance and anchor attributes", () => {
    const ui = render(
      <Button href="/docs" rel="next" target="_self" variant="primary">
        Documentation
      </Button>,
    );
    const link = ui.getByRole("link", { name: "Documentation" });

    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.getAttribute("rel")).toBe("next");
    expect(link.getAttribute("target")).toBe("_self");
    expect(link.getAttribute("data-variant")).toBe("primary");
    expect(link.getAttribute("data-size")).toBe("md");
    expect(link.classList.contains("sk-button")).toBe(true);
    expect(link.classList.contains("sk-interactive")).toBe(true);
  });
});
