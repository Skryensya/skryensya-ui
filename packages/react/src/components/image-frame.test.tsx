import { imageFrameParts } from "@skryensya/core/image-frame";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageFrame } from "./image-frame.js";

describe("ImageFrame", () => {
  it("maps geometry props to data attributes on the authored root", () => {
    const ui = render(
      <ImageFrame as="figure" aspect="16/9" fit="contain" position="top" radius="control" border="subtle">
        <img className={imageFrameParts.media} src="/photo.jpg" alt="Puerto" />
      </ImageFrame>,
    );

    const frame = ui.container.querySelector("figure.sk-image-frame");
    expect(frame?.getAttribute("data-aspect")).toBe("16/9");
    expect(frame?.getAttribute("data-fit")).toBe("contain");
    expect(frame?.getAttribute("data-position")).toBe("top");
    expect(frame?.getAttribute("data-radius")).toBe("control");
    expect(frame?.getAttribute("data-border")).toBe("subtle");
    expect(frame?.querySelector("img.sk-image-frame__media")?.getAttribute("alt")).toBe("Puerto");
  });

  it("renders a media img from src/alt when children are omitted", () => {
    const ui = render(<ImageFrame src="/cover.jpg" alt="Portada" aspect="1/1" />);
    const img = ui.container.querySelector("img.sk-image-frame__media");
    expect(img?.getAttribute("src")).toBe("/cover.jpg");
    expect(img?.getAttribute("alt")).toBe("Portada");
  });

  it("keeps a caption beside the src media", () => {
    const ui = render(
      <ImageFrame
        src="/cover.jpg"
        alt=""
        aspect="16/9"
        caption={<div className="sk-media-caption" data-edge="bottom">Title</div>}
      />,
    );
    const frame = ui.container.querySelector(".sk-image-frame");
    expect(frame?.querySelector("img.sk-image-frame__media")?.getAttribute("src")).toBe("/cover.jpg");
    expect(frame?.querySelector(".sk-media-caption")?.textContent).toBe("Title");
  });
});
