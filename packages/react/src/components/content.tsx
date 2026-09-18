import {
  contentParts,
  getToastLiveRegion,
  hasToastTimeout,
  toastEvents,
  toastLiveRegions,
  type ToastDismissDetails,
  type ToastOptions,
  type ToastTone,
  contentContract,
} from "@skryensya/core/content";
import { Button } from "./button.js";
import { Icon } from "./icon.js";
import { useCallback, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

/* Derived, never restated: the default lives in the contract. */
const { dismissLabel: dismissLabelOption, tone: toneOption } = contentContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ToastProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> &
  ToastOptions & {
    /** Optional actions owned by the caller, such as a recovery link. */
    actions?: ReactNode;
    children: ReactNode;
    /**
     * Whether the toast carries a dismiss control. Structure, not behaviour: the same split Tag
     * makes: the contract owns whether the control EXISTS, `onDismiss` owns what it does. Defaults
     * to whether a handler was passed, so callers written before this prop keep their button.
     */
    dismissible?: boolean;
    /** The dismiss control's accessible name. It is icon-only, so it has no other. */
    dismissLabel?: string;
    /** Optional decorative leading glyph. It is marked aria-hidden, meaning lives in the text. */
    icon?: ReactNode;
    /** Title text. Contract slot is `text`; rich markup belongs in `children`. */
    title?: string;
    tone?: ToastTone;
  };

/** Longest resolved `transition-duration` after `data-dismissing` lands, in ms. Same as Vanilla. */
function getExitDurationMs(root: HTMLElement): number {
  return Math.max(
    0,
    ...getComputedStyle(root)
      .transitionDuration.split(",")
      .map((value) => parseFloat(value) * 1000 || 0),
  );
}

function waitForExit(root: HTMLElement, durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      root.removeEventListener("transitionend", onTransitionEnd);
      resolve();
    };
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === root) finish();
    };
    root.addEventListener("transitionend", onTransitionEnd);
    setTimeout(finish, durationMs + 50);
  });
}

/** Transient Callout: same anatomy, owned by a floating region and optional timeout. */
export function Toast({
  actions,
  children,
  className,
  dismissLabel = dismissLabelOption.default,
  dismissible,
  icon,
  onDismiss,
  timeout,
  title,
  tone = toneOption.default,
  ...props
}: ToastProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dismissed = useRef(false);
  const liveRegion = toastLiveRegions[getToastLiveRegion(tone)];
  const hasDismiss = dismissible ?? Boolean(onDismiss);

  const dismiss = useCallback(
    (reason: ToastDismissDetails["reason"]) => {
      if (dismissed.current) return;
      dismissed.current = true;

      const root = rootRef.current;
      const finish = () => {
        const details: ToastDismissDetails = { reason };
        onDismiss?.(details);
        root?.dispatchEvent(
          new CustomEvent<ToastDismissDetails>(toastEvents.dismiss, { bubbles: true, detail: details }),
        );
      };

      if (!root) {
        finish();
        return;
      }

      // Same exit contract as Vanilla: paint `data-dismissing` first, hold the event until the
      // transition ends (or skip when duration is 0 / no stylesheet), then announce + callback.
      root.setAttribute("data-dismissing", "");
      const durationMs = getExitDurationMs(root);
      if (durationMs <= 0) {
        finish();
        return;
      }
      void waitForExit(root, durationMs).then(finish);
    },
    [onDismiss],
  );

  useEffect(() => {
    if (!hasToastTimeout(timeout)) return;

    const timer = window.setTimeout(() => dismiss("timeout"), timeout);
    return () => window.clearTimeout(timer);
  }, [dismiss, timeout]);

  return (
    <div
      {...props}
      aria-atomic="true"
      aria-live={liveRegion.ariaLive}
      className={cx(contentParts.toast, className)}
      data-dismissible={hasDismiss ? "" : undefined}
      data-sk-toast=""
      data-timeout={hasToastTimeout(timeout) ? String(timeout) : undefined}
      data-tone={tone}
      ref={rootRef}
      role={liveRegion.role}
    >
      {icon ? (
        <span aria-hidden="true" className={contentParts.toastIcon}>
          {icon}
        </span>
      ) : null}
      <div className={contentParts.toastContent}>
        {title ? <p className={contentParts.toastTitle}>{title}</p> : null}
        <div className={contentParts.toastDescription}>{children}</div>
      </div>
      {actions || hasDismiss ? (
        <div className={contentParts.toastActions}>
          {actions}
          {hasDismiss ? (
            /* A real Button, not a toast-shaped lookalike: the state layer, the focus ring and the
               44px hit target come with it. `close` is the system's icon for dismissing, never a
               literal "×". Same control Tag uses, so both dismissals are one contract. */
            <Button
              aria-label={dismissLabel}
              className={contentParts.toastDismiss}
              iconOnly
              onClick={() => dismiss("dismiss")}
              size="sm"
              variant="ghost"
            >
              <Icon name="close" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export type ToastRegionProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};
export function ToastRegion({ children, className, ...props }: ToastRegionProps) {
  return (
    <div {...props} aria-live="polite" className={cx(contentParts.toastRegion, className)}>
      {children}
    </div>
  );
}

export type ToastTemplateProps = HTMLAttributes<HTMLTemplateElement> & {
  children: ReactNode;
};
export function ToastTemplate({ children, ...props }: ToastTemplateProps) {
  return <template {...props}>{children}</template>;
}
