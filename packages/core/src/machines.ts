/*
 * The shared machines, a single source for both bindings.
 *
 * A stateful component has ONE state machine, not two. It used to live duplicated: React took it from
 * Zag and the vanilla layer reimplemented it by hand, pinned together only by the `*Parts` consts. Here
 * core re-exports Zag's machines, which are framework-agnostic, like everything else in core, so that
 * React (`@zag-js/react`) and the vanilla layer (`@zag-js/svelte`) adapt THE SAME machine. That is the
 * "one machine, two adapters" cut: the behavior has a single owner, and the parts contract is verified
 * against the machine instead of duplicated in a fixture. The verifying is
 * `packages/ai-gates/src/machine-parts.test.ts`: every canonical tree in both bindings, every element
 * a machine owns held to that machine's anatomy and to a contract part, and every re-export below
 * required to reach both adapters unless it is named there as single-adapter.
 *
 * COST, said plainly: this gives `@skryensya/core` `dependencies`, the `@zag-js/*` ones. The invariant
 * "core has no deps" (which supported, among other things, the argument for why an icon set cannot live
 * in core) stops being true. It is accepted because a machine is NOT a tenant: it names no brand and no
 * provider, it is platform-agnostic behavior, which is exactly what core publishes. An icon's geometry
 * still cannot live here; a machine can. See ADR-0010.
 *
 * WHAT IS NOT HERE, and why. ADR-0010's cut is "one machine, TWO adapters". Three re-exports did
 * not meet it and were costing every consumer of Core a dependency for nothing:
 *   - `accordion` had zero importers anywhere. `Accordion.svelte` says in prose that it runs one
 *     `@zag-js/collapsible` per item INSTEAD of a single accordion machine, and the re-export
 *     simply outlived that decision.
 * `carousel` and `splitter` stay, with a note: each has exactly ONE adapter today (both Vanilla),
 * so by ADR-0010's own "two adapters" test they are not yet earning this place. Moving them to
 * Vanilla was tried and reverted: pnpm re-resolves a dependency that moves package, and the 30-day
 * `minimumReleaseAge` quarantine then refuses it. An exclusion exists for CVEs, not for tidiness.
 */

export * as tabs from "@zag-js/tabs";
export * as tagsInput from "@zag-js/tags-input";
export * as carousel from "@zag-js/carousel";
export * as clipboard from "@zag-js/clipboard";
export * as collapsible from "@zag-js/collapsible";
export * as checkbox from "@zag-js/checkbox";
export * as colorPicker from "@zag-js/color-picker";
export * as radioGroup from "@zag-js/radio-group";
export * as ratingGroup from "@zag-js/rating-group";
export * as pinInput from "@zag-js/pin-input";
export * as passwordInput from "@zag-js/password-input";
export * as select from "@zag-js/select";
export * as tooltip from "@zag-js/tooltip";
export * as combobox from "@zag-js/combobox";
export * as datePicker from "@zag-js/date-picker";
export * as fileUpload from "@zag-js/file-upload";
export * as listbox from "@zag-js/listbox";
export * as menu from "@zag-js/menu";
export * as numberInput from "@zag-js/number-input";
export * as treeView from "@zag-js/tree-view";
export * as slider from "@zag-js/slider";
export * as splitter from "@zag-js/splitter";
export * as floatingPanel from "@zag-js/floating-panel";
