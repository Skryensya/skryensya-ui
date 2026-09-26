import { fadeEdgeAttrs } from "@skryensya/core/fade-edge";
import { watchFadeEdge } from "@skryensya/core/fade-edge-dom";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * FADE EDGE, the opt-in scroll watcher. A plain FadeEdge is paint and never reaches this file:
 * the registry only loads it for roots that carry `data-scroll-aware`. The watching itself is
 * core's `watchFadeEdge`, the same call React's effect makes, so both bindings retire the fade on
 * the same pixel.
 */
const rootSelector = `[${fadeEdgeAttrs.mount}][${fadeEdgeAttrs.scrollAware}]`;

export const mountFadeEdge = createConnectMount({ key: "fade-edge", rootSelector, connect: watchFadeEdge });
