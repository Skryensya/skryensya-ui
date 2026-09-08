import type { ComponentContract } from "./contract.js";

export const emptyStateParts = {
  root: "sk-empty-state",
  icon: "sk-empty-state__icon",
  title: "sk-empty-state__title",
  description: "sk-empty-state__description",
  actions: "sk-empty-state__actions",
} as const;

/*
 * A region with nothing in it, said on purpose. The title is a real heading rather than styled text,
 * because "no results" IS the heading of that region, and the icon is `aria-hidden` since it
 * repeats what the title already says.
 */
export const emptyStateContract = {
  id: "empty-state",
  css: "@skryensya/core/components/empty-state.css",
  parts: emptyStateParts,
  options: {},

  signatures: {
    EmptyState: {
      intent: ["no-results", "nothing-here-yet", "empty-list", "first-run"],
      host: { element: "section" },
      options: [],
      slots: {
        icon: { accepts: "signature", of: ["Icon"] },
        title: { accepts: "text", required: true },
        description: { accepts: "node" },
        actions: { accepts: "signature", of: ["Button.action", "Button.navigation"] },
      },
      template: {
        element: "section",
        part: "root",
        host: true,
        children: [
          {
            element: "div",
            part: "icon",
            whenGiven: "icon",
            attrs: { "aria-hidden": "true" },
            slot: "icon",
          },
          { element: "h2", part: "title", slot: "title" },
          { element: "div", part: "description", whenGiven: "description", slot: "description" },
          { element: "div", part: "actions", whenGiven: "actions", slot: "actions" },
        ],
      },
      react: { from: "@skryensya/react/empty-state", name: "EmptyState" },
    },
  },
} as const satisfies ComponentContract;
