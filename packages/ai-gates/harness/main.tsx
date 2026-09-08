import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { mountComponentsWithIcons } from "@skryensya/vanilla/auto";
import { mountCodePreview } from "@skryensya/vanilla/code-preview";
import { mountEditor } from "@skryensya/vanilla/editor";
import { phosphorIcons } from "@skryensya/icons-phosphor";
import { canonicalTrees } from "../src/trees.js";
import { renderTree, setPortalContainer } from "./react-render.js";

import "@skryensya/core/tokens.scss";

/*
 * EVERY component and pattern stylesheet, globbed rather than listed by hand.
 *
 * The hand-kept list had fallen 26 components and 11 patterns behind, and a stylesheet missing
 * from the stage is not a small thing: the component renders unstyled, so the visual baseline
 * freezes something nobody would ship, and the ACCESSIBILITY TREE changes too. A chart's points
 * ran together into "Sem 138.2K" in React and "Sem 1 38.2K" in vanilla purely because
 * `chart.css`'s grid, the thing that separates those two spans into their own boxes, was never
 * loaded; G2 reported it as a binding divergence, which it never was.
 *
 * A glob cannot fall behind. Relative rather than by package specifier because that is what Vite
 * can enumerate at build time.
 */
import.meta.glob("../../core/css/patterns/*.css", { eager: true });
import.meta.glob("../../core/css/components/*.css", { eager: true });
/* (Folder is one of the sheets that glob now covers. Its silhouette is drawn from numbers the
 * stylesheet publishes as hooks, `--sk-folder-tab-height` and friends, so without it BOTH bindings
 * fall back to `folderGeometryFrom`'s defaults and the gate compares two folders drawn from a
 * stylesheet that was never loaded. That is the failure mode for every sheet above.) */
/* Needed for focus-ring.spec.ts (G5): that gate reads a real computed `outline-style` off a
 * highlighted `.sk-menu__item`, which resolves to nothing without this sheet. Confirmed missing
 * before this addition: `menu/with-submenu` was already a canonical tree and rendered, unstyled,
 * through every existing gate; none of G2/G4/G3's screenshot baseline needed real menu CSS to pass,
 * so the gap went unnoticed until a test needed a computed style. Several other contracts in
 * `trees.ts` (select, combobox, dialog, popover, command-palette, …) have the same gap; out of scope
 * here. This adds only what G5 exercises. */
/* `megamenu/product` (the first canonical tree for this contract) needs this to be genuinely closed
 * at rest: without it, `.sk-megamenu__content`'s unconditional `display: none` default never applies,
 * and the panel paints (and stays in the accessibility tree) whether or not anything is open. Same
 * gap as menu.css above, same fix. */
import "./stage.css";

/*
 * The G2 stage. Every canonical tree gets rendered TWICE into the same page: once as authored markup
 * hydrated by the Vanilla enhancer, once by the React binding, and the test compares the two.
 *
 * Both halves have to reach their FINAL state before anything is read: the enhancer patches
 * attributes after the markup lands, and React commits asynchronously unless told otherwise. So the
 * page sets `data-ready` only once both are done, and the test waits for it rather than for a timer.
 */

declare global {
  interface Window {
    gateError?: string;
  }
}

function label(text: string): HTMLElement {
  const element = document.createElement("p");
  element.className = "stage-label";
  element.ariaHidden = "true";
  element.textContent = text;
  return element;
}

async function stage(): Promise<void> {
  const host = document.getElementById("stage")!;

  for (const { name, tree, enhanced } of canonicalTrees) {
    const block = document.createElement("section");
    block.dataset.case = name;
    block.dataset.enhanced = String(enhanced);

    /*
     * A FORM, not a div, and that is load-bearing. Radios are grouped by name within their form, or
     * within the whole document when they have none, so the two bindings' copies of one radio group
     * were a single group, and whichever mounted last unchecked the other. A stage that renders both
     * bindings at once has to scope anything the platform groups by name.
     */
    const vanilla = document.createElement("form");
    vanilla.dataset.binding = "vanilla";
    /*
     * Every case shares ONE document, so the generated ids are namespaced by case name. Without
     * this, three states of the same recipe emitted the same field id and each label pointed at the
     * first input on the page: a divergence the gate reported as real when it was the stage's own.
     * A real page never needs this: each preview is its own srcdoc document.
     */
    /*
     * PARSED IN A NEUTRAL ELEMENT, then moved: not assigned to the form's own `innerHTML`.
     *
     * The two are not equivalent. The HTML parser drops a `<form>` that appears inside another form,
     * and the stage IS a form for the reason above, so any template containing one lost it silently:
     * `dialog`'s close control is a `<form method="dialog">`, which is the platform's own way to
     * close a dialog with no script, and it simply vanished from this binding while React kept it.
     * G2 reported that as a divergence between the bindings when it was the stage's own doing.
     *
     * The drop is a rule about parsing CONTEXT, not about insertion, so parsing in a plain `<div>`
     * and appending the resulting nodes keeps the form and keeps the radio scoping both.
     */
    const parsed = document.createElement("div");
    parsed.innerHTML = emitMarkup(tree, { idPrefix: name.replace(/[^a-z0-9]+/gi, "-") });
    vanilla.append(...parsed.childNodes);

    const react = document.createElement("form");
    react.dataset.binding = "react";

    // Outside the measured containers and aria-hidden: the harness must not appear in the snapshots
    // it exists to compare.
    block.append(label("vanilla"), vanilla, label("react"), react);
    host.append(block);

    // Scope any portal to THIS binding's container, so the floating content stays in the subtree
    // the gate measures rather than escaping to document.body.
    setPortalContainer({ current: react });

    // Synchronous commit, so the DOM is final by the time the loop moves on.
    flushSync(() => createRoot(react).render(renderTree(tree)));
  }

  /*
   * One pass over the whole document: the enhancers find every authored root at once, and the icon
   * set binds alongside them (`initComponents` never binds one itself, choosing a set is an install,
   * decision 15). React's binding defaults to Phosphor, so the gate binds Phosphor here for the same
   * reason: to compare the two paths, both have to have made the same choice.
   *
   * `mountComponentsWithIcons` is the SAME sequence the docs preview frame boots with (icons, mount,
   * wait a frame, icons again): not a second, adjacent implementation of it. A Svelte enhancer that
   * finishes its DOM commit after `initComponents()`'s own await resolves used to be a race the docs
   * frame defended against and this gate could not see at all; sharing the sequence is what makes a
   * regression in that race show up here too.
   */
  await mountComponentsWithIcons(document, phosphorIcons);

  // Another opt-in mount `initComponents` deliberately excludes (`code-preview.ts`'s own doc):
  // without this, the vanilla side of every code-preview canonical tree never enhances at all, so
  // React and Vanilla only LOOK symmetric because neither's dynamic behavior ever ran.
  mountCodePreview(document.body);
  /*
   * Editor is excluded from `initComponents` for its own reason (`registry.ts`): ProseMirror is an
   * OPTIONAL peer dependency, so `@skryensya/vanilla/auto` must never name it, and a page that uses
   * Editor mounts it explicitly. The stage is such a page. Without this the vanilla editor stayed
   * as the contract emits it, an empty toolbar and a plain div, while React rendered fourteen
   * toolbar buttons and a live ProseMirror: a ~950-line "divergence" that was really one binding
   * never having been started.
   */
  for (const host of document.querySelectorAll<HTMLElement>('[data-binding="vanilla"]')) {
    /* Scoped to the vanilla halves, unlike the mounts above. React's Editor renders the same
     * `data-sk-editor` marker but builds its toolbar in JSX, so it has no `data-sk-toolbar` for the
     * enhancer to find; handed the whole document, the enhancer reaches those too and throws
     * ("necesita un [data-sk-toolbar]"), taking the whole stage down with it. */
    await mountEditor(host);
  }

  document.body.dataset.ready = "true";
}

stage().catch((error: unknown) => {
  window.gateError = error instanceof Error ? error.message : String(error);
  document.body.dataset.ready = "error";
});
