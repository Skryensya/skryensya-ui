import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * THE ANATOMY, and the one thing a Callout's parts have in common is that almost none of them are
 * boxes. The panel is (its own border, its own inset), and the icon is (a 36px cell around a
 * 24px glyph). Everything else is text or a row that hugs its contents, so the inset ring that is
 * right on a panel lands on the glyphs of a title. Those go OUTSIDE, at three distances rather than
 * one: the title and the description hug their own text at 2, and `sk-callout__content`, which is
 * the box holding exactly those two, stands off at 6 so it reads as the wrapper around them instead
 * of a third line drawn a hairline away from both.
 *
 * THE CONTENT WRAPPER IS NAMED FROM THE SAME GUTTER AS WHAT IT WRAPS, which looks like crowding and
 * is the opposite. Named from the start gutter it would have to reach its own LEFT edge, and that
 * edge sits immediately beside the icon: every version of that drawing ran a leader straight across
 * the glyph the diagram had just finished pointing at. From the end gutter the three leaders arrive
 * at three stacked edges with nothing between them and the frame.
 *
 * The specimen is the `info` tone with every optional part supplied (icon, title, actions), because
 * a diagram that names a part the drawing does not contain is worse than a diagram that omits it.
 * It is drained to grey like every other specimen here: THIS drawing is about the parts, and the
 * tones have four live panels of their own further down the page.
 */
export const calloutAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("callout.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "callout",
      signature: "Callout",
      options: { tone: "info" },
      slots: {
        icon: { contract: "icon", signature: "Icon", options: { name: "info" } },
        title: t("demo.callout.info.title"),
        actions: {
          contract: "button",
          signature: "Button.action",
          options: { variant: "translucent" },
          children: t("demo.callout.success.action"),
        },
      },
      children: t("demo.callout.info.body"),
    },
    items: [
      /* The panel and the icon cell are the two parts with air of their own, so both keep the inset
         default: a ring just inside an edge that exists. */
      { options: { for: ".sk-callout", side: "block-start" }, slots: { children: "sk-callout" } },
      { options: { for: ".sk-callout__icon", side: "inline-start" }, slots: { children: "sk-callout__icon" } },
      {
        options: {
          for: ".sk-callout__content",
          side: "inline-end",
          ringPlacement: "offset",
          ringDistance: 6,
        },
        slots: { children: "sk-callout__content" },
      },
      {
        options: {
          for: ".sk-callout__title",
          side: "inline-end",
          ringPlacement: "offset",
          ringDistance: 2,
        },
        slots: { children: "sk-callout__title" },
      },
      {
        options: {
          for: ".sk-callout__description",
          side: "inline-end",
          ringPlacement: "offset",
          ringDistance: 2,
        },
        slots: { children: "sk-callout__description" },
      },
      {
        options: {
          for: ".sk-callout__actions",
          side: "block-end",
          ringPlacement: "offset",
          ringDistance: 3,
        },
        slots: { children: "sk-callout__actions" },
      },
    ],
  },
});

/*
 * One visual weight, four tones, and no way to dismiss any of them. Callout is purely
 * informational: it shows something, it does not run anything, so there is no `dismissible` here to
 * demonstrate. The one interactive piece a Callout can carry is a recovery action, and the contract
 * narrows its `variant` to `subtle`/`danger` so it never reads as a second, competing action button.
 */

/** The default: surface and border, no semantic paint, and no action, ever. */
export const calloutNeutralTree = (t: Translate): UsageTree => ({
  contract: "callout",
  signature: "Callout",
  options: { tone: "neutral" },
  slots: { title: t("demo.callout.neutral.title") },
  children: t("demo.callout.neutral.body"),
});

/** A title beside the content it explains: a condition worth naming, not just describing. */
export const calloutInfoTree = (t: Translate): UsageTree => ({
  contract: "callout",
  signature: "Callout",
  options: { tone: "info" },
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: "info" } },
    title: t("demo.callout.info.title"),
  },
  children: t("demo.callout.info.body"),
});

/** A recovery path as a plain Link: a destination, not a command. */
export const calloutWarningTree = (t: Translate): UsageTree => ({
  contract: "callout",
  signature: "Callout",
  options: { tone: "warning" },
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: "warning" } },
    title: t("demo.callout.warning.title"),
    actions: {
      contract: "typography",
      signature: "Link",
      options: { href: "/billing" },
      children: t("demo.callout.warning.action"),
    },
  },
  children: t("demo.callout.warning.body"),
});

/** A recovery action as a Button: `translucent`, which blends with the callout's colored background. */
export const calloutSuccessTree = (t: Translate): UsageTree => ({
  contract: "callout",
  signature: "Callout",
  options: { tone: "success" },
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: "success" } },
    actions: {
      contract: "button",
      signature: "Button.action",
      options: { variant: "translucent" },
      children: t("demo.callout.success.action"),
    },
  },
  children: t("demo.callout.success.body"),
});
