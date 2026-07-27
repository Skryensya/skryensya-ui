import {
  animateStatCount,
  formatStatCount,
  prefersReducedMotion,
  readStatCountDuration,
  statCountFractionDigits,
  statParts,
  type StatTrend,
} from "@skryensya/core/stat";
import { useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type StatAnimateOptions = {
  /** Start of the count. Default `0`. */
  from?: number;
  /** Override `--sk-stat-count-duration` (ms). */
  duration?: number;
  /** Wait until the stat intersects the viewport. Default `true`. */
  whenVisible?: boolean;
};

export type StatProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: ReactNode;
  /**
   * The metric. Pass a `number` together with `animate` to count up; otherwise any node renders
   * as-is (the default, static path).
   */
  value: ReactNode;
  /** Formats each tick and the final number when `value` is numeric. Default: locale tabular count. */
  format?: (n: number) => string;
  /**
   * Opt-in count-up. Only runs when `value` is a finite number. Honours
   * `prefers-reduced-motion` (jumps to the end).
   */
  animate?: boolean | StatAnimateOptions;
  /** Optional change indicator, e.g. `<><Icon name="arrow-up" size="sm" /> 12.5%</>`. Colored by `trend`, not by its own sign. */
  change?: ReactNode;
  trend?: StatTrend;
};

export function Stat({
  animate = false,
  change,
  className,
  format,
  label,
  trend = "neutral",
  value,
  ...props
}: StatProps) {
  const animated = Boolean(animate) && typeof value === "number" && Number.isFinite(value);
  const options: StatAnimateOptions = typeof animate === "object" && animate ? animate : {};

  return (
    <div {...props} className={cx(statParts.root, className)}>
      <span className={statParts.label}>{label}</span>
      {animated ? (
        <StatValue animate={options} format={format} to={value} />
      ) : (
        <span className={statParts.value}>{value}</span>
      )}
      {change != null ? (
        <span className={statParts.change} data-trend={trend}>
          {change}
        </span>
      ) : null}
    </div>
  );
}

function StatValue({
  animate,
  format,
  to,
}: {
  animate: StatAnimateOptions;
  format?: (n: number) => string;
  to: number;
}) {
  const from = animate.from ?? 0;
  const whenVisible = animate.whenVisible !== false;
  const digits = statCountFractionDigits(to);
  const formatTick = useMemo(
    () => format ?? ((n: number) => formatStatCount(n, { fractionDigits: digits })),
    [digits, format],
  );
  const finalText = useMemo(() => formatTick(to), [formatTick, to]);
  const valueRef = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(() => formatTick(prefersReducedMotion() ? to : from));

  useEffect(() => {
    const node = valueRef.current;
    if (!node) return;

    let handle: { stop: () => void } | undefined;
    let observer: IntersectionObserver | undefined;
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      const duration =
        animate.duration ??
        (prefersReducedMotion() ? 0 : readStatCountDuration(node.closest(`.${statParts.root}`) ?? node));
      handle?.stop();
      handle = animateStatCount({
        from,
        to,
        duration,
        onUpdate: (n) => setText(formatTick(n)),
      });
    };

    if (!whenVisible || typeof IntersectionObserver === "undefined") {
      run();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          observer = undefined;
          run();
        },
        { threshold: 0.2 },
      );
      observer.observe(node);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      handle?.stop();
    };
  }, [animate.duration, formatTick, from, to, whenVisible]);

  return (
    <span className={statParts.value} ref={valueRef}>
      <span aria-hidden="true" className={statParts.valueSizer}>
        {finalText}
      </span>
      <span className={statParts.valueTick}>{text}</span>
    </span>
  );
}
