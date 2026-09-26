import { stickerContract, stickerParts } from "@skryensya/core/sticker";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sticker } from "./sticker.js";

const o = stickerContract.options;

describe("Sticker", () => {
  it("renders the src path as the contract's anatomy: art, then an aria-hidden flap holding the copy", () => {
    const ui = render(<Sticker src="/badge.png" alt="Early supporter" />);
    const root = ui.container.firstElementChild as HTMLElement;

    expect(root.tagName).toBe("SPAN");
    expect(root.className).toBe(stickerParts.root);
    const [art, flap] = [...root.children] as HTMLElement[];
    expect(art!.className).toBe(stickerParts.art);
    expect(flap!.className).toBe(stickerParts.flap);
    expect(flap!.getAttribute("aria-hidden")).toBe("true");
    expect(flap!.firstElementChild?.className).toBe(stickerParts.art);

    const [image, copy] = [...root.querySelectorAll("img")];
    expect(image!.getAttribute("src")).toBe("/badge.png");
    expect(copy!.getAttribute("src")).toBe("/badge.png");
    /* The alt belongs to the image a reader meets; the copy is hidden and says nothing. */
    expect(image!.getAttribute("alt")).toBe("Early supporter");
    expect(copy!.getAttribute("alt")).toBe("");
    /* Never on the wrapper. */
    expect(root.hasAttribute("alt")).toBe(false);
    expect(root.hasAttribute("src")).toBe(false);
  });

  it("keeps an explicitly empty alt for decoration instead of dropping it", () => {
    const ui = render(<Sticker src="/star.png" alt="" />);
    expect(ui.container.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("takes authored artwork as children and leaves its semantics alone", () => {
    const ui = render(
      <Sticker>
        <svg role="img" aria-label="Moon" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="4" />
        </svg>
      </Sticker>,
    );
    const root = ui.container.firstElementChild as HTMLElement;
    expect(root.querySelector("img")).toBeNull();
    expect(root.querySelector(`.${stickerParts.art} > svg`)?.getAttribute("aria-label")).toBe("Moon");
    /* The sticker adds no role and no name of its own. */
    expect(root.hasAttribute("role")).toBe(false);
    expect(root.hasAttribute("aria-label")).toBe(false);
    expect(ui.getAllByRole("img", { name: "Moon" })).toHaveLength(1);
  });

  it("writes the contract defaults, so the first paint is deterministic", () => {
    const ui = render(<Sticker src="/a.png" alt="" />);
    const root = ui.container.firstElementChild as HTMLElement;
    expect(root.getAttribute(o.state.attr)).toBe(o.state.default);
    expect(root.getAttribute(o.peelOrigin.attr)).toBe(o.peelOrigin.default);
  });

  it("maps every option to the attribute the contract names", () => {
    for (const state of o.state.values) {
      for (const peelOrigin of o.peelOrigin.values) {
        const ui = render(<Sticker src="/a.png" alt="" state={state} peelOrigin={peelOrigin} />);
        const root = ui.container.firstElementChild as HTMLElement;
        expect(root.getAttribute("data-state")).toBe(state);
        expect(root.getAttribute("data-peel-origin")).toBe(peelOrigin);
        ui.unmount();
      }
    }
  });

  it("moves between states from the outside without remounting the artwork", () => {
    const ui = render(<Sticker src="/a.png" alt="A" state="idle" />);
    const root = ui.container.firstElementChild as HTMLElement;
    const image = root.querySelector("img");

    ui.rerender(<Sticker src="/a.png" alt="A" state="peeled" />);
    expect(root.getAttribute("data-state")).toBe("peeled");
    ui.rerender(<Sticker src="/a.png" alt="A" state="applied" />);
    expect(root.getAttribute("data-state")).toBe("applied");

    expect(ui.container.firstElementChild).toBe(root);
    expect(root.querySelector("img")).toBe(image);
  });

  it("does not change its own state on click: that decision is the consumer's", () => {
    const ui = render(<Sticker src="/a.png" alt="A" state="idle" />);
    const root = ui.container.firstElementChild as HTMLElement;
    root.click();
    expect(root.getAttribute("data-state")).toBe("idle");
    expect(root.hasAttribute("role")).toBe(false);
    expect(root.hasAttribute("tabindex")).toBe(false);
  });

  it("passes ordinary host props through and merges the class", () => {
    const ui = render(<Sticker src="/a.png" alt="" id="s1" className="mine" title="Sticker" />);
    const root = ui.container.firstElementChild as HTMLElement;
    expect(root.id).toBe("s1");
    expect(root.className).toBe(`${stickerParts.root} mine`);
    expect(root.getAttribute("title")).toBe("Sticker");
  });
});
