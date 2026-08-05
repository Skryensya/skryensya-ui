import { contentParts, getToastLiveRegion, hasToastTimeout, toastLiveRegions, type ToastOptions, type ToastTone } from "@skryensya/core/content";
import { Button } from "./button.js";
import { Icon } from "./icon.js";
import { useCallback, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

type WithChildren<T> = T & { children: ReactNode };

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
    title?: ReactNode;
    tone?: ToastTone;
  };

/** Transient Callout: same anatomy, owned by a floating region and optional timeout. */
export function Toast({
  actions,
  children,
  className,
  dismissLabel = "Dismiss notification",
  dismissible,
  icon,
  onDismiss,
  timeout,
  title,
  tone = "neutral",
  ...props
}: ToastProps) {
  const dismissed = useRef(false);
  const dismiss = useCallback(
    (reason: "dismiss" | "timeout") => {
      if (dismissed.current) return;

      dismissed.current = true;
      onDismiss?.({ reason });
    },
    [onDismiss],
  );
  const liveRegion = toastLiveRegions[getToastLiveRegion(tone)];
  const hasDismiss = dismissible ?? Boolean(onDismiss);

  useEffect(() => {
    if (!onDismiss || !hasToastTimeout(timeout)) return;

    const timer = window.setTimeout(() => dismiss("timeout"), timeout);
    return () => window.clearTimeout(timer);
  }, [dismiss, onDismiss, timeout]);

  return (
    <div
      {...props}
      aria-live={liveRegion.ariaLive}
      className={cx(contentParts.toast, className)}
      data-dismissible={hasDismiss ? "" : undefined}
      data-tone={tone}
      data-sk-toast=""
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
