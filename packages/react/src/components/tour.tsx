import { tourAttrs, tourContract, tourParts, type TourAction, type TourStatus, type TourStep } from "@skryensya/core/tour";
import {
  TOUR_IDLE_STATE,
  connectTour,
  getTourStatus,
  subscribeTourStatus,
  type TourCallbacks,
  type TourController,
  type TourStartOptions,
  type TourState,
} from "@skryensya/core/tour-controller";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { Icon } from "./icon.js";

export type { TourPlacement, TourStatus, TourStep } from "@skryensya/core/tour";
export type { TourStartOptions, TourState } from "@skryensya/core/tour-controller";

/* Derived, never restated: the defaults live in the contract. */
const {
  progressLabel: progressOption,
  nextLabel: nextOption,
  finishLabel: finishOption,
  previousLabel: previousOption,
  skipLabel: skipOption,
  closeLabel: closeOption,
} = tourContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/** What a `Tour`'s `ref` holds: the controller's commands, callable before it has connected (they do nothing). */
export type TourHandle = Pick<
  TourController,
  "start" | "restart" | "close" | "skip" | "next" | "previous" | "goTo" | "refresh" | "forget" | "getState" | "subscribe"
>;

/*
 * TOUR: the React half. It renders the contract's markup and runs `connectTour` on it in an effect,
 * exactly as the Vanilla enhancer runs it on authored markup; every behaviour (focus, Escape, the
 * missing-target rule, placement, memory) is that controller's, so the two bindings cannot disagree.
 *
 * THE STEPS ARE RENDERED AS DATA, into the hidden list the controller reads, so the same `<ol>` exists
 * on both sides and a re-render with new steps is picked up at the next move without a reconnect.
 *
 * NO PORTAL. The ring and the box are `popover="manual"` and enter the top layer from wherever they
 * sit in the tree, above every stacking context and outside every `overflow: hidden`. That is also
 * what makes this safe to server-render: the markup is two hidden elements, identical on both sides
 * of hydration, and nothing touches `document` until the effect.
 *
 * NEVER AUTOMATIC. There is no `open` prop that starts it on mount: a tour starts from a
 * `Tour.Trigger` or a call on the ref, both of which are something the reader did.
 */
export type TourProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> &
  TourCallbacks & {
    /** The tour's id: what its triggers name in `opens`, and what its memory is keyed by. */
    id: string;
    /** One element and one idea per step. A step whose target is not on the page is skipped. */
    steps: readonly TourStep[];
    /** The imperative handle. */
    ref?: Ref<TourHandle>;
    /** "Step {index} of {count}". */
    progressLabel?: string;
    nextLabel?: string;
    finishLabel?: string;
    previousLabel?: string;
    skipLabel?: string;
    closeLabel?: string;
    /** Remember how the tour ended across visits. Default true. */
    remember?: boolean;
    /** Where focus goes on close when the element that started the tour is gone. */
    fallbackFocus?: () => HTMLElement | null;
  };

export function Tour({
  id,
  steps,
  ref,
  className,
  progressLabel = progressOption.default,
  nextLabel = nextOption.default,
  finishLabel = finishOption.default,
  previousLabel = previousOption.default,
  skipLabel = skipOption.default,
  closeLabel = closeOption.default,
  remember,
  onStatusChange,
  onStepChange,
  fallbackFocus,
  ...props
}: TourProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<TourController | null>(null);

  /* The latest props, read by the callbacks the controller holds: it connects once, and a closure over
     the first render's `onStepChange` would call a stale parent forever. */
  const latest = useRef({ onStatusChange, onStepChange, fallbackFocus });
  latest.current = { onStatusChange, onStepChange, fallbackFocus };
  const settings = { progressLabel, remember };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  /* Subscriptions live on the handle, not the controller, so one made before the controller connects
     (or across a StrictMode reconnect) keeps hearing about changes. */
  const [subscribers] = useState(() => new Set<() => void>());
  /* ONE handle for the component's life, whatever the parent passes as `ref`: an inline ref callback
     re-runs `useImperativeHandle` on every render, and a new object each time would make every
     `useTourState(handle)` below it re-subscribe forever. */
  const [handle] = useState(
    (): TourHandle => ({
      start: (options?: TourStartOptions) => controllerRef.current?.start(options),
      restart: (options?: TourStartOptions) => controllerRef.current?.restart(options),
      close: () => controllerRef.current?.close(),
      skip: () => controllerRef.current?.skip(),
      next: () => controllerRef.current?.next(),
      previous: () => controllerRef.current?.previous(),
      goTo: (index: number) => controllerRef.current?.goTo(index),
      refresh: () => controllerRef.current?.refresh(),
      forget: () => controllerRef.current?.forget(),
      getState: () => controllerRef.current?.getState() ?? TOUR_IDLE_STATE,
      subscribe: (listener: () => void) => subscribers.add(listener) && (() => void subscribers.delete(listener)),
    }),
  );
  useImperativeHandle(ref, () => handle, [handle]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const controller = connectTour(root, {
      ...settingsRef.current,
      onStatusChange: (status) => latest.current.onStatusChange?.(status),
      onStepChange: (index, step) => latest.current.onStepChange?.(index, step),
      fallbackFocus: () => latest.current.fallbackFocus?.() ?? null,
    });
    controllerRef.current = controller;
    const notify = () => {
      for (const listener of subscribers) listener();
    };
    const unsubscribe = controller.subscribe(notify);
    notify();
    return () => {
      unsubscribe();
      controller.destroy();
      controllerRef.current = null;
      notify();
    };
  }, [id, subscribers]);

  /* Settings follow the props on every render. */
  useEffect(() => {
    controllerRef.current?.configure(settingsRef.current);
  });

  return (
    <div {...props} className={cx(tourParts.root, className)} id={id} ref={rootRef}>
      <ol className={tourParts.steps} hidden>
        {steps.map((step, index) => (
          <li
            className={tourParts.step}
            key={`${index}:${step.target}`}
            {...{ [tourAttrs.target]: step.target, [tourAttrs.placement]: step.placement ?? "block-end" }}
          >
            <p className={tourParts.stepTitle}>{step.title}</p>
            <p className={tourParts.stepDescription}>{step.description}</p>
          </li>
        ))}
      </ol>
      <div aria-hidden="true" className={tourParts.ring} hidden popover="manual" />
      <p aria-atomic="true" aria-live="polite" className={`${tourParts.live} sk-visually-hidden`} />
      <div className={tourParts.popover} hidden popover="manual" role="dialog">
        <div aria-hidden="true" className={tourParts.arrow} />
        <div className={tourParts.content}>
          <div className={tourParts.header}>
            <p className={tourParts.progress} />
            <TourControl action="close" aria-label={closeLabel} data-icon-only="" data-size="xs" data-variant="ghost">
              <Icon name="close" size="sm" />
            </TourControl>
          </div>
          <h2 className={tourParts.title} />
          <p className={tourParts.description} />
          <div className={tourParts.footer}>
            <TourControl action="skip" data-size="sm" data-variant="ghost">
              <span>{skipLabel}</span>
            </TourControl>
            <div className={tourParts.nav}>
              <TourControl action="previous" data-size="sm" data-variant="soft">
                <span>{previousLabel}</span>
              </TourControl>
              <TourControl action="next" data-size="sm">
                <span className={tourParts.nextLabel}>{nextLabel}</span>
                <span className={tourParts.finishLabel}>{finishLabel}</span>
              </TourControl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TourControl({
  action,
  children,
  ...props
}: { action: TourAction; children: ReactNode } & Partial<Record<`data-${string}` | "aria-label", string>>) {
  return (
    <button {...props} className={`${tourParts.control} sk-button sk-interactive`} type="button" {...{ [tourAttrs.action]: action }}>
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------------------------------------- *
 * Tour.Trigger
 * ---------------------------------------------------------------------------------------------- */

export type TourTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type"> & {
  /** The `id` of the Tour this starts, always from step one. */
  opens: string;
  /** What it says before the tour has ended once: "Take the tour". */
  label: string;
  /** What it says once the tour was completed, skipped or dismissed: "Repeat tour". */
  restartLabel?: string;
};

/*
 * A button that starts the tour from step one. Markup and nothing else: the click is the controller's,
 * delegated from the document, so a trigger rendered anywhere starts its tour without registering.
 * Its status comes from the by-id store, so it says "Repeat tour" even rendered far from the tour,
 * and even before the tour has mounted (from what storage remembers).
 */
function TourTrigger({ opens, label, restartLabel, className, ...props }: TourTriggerProps) {
  const status = useTourStatus(opens);
  return (
    <button
      {...props}
      className={cx(`${tourParts.trigger} sk-button sk-interactive`, className)}
      data-size="md"
      data-variant="soft"
      type="button"
      {...{ [tourAttrs.opens]: opens, [tourAttrs.status]: status }}
    >
      <span className={tourParts.triggerStart}>{label}</span>
      {restartLabel ? <span className={tourParts.triggerRestart}>{restartLabel}</span> : null}
    </button>
  );
}

Tour.Trigger = TourTrigger;

/**
 * How the tour with this id last ended (or `running`), re-rendering on change. `idle` on the server
 * and on the first client render, so hydration matches; the remembered value arrives right after.
 */
export function useTourStatus(tourId: string): TourStatus {
  return useSyncExternalStore(
    (listener) => subscribeTourStatus(tourId, listener),
    () => getTourStatus(tourId),
    () => "idle",
  );
}

/** The full state of a tour through its handle (a `Tour`'s `ref`), re-rendering on change. */
export function useTourState(handle: TourHandle | null | undefined): TourState {
  return useSyncExternalStore(
    useCallback((listener: () => void) => handle?.subscribe(listener) ?? (() => {}), [handle]),
    () => handle?.getState() ?? TOUR_IDLE_STATE,
    () => TOUR_IDLE_STATE,
  );
}
