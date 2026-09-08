/*
 * The shared machines, a single source for both bindings.
 *
 * A stateful component has ONE state machine, not two. It used to live duplicated: React took it from
 * Zag and the vanilla layer reimplemented it by hand, pinned together only by the `*Parts` consts. Here
 * core re-exports Zag's machines, which are framework-agnostic, like everything else in core, so that
 * React (`@zag-js/react`) and the vanilla layer (`@zag-js/svelte`) adapt THE SAME machine. That is the
 * "one machine, two adapters" cut: the behavior has a single owner, and the parts contract is verified
 * against the machine instead of duplicated in a fixture.
 *
 * COST, said plainly: this gives `@skryensya/core` `dependencies`, the `@zag-js/*` ones. The invariant
 * "core has no deps" (which supported, among other things, the argument for why an icon set cannot live
 * in core) stops being true. It is accepted because a machine is NOT a tenant: it names no brand and no
 * provider, it is platform-agnostic behavior, which is exactly what core publishes. An icon's geometry
 * still cannot live here; a machine can. See ADR-0010.
 */

export * as tabs from "@zag-js/tabs";
export * as carousel from "@zag-js/carousel";
export * as collapsible from "@zag-js/collapsible";
export * as accordion from "@zag-js/accordion";
export * as checkbox from "@zag-js/checkbox";
export * as colorPicker from "@zag-js/color-picker";
export * as radioGroup from "@zag-js/radio-group";
export * as select from "@zag-js/select";
export * as tooltip from "@zag-js/tooltip";
export * as combobox from "@zag-js/combobox";
export * as datePicker from "@zag-js/date-picker";
export * as fileUpload from "@zag-js/file-upload";
export * as menu from "@zag-js/menu";
export * as numberInput from "@zag-js/number-input";
export * as treeView from "@zag-js/tree-view";
export * as slider from "@zag-js/slider";
export * as splitter from "@zag-js/splitter";
