import { codePreviewAttrs, codePreviewParts } from "@skryensya/core/code-preview";
import { useState, type ReactNode } from "react";
import { Icon } from "./icon.js";

/*
 * CODE PREVIEW — the React half, which did not exist.
 *
 * The enhancer shipped with no counterpart here, so this could not be a contract: one binding is not
 * a contract, it is a script. Same story as copy-button, dialog and command-palette.
 *
 * HIGHLIGHTING IS NOT THIS COMPONENT'S JOB, in either binding. The code arrives already marked up —
 * Shiki runs at build or on the server, never in the browser — so `children` is whatever the author
 * produced. What the component owns is the chrome around it: the label row, the disclosure, and the
 * line counts that make "show 40 more lines" a real number rather than a guess.
 */
export type CodePreviewProps = {
  children: ReactNode;
  label?: ReactNode;
  note?: ReactNode;
  /** The panel is taller than the preview window, so it gets a disclosure control. */
  collapsible?: boolean;
  /** Total lines, and how many the collapsed window shows — both counted where the code is made. */
  lines?: number;
  previewLines?: number;
  moreLabel?: string;
  lessLabel?: string;
};

export function CodePreview({
  children,
  collapsible = false,
  lessLabel = "Ver menos",
  lines,
  label,
  moreLabel = "Ver todo",
  note,
  previewLines,
}: CodePreviewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={codePreviewParts.root}
      {...{
        [codePreviewAttrs.root]: "",
        // `expanded` is the enhancer's bookkeeping, written when the control is used rather than
        // at rest — so this binding does not claim it either, or the two disagree before any click.
        ...(collapsible ? { [codePreviewAttrs.collapsible]: "" } : {}),
        ...(lines !== undefined ? { [codePreviewAttrs.lines]: String(lines) } : {}),
        ...(previewLines !== undefined ? { [codePreviewAttrs.previewLines]: String(previewLines) } : {}),
      }}
    >
      {label || note ? (
        <div className={codePreviewParts.label}>
          <span className={codePreviewParts.meta}>
            {label ? <span>{label}</span> : null}
            {note ? <span>{note}</span> : null}
          </span>
        </div>
      ) : null}
      <div className={codePreviewParts.preview}>
        <div className={codePreviewParts.viewport}>{children}</div>
      </div>
      {collapsible ? (
        <div className={codePreviewParts.more} {...{ [codePreviewAttrs.more]: "" }}>
          <button
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
