import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkipLink, skipLinkTarget } from "./skip-link.js";

/*
 * A skip link has no state to test, and that is the claim worth pinning: it is an anchor, so the
 * jump, the focus move and the Back button are the platform's. What this checks is the anatomy that
 * makes the CSS work, and the one rule the component cannot enforce for itself.
 */
describe("SkipLink", () => {
  it("is a real link, not a scripted jump", () => {
    const ui = render(<SkipLink href="#main-nav">Ir a la navegación</SkipLink>);
    const link = ui.getByRole("link", { name: "Ir a la navegación" });

    // A `<button onClick>` would lose the middle-click, the context menu and the Back button.
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("#main-nav");
  });

  it("is reachable at rest, because hidden here means clipped and not removed", () => {
    const ui = render(<SkipLink href="#main-nav">Ir a la navegación</SkipLink>);

    // `getByRole` only finds what is in the accessibility tree: a `display: none` skip link would
    // fail here, and it would also be unreachable by Tab, which is its whole job.
    expect(ui.getByRole("link", { name: "Ir a la navegación" })).toBeTruthy();
    expect(ui.container.querySelector(".sk-skip-link")?.hasAttribute("hidden")).toBe(false);
  });

  it("carries the part class and the shared interactive paint", () => {
    const ui = render(<SkipLink href="#main-nav">Ir a la navegación</SkipLink>);
    const link = ui.getByRole("link", { name: "Ir a la navegación" });

    expect(link.classList.contains("sk-skip-link")).toBe(true);
    // The focus ring comes from the state layer, like every other control in the kit.
    expect(link.classList.contains("sk-interactive")).toBe(true);
  });

  it("joins a consumer's className instead of replacing the part's", () => {
    const ui = render(
      <SkipLink className="solo-en-docs" href="#main-nav">
        Ir a la navegación
      </SkipLink>,
    );

    expect(ui.getByRole("link", { name: "Ir a la navegación" }).className).toBe(
      "sk-skip-link sk-interactive solo-en-docs",
    );
  });

  it("forwards the anchor attributes a consumer may still need", () => {
    const ui = render(
      <SkipLink data-testid="skip" href="#main-nav" id="skip-to-nav" lang="es">
        Ir a la navegación
      </SkipLink>,
    );
    const link = ui.getByTestId("skip");

    expect(link.id).toBe("skip-to-nav");
    expect(link.getAttribute("lang")).toBe("es");
  });

  it("hands the destination its own requirement as a value", () => {
    // Prose gets copied wrong once; a value cannot. Following an in-page link moves focus in only
    // some browsers, and where it does not the next Tab resumes from the link, dropping the reader
    // back into the chrome they asked to bypass.
    const ui = render(
      <>
        <SkipLink href="#main-nav">Ir a la navegación</SkipLink>
        <nav aria-label="Principal" id="main-nav" {...skipLinkTarget} />
      </>,
    );

    const target = ui.getByRole("navigation", { name: "Principal" });
    expect(target.tabIndex).toBe(-1);
    expect(ui.getByRole("link", { name: "Ir a la navegación" }).getAttribute("href")).toBe(
      `#${target.id}`,
    );
  });
});
