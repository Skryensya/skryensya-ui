---
num: 8
title: The sidebar collapses to a rail, so it is not a disclosure
short: "The sidebar collapses"
summary: >-
  Decision 8 sends disclosures to the native <details>, and a collapsible sidebar looks like one. It is
  not: a closed <details> hides its content, and a collapsed sidebar keeps showing it as icons. Because
  the platform ships nothing that narrows without hiding, a small enhancer earns its place without
  reimplementing anything. The two widths are two values of a single styling hook, collapsed is a state
  the machine writes, and the labels fade but are not removed from the DOM: collapsed, the label is the
  only thing naming the icon.
---

[Decision 8](./0002-what-tier-3-ships.md) has a table that cuts per component: if the platform ships it,
it is CSS only and there is no machine. The disclosure is in that table, with `<details>` / `<summary>`
next to it. A collapsible sidebar **looks like** a disclosure: there is a toggle, there is something that
opens and closes, there is an `aria-expanded`. Applying the rule from memory says to require a
`<details>` and close the matter.

That is the wrong conclusion, and it is worth saying why, because the rule is right.

## Hiding and narrowing are not the same

A closed `<details>` **hides its content**: the `<summary>` remains and nothing else. That is what a
disclosure is, and the native element is perfect for it.

A collapsed sidebar **hides nothing**. It narrows to a rail and the links are still there, visible as
icons, clickable, in the tab order and in the accessibility tree. What changes is the **width**, not the
presence. A `<details>` cannot express that at any price: its closed state is precisely the one that
erases what the rail has to keep showing.

So the platform ships nothing for this, and the other half of decision 8's table applies: a machine earns
its place. The enhancer is small, a boolean, `aria-expanded`, `aria-controls` and a `data-state`, and it
**reimplements nothing**, because there is nothing native to reimplement. The
[pure CSS](./0019-public-palettes-and-constant-semantics.md) objection has nothing to hold on to, just as
it did not with the combobox.

**The rule did not fail: the premise was false.** A collapsible sidebar was never a disclosure.

## The groups inside it are disclosures

The cut is not "sidebar yes, platform no". A nested navigation group that collapses **does** hide its
items, so it is a disclosure, and it goes in `<details>` / `<summary>` as decision 8 says. The same
component uses the native element where it fits and a machine where there is no element. The principle is
one and it lands differently in each place because the platform is different in each place.

## One width, two values, a single hook

The two widths are not two properties. `--sk-sidebar-inline-size` starts at
`--sk-sidebar-expanded-inline-size`, and `[data-state="collapsed"]` **re-declares** it as
`--sk-sidebar-collapsed-inline-size`. The consumer writes `inline-size: var(--sk-sidebar-inline-size)`
once and never revisits it: there is no second rule to keep in sync, which is exactly what the styling
hooks contract says, a variant re-declares the hook that changes rather than adding a new one.

Collapsed is a **state**: the machine writes it as `data-state` on the root, never by hand and never as a
BEM modifier.

The duration comes from the expand/collapse intent tokens
([decision 10](./0004-motion-through-intent-tokens.md)), which already shrink themselves under
`prefers-reduced-motion`, which is why the sidebar's CSS has no media query block for it at all.

## The label fades, it does not leave

Collapsed, the label's opacity goes to 0, `--sk-nav-list-label-opacity`, a hook of the list pattern the
shell re-declares when collapsing ([decision 17](./0019-public-palettes-and-constant-semantics.md)), and
the rail clips what is left over. The label **stays in the DOM**, and that is not a simplification: it is
the only thing giving the icon a name for a screen reader. A sighted user sees a rail of drawings; a
screen reader user hears "Reports" because the text never left.

For the same reason the sidebar **has no icon part**. The icon is a
[pattern](./0019-public-palettes-and-constant-semantics.md) and brings its own box; it takes its color
from `currentColor`, which the link already sets. An `sk-sidebar__icon` would be the sidebar re-declaring
what `sk-icon` already ships, the duplication a pattern exists to prevent.

## What was rejected

- *Requiring `<details>`.* It applies decision 8's rule to a false premise. The closed state hides the
  links, so the rail, the component's entire point, stops existing. What would be left is a menu that
  opens and closes, not a sidebar.
- *`display: none` or `visibility: hidden` on the labels.* It renders just as well and removes the names
  from the accessibility tree: the rail becomes a row of anonymous icons. The browser does not warn and
  no layout test fails.
- *A `visually-hidden` on the labels when collapsing.* It preserves accessibility but kills the
  transition: the width animates and the text vanishes abruptly on the first frame.
- *Two width hooks, one per state.* It forces the consumer to write two rules and to know which applies
  when. The state already knows which one it is; the hook is one.
- *Persisting the preference inside the enhancer.* `localStorage` is the app's decision, not the design
  system's, with what key, per user or per device, and whether it syncs. The enhancer emits
  `sk-collapsed-change` and React calls `onCollapsedChange`; storing that belongs to the consumer.

## Cost

The trigger needs an accessible name the consumer writes, because the enhancer patches attributes and
never content. The trigger is one icon wide, so that name goes in an `aria-label` or in visually hidden
text; a visible label inside would be text inside a square the width of an icon. A trigger with no name
stays anonymous, and the system cannot detect that for them.

And the rail bets that the icons are understood. A collapsed sidebar is usable to the extent that its
icons mean something without their label, which is true for "home" and false for almost any section with
a name of its own. The component allows starting collapsed; whether that is a good idea belongs to the
consumer, and for most apps the answer is no.
