import {
  formatTimeValue,
  getHourCycle,
  getPeriodLabels,
  getTimeFieldTokens,
  parseTimeValue,
  segmentBounds,
  timeFieldParts,
  to12Hour,
  to24Hour,
  type HourCycle,
  type Period,
  type TimeFieldSegmentType,
  type TimeFieldValueChangeDetails,
  type TimeValue,
} from "@skryensya/core/time-field";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

type SegmentValues = Partial<Record<TimeFieldSegmentType, number>>;

function decompose(value: TimeValue | undefined, cycle: HourCycle): SegmentValues {
  if (!value) return {};
  if (cycle === "h24") return { hour: value.hour, minute: value.minute };
  const { hour12, period } = to12Hour(value.hour);
  return { hour: hour12, minute: value.minute, dayPeriod: period === "AM" ? 0 : 1 };
}

function compose(segments: SegmentValues, cycle: HourCycle): TimeValue | undefined {
  if (segments.minute === undefined) return undefined;
  if (cycle === "h24") {
    if (segments.hour === undefined) return undefined;
    return { hour: segments.hour, minute: segments.minute };
  }
  if (segments.hour === undefined || segments.dayPeriod === undefined) return undefined;
  const period: Period = segments.dayPeriod === 0 ? "AM" : "PM";
  return { hour: to24Hour(segments.hour, period), minute: segments.minute };
}

/** Inclusive-range wrap: handles any step size and either direction in one formula, so an arrow
 * key past either end lands on the OTHER end instead of clamping there. */
function wrapStep(current: number, delta: number, min: number, max: number): number {
  const span = max - min + 1;
  return (((current + delta - min) % span) + span) % span + min;
}

function segmentText(
  type: TimeFieldSegmentType,
  raw: number | undefined,
  periods: { AM: string; PM: string },
): string {
  if (raw === undefined) return type === "hour" ? "hh" : type === "minute" ? "mm" : "–";
  if (type === "dayPeriod") return raw === 0 ? periods.AM : periods.PM;
  return String(raw).padStart(2, "0");
}

/** How long an unfinished digit ("1", which could still become "10"–"12") waits for a second
 * keystroke before it settles and focus moves on — long enough for a deliberate second digit,
 * short enough that it does not feel stuck. */
const ADVANCE_DELAY = 500;

export type TimeFieldProps = {
  clearLabel?: string;
  defaultValue?: string;
  disabled?: boolean;
  hint?: ReactNode;
  hourLabel?: string;
  id?: string;
  invalid?: boolean;
  label: ReactNode;
  locale?: string;
  minuteLabel?: string;
  minuteStep?: number;
  name?: string;
  onValueChange?: (details: TimeFieldValueChangeDetails) => void;
  periodLabel?: string;
  readOnly?: boolean;
  required?: boolean;
  value?: string;
};

/**
 * TIME FIELD: hour, minute, and (in a 12-hour locale) AM/PM as one accessible `role="group"` of
 * `role="spinbutton"` segments — no popover, no wheel. An earlier design put a scroll-wheel picker
 * behind a trigger; it turned out to be neither simpler nor more accessible than the segments
 * themselves, which is the same primitive every native segmented time control already uses.
 *
 * Segment order and separators come from `Intl.DateTimeFormat.formatToParts`, not an assumption:
 * some locales place the day period before the time, and the separator is not always ":". The
 * public value is still the canonical `HH:mm` string, carried on a hidden input so a form behind
 * this field never has to parse a locale-formatted one.
 */
export function TimeField({
  clearLabel = "Limpiar hora",
  defaultValue,
  disabled,
  hint,
  hourLabel = "Hora",
  id,
  invalid,
  label,
  locale = "es",
  minuteLabel = "Minuto",
  minuteStep = 1,
  name,
  onValueChange,
  periodLabel = "Periodo",
  readOnly,
  required,
  value,
}: TimeFieldProps) {
  const generatedId = useId();
  const rootId = id ?? generatedId;
  const labelId = `${rootId}-label`;
  const hintId = hint ? `${rootId}-hint` : undefined;

  const cycle = useMemo(() => getHourCycle(locale), [locale]);
  const periods = useMemo(() => getPeriodLabels(locale), [locale]);
  const tokens = useMemo(() => getTimeFieldTokens(locale, cycle), [locale, cycle]);
  const segmentOrder = useMemo(
    () => tokens.filter((token) => token.kind === "segment").map((token) => token.type),
    [tokens],
  );
  const segmentLabels: Record<TimeFieldSegmentType, string> = {
    hour: hourLabel,
    minute: minuteLabel,
    dayPeriod: periodLabel,
  };

  const controlled = value !== undefined;
  const [segments, setSegments] = useState<SegmentValues>(() =>
    decompose(parseTimeValue(controlled ? value : defaultValue), cycle),
  );

  // An external value only ever changes here because OUR OWN commit told the parent about one
  // (controlled) or because the parent reset it independently — either way this is the one place
  // that has to win, since a mid-typing segment never produces a value for the prop to carry.
  useEffect(() => {
    if (!controlled) return;
    setSegments(decompose(parseTimeValue(value), cycle));
  }, [value, controlled, cycle]);

  const commit = (next: SegmentValues) => {
    setSegments(next);
    const composed = compose(next, cycle);
    onValueChange?.({ value: composed ? formatTimeValue(composed) : "" });
  };

  const canonical = compose(segments, cycle);
  const hasValue = canonical !== undefined;

  const segmentRefs = useRef<Partial<Record<TimeFieldSegmentType, HTMLDivElement | null>>>({});
  // Keyed by segment type: what is mid-typing right now, so a second digit can extend it and any
  // OTHER segment's keystrokes never touch it.
  const bufferRef = useRef<{ type: TimeFieldSegmentType; value: number; digits: number } | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(advanceTimerRef.current), []);

  const moveFocus = (from: TimeFieldSegmentType, direction: 1 | -1) => {
    const next = segmentOrder[segmentOrder.indexOf(from) + direction];
    if (next) segmentRefs.current[next]?.focus();
  };

  const typeDigit = (type: TimeFieldSegmentType, digit: number) => {
    const { min, max } = segmentBounds(type, cycle);
    const buffered = bufferRef.current;
    let nextValue: number;
    let digits: number;
    if (buffered && buffered.type === type && buffered.digits < 2 && buffered.value * 10 + digit <= max) {
      nextValue = buffered.value * 10 + digit;
      digits = buffered.digits + 1;
    } else {
      nextValue = digit;
      digits = 1;
    }
    bufferRef.current = { type, value: nextValue, digits };
    commit({ ...segments, [type]: Math.max(nextValue, min) });

    clearTimeout(advanceTimerRef.current);
    const noRoomForAnotherDigit = digits >= 2 || nextValue * 10 > max;
    if (noRoomForAnotherDigit) {
      bufferRef.current = null;
      moveFocus(type, 1);
    } else {
      advanceTimerRef.current = setTimeout(() => {
        bufferRef.current = null;
        moveFocus(type, 1);
      }, ADVANCE_DELAY);
    }
  };

  const handleSegmentKeyDown = (type: TimeFieldSegmentType, event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || readOnly) return;
    const { min, max } = segmentBounds(type, cycle);
    const current = segments[type];

    if (type !== "dayPeriod" && event.key >= "0" && event.key <= "9") {
      event.preventDefault();
      typeDigit(type, Number(event.key));
      return;
    }

    if (type === "dayPeriod") {
      const key = event.key.toLowerCase();
      if (key.length === 1 && periods.AM.toLowerCase().startsWith(key)) {
        event.preventDefault();
        commit({ ...segments, dayPeriod: 0 });
        return;
      }
      if (key.length === 1 && periods.PM.toLowerCase().startsWith(key)) {
        event.preventDefault();
        commit({ ...segments, dayPeriod: 1 });
        return;
      }
    }

    switch (event.key) {
      case "ArrowUp": {
        event.preventDefault();
        bufferRef.current = null;
        const step = type === "minute" ? minuteStep : 1;
        commit({ ...segments, [type]: current === undefined ? min : wrapStep(current, step, min, max) });
        return;
      }
      case "ArrowDown": {
        event.preventDefault();
        bufferRef.current = null;
        const step = type === "minute" ? minuteStep : 1;
        commit({ ...segments, [type]: current === undefined ? max : wrapStep(current, -step, min, max) });
        return;
      }
      case "ArrowLeft":
        event.preventDefault();
        moveFocus(type, -1);
        return;
      case "ArrowRight":
        event.preventDefault();
        moveFocus(type, 1);
        return;
      case "Home":
        event.preventDefault();
        bufferRef.current = null;
        commit({ ...segments, [type]: min });
        return;
      case "End":
        event.preventDefault();
        bufferRef.current = null;
        commit({ ...segments, [type]: max });
        return;
      case "Backspace":
      case "Delete": {
        event.preventDefault();
        bufferRef.current = null;
        const rest = { ...segments };
        delete rest[type];
        commit(rest);
        return;
      }
      default:
        return;
    }
  };

  return (
    <div className={timeFieldParts.root} data-invalid={invalid ? "" : undefined}>
      <span className={timeFieldParts.label} id={labelId}>
        {label}
      </span>
      {/* Before the control, not after it. The vanilla enhancer RENDERS the control into the root,
          so an authored hint always precedes it — and this is the better reading order anyway: the
          instruction is heard before the first spinbutton is reached. Where it PAINTS is the
          stylesheet's call. */}
      {hint ? (
        <span className={timeFieldParts.hint} id={hintId}>
          {hint}
        </span>
      ) : null}
      <div
        aria-describedby={hintId}
        aria-labelledby={labelId}
        className={timeFieldParts.control}
        data-disabled={disabled ? "" : undefined}
        role="group"
      >
        {tokens.map((token, index) =>
          token.kind === "literal" ? (
            <span aria-hidden="true" className={timeFieldParts.literal} key={index}>
              {token.value}
            </span>
          ) : (
            <div
              aria-label={segmentLabels[token.type]}
              aria-required={required ? "true" : undefined}
              aria-valuemax={segmentBounds(token.type, cycle).max}
              aria-valuemin={segmentBounds(token.type, cycle).min}
              aria-valuenow={segments[token.type]}
              aria-valuetext={segmentText(token.type, segments[token.type], periods)}
              className={timeFieldParts.segment}
              data-sk-time-field-segment={token.type}
              data-placeholder={segments[token.type] === undefined ? "" : undefined}
              key={token.type}
              onFocus={() => {
                bufferRef.current = null;
              }}
              onKeyDown={(event) => handleSegmentKeyDown(token.type, event)}
              ref={(node) => {
                segmentRefs.current[token.type] = node;
              }}
              role="spinbutton"
              tabIndex={disabled ? -1 : 0}
            >
              {segmentText(token.type, segments[token.type], periods)}
            </div>
          ),
        )}
        {hasValue && !disabled && !readOnly ? (
          <button
            aria-label={clearLabel}
            className={cx(timeFieldParts.clear, "sk-button", "sk-interactive")}
            data-icon-only=""
            data-size="sm"
            data-variant="ghost"
            onClick={() => {
              bufferRef.current = null;
              commit({});
            }}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
      </div>
      {/* The wire value, always canonical `HH:mm` — no real `<input>` composes the segments, so this
       * is the only thing a form behind TimeField ever sees. */}
      <input name={name} type="hidden" value={canonical ? formatTimeValue(canonical) : ""} />
    </div>
  );
}
