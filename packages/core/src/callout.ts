import type { ComponentContract } from "./contract.js";

/*
 * CALLOUT, a persistent, inline message tied to a region of the page. It shows information; it does
 * not run anything. There is no dismiss control here; closing itself is behaviour, and behaviour is
 * exactly what separates Callout from Toast (see content.ts). A Callout that could dismiss itself
 * would be a Toast that forgot to float, which is the confusion this split exists to end.
 *
 * The two still LOOK related, same panel, same tone recipe, same part names for icon/content/title/
 * description/actions, because Toast really is this anatomy, transiently owned by a floating region.
 * But `dismiss` is not one of the parts they share: Toast has its own, because only Toast has
 * something to dismiss.
 *
 * Formerly "Alert". The name change is not cosmetic: most of this contract's real usage across the
 * docs was never an alert in any meaningful sense; an editorial aside next to a heading, a "by the
 * way" note beside a table; "Alert" carries an urgency the content did not have. `danger` still
 * interrupts (`role="alert"`, assertive) for the minority of cases that ARE a real alert; the name at
 * the top no longer forces that reading onto the majority that are not.
 */
/** `neutral` is the plain message, no semantic color. The rest paint status. */
export type CalloutTone = "neutral" | "info" | "success" | "warning" | "danger";

export type CalloutLiveRegion = "polite" | "assertive";

export const calloutLiveRegions = {
  polite: { ariaLive: "polite", role: "status" },
  assertive: { ariaLive: "assertive", role: "alert" },
} as const;

/** Danger interrupts; everything else waits for a pause. Mirrors Toast (see content.ts). */
export function getCalloutLiveRegion(tone: CalloutTone): CalloutLiveRegion {
  return tone === "danger" ? "assertive" : "polite";
}

export const calloutParts = {
  root: "sk-callout",
  icon: "sk-callout__icon",
  content: "sk-callout__content",
  title: "sk-callout__title",
  description: "sk-callout__description",
  actions: "sk-callout__actions",
} as const;

export type CalloutPart = keyof typeof calloutParts;
export type CalloutPartClass = (typeof calloutParts)[CalloutPart];

/*
 * A message about something that happened, and the one place a tone changes the ACCESSIBILITY rather
 * than just the colour: `danger` becomes an assertive live region, everything else stays polite.
 * That is what `getCalloutLiveRegion` decides, and it is why tone is not merely paint here.
 */
export const calloutContract = {
  id: "callout",
  css: "@skryensya/core/components/callout.css",
  parts: calloutParts,

  options: {
    tone: {
      type: "enum",
      values: ["neutral", "info", "success", "warning", "danger"],
      default: "neutral",
      attr: "data-tone",
    },
  },

  signatures: {
    Callout: {
      intent: ["message", "something-went-wrong", "confirmation", "warning-notice", "aside-note"],
      host: { element: "div" },
      options: ["tone"],
      slots: {
        icon: { accepts: "signature", of: ["Icon"] },
        title: { accepts: "text" },
        children: { accepts: "node", required: true },
        /*
         * A recovery path, and a plain Link is one of its shapes: "Ver planes" beside an expiring
         * plan is a destination, not a command. Restricted to these three because an action row is
         * where a consumer would otherwise put anything at all.
         *
         * `tone` is narrowed to `neutral`/`danger` on any Button here: this row exists for a
         * secondary way forward beside a message, never to plant a second call to action competing
         * with the page's real one. A Callout that wants to look urgent already has its own `tone`.
         *
         * It used to narrow `variant` to `translucent`/`danger`, which was the same rule said in the
         * vocabulary Button had at the time: one enum carried both how loud a button is and what it
         * means, so "no competing CTA" could only be spelled by banning the accent FILL. Now that
         * the two are separate axes, the rule is stated as what it always was about, and the
         * emphasis is left open: a destructive action here can be `solid` so it stands out, and a
         * neutral one can be `translucent` so it blends into the callout's own colour.
         */
        actions: {
          accepts: "signature",
          of: ["Button.action", "Button.navigation", "Link"],
          restrictOptions: { tone: ["neutral", "danger"] },
        },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        /*
         * Tone decides the accessibility here, not just the paint: danger is assertive because it
         * interrupts, everything else is polite because it can wait.
         */
        /*
         * `aria-atomic`, explicit rather than left to the implicit default: the same fix already
         * applied to Toast (`content.ts`), which shares this exact role/aria-live-by-tone mechanism.
         */
        attrsWhen: [
          {
            option: "tone",
            equals: "danger",
            attrs: { role: "alert", "aria-live": "assertive", "aria-atomic": "true" },
          },
          {
            option: "tone",
            notEquals: "danger",
            attrs: { role: "status", "aria-live": "polite", "aria-atomic": "true" },
          },
        ],
        children: [
          { element: "span", part: "icon", whenGiven: "icon", attrs: { "aria-hidden": "true" }, slot: "icon" },
          {
            element: "div",
            part: "content",
            children: [
              { element: "p", part: "title", whenGiven: "title", slot: "title" },
              { element: "div", part: "description", slot: "children" },
            ],
          },
          { element: "div", part: "actions", whenGiven: "actions", children: [{ slot: "actions" }] },
        ],
      },
      react: { from: "@skryensya/react/callout", name: "Callout" },
    },
  },
} as const satisfies ComponentContract;
