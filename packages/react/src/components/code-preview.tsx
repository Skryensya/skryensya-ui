import { codePreviewAttrs, codePreviewParts } from "@skryensya/core/code-preview";
import { selectionParts } from "@skryensya/core/selection";
import { useId, useState, type ReactNode } from "react";
import { Icon } from "./icon.js";

/*
 * CODE PREVIEW: the React half, which did not exist.
 *
 * The enhancer shipped with no counterpart here, so this could not be a contract: one binding is not
 * a contract, it is a script. Same story as copy-button, dialog and command-palette.
 *
 * HIGHLIGHTING IS NOT THIS COMPONENT'S JOB, in either binding. The code arrives already marked up;
 * Shiki runs at build or on the server, never in the browser; `children` is whatever the author
 * produced. What the component owns is the chrome around it: the label row, the disclosure, and the
 * line counts that make "show 40 more lines" a real number rather than a guess.
 */
export type CodePreviewProps = {
  children: ReactNode;
  label?: ReactNode;
  note?: ReactNode;
  /** The panel is taller than the preview window, so it gets a disclosure control. */
  collapsible?: boolean;
  /** Total lines, and how many the collapsed window shows; both counted where the code is made. */
  lines?: number;
  previewLines?: number;
  moreLabel?: string;
  lessLabel?: string;
  /** Rendered in the label row BESIDE the meta block, not inside it. The density switch lives here. */
  aside?: ReactNode;
  /** Extra attributes for the root, so the density variant can mark which panel is showing. */
  rootAttrs?: Record<string, string>;
  /**
   * The children already ARE the viewports, so no wrapper is added. The density variant renders one
   * per panel: each has to be addressable on its own for the enhancer to show and hide them.
   */
  ownViewports?: boolean;
  /**
   * Id of the panel the disclosure toggle controls, per WAI's own Disclosure pattern
   * (`aria-controls` on the trigger). Only meaningful together with `ownViewports`: this component
   * generates and owns its own viewport's id otherwise, since it is the one rendering it.
   */
  controlsId?: string;
};

export function CodePreview({
  aside,
  controlsId,
  ownViewports = false,
  rootAttrs,
  children,
  collapsible = false,
  lessLabel = "Contraer",
  lines,
  label,
  moreLabel = "Expandir",
  note,
  previewLines,
}: CodePreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const generatedViewportId = useId();
  const viewportId = controlsId ?? generatedViewportId;

  return (
    <div
      className={codePreviewParts.root}
      {...{
        [codePreviewAttrs.root]: "",
        // `expanded` is the enhancer's bookkeeping, written when the control is used rather than
        // at rest; so this binding does not claim it either, or the two disagree before any click.
        ...(collapsible ? { [codePreviewAttrs.collapsible]: "" } : {}),
        ...(lines !== undefined ? { [codePreviewAttrs.lines]: String(lines) } : {}),
        ...(previewLines !== undefined ? { [codePreviewAttrs.previewLines]: String(previewLines) } : {}),
        ...rootAttrs,
      }}
    >
      {label || note || aside ? (
        <div className={codePreviewParts.label}>
          <span className={codePreviewParts.meta}>
            {label ? <span>{label}</span> : null}
            {note ? <span>{note}</span> : null}
          </span>
          {aside}
        </div>
      ) : null}
      <div className={codePreviewParts.preview}>
        {ownViewports ? children : <div className={codePreviewParts.viewport} id={viewportId}>{children}</div>}
      </div>
      {collapsible ? (
        <div className={codePreviewParts.more} {...{ [codePreviewAttrs.more]: "" }}>
          <button
            aria-controls={viewportId}
            aria-expanded={expanded}
            className={`${codePreviewParts.toggle} sk-button sk-interactive`}
            data-size="sm"
            data-variant="ghost"
            onClick={() => setExpanded((was) => !was)}
            type="button"
            {...{ [codePreviewAttrs.toggle]: "" }}
          >
            <span {...{ [codePreviewAttrs.toggleLabel]: "" }}>{expanded ? lessLabel : moreLabel}</span>
            {/* Empty at rest in both bindings: the count is computed from the rendered height, which
                only exists once there is a layout. The enhancer fills it; nothing claims it here. */}
            <span className={codePreviewParts.toggleCount} />
            <span className={codePreviewParts.toggleIcon}>
              <Icon name="chevron-down" size="sm" />
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export type CodePreviewDensityProps = Omit<CodePreviewProps, "children"> & {
  /** The short version, shown first. */
  condensed: ReactNode;
  /** Everything, behind the switch. */
  full: ReactNode;
  condensedLabel?: string;
  fullLabel?: string;
  switchLabel?: string;
};

/*
 * THE DENSITY VARIANT: two panels and a switch between them.
 *
 * A second signature rather than an option on the first, because the anatomy is genuinely different:
 * one panel becomes two, each addressable, and a control appears that has no meaning without them.
 * `CodePreview` with a `density` flag would have carried two slots that are required when the flag
 * is set and forbidden when it is not, which is a signature wearing a disguise.
 *
 * The switch is a real `sk-switch`, not a pair of buttons: it is one binary choice with two named
 * ends. Those ends are labels BESIDE it rather than its accessible name, because the name has to say
 * what the switch does: show the full version; which is what a screen reader needs when the words
 * beside it are out of reach.
 */
export function CodePreviewDensity({
  condensed,
  condensedLabel = "Condensado",
  full,
  fullLabel = "Completo",
  switchLabel = "Mostrar la versión completa",
  ...rest
}: CodePreviewDensityProps) {
  // Single source of truth for which panel shows, same as the Vanilla enhancer's
  // `data-sk-code-preview-density` on the root — the stylesheet keys visibility off that one
  // attribute (`code-preview.css`), so this state is what actually makes the switch DO something,
  // not just report a `checked` value nobody reads.
  const [density, setDensity] = useState<"condensed" | "full">("condensed");
  const condensedId = useId();
  const fullId = useId();

  return (
    <CodePreview
      {...rest}
      controlsId={density === "full" ? fullId : condensedId}
      ownViewports
      rootAttrs={{ [codePreviewAttrs.density]: density }}
      aside={
        <div className={codePreviewParts.density}>
            <span className={codePreviewParts.densityEdge} data-density="condensed">
              {condensedLabel}
            </span>
            <label className={selectionParts.switch}>
              <input
                aria-label={switchLabel}
                checked={density === "full"}
                className={selectionParts.switchInput}
                onChange={(event) => setDensity(event.target.checked ? "full" : "condensed")}
                role="switch"
                type="checkbox"
                {...{ [codePreviewAttrs.densityInput]: "" }}
              />
              <span aria-hidden="true" className={selectionParts.switchControl}>
                <span className={selectionParts.switchThumb} />
              </span>
            </label>
          <span className={codePreviewParts.densityEdge} data-density="full">
            {fullLabel}
          </span>
        </div>
      }
    >
      <div
        className={codePreviewParts.viewport}
        id={condensedId}
        {...{ [codePreviewAttrs.densityPanel]: "condensed" }}
      >
        {condensed}
      </div>
      <div className={codePreviewParts.viewport} id={fullId} {...{ [codePreviewAttrs.densityPanel]: "full" }}>
        {full}
      </div>
    </CodePreview>
  );
}
