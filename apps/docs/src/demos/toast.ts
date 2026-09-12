import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";
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
  options: { label: t("toastPage.anatomyLabel"), inert: true },
  slots: {
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
    },
    items: [
      namePart(".sk-toast-region", "block-start"),
      namePart(".sk-callout", "inline-start"),
      namePart(".sk-callout__icon", "inline-start"),
      namePart(".sk-callout__content", "inline-end", { ringPlacement: "offset", ringDistance: 6 }),
      namePart(".sk-callout__title", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-callout__description", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-callout__actions", "block-end"),
      namePart(".sk-toast__dismiss", "inline-end"),
    ],
  },
});

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
