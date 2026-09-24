import {
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  CANVAS_TOUCH_HINT,
  CANVAS_WHEEL_HINT,
  canvasAttrs,
  canvasContract,
  canvasParts,
  connectCanvasView,
  type CanvasAction,
} from "@skryensya/core/canvas";
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "./icon.js";

/* Derived, never restated: the defaults live in the contract. */
const { zoomInLabel: zoomInOption, zoomOutLabel: zoomOutOption, fitLabel: fitOption } =
  canvasContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type CanvasProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** What is shown, laid out at its own width and viewed through the canvas. */
  children: ReactNode;
  /** Names the canvas and makes it a `group`. */
  label?: string;
  /** The smallest scale a reader can zoom out to. Default 0.25. */
  minZoom?: number;
  /** The largest scale a reader can zoom in to. Default 4. */
  maxZoom?: number;
  /** Only fit the content: no zoom bar, no gestures, not a tab stop. It still refits on resize. */
  fitOnly?: boolean;
  zoomInLabel?: string;
  zoomOutLabel?: string;
  fitLabel?: string;
  /** Shown when one finger drags across the canvas. */
  touchHint?: ReactNode;
  /** Shown when a plain wheel scrolls over it. */
  wheelHint?: ReactNode;
};

/*
 * CANVAS: the React half. Every gesture is `connectCanvasView`'s, run in an effect on this root,
 * exactly as the Vanilla enhancer runs it on authored markup; this component only renders the parts.
 */
export function Canvas({
  children,
  className,
  label,
  minZoom = CANVAS_MIN_ZOOM,
  maxZoom = CANVAS_MAX_ZOOM,
  fitOnly = false,
  zoomInLabel = zoomInOption.default,
  zoomOutLabel = zoomOutOption.default,
  fitLabel = fitOption.default,
  touchHint,
  wheelHint,
  ...props
}: CanvasProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return connectCanvasView(root, { minZoom, maxZoom, fitOnly });
  }, [minZoom, maxZoom, fitOnly]);

  return (
    <div
      {...props}
      aria-label={label}
      className={cx(canvasParts.root, className)}
      ref={rootRef}
      role={label ? "group" : undefined}
      {...{ [canvasAttrs.fitOnly]: fitOnly ? "" : undefined }}
    >
      <CanvasParts
        fitLabel={fitLabel}
        fitOnly={fitOnly}
        touchHint={touchHint}
        wheelHint={wheelHint}
        zoomInLabel={zoomInLabel}
        zoomOutLabel={zoomOutLabel}
      >
        {children}
      </CanvasParts>
    </div>
  );
}

type CanvasPartsProps = {
  children: ReactNode;
  fitOnly?: boolean;
  zoomInLabel: string;
  zoomOutLabel: string;
  fitLabel: string;
  touchHint?: ReactNode;
  wheelHint?: ReactNode;
};

/**
 * Everything below the root, shared with `Annotated`, which renders the same structure around its
 * own frame (the template does the same with `canvasTemplateChildren`).
 */
export function CanvasParts({
  children,
  fitOnly = false,
  zoomInLabel,
  zoomOutLabel,
  fitLabel,
  touchHint,
  wheelHint,
}: CanvasPartsProps) {
  const viewport = (
    <div className={canvasParts.viewport} tabIndex={fitOnly ? undefined : 0}>
      <div className={canvasParts.content}>{children}</div>
    </div>
  );
  if (fitOnly) return viewport;
  return (
    <>
      {viewport}
      <div className={canvasParts.controls}>
        <Control action="zoom-in" icon="zoom-in" label={zoomInLabel} />
        <Control action="zoom-out" icon="zoom-out" label={zoomOutLabel} />
        <Control action="fit" icon="fit" label={fitLabel} />
      </div>
      <p aria-hidden="true" className={canvasParts.hint} {...{ [canvasAttrs.hint]: "touch" }}>
        <span>{touchHint ?? CANVAS_TOUCH_HINT}</span>
      </p>
      <p aria-hidden="true" className={canvasParts.hint} {...{ [canvasAttrs.hint]: "wheel" }}>
        <span>{wheelHint ?? CANVAS_WHEEL_HINT}</span>
      </p>
    </>
  );
}

function Control({ action, icon, label }: { action: CanvasAction; icon: string; label: string }) {
  return (
    <button
      aria-label={label}
      className={`${canvasParts.control} sk-button sk-interactive`}
      data-icon-only=""
      data-size="xs"
      data-variant="ghost"
      type="button"
      {...{ [canvasAttrs.action]: action }}
    >
      <Icon name={icon as "fit"} size="sm" />
    </button>
  );
}

/** Wires `connectCanvasView` on a root that is not a `Canvas` element: `Annotated`'s embedded one. */
export function useCanvasView(
  ref: { readonly current: HTMLElement | null },
  enabled: boolean,
  options: { minZoom?: number; maxZoom?: number; fitOnly?: boolean } = {},
): void {
  const { minZoom, maxZoom, fitOnly } = options;
  useEffect(() => {
    const root = ref.current;
    if (!enabled || !root) return;
    return connectCanvasView(root, { minZoom, maxZoom, fitOnly });
  }, [enabled, minZoom, maxZoom, fitOnly, ref]);
}
