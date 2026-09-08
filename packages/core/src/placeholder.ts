import type { ComponentContract, OptionsOf, OptionValue } from "./contract.js";

export const placeholderParts = {
  root: "sk-placeholder",
  line: "sk-placeholder__line",
} as const;

export type PlaceholderPart = keyof typeof placeholderParts;
export type PlaceholderPartClass = (typeof placeholderParts)[PlaceholderPart];

/*
 * THE PRIMITIVE FOR COMPOSING A SPECIFIC SKELETON.
 *
 * A Placeholder is the shape of content that has not arrived. Always `aria-hidden`: a skeleton is a
 * picture of absence, and announcing it would tell a screen-reader user about a thing that is not
 * there. The surrounding region owns `aria-busy` and the loading message.
 *
 * WHAT THIS CONTRACT LEARNED, and why it grew. It used to name GEOMETRY only (`text`, `block`,
 * `circle`) and never what the geometry stands in for, so every author translated meaning into
 * pixels by hand: nine bespoke classes in the docs' own stylesheet, raw
 * `--sk-placeholder-inline-size` styles in the comment-thread demo. Both wrote the same three
 * things, separately: how wide a line runs, how tall a line is for the text it replaces, and how
 * big a circle is for the avatar it replaces.
 *
 * So the options are stated in the vocabulary the author already has, and the stylesheet translates:
 *
 *   - `text="h3"`  a line as tall as an h3's line box, from the SAME token pair Heading reads.
 *                  Not "1.5rem", which is what every call site was guessing at.
 *   - `size="sm"`  a circle as big as an `sm` Avatar, so the swap does not jump.
 *   - `width`      the one genuinely free measure: how far a line of unknown text reaches is the
 *                  composition's business, not the scale's.
 *
 * A skeleton that MATCHES is the whole job. Every hand-tuned rem was a chance for the loading state
 * and the loaded state to disagree, which is the one bug a skeleton exists to prevent.
 */

/**
 * How many lines a paragraph skeleton draws, clamped to something renderable.
 *
 * Pure and shared: React builds this many elements and the emitter expands this many entries
 * (`skeleton-lines`, a `repeatComputed` window), so a count that arrived as `0`, `-3`, `2.7` or
 * `NaN` cannot mean one thing in a component and another in authored markup.
 *
 * The ceiling is not defensive trivia. A skeleton stands in for content someone is about to read,
 * and past a dozen lines it stops predicting a paragraph and starts being a wall of grey that
 * costs more to paint than the content it replaces.
 */
export const PLACEHOLDER_MAX_LINES = 12;

export function placeholderLines(lines: number): number {
  if (!Number.isFinite(lines)) return 1;
  return Math.min(PLACEHOLDER_MAX_LINES, Math.max(1, Math.floor(lines)));
}

/*
 * The type roles a text skeleton can stand in for. Deliberately the SAME words Typography publishes
 * (`Text`'s `size`, `Heading`'s `headingSize`), because the author names the thing being replaced
 * rather than picking a height. A role missing here is a role whose skeleton could not match, so
 * this list tracks Typography's instead of being a convenient subset of it.
 */
const TEXT_ROLES = [
  "caption",
  "sm",
  "body",
  "lg",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "display-sm",
  "display-md",
  "display-lg",
] as const;

const placeholderOptions = {
  /**
   * How far the bar runs: any CSS length or percentage. The one measure the system cannot infer,
   * since how far a line of text-we-do-not-have reaches is composition, not a token.
   */
  width: { type: "string", styleProperty: "--sk-placeholder-inline-size" },
  /**
   * The type role this line replaces. The stylesheet resolves it to the font-size/line-height token
   * PAIR Typography uses, so the skeleton occupies exactly the block the real text will and nothing
   * moves when it arrives.
   */
  text: { type: "enum", values: TEXT_ROLES, default: "body", attr: "data-text" },
  /**
   * The control scale a circle matches: an `sm` Avatar's skeleton is `size="sm"`. The same three
   * steps Avatar and Button publish, for the same reason: a swap must not resize.
   */
  size: { type: "enum", values: ["sm", "md", "lg"], default: "md", attr: "data-size" },
  /** How tall a block runs. Media inside a clipped frame usually wants `fill` instead. */
  height: { type: "string", styleProperty: "--sk-placeholder-block-size" },
  /**
   * Take the parent's whole box and its corner. For a block inside an ImageFrame or any clipped
   * surface: the case that needed two bespoke declarations at every call site
   * (`block-size: 100%` and `border-radius: inherit`).
   */
  fill: { type: "boolean", default: false, attr: "data-fill", trueValue: "" },
  /**
   * How many lines the paragraph runs. Input to the count, not something that lands in the markup:
   * once the lines exist they say it themselves.
   */
  lines: { type: "number", default: 3, attr: "data-lines", computedInput: true },
  /**
   * How far the last line runs. A paragraph ends mid-measure, and that raggedness is the strongest
   * signal that the block is prose rather than a table.
   */
  lastLine: { type: "string", default: "62%", styleProperty: "--sk-placeholder-last-line" },
} as const;

export const placeholderContract = {
  id: "placeholder",
  css: "@skryensya/core/components/placeholder.css",
  parts: placeholderParts,
  options: placeholderOptions,

  signatures: {
    /** One bar standing in for one line of text, sized by the role it replaces. */
    Placeholder: {
      intent: ["loading-skeleton", "content-not-yet-loaded", "shape-of-absent-content", "skeleton-line"],
      host: { element: "span" },
      options: ["text", "width"],
      slots: {},
      template: {
        element: "span",
        part: "root",
        host: true,
        attrs: { "aria-hidden": "true", "data-shape": "text" },
      },
      react: { from: "@skryensya/react/placeholder", name: "Placeholder" },
    },

    /**
     * Several lines with a short last one: the shape of a paragraph that has not loaded, and by far
     * the most repeated skeleton there is. A signature rather than a documented recipe precisely
     * because it was being re-composed by hand at every call site, each with its own idea of the
     * widths.
     */
    "Placeholder.paragraph": {
      intent: ["loading-paragraph", "skeleton-text-block", "multiple-skeleton-lines"],
      host: { element: "span" },
      options: ["text", "lines", "lastLine"],
      slots: {},
      template: {
        element: "span",
        part: "root",
        host: true,
        attrs: { "aria-hidden": "true", "data-shape": "paragraph" },
        children: [
          {
            element: "span",
            part: "line",
            /*
             * One real element per line, expanded from the `lines` COUNT rather than from authored
             * entries: an author who wrote `lines: 3` should not also have to write three empty
             * items. How wide each line runs is not here because it is PAINT: the stylesheet owns
             * the ragged cycle, which is also how both bindings get the identical edge without
             * either of them computing it.
             */
            repeatComputed: { window: "skeleton-lines", from: ["lines"], key: "line" },
          },
        ],
      },
      react: { from: "@skryensya/react/placeholder", name: "PlaceholderParagraph" },
    },

    /** A rectangle: media, a card, a chart. `fill` makes it take a clipped parent's whole box. */
    "Placeholder.block": {
      intent: ["loading-media", "skeleton-rectangle", "image-not-yet-loaded"],
      host: { element: "span" },
      options: ["width", "height", "fill"],
      slots: {},
      template: {
        element: "span",
        part: "root",
        host: true,
        attrs: { "aria-hidden": "true", "data-shape": "block" },
      },
      react: { from: "@skryensya/react/placeholder", name: "PlaceholderBlock" },
    },

    /** A disc standing in for an avatar, sized on the same scale Avatar uses. */
    "Placeholder.circle": {
      intent: ["loading-avatar", "skeleton-circle", "person-not-yet-loaded"],
      host: { element: "span" },
      options: ["size"],
      slots: {},
      template: {
        element: "span",
        part: "root",
        host: true,
        attrs: { "aria-hidden": "true", "data-shape": "circle" },
      },
      react: { from: "@skryensya/react/placeholder", name: "PlaceholderCircle" },
    },
  },
} as const satisfies ComponentContract;

export type PlaceholderTextRole = OptionValue<typeof placeholderContract.options.text>;
export type PlaceholderCircleSize = OptionValue<typeof placeholderContract.options.size>;
export type PlaceholderOptions = OptionsOf<typeof placeholderContract>;

/** The shape vocabulary the stylesheet keys on. `paragraph` joins the original three. */
export type PlaceholderShape = "text" | "block" | "circle" | "paragraph";
