import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";
import dismissScript from "./scripts/toast-dismiss.ts?raw";
import emitScript from "./scripts/toast-emit.ts?raw";
import stackScript from "./scripts/toast-stack.ts?raw";

/*
 * Region plus one full toast: icon, title, description, actions and dismiss. Toast reuses Callout
 * parts for everything but dismiss, so the labels name both sheets on purpose.
 */
export const toastAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("toastPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "content",
      signature: "ToastRegion",
      attrs: { "data-stack": "off" },
      children: {
        contract: "content",
        signature: "Toast",
        options: {
          tone: "info",
          dismissible: true,
          dismissLabel: t("demo.toast.dismiss"),
        },
        slots: {
          icon: { contract: "icon", signature: "Icon", options: { name: "info" } },
          title: t("anatomy.title"),
          actions: {
            contract: "button",
            signature: "Button.action",
            options: { size: "sm", variant: "solid" },
            children: t("anatomy.action"),
          },
        },
        children: t("anatomy.description"),
      },
    },
    items: [
      /* Unlike Callout's, a toast's actions and dismiss sit BESIDE the text, on its inline-end edge.
         Naming the text parts from that side (as Callout does) drew every leader across the buttons,
         so the text parts are named from above and below and the inline-end is left to dismiss. */
      namePart(".sk-toast-region", "block-start", { mark: "bracket" }),
      namePart(".sk-callout", "inline-start"),
      namePart(".sk-callout__icon", "inline-start"),
      namePart(".sk-callout__title", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-callout__content", "block-end", { ringPlacement: "offset", ringDistance: 6 }),
      namePart(".sk-callout__description", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-callout__actions", "block-end", { ringPlacement: "offset", ringDistance: 3 }),
      namePart(".sk-toast__dismiss", "inline-end"),
    ],
  },
});

/*
 * Fixed region -> static box, the same move `vaulAnatomyCss` makes for its edge panel. The region is
 * `position: fixed` to a screen corner, and inside Annotated's zoomable canvas that corner is the
 * canvas's own: the toast landed half outside the drawing and every marker was measured against a
 * box that was not where it was painted. In flow, at the width a real region gives it.
 */
export const toastAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-toast-region {
  position: static;
  inset: auto;
  translate: none;
  inline-size: min(100%, 24rem);
}
`;

/* Static and runtime Toast compositions share the same emitted anatomy. */
export const toastSimpleTree = (t: Translate): UsageTree => ({
  contract: "content",
  signature: "ToastRegion",
  children: {
    contract: "content",
    signature: "Toast",
    options: {
      dismissible: true,
      dismissLabel: t("demo.toast.dismiss"),
    },
    children: t("demo.toast.linkCopied"),
  },
});

export const toastActionTree = (t: Translate): UsageTree => ({
  contract: "content",
  signature: "ToastRegion",
  children: {
    contract: "content",
    signature: "Toast",
    options: {
      dismissible: true,
      dismissLabel: t("demo.toast.dismiss"),
    },
    slots: {
      title: t("demo.toast.documentArchived"),
      actions: {
        contract: "button",
        signature: "Button.action",
        options: { size: "sm", variant: "solid" },
        children: t("demo.toast.undo"),
      },
    },
    children: t("demo.toast.movedToArchived"),
  },
});


export const toastEmitTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md", align: "start" },
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "accent" },
      attrs: { "data-emit-toast": "" },
      children: t("demo.toast.emit"),
    },
    {
      contract: "content",
      signature: "ToastRegion",
      attrs: { "data-emit-region": "" },
    },
    {
      contract: "content",
      signature: "ToastTemplate",
      attrs: { "data-toast-template": "" },
      children: {
        contract: "content",
        signature: "Toast",
        options: { dismissible: true, dismissLabel: t("demo.toast.dismiss"), timeout: 4000 },
        children: t("demo.toast.dynamic"),
      },
    },
  ],
});

/* Two files, joined: emitting a toast and dismissing one are separate concerns the demo needs both of. */
export const toastEmitScript = `${emitScript}\n${dismissScript}`;

export const toastStatusTree = (t: Translate): UsageTree => ({
  contract: "content",
  signature: "ToastRegion",
  attrs: { "data-stack": "off" },
  children: [
    {
      contract: "content",
      signature: "Toast",
      options: { tone: "info", timeout: 6000 },
      slots: {
        icon: { contract: "icon", signature: "Icon", options: { name: "info" } },
        title: t("demo.toast.syncing"),
      },
      children: t("demo.toast.syncingBody"),
    },
    {
      contract: "content",
      signature: "Toast",
      options: { tone: "success", dismissible: true, dismissLabel: t("demo.toast.dismiss") },
      slots: {
        icon: { contract: "icon", signature: "Icon", options: { name: "success" } },
        title: t("demo.toast.deploymentCreated"),
      },
      children: t("demo.toast.deploymentCreatedBody"),
    },
    {
      contract: "content",
      signature: "Toast",
      options: { tone: "danger", dismissible: true, dismissLabel: t("demo.toast.dismiss") },
      slots: {
        icon: { contract: "icon", signature: "Icon", options: { name: "danger" } },
        title: t("demo.toast.connectionFailed"),
      },
      children: t("demo.toast.connectionFailedBody"),
    },
  ],
});

export const toastStatusScript = dismissScript;

export const toastStackTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md", align: "start" },
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "accent" },
      attrs: { "data-stack-add": "" },
      children: t("demo.toast.emit"),
    },
    {
      contract: "content",
      signature: "ToastRegion",
      attrs: { "data-stack-region": "" },
      children: [
        t("demo.toast.stack.first"),
        t("demo.toast.stack.second"),
        t("demo.toast.stack.third"),
      ].map((message) => ({
        contract: "content",
        signature: "Toast",
        options: { dismissible: true, dismissLabel: t("demo.toast.dismiss") },
        children: message,
      })),
    },
  ],
});

export const toastStackScript = `${stackScript}\n${dismissScript}`;
