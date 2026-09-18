import {
  componentPreviewAttrs,
  componentPreviewParts,
} from "@skryensya/core/component-preview";
import type { ReactNode } from "react";

/*
 * COMPONENT PREVIEW (bare): the React half of the portable form.
 *
 * Deliberately thin: no Zag machine, no binding switch, no screen presets. Those belong to the site
 * that reads this file (`apps/docs`'s own `ComponentPreview.astro`), not to what this signature
 * publishes, the same split `Popover.bare` draws against the full `Popover`.
 */
export type ComponentPreviewBareProps = {
  /** What this example is. */
  title: string;
  /** A second line beside the title: a caveat, a variant name. */
  note?: string;
  /** Whatever is being demonstrated. */
  stage: ReactNode;
  /** The source, already a `CodePreview` composition. */
  code: ReactNode;
};

export function ComponentPreviewBare({ code, note, stage, title }: ComponentPreviewBareProps) {
  return (
    <div className={componentPreviewParts.root} {...{ [componentPreviewAttrs.root]: "" }}>
      {title || note ? (
        <header className={componentPreviewParts.header}>
          {title ? <span className={componentPreviewParts.title}>{title}</span> : null}
          {note ? <span className={componentPreviewParts.note}>{note}</span> : null}
        </header>
      ) : null}
      <div className={componentPreviewParts.stage}>{stage}</div>
      {code}
    </div>
  );
}
