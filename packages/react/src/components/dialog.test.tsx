import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dialog } from "./dialog.js";

/*
 * Dialog has no machine on purpose: the behaviour is the platform's. So what there is to test is the
 * anatomy, and above all that closing stays a `<form method="dialog">` submit rather than an onClick,
 * which is what makes the box work before any script runs and lets the opener read `returnValue`.
 */
describe("Dialog", () => {
  // Rendered open throughout: a closed `<dialog>` is inert, so nothing inside it has a role to
  // query, which is the platform doing its half of this contract.
  it("closes through the platform's own form rather than a handler", () => {
    const ui = render(
      <Dialog open title="Confirmar">
        Contenido
      </Dialog>,
    );

    const close = ui.getByRole("button", { name: "Cerrar" });
    expect(close.getAttribute("type")).toBe("submit");
    expect(close.getAttribute("value")).toBe("cancel");
    expect(close.closest("form")?.getAttribute("method")).toBe("dialog");
    expect(close.querySelector("svg")?.getAttribute("data-icon")).toBe("close");

    // Painted by the Button contract, so Core stays the only place these values live.
    expect(close.classList.contains("sk-dialog__close")).toBe(true);
    expect(close.classList.contains("sk-button")).toBe(true);
    expect(close.classList.contains("sk-interactive")).toBe(true);
    expect(close.getAttribute("data-icon-only")).toBe("");
    expect(close.getAttribute("data-size")).toBe("sm");
    expect(close.getAttribute("data-variant")).toBe("ghost");
  });

  it("renders the anatomy the stylesheet contracts against", () => {
    const ui = render(
      <Dialog
        className="extra"
        footer={
          <button type="submit" value="ok">
            Aceptar
          </button>
        }
        open
        title="Confirmar"
      >
        Contenido
      </Dialog>,
    );

    const dialog = ui.container.querySelector("dialog")!;
    expect(dialog.classList.contains("sk-dialog")).toBe(true);
    // A className from the consumer joins the part class, it does not replace it.
    expect(dialog.classList.contains("extra")).toBe(true);
    expect(ui.getByRole("heading", { name: "Confirmar" }).classList).toContain("sk-dialog__title");
    expect(dialog.querySelector(".sk-dialog__body")?.textContent).toBe("Contenido");

    // The footer is a second dialog form, so its buttons report which one closed the box.
    const footer = dialog.querySelector(".sk-dialog__footer")!;
    expect(footer.tagName).toBe("FORM");
    expect(footer.getAttribute("method")).toBe("dialog");
    expect(footer.querySelector("button")?.getAttribute("value")).toBe("ok");
  });

  it("omits the footer form when there is nothing to put in it", () => {
    const ui = render(<Dialog title="Confirmar" />);
    expect(ui.container.querySelector(".sk-dialog__footer")).toBeNull();
  });

  it("opts into Dialog Vaul with the enhancer's own mount point", () => {
    const ui = render(<Dialog title="Filtros" vaul />);
    const dialog = ui.container.querySelector("dialog")!;

    expect(dialog.getAttribute("data-sk-dialog-vaul")).toBe("");
    // `dialog-vaul.css` only ever slides from the bottom, so the edge is not a choice.
    expect(dialog.getAttribute("data-edge")).toBe("block-end");
    expect(dialog.querySelector('[data-part="handle"]')?.getAttribute("aria-hidden")).toBe("true");
  });

  it("keeps a plain dialog free of the sheet's attributes", () => {
    const ui = render(<Dialog title="Confirmar" />);
    const dialog = ui.container.querySelector("dialog")!;

    expect(dialog.hasAttribute("data-sk-dialog-vaul")).toBe(false);
    expect(dialog.hasAttribute("data-edge")).toBe(false);
    expect(dialog.querySelector('[data-part="handle"]')).toBeNull();
  });

  it("forwards the platform's own open attribute", () => {
    const ui = render(
      <Dialog closeLabel="Descartar" open title="Confirmar">
        Contenido
      </Dialog>,
    );

    expect(ui.container.querySelector("dialog")?.open).toBe(true);
    expect(ui.getByRole("button", { name: "Descartar" })).toBeTruthy();
  });
});
