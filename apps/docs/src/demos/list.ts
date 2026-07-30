import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * THE LADDER. Each demo adds exactly one slot to the one before it, so the page reads as an anatomy
 * being assembled rather than as six finished screens.
 *
 * Step 1 of that ladder — a bare `<li>` with nothing but text — is NOT here: `ListItem` declares
 * `title` as a required slot and has no `children`, so "a row with no slots at all" is precisely the
 * thing the contract cannot say. It is the floor the page exists to show, and it stays authored.
 */

/** The rows the middle of the ladder repeats, so a step differs from the last one by one field. */
const preferences = (t: Translate) =>
  [
    ["notifications", "info"],
    ["timezone", "calendar"],
    ["language", "settings"],
    ["dateFormat", "calendar"],
    ["homePage", "visibility"],
  ] as const;

/** 2 — The content column: title over description. No icons, no trailing. */
export const listTitledTree = (t: Translate): UsageTree => ({
  contract: "list",
  signature: "List",
  attrs: { "aria-label": t("demo.list.preferences") },
  children: preferences(t).map(([key]) => ({
    contract: "list",
    signature: "ListItem",
    slots: {
      title: t(`demo.list.${key}.title` as never),
      description: t(`demo.list.${key}.description` as never),
    },
  })),
});

/** 3 — Leading media. The icon is DECORATIVE: it names nothing the title does not already say. */
export const listLeadingTree = (t: Translate): UsageTree => ({
  contract: "list",
  signature: "List",
  attrs: { "aria-label": t("demo.list.preferences") },
  children: preferences(t).map(([key, icon]) => ({
    contract: "list",
    signature: "ListItem",
    slots: {
      leading: { contract: "icon", signature: "Icon", options: { name: icon } },
      title: t(`demo.list.${key}.title` as never),
      description: t(`demo.list.${key}.description` as never),
    },
  })),
});

/** 4 — The row is complete: leading, content and trailing. Still static, still no interaction. */
export const listTrailingTree = (t: Translate): UsageTree => ({
  contract: "list",
  signature: "List",
  attrs: { "aria-label": t("demo.list.preferences") },
  children: preferences(t).map(([key, icon], i) => ({
    contract: "list",
    signature: "ListItem",
    slots: {
      leading: { contract: "icon", signature: "Icon", options: { name: icon } },
      title: t(`demo.list.${key}.title` as never),
      description: t(`demo.list.${key}.description` as never),
      /* The first row's trailing is a component, the rest are plain values — which is the point:
       * `trailing` accepts a node, so a Badge and a string are equally legal there. */
      trailing:
        i === 0
          ? {
              contract: "badge",
              signature: "Badge",
              options: { tone: "success" },
              children: t("demo.list.active"),
            }
          : t(`demo.list.${key}.value` as never),
    },
  })),
});

/*
 * 5 — The row starts acting. Same anatomy wrapped in a real anchor, so focus, keyboard and the state
 * layer come free and List still owns no navigation state.
 *
 * The hrefs come from the page: they point at real docs routes, which differ per locale.
 */
export const listLinksTree = (t: Translate, hrefs: readonly string[]): UsageTree => ({
  contract: "list",
  signature: "List",
  attrs: { "aria-label": t("demo.list.resources") },
  children: (
    [
      ["prerequisites", "info"],
      ["gettingStarted", "info"],
      ["customization", "settings"],
      ["tokenReference", "copy"],
      ["tiers", "copy"],
    ] as const
  ).map(([key, icon], i) => ({
    contract: "list",
    signature: "ListItemLink",
    options: { href: hrefs[i]! },
    slots: {
      leading: { contract: "icon", signature: "Icon", options: { name: icon } },
      title: t(`demo.list.${key}.title` as never),
      description: t(`demo.list.${key}.description` as never),
      trailing: { contract: "icon", signature: "Icon", options: { name: "arrow-right" } },
    },
  })),
});

/*
 * 6 — The top: interactive rows, a component in each end slot, and compact density.
 *
 * The page's own version ends with a DISABLED row, and that row is not here: `disabled` is an option
 * of `ListItem` and not of `ListItemLink`, so a link that is disabled has no expression. The demo
 * keeps four rows instead of five, and the disabled state is taught by `ListItem` above.
 */
export const listFullTree = (t: Translate, hrefs: readonly string[]): UsageTree => ({
  contract: "list",
  signature: "List",
  options: { density: "compact" },
  attrs: { "aria-label": t("demo.list.team") },
  children: (
    [
      ["allison", "design"],
      ["mateo", "engineering"],
      ["elena", "product"],
      ["nadia", "product"],
    ] as const
  ).map(([person, area], i) => ({
    contract: "list",
    signature: "ListItemLink",
    options: { href: hrefs[i]! },
    slots: {
      leading: { contract: "icon", signature: "Icon", options: { name: "user" } },
      title: t(`demo.list.${person}.name` as never),
      description: t(`demo.list.${person}.role` as never),
      trailing: [
        { contract: "badge", signature: "Badge", children: t(`demo.list.area.${area}` as never) },
        { contract: "icon", signature: "Icon", options: { name: "arrow-right" } },
      ],
    },
  })),
});
