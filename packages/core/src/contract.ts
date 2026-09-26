/*
 * The shape of a Contract: everything Core declares about one component, and the single upstream
 * both bindings realize (decision 28).
 *
 * A contract is a VALUE, not a type. The markup half (which parts nest inside which, what an
 * option is written as, what accessibility a signature owes) is data, and a type system that tried
 * to hold it would need encodings nobody reads. Being a value also means the compiler imports and
 * serializes it deterministically instead of running a TypeScript Program over the catalogue; the
 * Compiler API is left proving the one thing only it can, that a binding's props are assignable to
 * these options.
 *
 * Authored with `as const satisfies ComponentContract`, so the literal types survive for the
 * bindings to derive from while the shape is still checked here.
 */

/**
 * One option a signature takes, and the attribute it lands on. The attribute is the whole point:
 * it is what makes `variant="accent"` and `data-variant="accent"` comparable, and therefore what
 * makes the two bindings diffable (G2).
 */
export type ContractOption = {
  readonly type: "enum" | "boolean" | "string" | "number";
  /** Present when `type` is `"enum"`. The binding's union is derived from this, never restated. */
  readonly values?: readonly string[];
  readonly default?: string | boolean | number;
  /** The DOM attribute the value is written to: `data-variant`, `href`, `aria-current`. */
  readonly attr?: string;
  /**
   * The name the React binding uses, when it differs from this option's key.
   *
   * An option key must be unique across the contract, but two signatures can legitimately have a prop
   * of the same name over different values: a Text is `size: "body"` and a Heading is `size: "h3"`.
   * So the key becomes `headingSize` and this says the binding still calls it `size`. Exactly what
   * `attr` already does for the DOM, pointed at the other binding.
   */
  readonly prop?: string;
  /** CSS custom property written on the host instead of a DOM attribute. */
  readonly styleProperty?: `--${string}`;
  /**
   * The value IS the host's element: an enum of tag names, written as the element rather than as an
   * attribute (so it takes no `attr`). A heading's level is document structure, and a structure no
   * tree could state meant every emitted Heading was an `h2`. React receives it under `prop`, which
   * for a polymorphic component is `as`. The default must be the template's own host element.
   */
  readonly element?: true;
  /**
   * The value names ENTRIES of this signature's own keyed collection: which tab starts active,
   * which branches start open. Without it a tree could seed `defaultExpandedValue="scr"` against a
   * node called `src`, validate, and render a tree where nothing is open and nothing says why.
   * `many` means a space- or comma-separated list. In a recursive collection a key is looked up at
   * every depth.
   */
  readonly keyOf?: { readonly slot: string; readonly many?: true };
  /**
   * The value is ANOTHER node's option in the same tree: a trigger naming the panel it opens by
   * that panel's id. The two sit apart (a Vaul's trigger lives outside the `<dialog>`), so no
   * template can pair them; the validator checks that some node of `contract` in the tree states
   * `option` with this exact value.
   */
  readonly refersTo?: { readonly contract: string; readonly option: string };
  /**
   * Values kept for existing markup, each with the value to use instead. Still valid; the validator
   * says so as an advisory, so a new composition stops reaching for them.
   */
  readonly deprecatedValues?: Readonly<Record<string, string>>;
  /**
   * A `string` option that is really a list, written into one attribute: `columnWeights="2,1,1"`.
   * `item` is what each entry must be. `countFrom` names a row signature whose direct children the
   * list must match one-for-one, looked up as the first such node under this one: a Table's weights
   * are per column, and a list one short is silently thrown away by the binding.
   */
  readonly list?: { readonly separator: string; readonly item: "positive-number"; readonly countFrom?: string };
  /**
   * A `string` option with a fixed format: the regular expression it must match (anchored by the
   * author) and one valid example for the diagnostic. A time field seeded with `"9.30"` parses to
   * nothing and starts blank, which is a typo the validator can name.
   */
  readonly pattern?: { readonly source: string; readonly example: string };
  /**
   * A `number` bounded by OTHER options of the same node, inclusive: a slider's value between its own
   * min and max, a range's low end at most its high end. Each side names an option; its value comes
   * from the tree or, when omitted, from that option's default.
   */
  readonly between?: { readonly min?: string; readonly max?: string };
  /**
   * A `string` option whose vocabulary belongs to ANOTHER contract: a Menu trigger forwards Button's
   * `variant`. Untyped, those drifted when Button split variant from tone, and a trigger kept writing
   * `data-variant="accent"`, which no rule in button.css paints. The validator checks the value against
   * the named option's `values`.
   */
  readonly valuesFrom?: { readonly contract: string; readonly option: string };
  /** Bounds for a `number` option, inclusive. A heading level of 7 or a threshold of 4 is not a value, it is a typo. */
  readonly min?: number;
  readonly max?: number;
  /** A `number` option that only takes whole numbers: a level, a position, a count. */
  readonly integer?: true;
  /** For a boolean option, what the attribute holds when true. `""` means presence-only. */
  readonly trueValue?: string;
  /**
   * What the attribute holds when FALSE. Absent means the attribute is not written at all, which is
   * how a presence-only boolean works (`disabled`, `required`): saying no is saying nothing.
   *
   * Some booleans are not like that: an Inline is `data-wrap="false"` because the stylesheet has a
   * rule for exactly that string, and an attribute that vanished would be a third state nobody meant.
   */
  readonly falseValue?: string;
  /**
   * A second attribute carrying the same value, when the CSS and the accessibility tree read
   * different names for one idea: a radiogroup is styled by `data-orientation` and announced by
   * `aria-orientation`, and they can never disagree because there is one option behind both.
   */
  readonly alsoAttr?: string;
  /**
   * This option configures the MACHINE rather than the appearance, and the two bindings hand it over
   * differently: authored markup has no channel but an attribute, so the enhancer reads it off the
   * DOM, while React passes it as a prop and Zag never writes it back. The attribute therefore exists
   * on one side by construction (like the mount point); the symmetry gate normalizes it instead
   * of reporting a divergence that is really two ways of saying the same thing.
   */
  readonly machineInput?: true;
  /**
   * This option is INPUT TO A COMPUTATION rather than something that lands in the markup.
   *
   * Pagination's page, total and siblings decide which page buttons exist; once they have, there is
   * nothing left for them to be an attribute of. Writing them anyway would put three values in the
   * DOM that nothing reads and that React has no reason to mirror; a divergence at G2 stands in
   * for a fact that is already expressed by the buttons themselves.
   *
   * `attr` stays declared: it names where the value WOULD go, which is what the docs and the
   * validator quote, and keeps every option one shape.
   */
  readonly computedInput?: true;
};

/** Where authored content lands inside a part template. */
export type ContractSlot = {
  readonly accepts: "text" | "node" | "signature" | "items";
  /**
   * The name the React binding gives this slot, when it differs from the slot key. Steps calls its
   * collection `steps`; the contract keys every collection `items` so an agent finds them by one
   * name. Same idea as an option's `prop`.
   */
  readonly prop?: string;
  readonly required?: true;
  /** Signature ids allowed here, when `accepts` is `"signature"`. */
  readonly of?: readonly string[];
  /**
   * Narrows one of the ITEM's OWN options to a subset of its usual values, while it sits in this
   * slot. The item is still whatever signature `of` allows, just held to a stricter vocabulary here
   * than it is everywhere else: a Button is a full-strength call to action on its own, but the
   * recovery link inside a Callout must never outrank the page's real accent action, so this slot
   * narrows its `variant` rather than inventing a second, weaker Button signature to say the same
   * thing. Checked against the item's own contract default when the option is omitted, so leaving
   * `variant` unset does not quietly slip through as the disallowed default.
   */
  readonly restrictOptions?: Readonly<Record<string, readonly string[]>>;
  /**
   * Attributes a DIRECT child of this slot may carry on its own host, outside the child's contract.
   *
   * LayoutGrid's `data-width` is the case: the span belongs to the child element (a heading, figure
   * or section owns its semantics) rather than to an option of Box/Stack/…. Authored on the child
   * via UsageTree `attrs` (the attr name in each option's `attr`); the validator checks values
   * against this vocabulary. Declaring them here also puts the names in the manifest.
   */
  readonly childAttrs?: Readonly<Record<string, ContractOption>>;
  /**
   * The order in `of` is REQUIRED, not merely a list. A table caption after its rows is markup the
   * parser moves and a screen reader announces out of sequence; nothing else in the model can say so.
   */
  readonly ordered?: true;
  /**
   * The children are a HIERARCHY WRITTEN FLAT: rows in document order whose depth and position are
   * options rather than nesting (a treegrid, where a `<tr>` cannot hold a `<tr>`). Each field names
   * the child option carrying that fact. The validator then holds the rows to what `aria-level`,
   * `aria-posinset` and `aria-setsize` promise a screen reader: depth grows one level at a time,
   * siblings agree on their set size and are numbered 1..n, a branch (`expanded` given) is followed
   * by its children and a leaf is not, and `key` is unique across the rows.
   */
  readonly flatHierarchy?: {
    readonly level: string;
    readonly setSize: string;
    readonly posInset: string;
    readonly expanded: string;
    readonly key?: string;
  };
  /**
   * How many of each signature may appear. Absent means any number; the common case. A table has at
   * most one caption and needs exactly one body, and neither is expressible as a presence check.
   */
  readonly cardinality?: Readonly<Record<string, "one" | "optional" | "many">>;
  /**
   * Cardinality over a GROUP of signatures counted together: a badge holder takes exactly one
   * anchor, whichever of Button, StateButton or Avatar it is. Per-signature `cardinality` can
   * only say "at most one of each", which lets two different anchors through.
   */
  readonly groupCardinality?: readonly { readonly of: readonly string[]; readonly count: "one" | "optional" | "many" }[];
  /** How many entries (a collection) or composed children (a signature slot) the slot takes. */
  readonly minItems?: number;
  readonly maxItems?: number;
  /**
   * When `accepts` is `"signature"`, every composed child in this slot must carry a distinct value
   * for this option on its signature (QuestionnaireItem `name` among siblings).
   */
  readonly uniqueChildOption?: string;
  /**
   * How many entries of this collection may have `option` equal to `equals` (a boolean compares as
   * "true"/"false", an omitted option reads as its default): at most one current step, since a
   * finished checkout has none.
   */
  readonly countWhere?: { readonly option: string; readonly equals: string; readonly count: "one" | "optional" };
  /**
   * The children are positioned siblings (`aria-posinset` / `aria-setsize`): every one states the
   * same set size, positions are unique and within it. A set size of -1 (unknown, WAI's own value)
   * skips the range check.
   */
  readonly positions?: { readonly posInset: string; readonly setSize: string };
  /**
   * Entries of this slot have the shape of the entry that CONTAINS it. A folder holds folders, and
   * declaring that by writing the shape again would be writing it forever.
   *
   * The one structural thing a flat collection cannot say. It is not only a tree's: a nested menu
   * and a nav list with sub-groups are the same claim.
   */
  readonly recursive?: true;
  /**
   * The shape of one entry, when `accepts` is `"items"`.
   *
   * A collection is not a list of child signatures: its entries are DATA, and one entry's fields can
   * land in places the markup keeps far apart. A tab's label goes in the trigger, its content goes in
   * a panel that is the trigger's uncle, and what pairs them is the entry's key. Composing that as
   * children would force an author to write the pairing by hand and keep it consistent: this is
   * exactly the invariant a contract should be holding.
   */
  readonly item?: {
    /** Item values that land on an attribute: the key that pairs the parts, a per-item disabled. */
    readonly options: Readonly<Record<string, ContractOption>>;
    /** Item content: the label, the panel body. */
    readonly slots: Readonly<Record<string, ContractSlot>>;
    /**
     * Which OPTION identifies an entry, so the emitter can pair the parts that repeat over it: a
     * tab's trigger and its panel are uncles, and this is what keeps them together.
     *
     * Absent when an entry becomes ONE element: a breadcrumb crumb and a step have nothing to pair,
     * and demanding a key there made two contracts name a slot as if it were an option, which the
     * validator then rejected for every tree that used them.
     */
    readonly key?: string;
    /** Entry options or slots every entry must give: a chart point with no value is not a point. */
    readonly requires?: readonly string[];
    /**
     * React takes each entry as THIS ONE FIELD's value rather than as an object: a tags input's
     * `defaultValue` is `string[]`, and every entry is nothing but its `label`. Without it both the
     * live render and the printed snippet handed React `[{ label: "react" }]`, which throws on
     * render and does not typecheck. The markup side is unaffected: it expands entries either way.
     */
    readonly unwrap?: string;
  };
};

/**
 * The subtree of parts one signature owns. It exists because the two bindings meet a contract at
 * different depths: React writes three elements where authored markup writes five, and this is what
 * makes those the same structure rather than two.
 */
export type ContractTemplate = {
  /**
   * Absent means the slot's content is placed directly, with no element of its own; a decorative
   * icon brings its own box and must not be wrapped in one.
   */
  readonly element?: string;
  /** Key into the contract's `parts`. Absent for a structural element that carries no part class. */
  readonly part?: string;
  /** Extra classes written verbatim, for a pattern this component composes (`sk-interactive`). */
  readonly also?: readonly string[];
  /** Static attributes every instance carries. */
  readonly attrs?: Readonly<Record<string, string>>;
  /**
   * The enhancer's attachment point on THIS node, when it is not the signature root: a segmented
   * control's enhancer scans for each option, a number field's for its own input and triggers.
   * Same rule as `ContractSignature.mount` one level down: present in authored markup by
   * construction and absent from React, so the symmetry gate reads this field to know which
   * attributes are bookkeeping rather than guessing from a `data-sk-*` prefix.
   */
  readonly mount?: string;
  /**
   * Attributes that appear only when the named option was supplied, or only when it was not. A
   * loader is `role="status"` when it has a name and `aria-hidden` when it has none; one decides
   * the other, and a static attribute cannot say so.
   */
  readonly attrsWhen?: readonly {
    readonly option: string;
    /** Whether the author supplied it at all. */
    readonly given?: boolean;
    /** Or which value it holds: an alert is assertive only when its tone is danger. */
    readonly equals?: string;
    readonly notEquals?: string;
    /**
     * Or whether it holds the same value as ANOTHER option. "You are on the last page" is
     * `page === total`, and there is no literal to compare against: the answer depends on both.
     */
    readonly equalsOption?: string;
    readonly attrs: Readonly<Record<string, string>>;
  }[];
  /**
   * Author-supplied attributes that land HERE rather than on the host. The accessible name of a tab
   * list belongs to the element that is the tablist, not to the box around it, and only the contract
   * knows which node that is.
   */
  readonly attrsFor?: readonly string[];
  /**
   * The node that receives the consumer's own attributes and every option no other node claims.
   * One per template.
   */
  readonly host?: true;
  /**
   * Options written on THIS node instead of the host. A frame's `src` and `alt` belong to the inner
   * `<img>`, not to the box around it, and without this the emitter would put them on the box.
   */
  readonly options?: readonly string[];
  /**
   * This node exists only when the named option or slot is supplied; an unlabelled group renders no
   * label, a frame with authored children renders no `<img>`. A list means ANY of them: a toast's
   * action row exists if it has actions, or a dismiss control, or both.
   */
  readonly whenGiven?: string | readonly string[];
  /**
   * The negative: this node exists only when the author supplied NONE of the named options or slots.
   *
   * It is what lets a slot have a default that is MARKUP rather than a string. A breadcrumb separator
   * is whatever the author slotted, and `/` when they slotted nothing; two nodes, one condition
   * each, the same way a crumb is an `<a>` when it has an href and a `<span>` when it does not
   * (`whenItemGiven` / `whenItemMissing`, one level down). A fallback written INSIDE one node would
   * need the emitter to know that literal text loses to slotted content, which is a precedence rule
   * living in code instead of a condition living in the contract.
   */
  readonly whenMissing?: string | readonly string[];
  /**
   * This node is `aria-labelledby` whatever renders the named slot, when that slot is filled. The id
   * is generated by the binding; what the contract fixes is the relationship, so both bindings owe
   * the same one and G2 can see it in the ARIA tree.
   */
  readonly labelledBySlot?: string;
  /**
   * A name for this node, so a wiring rule can point at it. Only nodes that take part in one need
   * it; a field's hint and error are pointed at, its root is not.
   */
  readonly name?: string;
  /** The slot whose content lands here. A node has either `slot` or `children`, never both. */
  readonly slot?: string;
  /**
   * This node is emitted once per entry of the named collection slot. Two nodes can repeat over the
   * same collection from different places in the tree: the triggers inside the list, the panels
   * beside it; this is how one entry becomes two elements that the key keeps paired.
   */
  readonly repeat?: string;
  /**
   * This node is emitted once per entry of the CURRENT ENTRY's named slot: the nested half of
   * `repeat`. With a `recursive` slot it is what makes a template of fixed depth render a
   * structure of any depth.
   */
  readonly repeatItemSlot?: string;
  /**
   * Render the template node carrying this `name`, here, with the current entry.
   *
   * The counterpart of a `recursive` slot: the data nests without limit, and a literal cannot
   * contain itself, so the shape is written once, named, and pointed back at from inside. It
   * terminates because a leaf's children slot is empty; the DATA is what has a bottom, not the
   * template.
   */
  readonly recurse?: string;
  /**
   * Rename the attribute an item option maps to, for THIS node only.
   *
   * One entry datum sometimes needs two spellings in one template: a Select row is
   * `<li data-value>` because the enhancer reads it there, while the hidden `<select>` beside it
   * needs `<option value>` for the browser to submit. The option means one thing; where it lands
   * decides how it is written.
   */
  readonly itemOptionAttrs?: Readonly<Record<string, string>>;
  /**
   * The same rename, one level UP: which attribute a HOST option maps to, for this node only.
   *
   * The case that needs it is the native Popover API. One authored id is two things: the content
   * element's `id` and the trigger's `popovertarget`; neither spelling is more true than
   * the other. Without this the contract would need two options for one fact, which an author could
   * set to two different values, and the popover would simply not open.
   *
   * An empty-string value means OMIT: this node does not write that option's attribute at all
   * (`Select.native` suppresses host `data-value` because `selectedBy` is the channel). Renaming
   * and omitting share one map so a template never needs a second vocabulary for "not here".
   */
  readonly optionAttrs?: Readonly<Record<string, string>>;

  /**
   * This node repeats over a collection the CONTRACT computes rather than the author supplies.
   *
   * Pagination is the case that needs it: which page numbers are visible follows from the current
   * page, the total and how many siblings are kept; it is not data anyone should be typing, and an
   * author who typed it could type a window that skips a page. So the contract names a computation
   * the compiler knows, exactly as `style.percentOf` names one, and the entries come out of it.
   *
   * The entries look like any other collection's, so everything downstream (`whenItemGiven`,
   * `itemSlot`, `selectedBy`) work on them unchanged.
   */
  readonly repeatComputed?: {
    /** The computation. The compiler holds the list; a name it does not know fails the build. */
    readonly window: "pagination-range" | "skeleton-lines" | "rating-symbols" | "otp-segments";
    /** Option names, in the computation's argument order. */
    readonly from: readonly string[];
    /** The item option each entry's value lands in, so `selectedBy` and `itemOptions` can name it. */
    readonly key: string;
  };

  /**
   * This node's ATTRIBUTE is computed by the contract rather than written by the author.
   *
   * The third named derivation, beside `style.percentOf` (a computed style) and `repeatComputed`
   * (a computed collection), and it exists because those two cover the wrong shapes for a symbol
   * that is one long string. QR is the case: its geometry is a `<path d>`, and the alternatives are
   * a collection of one element per module, which measures 16,020 elements and 669KB at version 40
   * against one element and 113KB as a path, or an attribute the author pastes in, which puts a
   * value in the tree that nothing can validate and that no longer says what it encodes.
   *
   * The vocabulary is closed for the reason the other two are: the compiler holds the list, a name
   * it does not know fails the build, and a second kind gets named when a second case turns up
   * rather than a formula string appearing in the data.
   *
   * `from` names OPTIONS and their values arrive as authored, not coerced: unlike `repeatComputed`,
   * whose windows all take numbers, a computation here may want the string an author typed.
   */
  readonly attrComputed?: {
    /** The computation. See `emit.ts`'s `computedAttribute`. */
    readonly compute: "qr-path" | "qr-viewbox";
    /** Option names, in the computation's argument order. */
    readonly from: readonly string[];
    /** Where the result lands on this node. */
    readonly attr: string;
  };
  /**
   * This node exists only when the ENTRY supplied or omitted the named item option. A breadcrumb
   * crumb is a link when it has an href and plain text when it does not: one entry, two shapes, and
   * `whenGiven` cannot say it because it asks the composition rather than the entry.
   */
  readonly whenItemGiven?: string;
  readonly whenItemMissing?: string;
  /**
   * The same presence question, asked of MULTIPLE item options at once, ALL of which must be
   * supplied. A breadcrumb crumb that is both `current` and carries an `href` is still not a link:
   * the current page is the one label the trail exists to answer "where am I", never truncated or
   * muted the way an ancestor link is, so it renders as `Breadcrumb.Current` even though it has
   * a destination. One entry, a THIRD shape neither `whenItemGiven` (single option) nor a second
   * node with its own `whenItemGiven` (fields do not compose across two calls to the same key on
   * one node) can express. `whenGiven` has the equivalent array at the composition level, meaning
   * ANY of them; this is the item-level, ALL-of-them counterpart the plain singular could not say.
   */
  readonly whenItemAllGiven?: readonly string[];
  /**
   * The same question, asked of a specific VALUE rather than mere presence. `whenItemGiven` cannot
   * tell a menu's checkbox entry from its separator: both merely have `kind` set, so a plain
   * presence check collapses every non-default value into one. A menu separator is a third shape
   * with nothing in common with a command row (no label, no click), which is why it needs to name
   * the value rather than just the option, the same way `attrsWhen`'s `equals` does for a host
   * option one level up.
   *
   * Only meaningful for a STRING or ENUM item option: a boolean's stored value is the literal JS
   * `true`/`false`, and `equals` is typed `string`, so it can never match one by strict equality -
   * use `whenItemGiven`/`whenItemMissing` (or `whenItemAllGiven`) for a boolean instead.
   */
  readonly whenItemEquals?: { readonly option: string; readonly equals: string };
  readonly whenItemNotEquals?: { readonly option: string; readonly equals: string };
  /**
   * The same question asked of the entry's CONTENT rather than its options: a tree node with
   * children is a branch and gets a control that opens it, one without is a leaf. Whether it has
   * children is not an option anyone sets; it is whether the slot was filled.
   */
  readonly whenItemSlotGiven?: string;
  readonly whenItemSlotMissing?: string;
  /**
   * This node exists on every entry but the last. Separators are the case: they go BETWEEN crumbs,
   * so a trailing one would be punctuation with nothing after it.
   */
  readonly whenNotLast?: true;
  /** Literal content taken from an option's value rather than fixed in the template. */
  readonly textFromOption?: string;
  /**
   * Attributes whose value is copied from an entry's slot text; a crumb's `title` repeats its label
   * so a truncated one still shows in full. Derived, so the two can never disagree.
   */
  readonly attrsFromItemSlot?: Readonly<Record<string, string>>;
  /** Item options written on this node. Inside a repeated node only. */
  readonly itemOptions?: readonly string[];
  /**
   * Writes a boolean attribute on the ONE entry whose key matches the named group option. Which
   * option is selected belongs to the group, not to any entry; exclusivity is exactly the claim
   * that only one can be; the contract asks the group and marks the match.
   */
  readonly selectedBy?: {
    readonly option: string;
    readonly attr: string;
    /** What the attribute holds. Absent means presence-only, the boolean case. */
    readonly value?: string;
  };
  /** The item slot whose content lands here. Inside a repeated node only. */
  readonly itemSlot?: string;
  /**
   * Literal text this node renders. For a mark the system owns rather than the author: the required
   * asterisk, which is  because the  attribute already says it.
   */
  readonly text?: string;
  /**
   * Styling hooks computed from options rather than written by the author. A progress bar's fill IS
   * its value made visible, so letting an author type it invites a bar that says 62% and looks 40%.
   *
   * The vocabulary is deliberately closed: one named derivation, because one is what exists. A second
   * kind gets named when a second case turns up, never a formula string in the data.
   */
  readonly style?: readonly {
    readonly property: string;
    readonly percentOf: readonly [string, string];
    /** `percent` writes "62%", `fraction` writes "0.62". The CSS decides which it reads. */
    readonly as?: "percent" | "fraction";
  }[];
  /**
   * This node's text content is CONTENT, not layout: emit it verbatim, on the element's own line,
   * and never re-indent or re-wrap it.
   *
   * Markup emission pretty-prints, which is right everywhere the HTML parser collapses whitespace
   * and wrong wherever CSS says it does not. A CodePreview viewport is `white-space: pre-wrap`
   * (code-preview.css), so the newline and six spaces the printer added around a one-line `pnpm
   * add …` were rendered as a blank line, an indent and another blank line: the Vanilla stage drew
   * a three-line box where React drew a one-line one, from the same tree, and the printer's own
   * `PRINT_WIDTH` decided which snippets got it.
   *
   * Named for what is true of the ELEMENT rather than for the fix, because the same is true of any
   * future `pre`: whitespace here is the author's, so the emitter stops editing it.
   */
  readonly preserveWhitespace?: boolean;
  readonly children?: readonly ContractTemplate[];
};

/**
 * One id relationship the contract fixes: which node points at which, with what attribute.
 *
 * A field is the reason this exists. Authored markup writes SIX ids by hand: the label's `for`, the
 * control's `id`, an `aria-describedby` naming two targets, and those two targets' own ids; and
 * getting `aria-describedby` wrong is invisible on screen while breaking every screen reader. Six
 * chances to be silently wrong, from one name.
 *
 * The parent computes them and the child receives them, which is not a modelling preference: it is
 * what the React binding already does through `FieldContext`. Had the contract said the author
 * supplies the ids instead, authored markup would carry the author's and React would generate its
 * own, and the symmetry gate would flag every form in the catalogue.
 *
 * Ids themselves are never in the data. The emitter derives them from the field's own id, so this
 * stays a relationship and never becomes a little templating language living in a contract.
 */
export type ContractWiring = {
  /** The node that carries the attribute: a template node's `name`, or `"control"` for the slotted child. */
  readonly on: string;
  readonly attr: string;
  /** Nodes whose ids this attribute points at, in order. */
  readonly references?: readonly string[];
  /** A literal value instead of a reference: `aria-invalid="true"`. */
  readonly value?: string;
  /** Only when the named option or slot was supplied. An absent error means no `aria-invalid`. */
  readonly whenGiven?: string;
};

/**
 * Accessibility a signature owes under a condition, structured rather than written in prose. An
 * icon-only control has no visible text, so something has to name it, and no gate can enforce a
 * paragraph.
 */
export type ContractA11yRule = {
  /**
   * The condition, in the same vocabulary as `host.when`: `"present"` / `"absent"` test whether the
   * author supplied the option at all, any other value tests equality. An icon-only control is named
   * because `iconOnly` IS `true`; an image needs an alt because `src` is *there*.
   */
  readonly when: Readonly<Record<string, string | boolean>>;
  readonly requiresOneOf: readonly string[];
  /** Why, for the diagnostic the agent reads when it fails. */
  readonly because: string;
  /**
   * The signatures this rule is about. Absent means all of them; right for a rule keyed on an
   * option every signature shares, wrong for one about a landmark only the root signature is.
   */
  readonly signatures?: readonly string[];
};

/** One selectable meaning inside a contract. Its id is logical: several can share one export. */
export type ContractSignature = {
  readonly intent: readonly string[];
  readonly host: {
    readonly element: string;
    /** What discriminates this signature from its siblings on the same export. */
    readonly when?: Readonly<Record<string, "present" | "absent">>;
  };
  /**
   * Which of the contract's options this signature accepts. Siblings rarely take the same set: a
   * nav list is oriented and a nav link is not; without this there is nothing to reject an
   * option on the signature that has no business with it.
   */
  readonly options: readonly string[];
  readonly requires?: readonly string[];
  readonly forbids?: readonly string[];
  /**
   * Exactly one of these must be supplied: options and slots alike, since a frame may take its
   * content either way and "one source of content" is the rule regardless of which.
   *
   * It exists because presence checks cannot express it: `requires` would demand both, `forbids`
   * would refuse both, and a signature that is valid with neither renders an empty box that every
   * static check calls fine.
   */
  readonly exactlyOneOf?: readonly (readonly string[])[];
  /**
   * At least one member of each group must count as supplied: an option set to something other than
   * its default, a filled slot, or a boolean option set to `true`.
   *
   * For a signature whose whole reason to exist is what those options paint: a Box with no padding,
   * no surface and no border draws nothing. Unlike `exactlyOneOf`, any number of them may be set
   * together, and slot names may appear in the group (QuestionnaireItem needs choices and/or text).
   */
  readonly atLeastOneOf?: readonly (readonly string[])[];
  /** Signature ids this one may sit inside. Empty means top level. */
  readonly parents?: readonly string[];
  /**
   * The negative of `parents`, at ANY depth: signature ids this one must never sit inside. A
   * Wrapper inside a Wrapper adds a second set of gutters and the outer ceiling wins anyway.
   */
  readonly notInside?: readonly string[];
  /**
   * When the key option is given, the listed options must not be: one decision spelled once. A
   * Text `textRole` sets size, tone and weight together, so also setting `size` states the same
   * thing twice and the role silently wins.
   */
  readonly excludes?: Readonly<Record<string, readonly string[]>>;
  /**
   * The other half of `excludes`: when the key option is given (a boolean counts only when true),
   * each listed option or slot must be given too. A count-up with no number to count to is not a
   * quieter stat, it is an enhancer that throws.
   */
  readonly implies?: Readonly<Record<string, readonly string[]>>;
  /*
   * Keys of `implies` and `excludes` (and the names they list) may also be a SLOT, given when
   * filled, or `option=value`, given when the option holds exactly that value: a fade's colour is
   * meaningless unless its mode is `color`, and a QR logo is a zero-size cover without a ratio.
   */
  /**
   * The same value on both sides of a composition: a split button's action and menu trigger share
   * one variant and size, or the welded halves stop reading as one control. Each side is a slot and
   * the option on the signature composed into it; a missing value reads as that option's default.
   */
  readonly pairs?: readonly {
    readonly a: { readonly slot: string; readonly option: string };
    readonly b: { readonly slot: string; readonly option: string };
  }[];
  readonly slots: Readonly<Record<string, ContractSlot>>;
  /** The id relationships this signature owes, and the only place ids are decided. */
  readonly wiring?: readonly ContractWiring[];
  readonly template: ContractTemplate;
  readonly react: { readonly from: string; readonly name: string };
  /**
   * The `data-sk-*` attribute the Vanilla enhancer mounts on. Binding-specific by nature; React
   * needs no mount point, so it lives here and not in the template, and the symmetry gate
   * normalizes it away rather than reporting the two bindings as different.
   */
  readonly mount?: string;
  /**
   * The floating content leaves the subtree: React portals it (to `document.body` by default) while
   * authored markup keeps it in place, positioned by CSS anchoring (decision 25).
   *
   * `true` means it portals. `{ container: true }` means React also accepts a `container` ref so a
   * consumer can scope the portal (a preview frame, a dialog); the symmetry gate uses that to
   * measure one subtree instead of two loose regions. Markup has no container channel.
   */
  readonly portals?: true | { readonly container?: true };
  /**
   * How pointer hit-testing works for this signature. CSS usually realizes it; declaring it here
   * puts the promise in the manifest so a tool does not have to read the stylesheet to learn that
   * an anchored badge never steals clicks from its control.
   *
   * `childrenNone` names signatures allowed in a slot of this host: those direct children get
   * `pointer-events: none` under this host. `host: "none"` means the host itself does not receive
   * pointer events (decorative overlays).
   */
  readonly hitTesting?: {
    readonly host?: "none";
    readonly childrenNone?: readonly string[];
  };
  /**
   * Host attributes this signature intentionally accepts via UsageTree `attrs`.
   *
   * Options already map the attributes the contract owns (`type`, `href`, `disabled`). Everything
   * else an author still needs on the host (`name`, `form`, `target`, `readonly`, `value`,
   * `aria-*`) used to live only as an open `attrs` bag. Declaring the allowlist here is what an
   * agent reads, and what the validator enforces: when `forward` is set, any other authored attr is
   * `unknown-attr` (except `class` / `style`, and attrs a parent slot publishes via `childAttrs`).
   * A trailing `*` is a prefix: `"aria-*"` allows every `aria-` attribute. Absent means attrs stay
   * open - the catalogue default until a signature opts in.
   */
  readonly forward?: readonly string[];
  /**
   * Families this signature composes (via template `also`, baked chrome, or binding-injected UI)
   * without rewriting every template node into a nested UsageTree.
   *
   * `also: ["sk-button"]` alone is a CSS class list; `compose` is what an agent reads: which
   * contract is borrowed, which sheets that borrow needs, and whether the composed markup is
   * system-owned (emitted/injected) rather than authored as a child. Validated: `of` must name a
   * catalogue contract; each `sheets` entry must exist in the CSS corpus.
   */
  readonly compose?: readonly {
    /** Contract id of the composed family. */
    readonly of: string;
    /** Stylesheets this composition needs beyond what parts/`also` already discover. */
    readonly sheets?: readonly string[];
    /** True when the composed markup is binding/system-injected, not an authored UsageTree child. */
    readonly systemOwned?: boolean;
  }[];
  readonly deprecated?: { readonly replacement: string };
};

/**
 * Where a component sits by the job it does, the eight groups design systems usually use and the docs
 * catalogue already follows. Identity, not a promise: it is indexed, and left out of the surface hash.
 */
export type ContractCategory = "actions" | "forms" | "navigation" | "overlays" | "feedback" | "data" | "content" | "layout";

export type ComponentContract = {
  readonly id: string;
  readonly category?: ContractCategory;
  /** The stylesheet a consumer must import. Resolved from the package export map, never typed by hand. */
  readonly css: string;
  readonly parts: Readonly<Record<string, string>>;
  readonly options: Readonly<Record<string, ContractOption>>;
  readonly signatures: Readonly<Record<string, ContractSignature>>;
  readonly a11y?: readonly ContractA11yRule[];
  /**
   * The STYLING HOOKS this component publishes: the tier-3 custom properties a consumer may
   * re-declare to restyle it, in the stylesheet `css` names.
   *
   * CONTEXT.md calls a styling hook "the public override surface of a component" and a Contract
   * "everything Core declares about one component", and until this field existed those two
   * sentences contradicted each other: 983 hooks lived in the CSS and the contract named 47 of
   * them, all in prose. Nothing could check either direction, so a hook could vanish from the
   * stylesheet and the only signal a consumer got was their override silently doing nothing.
   *
   * AUTHORED, NOT GENERATED. Deriving this list from the CSS would make it incapable of
   * disagreeing, and a check that cannot fail is not a check. Declaring it by hand is what lets
   * the validator report BOTH directions: a hook the stylesheet has and the contract does not
   * (undeclared), and a hook the contract promises and the stylesheet never declares (broken).
   *
   * Optional while the corpus is being filled in: a contract that declares none is skipped, not
   * failed, so the rule can land before the data does.
   */
  readonly hooks?: readonly string[];
  /**
   * The subset of `hooks` a binding WRITES at runtime (a drag offset, a measured size). Published so
   * a stylesheet can read them; overriding one does nothing, because the next frame writes over it.
   */
  readonly outputHooks?: readonly string[];
  /**
   * Kit-namespaced attributes (`data-sk-*`) this family publishes for an AUTHOR to write on a host
   * that belongs to a DIFFERENT family.
   *
   * `data-*` is the author's namespace by HTML's own rule, so the validator leaves every plain
   * `data-` attribute alone; `data-sk-*` is the kit's, and an undeclared one is a typo against an
   * enhancer that will never fire. A few are genuinely meant to be authored across a seam anyway:
   * a Button carrying `data-sk-vaul-close` closes the drawer around it, a NavListLink carrying
   * `data-sk-megamenu-preview` swaps the megamenu's image. Declaring them HERE rather than in the
   * receiving signature's `forward` is what keeps the direction of knowledge right - Button has no
   * business knowing Vaul exists, and Vaul is where someone reading about drawers will look.
   */
  readonly authoredAttrs?: readonly string[];
  /**
   * The OTHER stylesheets whose hooks this contract also publishes, when its styling does not fit
   * in the one sheet `css` names.
   *
   * 19 of 81 contracts are in that position, for three different reasons, and none of them is an
   * accident: one contract file can serve several signatures that are separate components
   * (`selection.ts` publishes Checkbox, RadioGroup and Switch, each with its own sheet); a
   * component can compose another and inherit its parts (Accordion's parts ARE Tile's classes); and
   * a pattern can have variants in sheets of their own (Vaul, with `dialog-vaul.css`).
   *
   * Before this field, `hooks` could only be reconciled against `css`, so every hook in the other
   * sheet was invisible: Accordion publishes 6 hooks and the `tile.css` its parts actually use
   * declares 18, of which 17 no contract could name. A consumer overriding `--sk-tile-bg` on an
   * Accordion was overriding real public surface that nothing documented and nothing checked.
   *
   * TWO CONTRACTS MAY NAME THE SAME SHEET, and both then declare its hooks. That duplication is
   * deliberate: Checkbox and Switch sharing `switch.css`'s hooks is a true statement about the
   * system, not a bookkeeping error, and the alternative (one owner per sheet) would force an
   * arbitrary choice about which of the two is allowed to describe its own surface.
   */
  readonly hookSheets?: readonly string[];
  /**
   * Keys of `parts` that bindings or enhancers emit but authors never write in a UsageTree.
   *
   * Calendar's grid cells, Carousel's prev/next/dots: the contract still owns the class names (CSS
   * and unique-sheet ownership), yet the template only authors the host shell. Listing them here is
   * what makes "binding fills the body" machine-readable. Validated: every name must be a key of
   * `parts`.
   */
  readonly systemOwned?: readonly string[];
  /**
   * The DOM events the component dispatches, by the name the code calls them: `valueChange` →
   * `sk:accordionvaluechange`.
   *
   * Authored markup has no callback to pass, so an event is the ONLY way a consumer on that side
   * hears about state, which makes it as much a part of the promise as an option is. Every family
   * that has one already exports it as a const beside the contract (`accordionEvents`); naming it
   * HERE is what puts it in the manifest, so the reference table and an agent can read it instead
   * of a person finding it in prose.
   */
  readonly events?: Readonly<Record<string, string>>;
  /**
   * What each event in `events` carries, keyed the same way: the fields of `event.detail` with their
   * TypeScript type, whether the component dispatches it (`out`, the default) or listens for it as a
   * command (`in`), and how React exposes the same channel. The name map alone told a consumer what
   * to listen for and nothing about what would arrive or which prop to pass.
   */
  readonly eventDetails?: Readonly<
    Record<
      string,
      {
        readonly detail: Readonly<Record<string, string>>;
        readonly direction?: "in";
        /**
         * React callback prop (`onValueChange`). `false` when React has no dedicated prop: listen on
         * the DOM, use a handle method, or the event is site/enhancer-only. Outbound events declare
         * one or the other; inbound (`direction: "in"`) may omit it.
         */
        readonly reactProp?: string | false;
        /**
         * React callback argument when it is NOT the `detail` object: a TypeScript type string
         * (`"string"`, `"number"`, `"void"`, `"{ low: number; high: number }"`).
         */
        readonly reactDetail?: string;
        /**
         * Key of `parts` that dispatches (or listens for, when `direction: "in"`) the CustomEvent.
         * Almost always `root`. What an agent reads to know where to attach a listener.
         */
        readonly source?: string;
        /**
         * Key of `parts` the user activates to cause the event (trigger button, thumb, remove
         * control). Omit when several parts can fire it, when it is lifecycle/timeout-driven, or
         * when `direction: "in"` (the consumer dispatches).
         */
        readonly trigger?: string;
      }
    >
  >;
};

/* ---------------------------------------------------------------------------------------------- *
 * Derivation
 *
 * What a binding uses to stop restating the contract. `ButtonProps` no longer declares
 * `variant?: ButtonVariant`; it derives it, so adding a variant to the contract is the only edit.
 * ---------------------------------------------------------------------------------------------- */

type EnumValueOf<O> = O extends { readonly values: readonly (infer V)[] } ? V : string;

/**
 * The TypeScript type one option admits.
 *
 * The `number` branch is not decoration: 42 options across 25 contracts declare `type: "number"`
 * (slider's `value`, meter's `min`/`max`, pagination's `page`, number-field's `step`), and without it
 * every one of them derived as `string` - so a derived type accepted `"not a number"` and rejected
 * `65`. Nothing broke because only two modules derive today and nothing imports either result; the
 * branch is here so that stops being the reason it is safe.
 */
export type OptionValue<O extends ContractOption> = O extends { readonly type: "enum" }
  ? EnumValueOf<O>
  : O extends { readonly type: "boolean" }
    ? boolean
    : O extends { readonly type: "number" }
      ? number
      : string;

/** Every option of a contract, as optional props. The binding narrows from here; it never re-declares. */
export type OptionsOf<C extends { readonly options: Readonly<Record<string, ContractOption>> }> = {
  [K in keyof C["options"]]?: OptionValue<C["options"][K]>;
};

type ContractWithSignatures = {
  readonly options: Readonly<Record<string, ContractOption>>;
  readonly signatures: Readonly<Record<string, { readonly options: readonly string[] }>>;
};

/**
 * The options one signature accepts. What a binding whose export covers a single signature derives
 * from, so that `NavListLink` cannot quietly grow an `orientation`.
 */
export type SignatureOptionsOf<
  C extends ContractWithSignatures,
  S extends keyof C["signatures"],
> = {
  [K in C["signatures"][S]["options"][number] & keyof C["options"]]?: OptionValue<C["options"][K]>;
};

/** The signature ids of a contract, for anything that has to name one. */
export type SignatureId<C extends { readonly signatures: Readonly<Record<string, ContractSignature>> }> =
  keyof C["signatures"] & string;

/**
 * The options a signature accepts, in the contract's declaration order. Order is the emitted order.
 *
 * Here rather than in the catalogue: it needs the contract TYPES and nothing else, and a caller
 * that only wants to read one signature's options should not have to load all 83 contracts to do it.
 */
export function signatureOptions(
  contract: ComponentContract,
  signature: ContractSignature,
): readonly [string, ContractOption][] {
  return Object.entries(contract.options).filter(([name]) => signature.options.includes(name));
}
