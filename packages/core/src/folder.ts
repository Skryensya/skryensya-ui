import type { ComponentContract } from "./contract.js";

/*
 * FOLDER: a surface whose top edge carries a TAB, drawn as one continuous silhouette.
 *
 * The shape is not a box with a second box stuck above it. A real folder's tab flows out of the
 * body through an S-curve, and that curve is the whole reason this component needs geometry at
 * all: two rectangles would have a seam exactly where the eye looks first. So the silhouette is a
 * single `<path>`, and the only number that cannot be written ahead of time is where the tab ends,
 * because it ends wherever the LABEL ends. That is the one measurement the bindings make.
 *
 * `folderPath` below is that geometry, as a pure function: numbers in, a `d` string out. It lives
 * here (not in either binding) for the same reason `collapsibleBreadcrumbRange` does - both
 * bindings must produce the identical string from the identical measurement, or the symmetry gate
 * is comparing two different drawings of the same contract. Every knob it takes is read off a CSS
 * custom property at call time (`folderGeometryFrom`), so a brand retunes the silhouette in its own
 * stylesheet rather than by patching a binding.
 *
 * WHY A PATH AND NOT `clip-path`. `clip-path: path()` would draw the same silhouette on a plain
 * div and would take any CSS paint (a gradient, an image) instead of a flat `fill`. It also clips
 * HIT TESTING, which is what settled it the other way: a folder is invisible until reached for, and
 * clipping would make it unclickable outside an outline the reader cannot see yet. An `<svg>` painted behind the content leaves the
 * whole box clickable and the shape purely visual, which is what it is.
 */

/** The silhouette's tunable numbers, all in CSS pixels. */
export type FolderGeometry = {
  /**
   * How tall the tab strip is, and so where the fold sits: also the vertical run of the S-curve down
   * to the body's top edge.
   *
   * MEASURED off the tab, like `tabEnd`, not read from the stylesheet. The tab is as tall as its
   * label plus its own padding, and a fixed number here would put the fold above or below the box
   * the label actually occupies - a title one size larger than the number expected would hang over
   * its own crease. `--sk-folder-tab-height` remains the tab's MINIMUM, which is what keeps a
   * one-line label from producing a stub of a tab.
   */
  tabHeight: number;
  /**
   * The tab's LEADING corner, at the top of the folder's own leading edge.
   *
   * A real corner, square on both axes like every other one in the shape. It used to span the tab's
   * whole height - `tabRadius` wide by `tabHeight` tall - which made it the one angle in the folder
   * that was not a quarter circle, and it read exactly like what it was: a different radius from
   * the other three.
   */
  tabRadius: number;
  /** The S-curve's horizontal run, from where the tab's top edge ends to where the body's begins. */
  shoulder: number;
  /**
   * How far ABOVE the tab's own bottom the body's top edge sits.
   *
   * The tab is as tall as its label plus its padding, and the fold used to land exactly on that
   * bottom - which put the body's top line right under the standfirst that follows it, two
   * horizontals a few pixels apart competing for the same reading. Lifting only this end of the
   * silhouette opens that gap without moving a single word: the label's box is untouched, and the
   * shoulder simply arrives higher than it leaves.
   */
  foldLift: number;
  /** The corner where the body's top edge meets its trailing edge. */
  topRadius: number;
  /** The two bottom corners. */
  radius: number;
};

/**
 * The measured shape: the box, the tab, and the geometry to draw them with.
 *
 * `mirror` is `direction: rtl`, not a decorative flip: a folder's tab sits at the INLINE-START
 * edge, which is the right-hand side in an RTL document. The bindings read it off the computed
 * style rather than taking a prop, so a folder inside an RTL subtree is correct without the author
 * restating what the document already says.
 */
export type FolderShape = FolderGeometry & {
  width: number;
  height: number;
  /**
   * Where the tab ENDS, measured from the folder's own inline-start edge - not the tab's width.
   *
   * The two differ by the folder's leading inset, and treating one as the other is a mistake with a
   * face: the flat top of the tab comes out one inset SHORTER than the label sitting on it, so the
   * last letters overhang the fold. That shipped once. A binding computes this as the tab's offset
   * plus its width (mirrored, in RTL), never as `offsetWidth` alone.
   */
  tabEnd: number;
  mirror?: boolean;
};

/**
 * The default silhouette, and the values `folder.css` publishes as its own hooks.
 *
 * WIDE curves, both of them. The leading sweep spans the tab's full height over `tabRadius` of
 * width, and the shoulder is more than twice its own height: a fold in a sheet of card is a long
 * shallow thing, and every version of this that looked wrong looked wrong for the same reason - the
 * curves were as tall as they were wide, which reads as a notch cut into a box.
 */
export const defaultFolderGeometry: FolderGeometry = {
  tabHeight: 40,
  tabRadius: 26,
  shoulder: 96,
  foldLift: 14,
  topRadius: 18,
  radius: 10,
};

/*
 * The fold, as ONE cubic with horizontal tangents at both ends: control points at half the shoulder,
 * one on the tab's line and one on the body's. That is a symmetric S, smooth where it leaves the tab
 * and smooth where it meets the body, and there is nothing to keep in sync.
 *
 * It replaces a two-cubic version traced off a folder drawn in a viewBox that was stretched sideways
 * by `preserveAspectRatio="none"`. Those control points describe the curve AFTER the stretch flattens
 * it; re-drawn one-to-one, as here, the same numbers give a steep little kink instead of a fold. The
 * shoulder being WIDE relative to the tab's height is what makes this read as a folded sheet, which
 * is why `shoulder` grew along with this.
 */
const S_CURVE = {
  c1: { x: 0.5, y: 0 },
  c2: { x: 0.5, y: 1 },
} as const;

/** Two decimals. Enough for a sub-pixel curve, few enough that the two bindings' strings compare
 *  as equal instead of differing in float noise nobody can see. */
const round = (value: number): number => Math.round(value * 100) / 100;

/**
 * Where the tab actually ends, once the box has had its say. A label longer than the folder can hold
 * would push the S-curve past the trailing edge and the path would fold back on itself, so the tab
 * stops where the shoulder still fits.
 *
 * Exported because `folder.css` caps the tab ELEMENT at the same number, so a label too long
 * ellipsises inside a tab that matches its silhouette instead of overflowing one that stopped short.
 */
export function folderTabEnd(shape: FolderShape): number {
  const max = shape.width - shape.shoulder - shape.topRadius;
  return Math.max(0, Math.min(shape.tabEnd, max));
}

/**
 * The leading corner's radius, clamped to the tab it has to fit inside.
 *
 * `tabRadius` is a wish, not a measurement, and a tab narrower than its own corner has no flat top
 * left for the corner to finish on: the curve would start before it ended and the tab would render
 * as a lopsided wedge. Clamping here rather than widening the TAB keeps the tab honest - it is as
 * wide as its label, and the silhouette bends to that.
 */
export function folderTabSweep(shape: FolderShape): number {
  return Math.min(shape.tabRadius, folderTabEnd(shape));
}

/**
 * `tabEnd` from the two boxes a binding can actually read, and the ONE place that arithmetic lives.
 *
 * Both bindings measure the same two elements and need the same answer, so this is here rather than
 * written out twice - the same reason `folderPath` is. `offsetLeft`/`offsetWidth` and never
 * `getBoundingClientRect()`: the rect is the TRANSFORMED box, so a folder inside any scaled ancestor
 * (the docs' own preview frame scales to fit) would be measured smaller than it lays out and drawn
 * to a number the browser then scales a second time.
 *
 * In RTL the tab is laid out from the right, so its distance from the INLINE-start edge is what is
 * left of the folder to the left of it.
 */
export function folderTabEndFrom(
  root: { offsetWidth: number },
  tab: { offsetLeft: number; offsetWidth: number },
  mirror: boolean,
): number {
  return mirror ? root.offsetWidth - tab.offsetLeft : tab.offsetLeft + tab.offsetWidth;
}

/**
 * The silhouette as an SVG `d`, in the element's own pixel space (the viewBox is `0 0 width
 * height`, so no scaling happens and the corner radii are the radii asked for).
 *
 * Returns an empty string for a box with no area - the state every folder is in for the one frame
 * between mount and measurement, and the state a `display: none` ancestor keeps it in forever.
 * Drawing nothing is right there: a path built from zeroes is a visible dot at the origin.
 */
export function folderPath(shape: FolderShape): string {
  const { width, height, tabHeight, shoulder, foldLift, topRadius, radius } = shape;
  if (width <= 0 || height <= 0) return "";

  /* Where the BODY's top edge sits: above the tab's own bottom by `foldLift`, never above the tab's
   * top, which would turn the fold inside out on a tab shorter than the lift. */
  const fold = Math.max(0, tabHeight - foldLift);

  const tabEnd = folderTabEnd(shape);
  const sweep = folderTabSweep(shape);
  const x = shape.mirror ? (value: number) => round(width - value) : (value: number) => round(value);
  const y = round;

  return [
    `M${x(0)} ${y(sweep)}`,
    `Q${x(0)} ${y(0)} ${x(sweep)} ${y(0)}`,
    `H${x(tabEnd)}`,
    `C${x(tabEnd + shoulder * S_CURVE.c1.x)} ${y(fold * S_CURVE.c1.y)}` +
      ` ${x(tabEnd + shoulder * S_CURVE.c2.x)} ${y(fold * S_CURVE.c2.y)}` +
      ` ${x(tabEnd + shoulder)} ${y(fold)}`,
    `H${x(width - topRadius)}`,
    `Q${x(width)} ${y(fold)} ${x(width)} ${y(fold + topRadius)}`,
    `V${y(height - radius)}`,
    `Q${x(width)} ${y(height)} ${x(width - radius)} ${y(height)}`,
    `H${x(radius)}`,
    `Q${x(0)} ${y(height)} ${x(0)} ${y(height - radius)}`,
    // Back up the leading edge to exactly where the top corner began. `Z` alone would close the same
    // straight line, but saying it keeps the four sides of the shape all written down.
    `V${y(sweep)}`,
    "Z",
  ].join(" ");
}

/**
 * What is actually painted BEHIND the folder, as a `background` value, or `null` when nothing is.
 *
 * A folder at rest is invisible by being its own ground's paint, and it has to be REAL paint rather
 * than `transparent`: a transparent folder paints nothing, so a folder behind it that has been
 * revealed shows straight through the ones in front, and a stack stops behaving like a stack.
 *
 * CSS cannot express this. There is no way for a rule to ask what is under an element, and a token
 * is only ever a guess about one context - `--color-bg-canvas` is right on a page and wrong inside a
 * Box, a Dialog, or a docs preview that paints no background at all. The binding is already reading
 * layout on every draw, so it reads this too: the first ancestor that paints something is the
 * ground, by definition.
 *
 * IMAGE AND COLOUR BOTH. Reading `backgroundColor` alone was wrong and looked it: this system's
 * surfaces are a colour with an elevation wash layered over it (`background: <gradient> <color>`, see
 * `_color.scss`), so a folder matched only the colour and the wash on top of it gave the shape away.
 * Measured on a `raised` Box: the folder read `oklch(1 0 0)` while the Box painted that plus a 2%
 * gradient. Taking the whole `background` shorthand copies the layers in the same order.
 *
 * Anything fully transparent is skipped, because it paints nothing. Anything else is taken as given,
 * INCLUDING a semi-transparent one: compositing a stack of translucent layers back into one paint is
 * not a component's job, and a caller in that position is exactly who `--sk-folder-ground` is for.
 *
 * `null` (nothing paints all the way up) leaves the property unset, so the stylesheet's own default
 * stands. That is the honest answer, not a wrong colour confidently written.
 */
export function folderGroundFrom(
  root: Element,
  paintOf: (element: Element) => { color: string; image: string },
): string | null {
  for (let element = root.parentElement; element; element = element.parentElement) {
    const { color, image } = paintOf(element);
    const hasImage = image.trim() !== "" && image.trim() !== "none";
    const hasColour = color.trim() !== "" && !isFullyTransparent(color.trim());
    if (!hasImage && !hasColour) continue;
    /* The same order CSS itself paints them: images over the colour. */
    return hasImage ? `${image.trim()} ${hasColour ? color.trim() : "transparent"}` : color.trim();
  }
  return null;
}

/** Computed colours come back in several spellings; all that matters here is a zero alpha. */
function isFullyTransparent(color: string): boolean {
  return color === "transparent" || /(?:,|\/)\s*0(?:\.0+)?%?\s*\)$/.test(color);
}

/**
 * How much of a folder's TAIL - the empty card below its last line - the next one may hide.
 *
 * The stack's overlap used to be one number, hand-tuned against one folder's copy, and it broke the
 * moment the copy grew: a standfirst of four lines was clipped mid-sentence by the folder in front,
 * which reads as broken rather than as stacked. The height of the text has to decide the spacing,
 * and only something that MEASURES can know it - which the binding already does on every draw.
 *
 * Each folder hides its OWN tail, so the answer depends on nothing but that folder: no rule has to
 * reach a previous sibling's height, which CSS could not do anyway. `breathing` is the air left
 * under the last line, so the copy never ends flush against the fold above it.
 *
 * `foreshortening` is the folder's static forward lean paid for. The tilt turns about the bottom
 * edge, so the TOP of every folder sits higher on screen than its layout box says - the next folder
 * in a stack arrives that much sooner, and a tail measured purely in layout space overlapped the
 * copy by exactly that much (5px, measured on a phone). It is `rect.height - offsetHeight`: the
 * tilt turns about the BOTTOM edge, so the painted box is TALLER than the layout one by the same
 * distance the top edge rose.
 *
 * Clamped at zero: a folder whose content overflows its own box hides nothing and simply stacks
 * below the one before it, which is the right failure - too much space, never a cut sentence.
 */
export function folderTailFrom(
  height: number,
  contentBottom: number,
  breathing: number,
  foreshortening: number,
): number {
  /* Rounded for the same reason the path's own coordinates are: the two bindings measure the same
   * box through slightly different code paths and land a float apart, which the symmetry gate reads
   * as two different components. Sub-pixel precision buys nothing on a margin. */
  return Math.max(0, Math.round((height - contentBottom - breathing - foreshortening) * 100) / 100);
}

/**
 * The same silhouette as a `clip-path` value, for the layers that have to follow it.
 *
 * The shared state layer (`patterns/state-layer.css`) paints hover and press as a `::before` with
 * `inset: 0` and `border-radius: inherit` - a RECTANGLE, which on a folder shows up as a grey slab
 * sticking out above the fold on hover. Measured on the real page, and it is the one place a
 * non-rectangular surface cannot use the system's interaction mechanism unchanged.
 *
 * Clipping that layer is the fix, and it costs nothing that the `<svg>` route was chosen to avoid:
 * `clip-path` clips hit testing, but the state layer is already `pointer-events: none`, so there is
 * no hit area to lose. The folder keeps the kit's one interaction model instead of rolling its own
 * hover colour, which is exactly what that pattern exists to prevent.
 *
 * Written by both bindings from the SAME `d` they hand the path, so the shape and its state layer
 * can never disagree.
 */
export function folderClipPath(d: string): string {
  return d ? `path("${d}")` : "none";
}

/**
 * Reads the geometry off computed style, falling back per-property to the default above.
 *
 * Per-property rather than all-or-nothing: a brand that only wants a taller tab redeclares one
 * hook, and jsdom (which resolves no custom property it was not given) still yields a drawable
 * shape instead of NaN.
 */
export function folderGeometryFrom(styles: { getPropertyValue(property: string): string }): FolderGeometry {
  const read = (property: string, fallback: number): number => {
    const value = Number.parseFloat(styles.getPropertyValue(property));
    return Number.isFinite(value) ? value : fallback;
  };
  return {
    tabHeight: read("--sk-folder-tab-height", defaultFolderGeometry.tabHeight),
    foldLift: read("--sk-folder-fold-lift", defaultFolderGeometry.foldLift),
    tabRadius: read("--sk-folder-tab-radius", defaultFolderGeometry.tabRadius),
    shoulder: read("--sk-folder-shoulder", defaultFolderGeometry.shoulder),
    topRadius: read("--sk-folder-top-radius", defaultFolderGeometry.topRadius),
    radius: read("--sk-folder-radius", defaultFolderGeometry.radius),
  };
}

export const folderParts = {
  root: "sk-folder",
  /** The `<svg>` the silhouette is painted in. Decorative: it is the folder's BACK, never content. */
  shape: "sk-folder__shape",
  path: "sk-folder__shape-path",
  /** The strip the label sits in. Its measured inline size is what decides where the tab ends. */
  tab: "sk-folder__tab",
  content: "sk-folder__content",
  /** The layer the `previews` slot lands in. Decorative, and never in the way of a pointer. */
  previews: "sk-folder__previews",
  /** One preview's own box: what the fan transforms and what carries its mat and its shadow. */
  preview: "sk-folder__preview",
  stack: "sk-folder-stack",
} as const;

export type FolderPart = keyof typeof folderParts;
export type FolderPartClass = (typeof folderParts)[FolderPart];

export const folderAttrs = {
  root: "data-sk-folder",
  /** The node the enhancer writes `viewBox` on. */
  shape: "data-sk-folder-shape",
  /** The node the enhancer writes `d` on. */
  path: "data-sk-folder-path",
  /** The node the enhancer MEASURES. */
  tab: "data-sk-folder-tab",
  /**
   * Set by the binding once a real measurement has been written, and read by the stylesheet: an
   * unmeasured silhouette is a path of nothing, and fading a folder in from `[data-sk-folder-ready]`
   * is what keeps the first paint from showing an empty box where a folder is about to be. The same
   * shape `Breadcrumb` uses for its own measured collapse.
   */
  ready: "data-sk-folder-ready",
} as const;


/*
 * FOLDER, the contract.
 *
 * A FOLDER IS NEVER PAINTED AT REST, and there is no option to make it so. The silhouette is the
 * colour of whatever it sits on until the pointer, or the keyboard's focus, lands on it - so a page
 * of them reads as a page of plain text, and the shape resolves under its own label only when
 * someone reaches for it. That is the whole component; a folder you can see from across the room is
 * a `Box` with a heading in it, and the catalogue already has one.
 *
 * The rule that needs writing down: the reveal answers `:hover` AND `:focus-within`, never hover
 * alone. A folder that only ever appears under a mouse is a folder a keyboard reader is told
 * nothing about, and the tab is where the label's meaning lives. On a coarse pointer, where there
 * is no hover to answer, `folder.css` simply paints it - invisible-forever is a worse answer than
 * revealed-early (see the stylesheet's own note).
 *
 * The silhouette is decorative by construction: `aria-hidden` on the `<svg>`, no `role`, no name.
 * What names a folder is the content in its tab, which is why `label` is a SLOT and not a string
 * option - a folder's tab routinely holds a heading, and a heading is markup, not text.
 *
 * PREVIEWS are an optional slot, not an option: what a folder shows when you reach for it is
 * CONTENT, and content the author composes (`ImageFrame`s, usually) rather than a list of urls this
 * contract would have to learn the shape of. The folder only decides WHERE they appear and that they
 * appear on the same states the silhouette does. They are decorative by construction - the layer is
 * `aria-hidden` and takes no pointer - because they show what the folder already says in words; a
 * preview that carries meaning of its own belongs in the body, where a reader can reach it.
 *
 * THERE IS NO `tone`. Folders come in one colour, the way a drawer of folders does: a pile where
 * each one is tinted differently reads as five unrelated cards that happen to share a shape, and the
 * shape is the whole point. A design that genuinely needs to mark one folder out redeclares
 * `--sk-folder-fill` on that instance, which is how every arbitrary value is asked for here.
 */
export const folderContract = {
  id: "folder",
  css: "@skryensya/core/components/folder.css",
  parts: folderParts,

  options: {
    /**
     * This folder is being REACHED FOR by something that is neither a pointer nor the keyboard.
     *
     * It exists for touch. A folder reveals on `:hover` and `:focus-within`, and a phone has
     * neither: hover does not exist, and a tap on a link navigates rather than settling focus on it.
     * Left at that the fan never appears on a phone at all - the previews render, take up DOM, and
     * sit at `opacity: 0` forever, which is what shipped before this option.
     *
     * The obvious alternative, painting the fan permanently on touch, is worse and for a concrete
     * reason: the previews rise INTO the folder above them, so a stack would have every folder's
     * pictures covering its neighbour's copy for good.
     *
     * WHO SETS IT is the composition's business, and deliberately not this component's. "Reached
     * for" on a scrolling page usually means "nearest the middle of the screen", but it could mean
     * the one a carousel stopped at, or the one a route points at, and the policy questions (which
     * threshold, how many at once, does it latch) belong to whoever knows the page. The folder only
     * promises what it does when told: the same reveal the pointer gets, plus its fan.
     */
    active: { type: "boolean", default: false, attr: "data-active", trueValue: "" },
    /** Where a `FolderLink` goes. */
    href: { type: "string", attr: "href" },
    /**
     * How deeply each folder in a stack sits behind the one before it, as a length. An option
     * rather than only a hook because it is the stack's ANATOMY (how much of each folder a reader
     * can see at rest), not its paint; it lands on a custom property because that is the only
     * thing a length can be here.
     */
    overlap: { type: "string", styleProperty: "--sk-folder-stack-overlap" },
  },

  signatures: {
    Folder: {
      intent: ["folder", "tabbed-surface", "labelled-card", "file-folder"],
      host: { element: "div" },
      mount: folderAttrs.root,
      options: ["active"],
      slots: {
        /** What the tab holds. A heading, usually. Its width is what the silhouette is drawn around. */
        label: { accepts: "node", required: true },
        /** The folder's body. */
        children: { accepts: "node", required: true },
        /**
         * What fans out above the folder while it is being reached for. Each entry is a
         * `FolderPreview` holding whatever the author composes (`ImageFrame`, most often), the
         * same shape `Carousel` gives its own slides: the wrapper is the folder's, the content is
         * the author's. Three is what the fan is drawn for; a fourth is placed but adds nothing the
         * eye can read.
         */
        previews: { accepts: "signature", of: ["FolderPreview"] },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            element: "svg",
            part: "shape",
            mount: folderAttrs.shape,
            /* No `viewBox` and no `d` here: both are measured, and a static placeholder would be a
             * drawing of nothing that the two bindings would have to agree on the spelling of. The
             * binding writes them together, once, and marks the root ready. */
            attrs: { "aria-hidden": "true", focusable: "false", preserveAspectRatio: "none" },
            children: [{ element: "path", part: "path", mount: folderAttrs.path }],
          },
          { element: "div", part: "tab", mount: folderAttrs.tab, slot: "label" },
          { element: "div", part: "content", slot: "children" },
          {
            element: "div",
            part: "previews",
            attrs: { "aria-hidden": "true" },
            slot: "previews",
            whenGiven: "previews",
          },
        ],
      },
      react: { from: "@skryensya/react/folder", name: "Folder" },
    },

    /*
     * The whole folder as one link, the same move `TileLink` makes and for the same reason: a card
     * whose entire surface goes somewhere is an `<a>`, not a `<div>` with a click handler. It is
     * also what makes the reveal work for a keyboard at all, since the root itself takes focus.
     */
    FolderLink: {
      intent: ["folder-link", "clickable-folder", "folder-that-goes-somewhere"],
      host: { element: "a" },
      mount: folderAttrs.root,
      options: ["active", "href"],
      requires: ["href"],
      slots: {
        label: { accepts: "node", required: true },
        children: { accepts: "node", required: true },
        /** See `Folder`'s own `previews` doc. */
        previews: { accepts: "signature", of: ["FolderPreview"] },
      },
      template: {
        element: "a",
        part: "root",
        host: true,
        also: ["sk-interactive"],
        options: ["href"],
        children: [
          {
            element: "svg",
            part: "shape",
            mount: folderAttrs.shape,
            attrs: { "aria-hidden": "true", focusable: "false", preserveAspectRatio: "none" },
            children: [{ element: "path", part: "path", mount: folderAttrs.path }],
          },
          { element: "div", part: "tab", mount: folderAttrs.tab, slot: "label" },
          { element: "div", part: "content", slot: "children" },
          {
            element: "div",
            part: "previews",
            attrs: { "aria-hidden": "true" },
            slot: "previews",
            whenGiven: "previews",
          },
        ],
      },
      react: { from: "@skryensya/react/folder", name: "FolderLink" },
    },

    /*
     * A pile of folders, overlapped the way they sit in a drawer.
     *
     * A plain box rather than a list, and its children are Folders directly rather than wrapped in
     * items of their own: the overlap is one CSS rule between siblings, and an `<li>` in between
     * would exist only to be the thing that rule selects. A stack that owes list semantics (a set
     * of results, say) gets them from whatever names it, not from this.
     */
    /*
     * ONE preview's box, and the reason it exists rather than the fan styling a slotted child
     * directly: a real component clips itself. `ImageFrame` sets `clip-path: inset(0 round …)`, and
     * a clip path removes everything the element paints outside its box - an outer `box-shadow` and
     * a `drop-shadow` filter both, measured. So the mat and the shadow that tell one preview from
     * the next have nowhere to land on the picture itself.
     *
     * A wrapper the folder owns has no clip of its own, so it can carry both, and the fan transforms
     * it instead of the picture. Same move `Carousel` makes with `CarouselSlide`.
     */
    FolderPreview: {
      intent: ["folder-preview", "one-card-in-a-folder-fan"],
      host: { element: "div" },
      options: [],
      parents: ["Folder", "FolderLink"],
      slots: {
        /** The picture. An `ImageFrame`, usually; anything that draws is allowed. */
        children: { accepts: "node", required: true },
      },
      template: { element: "div", part: "preview", host: true, slot: "children" },
      react: { from: "@skryensya/react/folder", name: "FolderPreview" },
    },

    FolderStack: {
      intent: ["folder-stack", "overlapping-cards", "drawer-of-folders"],
      host: { element: "div" },
      options: ["overlap"],
      slots: {
        children: { accepts: "signature", of: ["Folder", "FolderLink"], required: true },
      },
      template: {
        element: "div",
        part: "stack",
        host: true,
        options: ["overlap"],
        slot: "children",
      },
      react: { from: "@skryensya/react/folder", name: "FolderStack" },
    },
  },
} as const satisfies ComponentContract;
