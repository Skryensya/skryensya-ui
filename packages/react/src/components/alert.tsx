import { alertParts, getAlertLiveRegion, type AlertPresentation, type AlertTone } from "@skryensya/core/alert";
import { Button } from "./button.js";
import { Icon } from "./icon.js";
import { type HTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  /** Optional actions owned by the caller, such as a recovery link or button. */
  actions?: ReactNode;
  children: ReactNode;
  /**
   * Whether the alert carries a dismiss control. Structure, not behaviour — the split Tag and Toast
   * make: the contract owns whether the control EXISTS, `onDismiss` owns what it does. Defaults to
   * whether a handler was passed, so callers written before this prop keep their button.
   */
  dismissible?: boolean;
  /** The dismiss control's accessible name. It is icon-only, so it has no other. */
  dismissLabel?: string;
  /** Optional decorative leading glyph. It is marked aria-hidden, meaning lives in the text. */
  icon?: ReactNode;
  /** Called when the dismiss control is used. */
  onDismiss?: () => void;
  presentation?: AlertPresentation;
  title?: ReactNode;
  tone?: AlertTone;
};

export function Alert({
  actions,
  children,
  className,
  dismissLabel = "Dismiss alert",
  dismissible,
  icon,
  onDismiss,
  presentation = "banner",
  title,
  tone = "neutral",
  ...props
}: AlertProps) {
  const live = alertLiveRegionFor(tone);
  const hasDismiss = dismissible ?? Boolean(onDismiss);

  return (
    <div {...props} aria-live={live.ariaLive} className={cx(alertParts.root, className)} data-dismissible={hasDismiss ? "" : undefined} data-presentation={presentation} data-tone={tone} role={live.role}>
      {icon ? <span aria-hidden="true" className={alertParts.icon}>{icon}</span> : null}
      <div className={alertParts.content}>
        {title ? <p className={alertParts.title}>{title}</p> : null}
        <div className={alertParts.description}>{children}</div>
      </div>
      {actions || hasDismiss ? (
        <div className={alertParts.actions}>
          {actions}
          {hasDismiss ? (
            /* A real Button, not an alert-shaped lookalike: the state layer, the focus ring and the
               44px hit target come with it. `close` is the system's icon for dismissing, never a
               literal "×". The same control Toast draws, so both dismissals are one contract. */
            <Button
              aria-label={dismissLabel}
              className={alertParts.dismiss}
              iconOnly
              onClick={onDismiss}
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

function alertLiveRegionFor(tone: AlertTone) {
  return getAlertLiveRegion(tone) === "assertive"
    ? ({ ariaLive: "assertive", role: "alert" } as const)
    : ({ ariaLive: "polite", role: "status" } as const);
}
