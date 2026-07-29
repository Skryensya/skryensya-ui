import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { initComponents } from "@skryensya/vanilla/auto";
import { mountIcons } from "@skryensya/vanilla/icon";
import { phosphorIcons } from "@skryensya/icons-phosphor";
import { canonicalTrees } from "../src/trees.js";
import { renderTree, setPortalContainer } from "./react-render.js";

import "@skryensya/core/tokens.scss";
import "@skryensya/core/components/tag.css";
import "@skryensya/core/components/progress.css";
import "@skryensya/core/components/avatar.css";
import "@skryensya/core/components/typography.css";
import "@skryensya/core/patterns/layout.css";
import "@skryensya/core/patterns/box.css";
import "@skryensya/core/patterns/wrapper.css";
import "@skryensya/core/components/breadcrumb.css";
import "@skryensya/core/components/empty-state.css";
import "@skryensya/core/components/stat.css";
import "@skryensya/core/components/alert.css";
import "@skryensya/core/components/process-list.css";
import "@skryensya/core/components/steps.css";
import "@skryensya/core/components/list.css";
import "@skryensya/core/components/navbar.css";
import "@skryensya/core/components/toolbar.css";
import "@skryensya/core/patterns/media-gradient.css";
import "@skryensya/core/components/segmented.css";
import "@skryensya/core/components/slider.css";
import "@skryensya/core/components/number-field.css";
import "@skryensya/core/components/pagination.css";
import "@skryensya/core/components/accordion.css";
import "@skryensya/core/components/tile.css";
import "@skryensya/core/components/theme-toggle.css";
import "@skryensya/core/components/toast.css";
import "@skryensya/core/components/tooltip.css";
import "@skryensya/core/patterns/anchored.css";
import "@skryensya/core/components/badge.css";
import "@skryensya/core/components/kbd.css";
import "@skryensya/core/components/loader.css";
import "@skryensya/core/components/placeholder.css";
import "@skryensya/core/components/button.css";
import "@skryensya/core/patterns/nav-list.css";
import "@skryensya/core/patterns/image-frame.css";
import "@skryensya/core/components/checkbox.css";
import "@skryensya/core/components/radio-group.css";
import "@skryensya/core/components/switch.css";
import "@skryensya/core/components/field.css";
import "@skryensya/core/components/input.css";
import "@skryensya/core/components/table.css";
import "@skryensya/core/components/tabs.css";
import "@skryensya/core/patterns/icon.css";
import "@skryensya/core/patterns/state-layer.css";
import "./stage.css";

/*
 * The G2 stage. Every canonical tree gets rendered TWICE into the same page — once as authored markup
 * hydrated by the Vanilla enhancer, once by the React binding — and the test compares the two.
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
     * within the whole document when they have none — so the two bindings' copies of one radio group
     * were a single group, and whichever mounted last unchecked the other. A stage that renders both
     * bindings at once has to scope anything the platform groups by name.
     */
    const vanilla = document.createElement("form");
    vanilla.dataset.binding = "vanilla";
    vanilla.innerHTML = emitMarkup(tree);

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

  // One pass over the whole document: the enhancers find every authored root at once.
  await initComponents();

  /*
   * Binding an icon set is a separate, deliberate step — `initComponents` does not take one, because
   * the system ships no geometry and choosing a set is an install (decision 15). Until this runs, the
   * authored markup holds a `<span data-sk-icon>` placeholder and nothing draws it. React's binding
   * defaults to Phosphor, so the gate binds Phosphor here for the same reason: to compare the two
   * paths, both have to have made the same choice.
   */
  mountIcons(document.body, phosphorIcons);

  document.body.dataset.ready = "true";
}

stage().catch((error: unknown) => {
  window.gateError = error instanceof Error ? error.message : String(error);
  document.body.dataset.ready = "error";
});
