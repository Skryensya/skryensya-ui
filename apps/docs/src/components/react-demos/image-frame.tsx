/*
 * Live React demos for the authored ImageFrame stages (aspect / fit / position). The basic frame
 * is tree-driven; these stay islands because they wrap frames in docs-only `demo-grid` chrome.
 */
import { ImageFrame } from "@skryensya/react/image-frame";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

const demoSrc = "/demos/image-frame.svg";

export const ImageFrameAspectDemo = framed(function ImageFrameAspectDemo() {
  return (
    <div className="demo-grid">
      <figure className="demo-shot">
        <ImageFrame aspect="1/1" fit="cover" src={demoSrc} alt="" />
        <figcaption>
          <code>1/1</code>
        </figcaption>
      </figure>
      <figure className="demo-shot">
        <ImageFrame aspect="4/3" fit="cover" src={demoSrc} alt="" />
        <figcaption>
          <code>4/3</code>
        </figcaption>
      </figure>
      <figure className="demo-shot">
        <ImageFrame aspect="16/9" fit="cover" src={demoSrc} alt="" />
        <figcaption>
          <code>16/9</code>
        </figcaption>
      </figure>
      <figure className="demo-shot">
        <ImageFrame aspect="9/16" fit="cover" src={demoSrc} alt="" />
        <figcaption>
          <code>9/16</code>
        </figcaption>
      </figure>
    </div>
  );
});

export const ImageFrameFitDemo = framed(function ImageFrameFitDemo() {
  return (
    <div className="demo-grid demo-grid--fit">
      <figure className="demo-shot">
        <ImageFrame aspect="1/1" fit="cover" border="subtle" src={demoSrc} alt="" />
        <figcaption>
          <code>cover</code>
        </figcaption>
      </figure>
      <figure className="demo-shot">
        <ImageFrame aspect="1/1" fit="contain" border="subtle" src={demoSrc} alt="" />
        <figcaption>
          <code>contain</code>
        </figcaption>
      </figure>
      <figure className="demo-shot">
        <ImageFrame aspect="1/1" fit="fill" border="subtle" src={demoSrc} alt="" />
        <figcaption>
          <code>fill</code>
        </figcaption>
      </figure>
    </div>
  );
});

export const ImageFramePositionDemo = framed(function ImageFramePositionDemo() {
  return (
    <div className="demo-grid">
      <figure className="demo-shot">
        <ImageFrame aspect="1/1" fit="cover" position="top-left" src={demoSrc} alt="" />
        <figcaption>
          <code>top-left</code>
        </figcaption>
      </figure>
      <figure className="demo-shot">
        <ImageFrame aspect="1/1" fit="cover" position="center" src={demoSrc} alt="" />
        <figcaption>
          <code>center</code>
        </figcaption>
      </figure>
      <figure className="demo-shot">
        <ImageFrame aspect="1/1" fit="cover" position="bottom-right" src={demoSrc} alt="" />
        <figcaption>
          <code>bottom-right</code>
        </figcaption>
      </figure>
    </div>
  );
});
