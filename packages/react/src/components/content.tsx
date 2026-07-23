import { contentParts, getToastLiveRegion, hasToastTimeout, toastLiveRegions, type ToastOptions, type ToastTone } from "@skryensya/core/content";
import { type AlertPresentation } from "@skryensya/core/alert";
import { useCallback, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

type WithChildren<T> = T & { children: ReactNode };

export type ToastProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> &
  ToastOptions & {
    /** Optional actions owned by the caller, such as a recovery link. */
    actions?: ReactNode;
    children: ReactNode;
    /** Optional decorative leading glyph. It is marked aria-hidden, meaning lives in the text. */
    icon?: ReactNode;
    presentation?: AlertPresentation;
    title?: ReactNode;
    tone?: ToastTone;
  };

/** Transient Alert: same anatomy, owned by a floating region and optional timeout. */
export function Toast({
  actions,
  children,
  className,
  icon,
  onDismiss,
  presentation = "banner",
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
      data-presentation={presentation}
      data-tone={tone}
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
      {actions || onDismiss ? (
        <div className={contentParts.toastActions}>
          {actions}
          {onDismiss ? (
            <button aria-label="Dismiss notification" className={contentParts.toastDismiss} onClick={() => dismiss("dismiss")} type="button">
              ×
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export type ToastRegionProps = WithChildren<HTMLAttributes<HTMLDivElement>>;
export function ToastRegion({ children, className, ...props }: ToastRegionProps) {
  return (
    <div {...props} aria-live="polite" className={cx(contentParts.toastRegion, className)}>
      {children}
    </div>
  );
}
