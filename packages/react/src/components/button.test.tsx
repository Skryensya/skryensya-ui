import { fireEvent, render } from "@testing-library/react";
import { buttonParts } from "@skryensya/core/button";
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
        <Button size="md" variant="solid">Explicit defaults</Button>
      </>,
    );

    for (const name of ["Implicit defaults", "Explicit defaults"]) {
      const button = ui.getByRole("button", { name });
      expect(button.classList.contains("sk-interactive")).toBe(true);
      expect(button.hasAttribute("data-sk-button")).toBe(true);
      expect(button.getAttribute("data-size")).toBe("md");
      // Both appearance axes are always serialized, defaults included: the emitter writes them for
      // authored markup, so a React button that left one off would diverge at G2.
      expect(button.getAttribute("data-variant")).toBe("solid");
      expect(button.getAttribute("data-tone")).toBe("neutral");
    }
  });

  /* The floor of the size scale, and the one size whose whole point is that it is smaller than the
   * accessible target: it has to reach `data-size` like any other, because the 24px face and the
   * 44px hit area underneath it are both keyed off that attribute in `button.css`. */
  it("serializes the xs size onto the same attribute as every other size", () => {
    const ui = render(<Button size="xs">Fold</Button>);

    expect(ui.getByRole("button", { name: "Fold" }).getAttribute("data-size")).toBe("xs");
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

  it("carries a leading icon in the pre slot alongside its label", () => {
    const ui = render(
      <Button tone="accent" pre={<svg className="sk-icon" data-icon="check" aria-hidden="true" />}>
        Guardar
      </Button>,
    );
    const button = ui.getByRole("button", { name: "Guardar" });

    expect(button.querySelector(`.${buttonParts.pre} svg.sk-icon`)).not.toBeNull();
    expect(button.querySelector(`.${buttonParts.post}`)).toBeNull();
  });

  it("carries a trailing icon in the post slot alongside its label", () => {
    const ui = render(
      <Button tone="accent" post={<svg className="sk-icon" data-icon="arrow-right" aria-hidden="true" />}>
        Continuar
      </Button>,
    );
    const button = ui.getByRole("button", { name: "Continuar" });

    expect(button.querySelector(`.${buttonParts.pre}`)).toBeNull();
    expect(button.querySelector(`.${buttonParts.post} svg.sk-icon`)).not.toBeNull();
  });

  it("renders an icon-only button as a named square", () => {
    const ui = render(
      <Button iconOnly aria-label="Close">
        <svg className="sk-icon" data-icon="close" aria-hidden="true" />
      </Button>,
    );
    const button = ui.getByRole("button", { name: "Close" });

    expect(button.getAttribute("data-icon-only")).toBe("");
    expect(button.textContent).toBe(""); // the name is the label, not visible text
  });

  it("warns in development when a button renders nothing at all", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Button>{""}</Button>);

    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/renders nothing/i));
    spy.mockRestore();
  });

  /*
   * PROVABLY empty, not "no text found". `hasTextContent` cannot see through a component boundary, so
   * reusing it here would warn on perfectly good markup whose label lives inside a child component.
   * These two are the boundary of the narrower question `rendersNothing` asks.
   */
  it("does not warn when the only content is an element, whatever it renders", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const Label = () => <>Guardar</>;
    render(
      <Button>
        <Label />
      </Button>,
    );

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("warns when children is empty even though an aria-label names the button", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    // A name makes it announceable; it still paints nothing for everybody else.
    render(<Button aria-label="Guardar">{""}</Button>);

    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/renders nothing/i));
    spy.mockRestore();
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

  /*
   * The `pre` and `post` slots are part of the name too, and the vanilla enhancer has always agreed:
   * it reads `root.textContent`, which is the WHOLE button, spans included. React walked only
   * `children`, so a visually hidden label placed in a slot was rejected here and accepted there,
   * which is the exact divergence the walk exists to prevent (see the note above `hasTextContent`).
   */
  it("accepts a visually hidden name supplied through a slot rather than children", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Button iconOnly post={<span className="sk-visually-hidden">Close</span>}>
        <svg className="sk-icon" data-icon="close" aria-hidden="true" />
      </Button>,
    );

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("Button.navigation", () => {
  it("renders navigation with Button appearance and anchor attributes", () => {
    const ui = render(
      <Button href="/docs" rel="next" target="_self" tone="accent">
        Documentation
      </Button>,
    );
    const link = ui.getByRole("link", { name: "Documentation" });

    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.getAttribute("rel")).toBe("next");
    expect(link.getAttribute("target")).toBe("_self");
    // `accent` is a TONE now, not an emphasis: a link can be quiet and still be the primary action.
    expect(link.getAttribute("data-tone")).toBe("accent");
    expect(link.getAttribute("data-variant")).toBe("solid");
    expect(link.getAttribute("data-size")).toBe("md");
    expect(link.classList.contains("sk-button")).toBe(true);
    expect(link.classList.contains("sk-interactive")).toBe(true);
  });

  it("does not write aria-pressed or disabled on a navigation host", () => {
    // Loose call site: the contract forbids both; React used to spread them onto the anchor.
    const ui = render(
      // @ts-expect-error pressed is action-only
      <Button href="/docs" pressed disabled>
        Documentation
      </Button>,
    );
    const link = ui.getByRole("link", { name: "Documentation" });

    expect(link.hasAttribute("aria-pressed")).toBe(false);
    expect(link.hasAttribute("disabled")).toBe(false);
  });
});

/*
 * THE TWO AXES NOTHING WAS ASKING ABOUT. Both are presence-only attributes the emitter writes for
 * authored markup, so a React binding that spelled either one differently diverges at the symmetry
 * gate (G2) rather than in any test  -  the same reasoning the appearance-axes case above states.
 */
describe("Button.action welded edges", () => {
  it("welds either edge on its own, and both at once for a middle member", () => {
    const ui = render(
      <>
        <Button weldStart>Start</Button>
        <Button weldEnd>End</Button>
        <Button weldStart weldEnd>Middle</Button>
      </>,
    );

    const start = ui.getByRole("button", { name: "Start" });
    expect(start.getAttribute("data-weld-start")).toBe("");
    expect(start.hasAttribute("data-weld-end")).toBe(false);

    const end = ui.getByRole("button", { name: "End" });
    expect(end.hasAttribute("data-weld-start")).toBe(false);
    expect(end.getAttribute("data-weld-end")).toBe("");

    const middle = ui.getByRole("button", { name: "Middle" });
    expect(middle.getAttribute("data-weld-start")).toBe("");
    expect(middle.getAttribute("data-weld-end")).toBe("");
  });

  /* Presence-only: `false` has to leave no attribute at all, not `data-weld-start="false"`, which CSS
     would match on. The plain button beside it is what proves the absent case is the default and not
     something this render happened to drop. */
  it("writes nothing for an unwelded edge", () => {
    const ui = render(
      <>
        <Button weldStart={false} weldEnd={false}>Explicitly flat</Button>
        <Button>Plain</Button>
      </>,
    );

    for (const name of ["Explicitly flat", "Plain"]) {
      const button = ui.getByRole("button", { name });
      expect(button.hasAttribute("data-weld-start")).toBe(false);
      expect(button.hasAttribute("data-weld-end")).toBe(false);
    }
  });

  /* Orthogonal to every other axis, which the option's own doc claims and nothing checked. */
  it("welds a button of any variant and size", () => {
    const ui = render(
      <Button weldStart weldEnd variant="ghost" tone="danger" size="sm">
        Quiet middle
      </Button>,
    );
    const button = ui.getByRole("button", { name: "Quiet middle" });

    expect(button.getAttribute("data-weld-start")).toBe("");
    expect(button.getAttribute("data-variant")).toBe("ghost");
    expect(button.getAttribute("data-tone")).toBe("danger");
    expect(button.getAttribute("data-size")).toBe("sm");
  });
});

/*
 * The default (`type="button"`, tested at the top of this file) exists so a button inside a form is
 * inert unless it says otherwise. These are the other half of that promise: when it DOES say
 * otherwise, the platform behaviour has to arrive intact.
 */
describe("Button.action form participation", () => {
  it("submits its form when asked, and resets one on reset", () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const ui = render(
      <form onSubmit={onSubmit}>
        <input name="title" defaultValue="draft" />
        <Button type="submit">Send</Button>
        <Button type="reset">Clear</Button>
      </form>,
    );

    const field = ui.container.querySelector("input") as HTMLInputElement;
    field.value = "edited";

    fireEvent.click(ui.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    fireEvent.click(ui.getByRole("button", { name: "Clear" }));
    expect(field.value).toBe("draft");
  });

  /* `name` and `value` are forwarded rather than options, and the contract's own note says why they
     travel together: a submit button that names a field and cannot say what it submits is half an
     attribute. Read off the submitter, which is the only place the pair means anything. */
  it("carries the name and value a submitter needs to say which button sent the form", () => {
    const ui = render(
      <Button type="submit" name="intent" value="publish">
        Publish
      </Button>,
    );
    const button = ui.getByRole("button", { name: "Publish" }) as HTMLButtonElement;

    expect(button.name).toBe("intent");
    expect(button.value).toBe("publish");
    expect(button.type).toBe("submit");
  });
});

describe("Button.action pressed", () => {
  it("writes aria-pressed only when pressed is given", () => {
    const ui = render(
      <>
        <Button>Plain</Button>
        <Button pressed={false}>Off</Button>
        <Button pressed>On</Button>
      </>,
    );

    expect(ui.getByRole("button", { name: "Plain" }).hasAttribute("aria-pressed")).toBe(false);
    expect(ui.getByRole("button", { name: "Off" }).getAttribute("aria-pressed")).toBe("false");
    expect(ui.getByRole("button", { name: "On" }).getAttribute("aria-pressed")).toBe("true");
  });
});
