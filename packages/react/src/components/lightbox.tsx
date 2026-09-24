import { lightboxAttrs, lightboxContract, lightboxParts, type LightboxAction, type LightboxImage } from "@skryensya/core/lightbox";
import {
  LIGHTBOX_CLOSED_STATE,
  connectLightbox,
  createLightboxHandle,
  type LightboxCallbacks,
  type LightboxHandle,
  type LightboxSettings,
  type LightboxState,
} from "@skryensya/core/lightbox-controller";
import {
  createContext,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type DialogHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import type { StableIconName } from "@skryensya/core/icon";
import { Icon } from "./icon.js";

export type { LightboxImage } from "@skryensya/core/lightbox";
export type {
  LightboxHandle,
  LightboxOpenOptions,
  LightboxSettings,
  LightboxState,
} from "@skryensya/core/lightbox-controller";

/* Derived, never restated: the defaults live in the contract. */
const {
  label: labelOption,
  closeLabel: closeOption,
  previousLabel: previousOption,
  nextLabel: nextOption,
  zoomInLabel: zoomInOption,
  zoomOutLabel: zoomOutOption,
  resetZoomLabel: resetZoomOption,
  errorLabel: errorOption,
  counterLabel: counterOption,
} = lightboxContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/*
 * LIGHTBOX: the React half. It renders the contract's markup and runs `connectLightbox` on it in an
 * effect, exactly as the Vanilla enhancer runs it on authored markup; every behaviour (focus, keys,
 * gestures, loading, the live region) is that controller's, so the two bindings cannot disagree.
 *
 * THREE WAYS IN, ONE LIFECYCLE:
 *   - imperative: the `ref` is a `LightboxHandle` (`open`, `close`, `next`, `goTo`, …);
 *   - app-wide: `<LightboxProvider>` renders one of these and `useLightbox()` returns its handle
 *     from anywhere below it;
 *   - declarative: `open`, `images` and `index` as props, with `onOpenChange` and `onIndexChange`.
 * All three end in the controller's `open()`, so a thumbnail, a button and a prop all get the same
 * focus handling, scroll lock and cleanup.
 *
 * THE DECLARATIVE PROPS ARE REQUESTS, AND A DISMISSAL ALWAYS WINS. `open={true}` opens it; Escape or
 * the close button close it and report `onOpenChange(false)`, and the lightbox does not wait for the
 * parent to agree. A modal that a parent could hold open against Escape would be a keyboard trap
 * (WCAG 2.1.2), so the controller stays the one source of truth and the props follow it.
 *
 * NO PORTAL. A modal `<dialog>` is drawn in the top layer, above every stacking context and outside
 * every `overflow: hidden` and `transform`, wherever it sits in the tree. That is also why this is
 * safe to server-render: the markup is a closed dialog, identical on both sides of hydration, and
 * nothing touches `document` until the effect.
 */
export type LightboxProps = Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "children" | "title"> &
  LightboxSettings &
  LightboxCallbacks & {
    /** The images, for declarative use. The imperative handle takes its own. */
    images?: readonly LightboxImage[];
    /** Opens (true) or closes (false) the lightbox. Leave undefined to drive it only through the handle. */
    open?: boolean;
    /** Which image is showing, while open. */
    index?: number;
    /** The imperative handle. */
    ref?: Ref<LightboxHandle>;
    /** The id its `Lightbox.Trigger`s name in `opens`. */
    id?: string;
    /** The dialog's accessible name. Default "Image viewer". */
    label?: string;
    closeLabel?: string;
    previousLabel?: string;
    nextLabel?: string;
    zoomInLabel?: string;
    zoomOutLabel?: string;
    resetZoomLabel?: string;
    /** Shown on the stage when an image fails to load. */
    errorLabel?: string;
    /** What the live region says on navigation: "Image {index} of {count}". */
    counterLabel?: string;
    /** Where focus goes on close when the element that opened it is gone. */
    fallbackFocus?: () => HTMLElement | null;
    /**
     * Bind this lightbox to a handle created elsewhere with `createLightboxHandle()`. What
     * `LightboxProvider` does; rarely needed directly.
     */
    handle?: ReturnType<typeof createLightboxHandle>;
  };

export function Lightbox({
  images,
  open,
  index,
  ref,
  handle: externalHandle,
  className,
  label = labelOption.default,
  closeLabel = closeOption.default,
  previousLabel = previousOption.default,
  nextLabel = nextOption.default,
  zoomInLabel = zoomInOption.default,
  zoomOutLabel = zoomOutOption.default,
  resetZoomLabel = resetZoomOption.default,
  errorLabel = errorOption.default,
  counterLabel = counterOption.default,
  loop,
  zoom,
  maxZoom,
  showCounter,
  showCaption,
  closeOnBackdropClick,
  onOpenChange,
  onIndexChange,
  onImageLoad,
  onImageError,
  fallbackFocus,
  ...props
}: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [handle] = useState(() => externalHandle ?? createLightboxHandle());
  const [connected, setConnected] = useState(false);
  useImperativeHandle(ref, () => handle, [handle]);

  /* The latest props, read by the callbacks the controller holds: it is connected once, and a
     closure over the first render's `onIndexChange` would call a stale parent forever. */
  const latest = useRef({ onOpenChange, onIndexChange, onImageLoad, onImageError, fallbackFocus });
  latest.current = { onOpenChange, onIndexChange, onImageLoad, onImageError, fallbackFocus };
  const settings = { loop, zoom, maxZoom, showCounter, showCaption, closeOnBackdropClick, counterLabel };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const controllerRef = useRef<ReturnType<typeof connectLightbox> | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const controller = connectLightbox(dialog, {
      ...settingsRef.current,
      onOpenChange: (value) => latest.current.onOpenChange?.(value),
      onIndexChange: (at, image) => latest.current.onIndexChange?.(at, image),
      onImageLoad: (image, at) => latest.current.onImageLoad?.(image, at),
      onImageError: (image, at) => latest.current.onImageError?.(image, at),
      fallbackFocus: () => latest.current.fallbackFocus?.() ?? null,
    });
    controllerRef.current = controller;
    handle.bind(controller);
    setConnected(true);
    return () => {
      handle.bind(null);
      controller.destroy();
      controllerRef.current = null;
      setConnected(false);
    };
  }, [handle]);

  /* Settings follow the props on every render; the controller re-renders its chrome only if open. */
  useEffect(() => {
    controllerRef.current?.configure(settingsRef.current);
  });

  /* ---- declarative: each prop is applied when it changes, never re-asserted over the reader ---- */
  const imagesRef = useRef(images);
  imagesRef.current = images;
  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    if (!connected || open === undefined) return;
    if (open) handle.open({ images: imagesRef.current ?? [], index: indexRef.current });
    else handle.close();
  }, [connected, open, handle]);

  useEffect(() => {
    if (!connected || images === undefined || !handle.getState().open) return;
    handle.setImages(images);
  }, [connected, images, handle]);

  useEffect(() => {
    if (!connected || index === undefined || !handle.getState().open) return;
    handle.goTo(index);
  }, [connected, index, handle]);

  return (
    <dialog {...props} aria-label={label} className={cx(lightboxParts.root, className)} ref={dialogRef}>
      <div className={lightboxParts.toolbar}>
        <p aria-hidden="true" className={lightboxParts.counter} />
        <div className={lightboxParts.actions}>
          <LightboxControl action="zoom-out" icon="zoom-out" label={zoomOutLabel} />
          <LightboxControl action="zoom-in" icon="zoom-in" label={zoomInLabel} />
          <LightboxControl action="reset-zoom" icon="fit" label={resetZoomLabel} />
          <LightboxControl action="close" icon="close" label={closeLabel} />
        </div>
      </div>
      <figure className={lightboxParts.figure}>
        {/* The controller prepends the two `<img>` here; React renders nothing that could collide. */}
        <div className={lightboxParts.stage}>
          <span aria-hidden="true" className={`${lightboxParts.loader} sk-loader`} data-size="lg" />
          <p className={lightboxParts.error} data-error-label={errorLabel} hidden>
            {errorLabel}
          </p>
        </div>
        <figcaption className={lightboxParts.caption} hidden>
          <p className={lightboxParts.title} hidden />
          <p className={lightboxParts.description} hidden />
          <p className={lightboxParts.credit} hidden />
        </figcaption>
      </figure>
      <LightboxControl action="previous" icon="chevron-left" label={previousLabel} nav />
      <LightboxControl action="next" icon="chevron-right" label={nextLabel} nav />
      <p aria-atomic="true" aria-live="polite" className={`${lightboxParts.live} sk-visually-hidden`} />
    </dialog>
  );
}

function LightboxControl({
  action,
  icon,
  label,
  nav = false,
}: {
  action: LightboxAction;
  icon: StableIconName;
  label: string;
  nav?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className={
        nav
          ? `${lightboxParts.nav} ${lightboxParts.control} sk-button sk-interactive`
          : `${lightboxParts.control} sk-button sk-interactive`
      }
      data-icon-only=""
      data-size="md"
      data-variant="translucent"
      type="button"
      {...{ [lightboxAttrs.action]: action }}
    >
      <Icon name={icon} size="md" />
    </button>
  );
}

/* ---------------------------------------------------------------------------------------------- *
 * Lightbox.Trigger
 * ---------------------------------------------------------------------------------------------- */

export type LightboxTriggerProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "title"> & {
  /** The `id` of the Lightbox this opens. Every trigger naming one id is one gallery, in page order. */
  opens: string;
  /** The full-size image, and the link's own destination when no script runs. */
  src: string;
  /** The full image's alt, when it should differ from the thumbnail's. */
  alt?: string;
  title?: string;
  description?: string;
  credit?: string;
  width?: number;
  height?: number;
  /** The thumbnail. Its `alt` names the link. */
  children: ReactNode;
};

/*
 * A link to the image that opens it in the lightbox instead. Markup and nothing else: the click is
 * the controller's, delegated from the document, so a trigger rendered anywhere (another subtree, a
 * list that re-renders) belongs to its gallery without registering itself.
 */
function LightboxTrigger({
  opens,
  src,
  alt,
  title,
  description,
  credit,
  width,
  height,
  children,
  className,
  ...props
}: LightboxTriggerProps) {
  return (
    <a
      {...props}
      aria-haspopup="dialog"
      className={cx(lightboxParts.trigger, className)}
      href={src}
      {...{
        [lightboxAttrs.opens]: opens,
        [lightboxAttrs.alt]: alt,
        [lightboxAttrs.title]: title,
        [lightboxAttrs.description]: description,
        [lightboxAttrs.credit]: credit,
        [lightboxAttrs.width]: width,
        [lightboxAttrs.height]: height,
      }}
    >
      {children}
    </a>
  );
}

Lightbox.Trigger = LightboxTrigger;

/* ---------------------------------------------------------------------------------------------- *
 * One lightbox for the whole app
 * ---------------------------------------------------------------------------------------------- */

const LightboxContext = createContext<LightboxHandle | null>(null);

export type LightboxProviderProps = Omit<LightboxProps, "open" | "index" | "images" | "ref" | "handle"> & {
  children?: ReactNode;
};

/*
 * Renders ONE lightbox and hands its handle to everything below. However many components call
 * `useLightbox()`, there is one dialog, one set of listeners and one open session: a second `open()`
 * replaces what is showing rather than stacking a second overlay.
 */
export function LightboxProvider({ children, ...props }: LightboxProviderProps) {
  const [handle] = useState(() => createLightboxHandle());
  return (
    <LightboxContext.Provider value={handle}>
      {children}
      <Lightbox {...props} handle={handle} />
    </LightboxContext.Provider>
  );
}

/**
 * The app-wide lightbox's handle. Stable across renders, callable before the dialog has mounted
 * (the last `open()` is replayed), and a no-op for everything else until then.
 */
export function useLightbox(): LightboxHandle {
  const handle = useContext(LightboxContext);
  if (!handle) {
    throw new Error("useLightbox() needs a <LightboxProvider> above it in the tree.");
  }
  return handle;
}

/**
 * The lightbox's current state (open, index, count, image, zoom, status), re-rendering on change.
 * Reads the provider's lightbox by default, or any handle passed in (a `Lightbox`'s `ref`).
 */
export function useLightboxState(handle?: LightboxHandle | null): LightboxState {
  const fromContext = useContext(LightboxContext);
  const source = handle ?? fromContext;
  return useSyncExternalStore(
    (listener) => source?.subscribe(listener) ?? (() => {}),
    () => source?.getState() ?? LIGHTBOX_CLOSED_STATE,
    () => LIGHTBOX_CLOSED_STATE,
  );
}
