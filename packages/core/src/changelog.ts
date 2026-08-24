import type { ComponentContract } from "./contract.js";

/*
 * CHANGELOG, the history of one thing, grouped by the version it shipped in.
 *
 * The kinds are the ones `packages/ai-compiler/src/changelog.ts` already validates, restated here
 * rather than imported: that module is a build tool that reads YAML off disk, and Core must not
 * depend on it to know what a change looks like. They agree because there is one vocabulary, and a
 * gate reads both.
 *
 * ── WHY THESE FIVE WORDS ────────────────────────────────────────────────────
 * They used to be Keep a Changelog's. Added, changed, fixed, removed, breaking, which name what
 * happened to the FILE. These name what happened to the CONSUMER, which is the only reader a
 * changelog has:
 *
 *   `breaking`  their code has to change, today
 *   `feature`   there is something new they may want to reach for
 *   `bugfix`    something they already use was wrong and now is not
 *   `rework`    the same capability, rebuilt: nothing to do, but it may not look or behave identically
 *   `chore`     nothing reaches them at all. Build, deps, internals
 *
 * FIVE, AND NOT SIX, because Badge ships exactly five tones and every kind is coloured (see the
 * `attrsWhen` on ChangelogEntry). A sixth kind would either share a colour with another, which is
 * the ambiguity colour-coding exists to remove, or force this component to paint hues Badge does
 * not own, and then a brand that restyles a status pill would restyle four of them.
 *
 * WHAT IS NOT HERE, and where it goes instead. `removed` and `deprecated` are both `breaking`: this
 * is a contract kit, so a published option that stops existing, or is about to, is a thing a
 * consumer has to act on, and a reader who must act is the whole meaning of the red badge. Writing
 * them apart would sort by what the maintainer did rather than by what the reader owes. `perf`,
 * `docs` and `a11y` are `bugfix` when a consumer feels the difference and `chore` when they do not,
 * which is the same question every other kind is already answering.
 */
export type ChangeKind = "breaking" | "feature" | "bugfix" | "rework" | "chore";

/*
 * Ordered by how much the reader owes, loudest first, and that order is not decoration: it is the
 * order the docs list them in and the order a legend reads. Alphabetical would put `breaking`
 * first by accident and `chore` second, which says nothing.
 */
export const changeKinds = [
  "breaking",
  "feature",
  "bugfix",
  "rework",
  "chore",
] as const satisfies readonly ChangeKind[];

/**
 * The tone each kind wears, which is the ONE place the mapping is written.
 *
 * The contract derives `data-tone` from `kind` through `attrsWhen` below, so an author can never
 * file a `breaking` change under a calm badge; this table is what those branches are generated
 * from, and what a docs legend reads so the page and the component cannot drift.
 *
 * ROLE, NOT HUE, because that is what Badge's tones are: `danger` means act now, `warning` means
 * look before you upgrade, `success` means there is something to gain, `accent` means you already
 * got it for free, `neutral` means this is not addressed to you.
 */
export const changeKindTones = {
  breaking: "danger",
  feature: "success",
  bugfix: "accent",
  rework: "warning",
  chore: "neutral",
} as const satisfies Record<ChangeKind, "neutral" | "accent" | "success" | "warning" | "danger">;

/*
 * ELEVEN PARTS, and the rail moved up a level.
 *
 * It used to be one dot per ENTRY, which meant every entry was a two-column grid, and the connector
 * between two dots had to be masked open at both ends by arithmetic that only worked because every
 * entry was set at one size. All of that was in service of a tick that said WHEN, and the version
 * heading says when now, better, because it says it once for a group of changes instead of
 * repeating a date down the side of a page. There is no dot left at all: the rail simply runs
 * thicker beside a version, which is one shape doing both jobs.
 *
 * So the release is the thing on the rail, and an entry underneath it is a badge, a headline and a
 * paragraph: nothing to keep aligned, and two levels of reading rather than one.
 */
export const changelogParts = {
  root: "sk-changelog",
  /** One version and everything that shipped in it. The thing the rail marks. */
  release: "sk-changelog__release",
  /** Where the rail thickens beside a version. Decorative: the version itself is the readable form. */
  marker: "sk-changelog__marker",
  version: "sk-changelog__version",
  /** The day the version shipped. Absent on a version that has not. */
  date: "sk-changelog__date",
  /** The list of changes inside one release. */
  entries: "sk-changelog__entries",
  entry: "sk-changelog__entry",
  /** The kind, as a Badge. Composes `sk-badge` rather than restating it; see the signature. */
  kind: "sk-changelog__kind",
  /** The headline: what changed, in one line, which is what a reader scans a release for. */
  title: "sk-changelog__title",
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
 * itself 1, 2, 3 backwards through time, and there is no slot to put a version there instead. Steps
 * is PROGRESS: complete, current and upcoming, none of which a shipped release can be, and its
 * connector means "this much is behind you", which of a published version is simply false. The two
 * say so about each other in their own contracts; this one is what is left when neither is true.
 *
 * WHAT A CHANGELOG IS instead: a stack of VERSIONS, newest first, each holding the changes that
 * shipped in it. The version is what a reader scans for, because the question they came with is
 * whether they already have the thing they are reading about, and a date cannot answer that. Every
 * release is immutable once cut and the list is append-only. Nothing is in progress and nothing is
 * next.
 *
 * THE DATE IS TWO FACTS AND SO IT IS TWO FIELDS. The `date` OPTION is the machine one,
 * `YYYY-MM-DD`, and it lands on `<time datetime>` where a parser can reach it. The visible one is a
 * SLOT, because a formatted date is copy in a language, and Core ships none (the same reason
 * `changelog.ts` in the compiler gives for keeping the entries themselves out of Core). A binding
 * formats with `Intl` and slots the result; the contract owns only that both exist and that they are
 * the same day.
 *
 * A VERSION WITH NO DATE IS ONE THAT HAS NOT SHIPPED, and that is the only thing the contract says
 * about unreleased work: no `status` option, no second vocabulary. The absence IS the fact, so
 * there is no way to write a release that claims a ship date and denies it, or the reverse. What a
 * consumer does with it is name the version accordingly (`0.1.0-dev`), and the template hands CSS a
 * `data-unreleased` hook so the rail can run past that version without thickening into a stop.
 */
export const changelogContract = {
  id: "changelog",
  css: "@skryensya/core/components/changelog.css",
  parts: changelogParts,

  options: {
    /**
     * The day a release shipped, `YYYY-MM-DD`, written to `<time datetime>`. Omitted on a version
     * that has not shipped. Not validated here: a contract option has no format vocabulary, and the
     * tool that reads changelogs off disk already refuses anything else.
     */
    date: { type: "string", attr: "datetime" },
    /**
     * What kind of change it was. The word itself is the `kind` slot.
     *
     * `chore` is the default because it is the only kind that claims nothing: an entry whose kind
     * was forgotten should read as "this is not addressed to you", never as a feature the author
     * never announced or a fix nobody made. Defaults are what an unset field asserts, and the safe
     * assertion is the quiet one.
     */
    kind: {
      type: "enum",
      values: changeKinds,
      default: "chore",
      attr: "data-kind",
    },
  },

  signatures: {
    Changelog: {
      intent: ["changelog", "release-notes", "what-changed", "version-history"],
      host: { element: "ol" },
      options: [],
      slots: {
        children: { accepts: "signature", required: true, of: ["ChangelogRelease"] },
      },
      /*
       * `<ol>`, because the order is the meaning: these are in version order and reversed.
       * `reversed` is static rather than an option: newest-first is what a changelog IS, and an
       * author who could turn it off would get a list numbered against its own sequence. Nothing
       * renders the numbers, but the accessibility tree reads them, and there they should count
       * backwards.
       */
      /*
       * `role="list"` alongside `reversed`: `list-style: none` (changelog.css) drops the implicit
       * list role in Safari/VoiceOver specifically, which would silence the very numbering this
       * component depends on to read backwards.
       */
      template: {
        element: "ol",
        part: "root",
        host: true,
        attrs: { reversed: "", role: "list" },
        slot: "children",
      },
      react: { from: "@skryensya/react/changelog", name: "Changelog" },
    },

    ChangelogRelease: {
      intent: ["one-version", "release", "version-heading"],
      host: { element: "li" },
      options: ["date"],
      parents: ["Changelog"],
      slots: {
        /** The version, as it is written in a lockfile: `0.2.0`, or `0.1.0-dev` for unshipped work. */
        version: { accepts: "text", required: true },
        /**
         * The day it shipped, as a reader reads it. Optional, and its absence is what says the
         * version has not shipped; see the note above. Formatted by the binding.
         *
         * `prop`, because this slot and the `date` OPTION are deliberately the same word: they are
         * one fact in two representations, and a tree that said `options: { date }` beside
         * `slots: { dateLabel }` would hide that. React has no such luxury, where both land in one
         * flat props object and two `date=` would be a syntax error rather than a divergence; so
         * the binding calls it `dateLabel` and this is where the contract says so.
         */
        date: { accepts: "text", prop: "dateLabel" },
        children: { accepts: "signature", required: true, of: ["ChangelogEntry"] },
      },
      template: {
        element: "li",
        part: "release",
        host: true,
        /*
         * The hook, derived rather than declared. A release with no `date` has not shipped, so
         * there is no second option an author could set to contradict the first one.
         */
        attrsWhen: [{ option: "date", given: false, attrs: { "data-unreleased": "" } }],
        children: [
          /*
           * The mark on the rail, `aria-hidden` on purpose: it repeats what the version and its date
           * already say in words. Announced, it would read as an extra bullet before every release.
           */
          { element: "span", part: "marker", attrs: { "aria-hidden": "true" } },
          /*
           * The version and the date are INLINE and unwrapped, which is what the old `meta` box was
           * for. Two inline elements in block flow sit on one line by themselves; a wrapper was only
           * ever needed because the entry was a grid and two children cannot share one cell.
           */
          { element: "span", part: "version", slot: "version" },
          { element: "time", part: "date", options: ["date"], whenGiven: "date", slot: "date" },
          { element: "ol", part: "entries", attrs: { role: "list" }, slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/changelog", name: "ChangelogRelease" },
    },

    /*
     * THREE LINES, IN READING ORDER: what kind of change and to what (the badge and the target),
     * then what changed (the headline), then why (the prose). Each starts at the same inline edge,
     * so a change is a small block rather than a sentence with a pill wedged into it.
     *
     * TWO LEVELS OF READING, which is what the title buys and the whole reason the entry is not one
     * paragraph any more. A reader scanning a release wants the list of what moved; a reader who
     * stopped on one line wants the reasoning. With one blob they had to read the second reader's
     * paragraph to find out whether they were the first reader.
     *
     * THE KIND IS A BADGE, composed rather than restated: `also` carries `sk-badge`, the same way
     * Avatar carries `sk-image-frame` and Combobox carries `sk-form-field`. Badge already owns what a
     * status pill looks like, and a second pill drawn here would be a copy that drifts.
     *
     * ITS TONE IS DERIVED, never passed. `kind` is the fact and the tone is a rendering of it, so
     * `attrsWhen` computes one from the other and there is no way for an author to file a `breaking`
     * change under a calm badge. That is also why `kind` stays an OPTION with a text slot beside it
     * rather than becoming a `Badge` signature slot: a slot would let the word, the colour and the
     * `data-kind` hook disagree three ways.
     *
     * EVERY KIND IS COLOURED, one tone each, straight off `changeKindTones`. An earlier version
     * coloured only `breaking` and left the rest grey, on the argument that a page of green reads as
     * a success report; what it produced instead was a page of grey, where the badge column carried
     * no information at all and the kind had to be READ rather than seen, which is the one job a
     * badge has that prose does not. The tones are roles rather than a rainbow, and they sort by how
     * much the reader owes, so scanning the column answers "is any of this for me" before a word is
     * read.
     */
    ChangelogEntry: {
      intent: ["one-change", "changelog-entry", "release-note"],
      host: { element: "li" },
      options: ["kind"],
      parents: ["ChangelogRelease"],
      slots: {
        /** The kind as a word: "Añadido", "Breaking". Required, so the kind is never colour alone. */
        kind: { accepts: "text", required: true, prop: "kindLabel" },
        /** The headline: what changed, in one line. Text, because a headline needs no markup. */
        title: { accepts: "text", required: true },
        /** What the change is about: an option, a part, a signature. Rendered as code. */
        target: { accepts: "text" },
        /** Why it changed and what it means, in the words a consumer reads. */
        children: { accepts: "node", required: true },
      },
      template: {
        element: "li",
        part: "entry",
        host: true,
        options: ["kind"],
        children: [
          {
            element: "span",
            part: "kind",
            also: ["sk-badge"],
            /*
             * `changeKindTones`, written out. Five `equals` branches rather than a loop over the
             * table, because this object is `as const` and a mapped array widens every literal in
             * it to `string`. The contract would stop type-checking its own attribute values. The
             * gate that keeps the two in step is exhaustiveness: `kind` has a default, so the
             * emitter always resolves a value, and a kind added to the table without a branch here
             * ships a badge with no `data-tone` at all.
             */
            attrsWhen: [
              { option: "kind", equals: "breaking", attrs: { "data-tone": "danger" } },
              { option: "kind", equals: "feature", attrs: { "data-tone": "success" } },
              { option: "kind", equals: "bugfix", attrs: { "data-tone": "accent" } },
              { option: "kind", equals: "rework", attrs: { "data-tone": "warning" } },
              { option: "kind", equals: "chore", attrs: { "data-tone": "neutral" } },
            ],
            slot: "kind",
          },
          /*
           * The target rides with the BADGE, on the line above the headline, because both of them
           * answer "what is this about" before a reader has read anything: one says what kind of
           * change, the other says which part of the contract. The headline is the first thing that
           * is READ, so it starts its own line clean.
           */
          { element: "code", part: "target", whenGiven: "target", slot: "target" },
          { element: "span", part: "title", slot: "title" },
          /*
           * A `div` and not a `p`: the author's prose goes in here and brings its own paragraphs,
           * and a `p` cannot contain one.
           */
          { element: "div", part: "text", slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/changelog", name: "ChangelogEntry" },
    },
  },
} as const satisfies ComponentContract;
