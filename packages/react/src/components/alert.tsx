import { alertParts, getAlertLiveRegion, type AlertPresentation, type AlertTone } from "@skryensya/core/alert";
import { type HTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  /** Optional actions owned by the caller, such as a recovery link or button. */
  actions?: ReactNode;
  children: ReactNode;
  /** Optional decorative leading glyph. It is marked aria-hidden, meaning lives in the text. */
  icon?: ReactNode;
  /** Called when the dismiss control is used. Omit to render a non-dismissible alert. */
  onDismiss?: () => void;
  presentation?: AlertPresentation;
  title?: ReactNode;
  tone?: AlertTone;
};

export function Alert({
  actions,
  children,
  className,
  icon,
  onDismiss,
  presentation = "banner",
  title,
  tone = "neutral",
  ...props
}: AlertProps) {
  const live = alertLiveRegionFor(tone);

  return (
    <div {...props} aria-live={live.ariaLive} className={cx(alertParts.root, className)} data-presentation={presentation} data-tone={tone} role={live.role}>
      {icon ? <span aria-hidden="true" className={alertParts.icon}>{icon}</span> : null}
      <div className={alertParts.content}>
        {title ? <p className={alertParts.title}>{title}</p> : null}
        <div className={alertParts.description}>{children}</div>
      </div>
      {actions || onDismiss ? (
        <div className={alertParts.actions}>
          {actions}
          {onDismiss ? (
            <button aria-label="Dismiss alert" className={alertParts.dismiss} onClick={onDismiss} type="button">
              ×
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function alertLiveRegionFor(tone: AlertTone) {
  return getAlertLiveRegion(tone) === "assertive"
    ? ({ ariaLive: "assertive", role: "alert" } as const)
    : ({ ariaLive: "polite", role: "status" } as const);
}
