import { stepsParts, type Step, type StepStatus } from "@skryensya/core/steps";
import { type HTMLAttributes } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type StepsProps = Omit<HTMLAttributes<HTMLOListElement>, "children"> & {
  steps: readonly Step[];
  /** Zero-based index of the current step. Used only for steps that don't declare their own status. */
  current?: number;
};

export function Steps({ className, current = 0, steps, ...props }: StepsProps) {
  return (
    <ol {...props} className={cx(stepsParts.root, className)}>
      {steps.map((step, index) => {
        const status = step.status ?? deriveStatus(index, current);
        return (
          <li
            aria-current={status === "current" ? "step" : undefined}
            className={stepsParts.item}
            data-status={status}
            key={step.label + index}
          >
            <span className={stepsParts.marker}>{status === "complete" ? "✓" : index + 1}</span>
            <span>
              <span className={stepsParts.label}>{step.label}</span>
              {step.description ? <span className={stepsParts.description}>{step.description}</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function deriveStatus(index: number, current: number): StepStatus {
  if (index < current) return "complete";
  if (index === current) return "current";
  return "upcoming";
}
