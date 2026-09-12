import type { UsageTree } from "@skryensya/core/usage-tree";
import { DEMO_IMAGE_FRAME_SRC } from "./image-frame.js";
import type { Translate } from "../i18n";

/*
 * THE ANATOMY SPECIMEN: frozen open markup. A live Megamenu cannot be held open in an inert frame
 * (hover-intent and dismiss close it on the first pointer press). No mount attributes, so
 * `initComponents` never attaches. `data-state="open"` paints the panel; the positioner is forced
 * static in `megamenuAnatomyCss` so the floating panel contributes to Annotated's measured box.
 *
 * Structure matches the emitter on a one-trigger Megamenu with two NavListGroup columns, minus
 * mounts and the shared-ruler machinery the live page uses.
 */
const megamenuAnatomySpecimen = (t: Translate): string => `<nav class="sk-megamenu sk-anchor" aria-label="${t("demo.megamenu.label")}">
  <ul class="sk-megamenu__list" role="list">
    <li class="sk-megamenu__item">
      <button class="sk-megamenu__trigger sk-interactive" type="button" aria-expanded="true" tabindex="-1">
        ${t("demo.megamenu.trigger1")}
      </button>
      <div class="sk-megamenu__positioner sk-anchored sk-megamenu">
        <div class="sk-megamenu__content" data-state="open">
          <div class="sk-nav-list__group" data-heading="">
            <h3 class="sk-nav-list__group-label">${t("demo.megamenu.group1")}</h3>
            <ul class="sk-nav-list__list" role="list">
              <li class="sk-nav-list__item">
                <a class="sk-nav-list__link sk-interactive" href="#">
                  <span class="sk-nav-list__label">${t("demo.megamenu.link1")}</span>
                </a>
              </li>
              <li class="sk-nav-list__item">
                <a class="sk-nav-list__link sk-interactive" href="#">
                  <span class="sk-nav-list__label">${t("demo.megamenu.link2")}</span>
                </a>
              </li>
            </ul>
          </div>
          <div class="sk-nav-list__group" data-heading="">
            <h3 class="sk-nav-list__group-label">${t("demo.megamenu.group2")}</h3>
            <ul class="sk-nav-list__list" role="list">
              <li class="sk-nav-list__item">
                <a class="sk-nav-list__link sk-interactive" href="#">
                  <span class="sk-nav-list__label">${t("demo.megamenu.link4")}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </li>
    <li class="sk-megamenu__item">
      <button class="sk-megamenu__trigger sk-interactive" type="button" aria-expanded="false" tabindex="-1">
        ${t("demo.megamenu.trigger2")}
      </button>
    </li>
  </ul>
</nav>`;

const label = (target: string, side: string, text: string, extra = ""): string =>
  `<span class="sk-annotation" data-for="${target}" data-side="${side}" data-match="first"${extra} tabindex="0">${text}</span>`;

export const megamenuAnatomyHtml = (t: Translate): string => `<div
  class="sk-annotated"
  data-sk-annotated
  aria-label="${t("megamenuPage.anatomyLabel")}"
  data-ring-placement="inset"
  data-ring-distance="2"
  role="group"
>
  <div class="sk-annotated__subject" inert>
    ${megamenuAnatomySpecimen(t)}
  </div>
  ${label(".sk-megamenu", "block-start", "sk-megamenu", ' data-ring-placement="offset" data-ring-distance="8"')}
  ${label(".sk-megamenu__list", "inline-start", "sk-megamenu__list")}
  ${label(".sk-megamenu__item", "inline-start", "sk-megamenu__item", ' data-ring-placement="offset" data-ring-distance="2"')}
  ${label(".sk-megamenu__trigger", "inline-end", "sk-megamenu__trigger")}
  ${label(".sk-megamenu__positioner", "inline-start", "sk-megamenu__positioner")}
  ${label(".sk-megamenu__content", "inline-end", "sk-megamenu__content")}
  ${label(".sk-nav-list__group", "inline-start", "sk-nav-list__group", ' data-ring-placement="offset" data-ring-distance="3"')}
  ${label(".sk-nav-list__link", "inline-end", "sk-nav-list__link", ' data-ring-placement="offset" data-ring-distance="2"')}
  <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
</div>`;

export const megamenuAnatomyCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-megamenu {
  display: grid;
  justify-items: stretch;
  gap: var(--space-stack-md);
  inline-size: min(100%, 28rem);
}

.sk-annotated__subject > .sk-megamenu > .sk-megamenu__list {
  display: flex;
  gap: var(--space-inline-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.sk-annotated .sk-megamenu__item > .sk-megamenu__positioner {
  position: static;
  inline-size: 100%;
}

.sk-annotated .sk-megamenu__content {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-inline-md);
  padding: var(--space-inset-md);
}

.sk-annotated__subject {
  text-align: center;
}`;

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
