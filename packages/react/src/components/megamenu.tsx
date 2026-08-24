import { imageFrameParts } from "@skryensya/core/image-frame";
import { megamenuAttrs, megamenuParts } from "@skryensya/core/megamenu";
import { resolveMegamenuEvent, type MegamenuEvent, type MegamenuState } from "@skryensya/core/megamenu";
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useAnchored } from "./anchored.js";
import { ImageFrame } from "./image-frame.js";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

const OPEN_DELAY_MS = 150;
const CLOSE_DELAY_MS = 150;

/*
 * MEGAMENU, the React binding — no `@zag-js/*` machine here either (`core/src/megamenu.ts`'s own
 * header comment: activation is native `<button>` semantics, and this component owns no arrow-key
 * vocabulary). `resolveMegamenuEvent` is the only piece of real logic; everything below is wiring it
 * to timers (hover-intent), a click, Escape and a blur-of-the-whole-bar, the same shape
 * `Menubar`'s own React binding wires `resolveMenubarKey` to.
 *
 * ONE PHYSICAL PANEL, of CONSTANT height, not one per trigger: `Megamenu` reads every
 * `MegamenuTrigger` child's own `columns` prop directly (they are ordinary elements in `children`,
 * nothing exotic) and renders a SINGLE positioner/content pair, once, portaled from the root — never
 * one inside each trigger. `displayedIndex` is what makes switching read as "the same box, new
 * content" rather than "one box closes while another opens": it only ever moves to a NEW index when
 * one is opened, and is left alone on close, so the exit transition fades out whatever was already
 * showing instead of an empty box collapsing to nothing.
 *
 * The box never CHANGES height either, by construction rather than by measuring or animating
 * anything (`megamenu.css`'s own comment on `.sk-megamenu__ruler` has the full reasoning): every
 * trigger's columns render into the hidden `ruler`, stacked in the same grid cell as the one VISIBLE
 * panel, so that cell's track is always exactly as tall as the tallest trigger needs, whichever one
 * is actually shown.
 *
 * LINK-TO-IMAGE PREVIEW. A `NavListLink` inside a trigger's columns can carry
 * `megamenuAttrs.preview` (a plain `data-*` prop, forwarded straight to the `<a>` by that
 * signature's own `...props` spread — `nav-list.tsx` needs no change for this): hovering or
 * focusing it swaps that trigger's `ImageFrame` column to the given image, imperatively (the same
 * kind of direct DOM patch `anchored.ts` already does elsewhere in this binding), reverting to the
 * trigger's own authored default the instant neither a preview link nor the image has hover or
 * focus. Delegated on the one visible panel via React's own bubbling `onPointerOver`/`onFocus`
 * props, not one listener per link: `displayedIndex` already re-renders that panel's content on
 * every trigger switch, so a single pair of handlers on its wrapper covers every trigger.
 */

/** A trigger's own `ImageFrame` column, read directly off its element props — `undefined` when
 *  this trigger has no image column. A plain top-level array walk, not `Children.map`/
 *  `Children.toArray` (see the `columnsByIndex` comment below for why those flatten wrongly here):
 *  `ImageFrame` is always a direct item of `columns`, never nested inside a `NavListGroup`. */
function findDefaultImage(columns: ReactNode): { src: string; alt: string } | undefined {
  const items: ReactNode[] = Array.isArray(columns) ? columns : columns == null ? [] : [columns];
  for (const item of items) {
    if (isValidElement(item) && item.type === ImageFrame) {
      const props = item.props as { src?: string; alt?: string };
      if (props.src) return { src: props.src, alt: props.alt ?? "" };
    }
  }
  return undefined;
}

type MegamenuContextValue = {
  readonly state: MegamenuState;
  readonly dispatch: (event: MegamenuEvent) => void;
  readonly scheduleOpen: (index: number) => void;
  readonly scheduleClose: (index: number) => void;
  readonly clearTimers: () => void;
  readonly registerTrigger: (index: number, element: HTMLElement | null) => void;
};

const MegamenuContext = createContext<MegamenuContextValue | null>(null);

function useMegamenuContext(component: string): MegamenuContextValue {
  const context = useContext(MegamenuContext);
  if (!context) throw new Error(`Megamenu.${component} must be rendered inside Megamenu.`);
  return context;
}

export type MegamenuProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  label: string;
  children: ReactNode;
  /** Where the panel portals — `Menu`'s own `container`, see its identical doc. */
  container?: RefObject<HTMLElement>;
};

export function Megamenu({ children, className, container, label, ...props }: MegamenuProps) {
  const id = useId();
  const anchored = useAnchored(id);
  const [state, setState] = useState<MegamenuState>({ openIndex: null });
  const [displayedIndex, setDisplayedIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const visiblePanelRef = useRef<HTMLDivElement | null>(null);
  const outgoingPreviewImage = useRef<HTMLImageElement | null>(null);
  const pointerDownWasInsideRef = useRef(false);
  const triggers = useRef(new Map<number, HTMLElement>());
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    openTimer.current = undefined;
    closeTimer.current = undefined;
  };
  useEffect(() => clearTimers, []);

  // See `onBlur`'s own doc for why this exists. Document-level and capture-phase: a click anywhere
  // has to be seen before the resulting blur fires, and the panel is portaled outside `<nav>`'s own
  // DOM subtree, so a listener scoped to this component's own elements would miss clicks landing on
  // portaled content entirely.
  useEffect(() => {
    const onPointerDownCapture = (event: globalThis.PointerEvent) => {
      const target = event.target as Node | null;
      pointerDownWasInsideRef.current = !!target && (rootRef.current?.contains(target) || visiblePanelRef.current?.contains(target)) === true;
    };
    document.addEventListener("pointerdown", onPointerDownCapture, true);
    return () => document.removeEventListener("pointerdown", onPointerDownCapture, true);
  }, []);

  const dispatch = (event: MegamenuEvent) => setState((current) => resolveMegamenuEvent(current, event));

  // Content only ever changes on OPEN of a (possibly different) index; closing leaves it alone so
  // the exit transition fades out the content that was actually showing. A layout effect, not a
  // plain one: it must commit before paint, or a true first open would flash one empty frame (the
  // materialize transition already begun on `data-state`, content still the PREVIOUS — null —
  // `displayedIndex` for one tick otherwise).
  useLayoutEffect(() => {
    if (state.openIndex !== null) setDisplayedIndex(state.openIndex);
  }, [state.openIndex]);

  // A preview crossfade mid-flight is about to lose the real `<img>` its clone sits beside to the
  // fresh render this triggers; nothing is left for the clone's own fade to finish doing, so it
  // goes immediately instead of outliving the content it was laid over.
  useLayoutEffect(() => {
    outgoingPreviewImage.current?.remove();
    outgoingPreviewImage.current = null;
  }, [displayedIndex]);

  const scheduleOpen = (index: number) => {
    clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
    if (state.openIndex === index) return;
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => dispatch({ kind: "hoverIntentOpen", index }), OPEN_DELAY_MS);
  };

  const scheduleClose = (index: number) => {
    clearTimeout(openTimer.current);
    openTimer.current = undefined;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => dispatch({ kind: "hoverIntentClose", index }), CLOSE_DELAY_MS);
  };

  // The one shared panel's own hover-intent: read `openIndex` at the moment the timer FIRES, never
  // a fixed index captured at schedule time, so a stale timer can't close a different trigger the
  // user has since switched to.
  const cancelPanelClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
  };
  const schedulePanelClose = () => {
    clearTimeout(openTimer.current);
    openTimer.current = undefined;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setState((current) =>
        current.openIndex === null ? current : resolveMegamenuEvent(current, { kind: "hoverIntentClose", index: current.openIndex }),
      );
    }, CLOSE_DELAY_MS);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape" || state.openIndex === null) return;
    const openTrigger = triggers.current.get(state.openIndex);
    clearTimers();
    dispatch({ kind: "escape" });
    openTrigger?.focus();
  };

  // No focus trap, no wraparound (`core/src/megamenu.ts`'s own doc): this only notices when focus
  // has left the WHOLE bar, never redirects it. `rootRef` ALONE is not enough: the panel is
  // portaled to `document.body` (or `container`), so it is not a DOM descendant of `<nav>` even
  // though it is one in the React tree — without also checking `visiblePanelRef`, every focus move
  // FROM a trigger INTO its own panel (or between two links inside it) read as "left the bar" and
  // closed the menu, breaking Tab navigation through the panel's links entirely.
  //
  // `pointerDownWasInside` covers the OTHER gap `relatedTarget` cannot: a click on something inside
  // the panel that is not itself focusable (the image, a column heading, the padding around them)
  // blurs whatever WAS focused with no new focus target at all — the browser's own behavior for a
  // pointer press on a non-focusable element, not a bug. `relatedTarget` is then `null`, which
  // cannot be told apart from "focus actually left the bar" by containment alone, so a click that
  // never left the panel closed the menu anyway. `pointerDownRef` is set on the CAPTURE phase,
  // which runs before the resulting focus change, so this check sees it in time.
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && (rootRef.current?.contains(next) || visiblePanelRef.current?.contains(next))) return;
    if (pointerDownWasInsideRef.current) return;
    clearTimers();
    dispatch({ kind: "blur" });
  };

  const context: MegamenuContextValue = {
    clearTimers,
    dispatch,
    registerTrigger: (index, element) => {
      if (element) triggers.current.set(index, element);
      else triggers.current.delete(index);
    },
    scheduleClose,
    scheduleOpen,
    state,
  };

  // A PLAIN array walk, not `Children.map`/`Children.toArray`: both flatten a child's OWN array-
  // valued props (a trigger's `columns` is 2-4 elements) into the outer traversal, so reading
  // `columnsByIndex[n]` through either came back as "the n-th column across every trigger", not "the
  // n-th trigger's own columns" — Producto showed only its first column, Recursos showed Producto's
  // second. `children` is already a flat list of `MegamenuTrigger` elements once JSX assembles it
  // (the contract's own `children` slot allows nothing else), so a shallow filter is enough and never
  // recurses into anyone's props.
  const rawChildren: ReactNode[] = Array.isArray(children) ? children : children == null ? [] : [children];
  const triggerChildren = rawChildren.filter(
    (child): child is ReactElement<MegamenuTriggerProps> => isValidElement(child) && child.type === MegamenuTrigger,
  );
  const columnsByIndex = triggerChildren.map((child) => child.props.columns);
  const items = triggerChildren.map((child, index) =>
    cloneElement(child, { index, key: child.key ?? index } as Partial<InjectedMegamenuTriggerProps> & { key: number }),
  );
  const defaultImageByIndex = columnsByIndex.map(findDefaultImage);

  const previewImage = () => visiblePanelRef.current?.querySelector<HTMLImageElement>(`.${imageFrameParts.media}`);

  /*
   * A hard `src` cut reads as broken, and a single image fading through its OWN transparency
   * exposes the frame's background for a beat instead of crossfading photo to photo (`megamenu.css`'s
   * own doc on `.sk-megamenu__preview-outgoing` has the full reasoning). So this clones the OUTGOING
   * image as an absolutely-positioned copy, updates the REAL `<img>` underneath immediately (already
   * the new picture, just covered by the clone), and lets `@starting-style` carry the clone from
   * fully opaque to gone — nothing here times or toggles that fade itself. At most one clone at a
   * time: a fast pointer sweep across several links removes the PREVIOUS one outright rather than
   * stacking several fades on top of each other. Imperative DOM, same as the rest of this preview
   * mechanism (`applyPreview`/`resetPreview` already patch `img.src` directly) — React never
   * re-renders this element on a hover, so there is nothing for it to fight.
   */
  const setPreviewImage = (src: string, alt: string) => {
    const img = previewImage();
    if (!img) return;
    if (img.src === new URL(src, document.baseURI).href) return;

    outgoingPreviewImage.current?.remove();
    const outgoing = img.cloneNode(true) as HTMLImageElement;
    outgoing.className = `${imageFrameParts.media} ${megamenuParts.previewOutgoing}`;
    outgoing.removeAttribute("style");
    outgoing.setAttribute("aria-hidden", "true");
    img.insertAdjacentElement("afterend", outgoing);
    outgoingPreviewImage.current = outgoing;

    img.src = src;
    img.alt = alt;

    const cleanup = () => {
      outgoing.removeEventListener("transitionend", onTransitionEnd);
      clearTimeout(safety);
      outgoing.remove();
      if (outgoingPreviewImage.current === outgoing) outgoingPreviewImage.current = null;
    };
    const onTransitionEnd = (event: globalThis.TransitionEvent) => {
      if (event.target === outgoing && event.propertyName === "opacity") cleanup();
    };
    outgoing.addEventListener("transitionend", onTransitionEnd);
    // A dropped `transitionend` (reduced motion, or a second swap already having removed this
    // clone) must not leave it in the DOM forever.
    const safety = setTimeout(cleanup, 500);
  };

  const applyPreview = (link: HTMLElement) => {
    setPreviewImage(link.getAttribute(megamenuAttrs.preview) ?? "", link.getAttribute(megamenuAttrs.previewAlt) ?? "");
  };

  const resetPreview = () => {
    const fallback = displayedIndex !== null ? defaultImageByIndex[displayedIndex] : undefined;
    if (!fallback) return;
    setPreviewImage(fallback.src, fallback.alt);
  };

  // A pointer/focus LEAVING one preview link often lands on another (adjacent links in the same
  // list) or on the image itself (hovering down into the swapped picture) — neither should revert
  // to the default only to immediately swap again; only truly leaving every preview link does.
  const stillOnAPreviewLink = (next: EventTarget | null): boolean =>
    next instanceof Element && next.closest(`[${megamenuAttrs.preview}]`) !== null;

  const onPreviewPointerOver = (event: PointerEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest<HTMLElement>(`[${megamenuAttrs.preview}]`);
    if (link) applyPreview(link);
  };
  const onPreviewPointerOut = (event: PointerEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest<HTMLElement>(`[${megamenuAttrs.preview}]`);
    if (link && !stillOnAPreviewLink(event.relatedTarget)) resetPreview();
  };
  const onPreviewFocus = (event: FocusEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest<HTMLElement>(`[${megamenuAttrs.preview}]`);
    if (link) applyPreview(link);
  };
  const onPreviewBlur = (event: FocusEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest<HTMLElement>(`[${megamenuAttrs.preview}]`);
    if (link && !stillOnAPreviewLink(event.relatedTarget)) resetPreview();
  };

  const panel = (
    <div
      {...anchored.positioner({}, cx(megamenuParts.positioner, megamenuParts.root))}
      data-sk-megamenu-positioner
      onPointerEnter={cancelPanelClose}
      onPointerLeave={schedulePanelClose}
    >
      <div className={megamenuParts.content} data-sk-megamenu-content data-state={state.openIndex !== null ? "open" : "closed"}>
        <div className={megamenuParts.ruler} aria-hidden="true">
          {columnsByIndex?.map((columns, index) => (
            <div className={megamenuParts.panel} key={index}>
              {columns}
            </div>
          ))}
        </div>
        {
          /*
           * Unconditional, matching Vanilla: that binding builds this panel once, at connect, and
           * only ever swaps its CHILDREN (`megamenu.ts`'s own `buildPanel(columnsByIndex[0], …)` at
           * connect, `visiblePanel.replaceChildren(…)` on open) — it is a permanent fixture, never
           * absent-then-created. Gating this on `displayedIndex !== null` (React never having opened
           * yet) made the panel node itself not exist until the first open, a real DOM-shape
           * divergence G2 caught the moment a canonical tree first rendered this contract: closed
           * and never-opened is still "closed", and the two bindings owe the same markup for it, not
           * merely the same painted result. Costs nothing extra on screen either way — this panel's
           * whole ancestor (`sharedContent`/`.sk-megamenu__content`) is what `data-state="closed"`
           * hides, same as Vanilla's.
           */
        }
        <div
          className={`${megamenuParts.panel} ${megamenuParts.panelVisible}`}
          onBlur={onPreviewBlur}
          onFocus={onPreviewFocus}
          onPointerOut={onPreviewPointerOut}
          onPointerOver={onPreviewPointerOver}
          ref={visiblePanelRef}
        >
          {columnsByIndex?.[displayedIndex ?? 0]}
        </div>
      </div>
    </div>
  );

  return (
    <MegamenuContext.Provider value={context}>
      <nav
        {...props}
        {...anchored.anchor(cx(megamenuParts.root, className))}
        aria-label={label}
        onBlurCapture={onBlur}
        onKeyDown={onKeyDown}
        ref={(element) => {
          rootRef.current = element;
        }}
      >
        <ul className={megamenuParts.list} role="list">
          {items}
        </ul>
        {typeof document === "undefined" ? panel : createPortal(panel, container?.current ?? document.body)}
      </nav>
    </MegamenuContext.Provider>
  );
}

export type MegamenuTriggerProps = {
  /** The category's own name — the contract's `children` slot. */
  children: ReactNode;
  /** 2-4 `NavListGroup` elements — the contract's own `columns` slot, see its doc for why the range
   *  is a usage guideline rather than something this binding enforces. Read by the parent `Megamenu`
   *  directly off this element's props: the panel that renders it lives there, not here. */
  columns: ReactNode;
};

/** `index` is injected by the parent `Megamenu` — never author-set. */
type InjectedMegamenuTriggerProps = MegamenuTriggerProps & { index: number };

export function MegamenuTrigger(publicProps: MegamenuTriggerProps) {
  const { children, index } = publicProps as InjectedMegamenuTriggerProps;
  const context = useMegamenuContext("Trigger");
  const open = context.state.openIndex === index;

  return (
    <li className={megamenuParts.item}>
      <button
        aria-expanded={open}
        className={cx(megamenuParts.trigger, "sk-interactive")}
        data-sk-megamenu-trigger
        onClick={() => {
          context.clearTimers();
          context.dispatch({ kind: "activate", index });
        }}
        onPointerEnter={() => context.scheduleOpen(index)}
        onPointerLeave={() => context.scheduleClose(index)}
        ref={(element) => context.registerTrigger(index, element)}
        type="button"
      >
        {children}
      </button>
    </li>
  );
}
