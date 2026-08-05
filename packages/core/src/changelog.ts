import type { ComponentContract } from "./contract.js";

/*
 * CHANGELOG, a dated history of one thing, newest first.
 *
 * The kinds are the ones `packages/ai-compiler/src/changelog.ts` already validates, restated here
 * rather than imported: that module is a build tool that reads YAML off disk, and Core must not
 * depend on it to know what a change looks like. They agree because there is one vocabulary, and a
 * gate reads both.
 */
export type ChangeKind = "added" | "changed" | "fixed" | "removed" | "breaking";

export const changeKinds = [
  "added",
  "changed",
  "fixed",
  "removed",
  "breaking",
] as const satisfies readonly ChangeKind[];

/*
 * Seven parts, and there were eight: the entry used to wrap its meta and its text in a `body` so
 * that a two-column grid had exactly two children. Making the ENTRY the grid does the same job with
 * one box fewer, the marker in the first column and the other two stacked in the second, so the
 * wrapper existed only to be a wrapper.
 */
export const changelogParts = {
  root: "sk-changelog",
  entry: "sk-changelog__entry",
  /** The dot on the rail. Decorative: the kind is also spelled out in `kind`. */
  marker: "sk-changelog__marker",
  /** The date, the kind and the target on one line, which is the row a reader scans. */
  meta: "sk-changelog__meta",
  date: "sk-changelog__date",
  kind: "sk-changelog__kind",
  /** Which option, part or signature the entry is about. */
  target: "sk-changelog__target",
  text: "sk-changelog__text",
} as const;

export type ChangelogPart = keyof typeof changelogParts;
export type ChangelogPartClass = (typeof changelogParts)[ChangelogPart];

/*
 * A HISTORY, not a list of instructions and not a progress bar, which is the whole reason this is
 * its own contract rather than a skin on one of the two rails the kit already has.
 *
 * ProcessList is ORDER: its markers are a CSS `counter()`, so a newest-first history would number
 * itself 1, 2, 3 backwards through time, and there is no slot to put a date there instead. Steps is
 * PROGRESS: complete, current and upcoming, none of which a shipped change can be, and its
 * connector means "this much is behind you", which of a changelog is simply false. The two say so
 * about each other in their own contracts; this one is what is left when neither is true.
 *
 * WHAT A CHANGELOG IS instead: every entry has a DATE, and the date is the thing a reader scans
 * for, so it leads the entry rather than trailing it as a caption. Entries are immutable and
 * append-only. Nothing is in progress and nothing is next.
 *
 * THE DATE IS TWO FACTS AND SO IT IS TWO FIELDS. `date` is the machine one, `YYYY-MM-DD`, and it
 * lands on `<time datetime>` where a parser can reach it. The visible one is a SLOT, because a
 * formatted date is copy in a language, and Core ships none (the same reason `changelog.ts` gives
 * for keeping the entries themselves out of Core). A binding formats with `Intl` and slots the
 * result; the contract owns only that both exist and that they are the same day.
 *
 * `kind` IS ALSO TWO, and for a related reason. The option colours the marker and is what a
 * reference table badges; the slot is the WORD, so the kind is never colour alone. Steps makes the
 * same split for the same reason, its `status` option beside its `marker` slot.
 */
export const changelogContract = {
  id: "changelog",
  css: "@skryensya/core/components/changelog.css",
  parts: changelogParts,

  options: {
    /**
     * The machine-readable day, `YYYY-MM-DD`, written to `<time datetime>`. Not validated here: a
     * contract option has no format vocabulary, and the tool that reads changelogs off disk already
     * refuses anything else.
     */
    date: { type: "string", attr: "datetime" },
    /** What kind of change it was. Colours the marker; the word itself is the `kind` slot. */
    kind: {
      type: "enum",
      values: changeKinds,
      default: "changed",
      attr: "data-kind",
    },
  },

  signatures: {
    Changelog: {
      intent: ["changelog", "release-notes", "what-changed", "dated-history"],
      host: { element: "ol" },
      options: [],
      slots: {
        /**
         * `signature` and not `items`, for the same reason ProcessList composes rather than
         * repeating: an entry's body is arbitrary flow content, prose with code in it and links out
         * of it, and a collection entry can hold text or nodes but not a subtree an author writes.
         */
        children: { accepts: "signature", required: true, of: ["ChangelogEntry"] },
      },
      /*
       * `<ol>`, because the order is the meaning: these are in time order and reversed. `reversed`
       * is static rather than an option: newest-first is what a changelog IS, and an author who
       * could turn it off would get a list numbered against its own sequence. Nothing renders the
       * numbers, but the accessibility tree reads them, and there they should count backwards.
       */
      template: {
        element: "ol",
        part: "root",
        host: true,
        attrs: { reversed: "" },
        slot: "children",
      },
      react: { from: "@skryensya/react/changelog", name: "Changelog" },
    },

    ChangelogEntry: {
      intent: ["one-dated-change", "changelog-entry", "release-note"],
      host: { element: "li" },
      options: ["date", "kind"],
      parents: ["Changelog"],
      slots: {
        /*
         * The date as a reader reads it. Formatted by the binding; see the note above.
         *
         * `prop`, because this slot and the `date` OPTION are deliberately the same word: they are
         * one fact in two representations, and a tree that said `options: { date }` beside
         * `slots: { dateLabel }` would hide that. React has no such luxury, where both land in one
         * flat props object and two `date=` would be a syntax error rather than a divergence; so
         * the binding calls it `dateLabel` and this is where the contract says so. Same for `kind`.
         */
        date: { accepts: "text", required: true, prop: "dateLabel" },
        /** The kind as a word: "Añadido", "Breaking". Required, so the kind is never colour alone. */
        kind: { accepts: "text", required: true, prop: "kindLabel" },
        /** What the change is about: an option, a part, a signature. Rendered as code. */
        target: { accepts: "text" },
        /** What changed, in the words a consumer reads. */
        children: { accepts: "node", required: true },
      },
      template: {
        element: "li",
        part: "entry",
        host: true,
        options: ["kind"],
        children: [
          /*
           * The dot, and it is `aria-hidden` on purpose: it repeats the kind, which the `kind` slot
           * beside it already says in words. Announced, it would read as an extra bullet before
           * every entry.
           */
          { element: "span", part: "marker", attrs: { "aria-hidden": "true" } },
          {
            /*
             * A `div` and not a `p`. This line is a date, a word and a name: metadata, not prose.
             * And a `p` inherits every consumer's paragraph margin, which is UNLAYERED in a docs
             * site and so beats this component's own `margin: 0` inside `@layer components` no
             * matter what it says. Measured: 12px of somebody else's paragraph spacing between the
             * date and its own text. The element that is not a paragraph cannot be styled as one.
             */
            element: "div",
            part: "meta",
            children: [
              { element: "time", part: "date", options: ["date"], slot: "date" },
              { element: "span", part: "kind", slot: "kind" },
              { element: "code", part: "target", whenGiven: "target", slot: "target" },
            ],
          },
          { element: "div", part: "text", slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/changelog", name: "ChangelogEntry" },
    },
  },
} as const satisfies ComponentContract;
