import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Layout's demos, one export per page — Box, Stack, Inline, Primitives and Grid basic. Multicol
 * stays authored: `data-multicol` is not a declared option.
 */

/** A surface with a heading, a line of prose and an action: the three things Box has to hold up. */
export const boxTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "lg" },
  children: [
    { contract: "typography", signature: "Heading", children: t("demo.box.title") },
    { contract: "typography", signature: "Text", children: t("demo.box.body") },
    { contract: "button", signature: "Button.action", children: t("demo.box.action") },
  ],
});

/** A short status summary with a locale-owned destination. */
export const stackTree = (t: Translate, href: string): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md", align: "start" },
  attrs: { "aria-labelledby": "stack-demo-title" },
  children: [
    {
      contract: "typography",
      signature: "Heading",
      options: { headingSize: "h2" },
      attrs: { id: "stack-demo-title" },
      children: t("demo.stack.title"),
    },
    { contract: "typography", signature: "Text", children: t("demo.stack.body") },
    {
      contract: "typography",
      signature: "Link",
      options: { href },
      children: t("demo.stack.action"),
    },
  ],
});

/** A project summary and its actions, composed from the three flow primitives. */
export const inlineTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "lg" },
  attrs: { "aria-labelledby": "project-title" },
  children: {
    contract: "layout",
    signature: "Inline",
    options: { gap: "md", inlineAlign: "center", justify: "between" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "none" },
        children: [
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "h4" },
            attrs: { id: "project-title" },
            children: t("demo.inline.title"),
          },
          {
            contract: "typography",
            signature: "Text",
            options: { size: "sm", tone: "secondary" },
            children: t("demo.inline.status"),
          },
        ],
      },
      {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm", wrap: false },
        children: [
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "ghost" },
            children: t("demo.inline.preview"),
          },
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "primary" },
            children: t("demo.inline.publish"),
          },
        ],
      },
    ],
  },
});

/**
 * A raised summary beside a three-column grid: the layout + typography vocabulary on one stage.
 * Locale-owned destination comes from the page.
 */
export const primitivesTree = (t: Translate, href: string): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "lg" },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { surface: "raised", border: "subtle", padding: "lg" },
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "md" },
        children: [
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "sm" },
            children: t("demo.primitives.title"),
          },
          {
            contract: "typography",
            signature: "Text",
            options: { tone: "secondary" },
            children: t("demo.primitives.body"),
          },
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm", inlineAlign: "baseline" },
            children: [
              {
                contract: "typography",
                signature: "Link",
                options: { href },
                children: t("demo.primitives.action"),
              },
              {
                contract: "typography",
                signature: "Text",
                options: { size: "caption" },
                children: t("demo.primitives.updated"),
              },
            ],
          },
        ],
      },
    },
    {
      contract: "layout",
      signature: "Grid",
      options: { columns: "3", gap: "md" },
      children: [
        {
          contract: "box",
          signature: "Box",
          options: { surface: "surface", border: "subtle", padding: "md" },
          children: t("demo.primitives.cell.first"),
        },
        {
          contract: "box",
          signature: "Box",
          options: { surface: "surface", border: "subtle", padding: "md" },
          children: t("demo.primitives.cell.second"),
        },
        {
          contract: "box",
          signature: "Box",
          options: { surface: "surface", border: "subtle", padding: "md" },
          children: t("demo.primitives.cell.third"),
        },
      ],
    },
  ],
});

/** Three equal columns of project cards. Product names stay written. */
export const gridTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md" },
  attrs: { "aria-label": t("demo.grid.label") },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "md" },
      children: "Atlas",
    },
    {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "md" },
      children: "Brisa",
    },
    {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "md" },
      children: "Cauce",
    },
  ],
});
