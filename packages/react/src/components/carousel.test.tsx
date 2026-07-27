import { createRef } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Carousel, CarouselSlide, type CarouselHandle } from "./carousel.js";

describe("Carousel", () => {
  it("renders a section region with a scroll-snap track of slides", () => {
    const ui = render(
      <Carousel aria-label="Destacados">
        <CarouselSlide>Uno</CarouselSlide>
        <CarouselSlide>Dos</CarouselSlide>
        <CarouselSlide>Tres</CarouselSlide>
      </Carousel>,
    );

    const region = ui.container.querySelector(".sk-carousel")!;
    expect(region.tagName).toBe("SECTION");
    expect(region.getAttribute("data-sk-carousel")).toBe("");
    expect(region.getAttribute("aria-label")).toBe("Destacados");

    const track = region.querySelector(".sk-carousel__track")!;
    expect(track.tagName).toBe("UL");
    expect(track.querySelectorAll("li.sk-carousel__slide")).toHaveLength(3);
  });

  it("exposes a snapTo handle that dispatches the goto command the enhancer listens for", () => {
    const ref = createRef<CarouselHandle>();
    const ui = render(
      <Carousel ref={ref}>
        <CarouselSlide>Uno</CarouselSlide>
        <CarouselSlide>Dos</CarouselSlide>
      </Carousel>,
    );

    const root = ui.container.querySelector(".sk-carousel")!;
    const onGoto = vi.fn();
    root.addEventListener("sk-carousel-goto", onGoto as EventListener);

    ref.current?.snapTo(1);

    expect(onGoto).toHaveBeenCalledTimes(1);
    expect((onGoto.mock.calls[0][0] as CustomEvent).detail).toEqual({ index: 1 });
    expect(ref.current?.element).toBe(root);
  });
});
