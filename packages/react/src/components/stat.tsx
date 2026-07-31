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
  /** Machine-readable metric used by usage-tree markup while `value` remains the final fallback text. */
  count?: number;
  locale?: string;
  suffix?: string;
  fractionDigits?: number;
  /** Formats each tick and the final number when the metric is numeric. */
  format?: (n: number) => string;
  /** Opt-in count-up. Reduced motion jumps directly to the final value. */
  animate?: boolean | StatAnimateOptions;
  /** Optional change indicator, paired with `trend` so color is not the only cue. */
  change?: ReactNode;
  trend?: StatTrend;
};

export function Stat({
  animate = false,
  change,
  className,
  count,
  format,
  fractionDigits,
  label,
  locale,
  suffix = "",
  trend = "neutral",
  value,
  ...props
}: StatProps) {
  const metric = count ?? value;
  const countFormat = useMemo(() => {
    if (format) return format;
    if (count === undefined) return undefined;
    const formatter = new Intl.NumberFormat(locale, {
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    });
    return (n: number) => `${formatter.format(n)}${suffix}`;
  }, [count, format, fractionDigits, locale, suffix]);
  const animated = Boolean(animate) && typeof metric === "number" && Number.isFinite(metric);
  const options: StatAnimateOptions = typeof animate === "object" && animate ? animate : {};
  const staticValue =
    count !== undefined && typeof metric === "number" && countFormat
      ? countFormat(metric)
      : metric;

  return (
    <div {...props} className={cx(statParts.root, className)} data-sk-stat="">
      <span className={statParts.label}>{label}</span>
      {animated ? (
        <StatValue animate={options} format={countFormat} to={metric as number} />
      ) : (
        <span className={statParts.value}>{staticValue}</span>
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
