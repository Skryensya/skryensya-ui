## What this changes

<!-- The effect, not the file list. The diff already says which files. -->

## Why

<!-- The problem it solves, or the decision it implements. If it contradicts something in
     docs/decisiones/, say so and say why. -->

## Checklist

- [ ] Both bindings changed, if this touches a component (`packages/vanilla` and `packages/react`)
- [ ] Tests added or updated, and `pnpm turbo run check --filter='!@skryensya/ai-gates'` passes
- [ ] Docs updated in both locales, if this changes anything a reader sees
- [ ] `pnpm --filter @skryensya/ai-gates check` run, if this changes rendered output
- [ ] Terms match `CONTEXT.md`

<!-- A binding changed alone is the drift this system exists to prevent, so that first box is the
     one worth being honest about. If it does not apply, delete it. -->
