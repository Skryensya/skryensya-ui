import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

const mediaSrc = "/demos/media-gradient.svg";

const publicationPlaceholder = (): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { border: "subtle", padding: "lg", surface: "surface" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "image-frame",
        signature: "ImageFrame",
        options: { aspect: "16/9", border: "subtle", radius: "control" },
        children: {
          contract: "placeholder",
          signature: "Placeholder",
          options: { shape: "block" },
          attrs: { class: "sk-image-frame__media placeholder-example__media" },
        },
      },
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "sm" },
        children: [
          {
            contract: "placeholder",
            signature: "Placeholder",
            attrs: { class: "placeholder-example__line--eyebrow" },
          },
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              {
                contract: "placeholder",
                signature: "Placeholder",
                attrs: { class: "placeholder-example__line--title" },
              },
              {
                contract: "placeholder",
                signature: "Placeholder",
                attrs: { class: "placeholder-example__line--title-short" },
              },
            ],
          },
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              {
                contract: "placeholder",
                signature: "Placeholder",
                attrs: { class: "placeholder-example__line--body" },
              },
              {
                contract: "placeholder",
                signature: "Placeholder",
                attrs: { class: "placeholder-example__line--body-short" },
              },
            ],
          },
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm", inlineAlign: "center" },
            children: [
              {
                contract: "placeholder",
                signature: "Placeholder",
                options: { shape: "circle" },
                attrs: { class: "placeholder-example__avatar" },
              },
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "xs" },
                attrs: { class: "placeholder-example__byline-copy" },
                children: [
                  { contract: "placeholder", signature: "Placeholder" },
                  { contract: "placeholder", signature: "Placeholder" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});

const publicationContent = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { border: "subtle", padding: "lg", surface: "surface" },
  attrs: { "aria-labelledby": "publication-title", role: "article" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "image-frame",
        signature: "ImageFrame",
        options: {
          alt: "",
          aspect: "16/9",
          border: "subtle",
          fit: "cover",
          radius: "control",
          src: mediaSrc,
        },
      },
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "sm" },
        children: [
          {
            contract: "badge",
            signature: "Badge",
            options: { tone: "accent" },
            children: t("demo.placeholder.research"),
          },
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "h3" },
                attrs: { id: "publication-title" },
                children: t("demo.placeholder.title"),
              },
              {
                contract: "typography",
                signature: "Text",
                options: { tone: "secondary" },
                children: t("demo.placeholder.body"),
              },
            ],
          },
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm", inlineAlign: "center" },
            children: [
              {
                contract: "avatar",
                signature: "Avatar.initials",
                options: { name: "Rocio Mora" },
                children: "RM",
              },
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "none" },
                children: [
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { size: "sm", weight: "label" },
                    children: "Rocio Mora",
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { size: "caption", tone: "tertiary" },
                    children: t("demo.placeholder.readTime"),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});

/** Always-pending geometry: the status remains outside the decorative placeholder subtree. */
export const publicationPlaceholderTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  attrs: { "aria-busy": "true", class: "placeholder-example" },
  children: [
    {
      contract: "typography",
      signature: "Text",
      options: { size: "sm", tone: "secondary" },
      attrs: { role: "status" },
      children: t("demo.placeholder.loading"),
    },
    publicationPlaceholder(),
  ],
});

/** Both states occupy one grid area; the frame script changes only state and accessibility attrs. */
export const publicationSwapTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  attrs: { "aria-busy": "true", class: "placeholder-example" },
  children: [
    {
      contract: "typography",
      signature: "Text",
      options: { size: "sm", tone: "secondary" },
      /*
       * BOTH words, on the node that shows them: the script swaps the text after five seconds and
       * reads the second one from `data-loaded` rather than carrying it. A script that carried it
       * would have to be built once per language, which is what it used to be.
       */
      attrs: {
        "aria-live": "polite",
        "data-placeholder-status": "",
        "data-loaded": t("demo.placeholder.loaded"),
        role: "status",
      },
      children: t("demo.placeholder.loading"),
    },
    {
      contract: "box",
      signature: "Box",
      attrs: { class: "placeholder-example__swap", "data-state": "loading" },
      children: [
        {
          contract: "box",
          signature: "Box",
          attrs: { "aria-hidden": "false", "data-placeholder-loading": "" },
          children: publicationPlaceholder(),
        },
        {
          contract: "box",
          signature: "Box",
          attrs: { "aria-hidden": "true", "data-placeholder-content": "" },
          children: publicationContent(t),
        },
      ],
    },
  ],
});

export { default as publicationSwapScript } from "./scripts/placeholder-swap.ts?raw";
