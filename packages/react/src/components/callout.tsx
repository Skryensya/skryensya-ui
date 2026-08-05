import { calloutParts, getCalloutLiveRegion, type CalloutTone } from "@skryensya/core/callout";
import { type HTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type CalloutProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  /**
   * Optional recovery action owned by the caller — a `translucent` or `danger` Button, or a plain Link.
   * Never a dismiss: Callout is purely informational and has no way to close itself, unlike Toast.
   */
  actions?: ReactNode;
  children: ReactNode;
  /** Optional decorative leading glyph. It is marked aria-hidden, meaning lives in the text. */
  icon?: ReactNode;
  title?: ReactNode;
  tone?: CalloutTone;
};

export function Callout({ actions, children, className, icon, title, tone = "neutral", ...props }: CalloutProps) {
  const live = calloutLiveRegionFor(tone);

  return (
    <div {...props} aria-live={live.ariaLive} className={cx(calloutParts.root, className)} data-tone={tone} role={live.role}>
      {icon ? <span aria-hidden="true" className={calloutParts.icon}>{icon}</span> : null}
      <div className={calloutParts.content}>
        {title ? <p className={calloutParts.title}>{title}</p> : null}
        <div className={calloutParts.description}>{children}</div>
      </div>
      {actions ? <div className={calloutParts.actions}>{actions}</div> : null}
    </div>
  );
}

function calloutLiveRegionFor(tone: CalloutTone) {
  return getCalloutLiveRegion(tone) === "assertive"
    ? ({ ariaLive: "assertive", role: "alert" } as const)
    : ({ ariaLive: "polite", role: "status" } as const);
}
