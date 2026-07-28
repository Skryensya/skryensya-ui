import type { ComponentSchema } from "./catalog.js";

export interface UsageProblem {
  rule: "unknown-surface" | "unknown-prop" | "invalid-value" | "missing-required" | "forbidden-present";
  msg: string;
}

interface SurfaceDef {
  requires?: string[];
  forbids?: string[];
  props?: Record<string, Array<string | boolean | null>>;
}

/**
 * Checks one proposed usage — {surface, props} — against exactly what the schema DECLARES:
 * the surface's requires/forbids and the prop enums (surface-level overrides schema-level, same
 * precedence checks.mjs's gate-0 example-prop rule uses). Nothing beyond the schema is enforced —
 * inventing a rule the guide doesn't state would be the server authoring policy, which is out of
 * scope (see index.ts's server description).
 */
export function checkUsage(
  schema: ComponentSchema,
  surfaceName: string,
  props: Record<string, unknown>,
): UsageProblem[] {
  const surfaces = (schema.surfaces ?? {}) as Record<string, SurfaceDef>;
  const surface = surfaces[surfaceName];

  if (!surface) {
    return [
      {
        rule: "unknown-surface",
        msg: `"${surfaceName}" is not a surface of "${schema.id}". Known surfaces: ${Object.keys(surfaces).join(", ") || "(none)"}.`,
      },
    ];
  }

  const problems: UsageProblem[] = [];
  const givenKeys = new Set(Object.keys(props));

  for (const required of surface.requires ?? []) {
    if (!givenKeys.has(required)) {
      problems.push({
        rule: "missing-required",
        msg: `${surfaceName} requires "${required}", not present in the given props.`,
      });
    }
  }

  for (const forbidden of surface.forbids ?? []) {
    if (givenKeys.has(forbidden)) {
      problems.push({
        rule: "forbidden-present",
        msg: `${surfaceName} forbids "${forbidden}", but it is present in the given props.`,
      });
    }
  }

  const sharedProps = (schema.props ?? {}) as Record<string, Array<string | boolean | null>>;
  const availableProps = { ...sharedProps, ...(surface.props ?? {}) };

  for (const [key, value] of Object.entries(props)) {
    const enumValues = availableProps[key];
    if (enumValues === undefined) continue; // not every prop is an enum axis the guide declares (event handlers, aria-*, …)
    if (!enumValues.includes(value as string | boolean | null)) {
      problems.push({
        rule: "invalid-value",
        msg: `${surfaceName}.${key}=${JSON.stringify(value)} is not one of ${JSON.stringify(enumValues)}.`,
      });
    }
  }

  return problems;
}
