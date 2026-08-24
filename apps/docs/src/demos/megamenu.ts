import type { UsageTree } from "@skryensya/core/usage-tree";
import { DEMO_IMAGE_FRAME_SRC } from "./image-frame.js";
import type { Translate } from "../i18n";

/*
 * Two categories, `Producto` (4 columns) and `Recursos` (3 columns). Both inside the contract's
 * documented 2-4 range, and different enough from each other that the ruler's own constant-height
 * behavior visibly does something. Every links column is `NavListGroup` with `heading: true` (a real
 * `<h3>`, see `nav-list.ts`'s own doc). The same component NavList uses for its sidebar/navbar
 * groups, not a second description of one. Each trigger's LAST column is an `ImageFrame`
 * (`image-frame.ts`), the contract's own worked example of `columns`' OTHER accepted signature. A
 * media column, not a links column, proving `columns` was never NavListGroup-only by construction.
 *
 * EVERY link carries `data-sk-megamenu-preview` (`megamenu.ts`'s own `attrs` escape hatch, no
 * contract change needed; see that constant's own doc), each a differently-colored placeholder:
 * hovering or focusing one swaps ITS trigger's image, reverting to the trigger's own authored default
 * the instant focus/hover leaves every preview link.
 */
export const megamenuTree = (
  t: Translate,
  hrefs: { overview: string; pricing: string; integrations: string; teams: string; enterprise: string },
): UsageTree => ({
  contract: "megamenu",
  signature: "Megamenu",
  options: { label: t("demo.megamenu.label") },
  children: [
    {
      contract: "megamenu",
      signature: "MegamenuTrigger",
      children: t("demo.megamenu.trigger1"),
      slots: {
        columns: [
          {
            contract: "nav-list",
            signature: "NavListGroup",
            options: { heading: true },
            slots: { label: t("demo.megamenu.group1") },
            children: [
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: hrefs.overview },
                attrs: {
                  "data-sk-megamenu-preview": "https://dummyimage.com/800x500/60a5fa/1e3a8a.png",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link1"),
              },
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: hrefs.pricing },
                attrs: {
                  "data-sk-megamenu-preview": "https://dummyimage.com/800x500/4ade80/14532d.png",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link2"),
              },
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: hrefs.integrations },
                attrs: {
                  "data-sk-megamenu-preview": "https://dummyimage.com/800x500/fb923c/7c2d12.png",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link3"),
              },
            ],
          },
          {
            contract: "nav-list",
            signature: "NavListGroup",
            options: { heading: true },
            slots: { label: t("demo.megamenu.group2") },
            children: [
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: hrefs.teams },
                attrs: {
                  "data-sk-megamenu-preview": "https://dummyimage.com/800x500/c084fc/581c87.png",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link4"),
              },
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: hrefs.enterprise },
                attrs: {
                  "data-sk-megamenu-preview": "https://dummyimage.com/800x500/f472b6/831843.png",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link5"),
              },
            ],
          },
          {
            contract: "nav-list",
            signature: "NavListGroup",
            options: { heading: true },
            slots: { label: t("demo.megamenu.group3") },
            children: [
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "https://dummyimage.com/800x500/fbbf24/78350f.png",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link6"),
              },
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "https://dummyimage.com/800x500/2dd4bf/134e4a.png",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link7"),
              },
            ],
          },
          {
            contract: "image-frame",
            signature: "ImageFrame",
            options: { aspect: "4/3", fit: "cover", radius: "surface", src: DEMO_IMAGE_FRAME_SRC, alt: "" },
          },
        ],
      },
    },
    {
      contract: "megamenu",
      signature: "MegamenuTrigger",
      children: t("demo.megamenu.trigger2"),
      slots: {
        columns: [
          {
            contract: "nav-list",
            signature: "NavListGroup",
            options: { heading: true },
            slots: { label: t("demo.megamenu.group3") },
            children: [
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "https://dummyimage.com/800x500/fbbf24/78350f.png",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link6"),
              },
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "https://dummyimage.com/800x500/2dd4bf/134e4a.png",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link7"),
              },
            ],
          },
          {
            contract: "nav-list",
            signature: "NavListGroup",
            options: { heading: true },
            slots: { label: t("demo.megamenu.group4") },
            children: [
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "https://dummyimage.com/800x500/f87171/7f1d1d.png",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link8"),
              },
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "https://dummyimage.com/800x500/94a3b8/1e293b.png",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link9"),
              },
            ],
          },
          {
            contract: "image-frame",
            signature: "ImageFrame",
            options: { aspect: "4/3", fit: "cover", radius: "surface", src: DEMO_IMAGE_FRAME_SRC, alt: "" },
          },
        ],
      },
    },
  ],
});
