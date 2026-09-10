import {
  qrGeometry,
  qrCodeParts,
  type QrLevel,
  type QrMask,
  type QrModuleShape,
  type QrPolarity,
  type QrSize,
  type QrTone,
} from "@skryensya/core/qr-code";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

type QRCodeStyle = CSSProperties & { "--sk-qr-code-logo-ratio"?: number };

export type QRCodeProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The string the symbol carries. */
  value: string;
  /** What the code DOES, for assistive technology. Never the raw value: see the contract. */
  label: string;
  level?: QrLevel;
  /** One of the eight mask patterns, or `auto` to let the standard's penalty rules choose. */
  mask?: QrMask;
  shape?: QrModuleShape;
  quietZone?: number;
  logoRatio?: number;
  size?: QrSize;
  tone?: QrTone;
  polarity?: QrPolarity;
  /** Anything the kit publishes, laid over the cleared middle. Pair it with `logoRatio`. */
  logo?: ReactNode;
};

/*
 * The React half of the QRCode contract.
 *
 * IT CALLS THE SAME `qrGeometry` THE MARKUP EMITTER CALLS, which is the whole arrangement: the
 * encoder lives in Core (decision 13) so that a symbol cannot come out one way in authored markup
 * and another way here. Two implementations of ISO/IEC 18004 that agree by inspection is not a thing
 * anyone can verify in a diff; one function called twice is.
 *
 * There is no memo around it because `qrGeometry` already caches, and a component that re-renders
 * with the same value therefore pays a map lookup rather than an encode.
 */
export function QRCode({
  className,
  label,
  level = "Q",
  mask = "auto",
  logo,
  logoRatio = 0,
  polarity = "auto",
  quietZone = 4,
  shape = "square",
  size = "md",
  style,
  tone = "neutral",
  value,
  ...props
}: QRCodeProps) {
  const { path, extent } = qrGeometry(value, {
    level,
    mask,
    moduleShape: shape,
    quietZone,
    logoRatio,
  });

  return (
    <div
      {...props}
      aria-label={label}
      className={className ? `${qrCodeParts.root} ${className}` : qrCodeParts.root}
      data-polarity={polarity}
      data-size={size}
      data-tone={tone}
      role="img"
      /* The ratio reaches the stylesheet as a custom property, which is what sizes the logo box;
         the markup emitter writes the same one from the contract's `styleProperty`. */
      style={{ ...style, "--sk-qr-code-logo-ratio": logoRatio } as QRCodeStyle}
    >
      <svg
        aria-hidden="true"
        className={qrCodeParts.frame}
        focusable="false"
        viewBox={`0 0 ${extent} ${extent}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path className={qrCodeParts.modules} d={path} fill="currentColor" />
      </svg>
      {logo === undefined ? null : <div className={qrCodeParts.logo}>{logo}</div>}
    </div>
  );
}
