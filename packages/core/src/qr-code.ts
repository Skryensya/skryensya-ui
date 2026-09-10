/// <reference path="./qrcode.d.ts" />
/* A triple-slash reference and not merely a sibling `.d.ts`: `react` and `ai-compiler` compile this
   file from source rather than from a build, and their own `include` globs never reach into this
   package. The reference travels with the file, so every project that compiles it gets the types. */
import { create } from "qrcode/lib/core/qrcode.js";
import type { ComponentContract } from "./contract.js";

/** Error correction level, weakest to strongest. Recovers roughly 7 / 15 / 25 / 30 percent. */
export const qrLevels = ["L", "M", "Q", "H"] as const;
export type QrLevel = (typeof qrLevels)[number];

/** Thrown when the payload cannot be encoded at all: too long for version 40 at this level. */
export class QrError extends Error {}

/*
 * QR, a string made scannable.
 *
 * THE ENCODER IS `qrcode` (node-qrcode), NOT OURS. It was ours for about an hour, and the hour was
 * instructive: transcribing the standard's block tables by hand put a wrong value at version 32
 * level H, which produces symbols that simply do not scan and which no test short of a full decoder
 * would have caught. A library at seventeen million downloads a week has had that class of bug found
 * by other people already. Core takes runtime dependencies where a good implementation exists
 * (eighteen Zag machines are the precedent); this is that same call.
 *
 * WE IMPORT `lib/core/qrcode.js`, NOT THE PACKAGE ROOT. The root is the rendering API and drags
 * `pngjs` and `yargs` behind it; the core path is the symbol builder and pulls one small graph
 * library for segmentation. Verified: 23 modules loaded, one of them outside the package.
 *
 * NO KANJI MODE, deliberately. Byte mode carries UTF-8, so Japanese text encodes correctly either
 * way; kanji mode only makes it denser (13 bits per character against 24). Supporting it means
 * owning a 7,000 entry Shift-JIS table, which is a real maintenance surface bought for a size
 * optimisation nobody has asked for. If it is ever wanted, `qrcode` supports it through its own
 * `toSJISFunc` helper and this file is where it would be wired in.
 *
 * WHAT IS STILL OURS IS THE GEOMETRY, because no encoder does it: merging the dark modules into one
 * `<path>`, clearing a hole for a logo, and the three module shapes. A version
 * 40 symbol is 177x177, and the three ways to draw it cost, at that size: 16,020 elements and 669KB
 * as one rect per module, 7,872 and 329KB with horizontal runs merged, or ONE element and 113KB as a
 * single path. Even a plain URL at level H lands around version 6, where the same comparison reads
 * 894 elements against one. A collection of module elements is not a rendering strategy that
 * survives the range this contract promises.
 *
 * THE MODULES ARE NOT DATA, which is the line between this and `chart`. A chart models its series as
 * an `items` slot because the bars ARE the numbers, so the DOM carries the accessible rendering for
 * free. A QR's modules are an encoding artifact: nobody reads them, nobody should type them, and a
 * screen reader walking them would learn less than `role="img"` and a label already say. So the
 * matrix is computed, not authored, and the accessible name is a slot of its own.
 *
 * WHICH MEANS THE PATH IS COMPUTED AT BUILD TIME, in the markup emitter, from the same function the
 * React binding calls at render. That is the `paginationRange` arrangement (decision 13) applied to
 * an attribute instead of a collection, and it is what keeps the Vanilla binding real: unlike a
 * chart, whose bars paint from CSS and whose line is an optional upgrade, a QR has no degraded
 * rendering. Without its geometry it is not a worse QR, it is a blank box.
 *
 * WHAT THIS CONTRACT DOES NOT HAVE: a caption, a surface, a download button, a "share" affordance.
 * A QR under a heading beside a copyable link is a COMPOSITION, and the kit already publishes every
 * piece of it.
 */

export const qrCodeParts = {
  root: "sk-qr-code",
  frame: "sk-qr-code__frame",
  modules: "sk-qr-code__modules",
  logo: "sk-qr-code__logo",
} as const;
export type QrCodePart = keyof typeof qrCodeParts;

/** How each dark module is drawn. Geometry only; colour is a styling hook, never an option. */
export const qrModuleShapes = ["square", "dot", "rounded"] as const;
export type QrModuleShape = (typeof qrModuleShapes)[number];

/** Rendered footprint, in the same token vocabulary the rest of the kit sizes things with. */
export const qrSizes = ["sm", "md", "lg", "xl"] as const;
export type QrSize = (typeof qrSizes)[number];

/**
 * Colour of the modules. The same vocabulary `chart` uses, for the same reason: a closed list, so a
 * tint cannot be set to something a camera refuses to read.
 *
 * Every value resolves to a DARK step of its palette and stays there in both colour schemes, which
 * is not a stylistic call: at the default polarity the paper is light, so a tint that flipped light
 * in dark mode would invert the symbol's contrast and stop it scanning.
 */
export const qrTones = ["neutral", "accent", "success", "warning", "danger", "info"] as const;
export type QrTone = (typeof qrTones)[number];

/**
 * Which way round the symbol is painted, and the one option here that is about WORKING rather than
 * about looking.
 *
 * `auto` follows the reader's colour scheme and is the DEFAULT: a light chip in light mode, a dark
 * one in dark mode. It is the value that looks native on any surface, and it is a deliberate choice
 * over the safer `light`, made knowing the trade: ISO/IEC 18004 specifies dark-on-light and only
 * promises that polarity, so an inverted symbol is read by current phone cameras (iOS and Android
 * both handle it) rather than by every reader that has ever existed. A project printing codes, or
 * shipping to scanners it does not control, should say `light` and stop thinking about it.
 *
 * `light` is dark modules on a light ground, pinned: the polarity the standard specifies, the one
 * every reader accepts, and the right answer whenever the code leaves the screen.
 *
 * `dark` is the deliberate opposite, for a dark poster or a dark surface where a light chip would
 * look pasted on. Modern phone cameras read it; the standard does not require them to, so it is opt
 * in and never a default.
 *
 * The symbol is painted from the same `light-dark()` tokens in all three cases, and it has always
 * been an inline SVG drawing in `currentColor`. All these values decide is which branch wins, which
 * the stylesheet does by setting `color-scheme` on the box rather than by hard-coding a colour.
 */
/**
 * Which of the standard's eight mask patterns is XORed over the symbol before it is drawn.
 *
 * A mask is not decoration and changes nothing about what the code says: every one of the eight
 * carries the identical payload and every reader undoes it from the format field. What it changes is
 * the PICTURE  -  masking exists to break up the large uniform blocks and finder-lookalike runs that
 * a raw encoding tends to produce, because those are what a camera misreads.
 *
 * `auto` is the default and the right answer: the encoder builds all eight, scores each with the
 * standard's four penalty rules, and keeps the quietest. Naming one is for reproducing a specific
 * symbol byte for byte, or for showing what the choice actually does, which is the only reason this
 * is in the vocabulary at all.
 */
export const qrMasks = ["auto", "0", "1", "2", "3", "4", "5", "6", "7"] as const;
export type QrMask = (typeof qrMasks)[number];

export const qrPolarities = ["auto", "light", "dark"] as const;
export type QrPolarity = (typeof qrPolarities)[number];

export type QrGeometryOptions = {
  readonly level?: QrLevel;
  /** One of the eight mask patterns, or `auto` to let the penalty rules choose. See `qrMasks`. */
  readonly mask?: QrMask;
  readonly moduleShape?: QrModuleShape;
  /** Modules of clear margin on every side. Four is what the standard requires; zero if the layout
   *  around it already provides the margin. */
  readonly quietZone?: number;
  /**
   * Fraction of the symbol's width reserved for a logo, 0 to 0.5.
   *
   * The reserved modules are CLEARED rather than merely covered. A logo laid over live modules
   * leaves half-dark cells at its edge that a scanner reads as noise; a clean hole is what error
   * correction is designed to recover from, so knocking the modules out actually scans BETTER than
   * hiding them. See `qrLogoAdvice` for the level this needs.
   */
  readonly logoRatio?: number;
};

export type QrGeometry = {
  /** The `d` of the single path that draws every dark module. */
  readonly path: string;
  /** Side of the viewBox, in modules, quiet zone included. */
  readonly extent: number;
  readonly version: number;
  readonly level: QrLevel;
};

/*
 * A SMALL CACHE, because two template nodes ask about the same symbol.
 *
 * The `<svg>` needs the viewBox and the `<path>` needs the `d`, and both are answers to "encode this
 * string": without this, every emitted QR would run the encoder twice, and a page of demos would run
 * it a few dozen times. Keyed by the full option tuple, capped so a long build cannot grow it
 * without bound.
 */
const cache = new Map<string, QrGeometry>();
const CACHE_LIMIT = 64;

/** The dark-module geometry of `value`, as one SVG path. */
export function qrGeometry(value: string, options: QrGeometryOptions = {}): QrGeometry {
  const level = options.level ?? "Q";
  const mask = options.mask ?? "auto";
  const shape = options.moduleShape ?? "square";
  const quietZone = Math.max(0, Math.round(options.quietZone ?? 4));
  const logoRatio = Math.min(0.5, Math.max(0, options.logoRatio ?? 0));
  const key = `${level}|${mask}|${shape}|${quietZone}|${logoRatio}|${value}`;

  const hit = cache.get(key);
  if (hit) return hit;

  let symbol;
  try {
    symbol = create(value, {
      errorCorrectionLevel: level,
      /* Omitted entirely rather than passed as a sentinel: the library's own default IS the scored
         choice, and there is no number that means "score them for me". */
      ...(mask === "auto" ? {} : { maskPattern: Number(mask) }),
    });
  } catch (cause) {
    /* The library throws a plain Error for "too big to store"; rethrown as ours so a caller can tell
       an encoding limit from a bug, and so the message names the value that caused it. */
    throw new QrError(
      `Cannot encode ${value.length} characters at error correction level ${level}.`,
      { cause },
    );
  }

  const size = symbol.modules.size;
  const data = symbol.modules.data;

  /*
   * THE HOT PATH READS THE LIBRARY'S BYTES DIRECTLY, and the reason is measured: materializing this
   * as a nested `boolean[][]` first (two `Array.from` closures per row, one allocation per module)
   * cost 0.84ms on a typical URL against the encoder's own 0.82ms  -  half the total time spent
   * copying a grid we were about to walk once. A version 40 symbol is 31,329 modules, so the copy is
   * the difference between a fast component and a janky one on a page full of them.
   */
  const dark = (x: number, y: number): boolean => data[y * size + x] === 1;

  /*
   * The logo hole as BOUNDS rather than as a mutation. Same reason: clearing modules by writing
   * `false` into a copied grid means making the copy. An odd-aligned span keeps the hole exactly
   * centred instead of half a module off, which is visible at small sizes.
   */
  let holeStart = 0;
  let holeEnd = -1;
  if (logoRatio > 0) {
    /*
     * THE SPAN IS A FRACTION OF THE WHOLE RENDERED BOX, quiet zone included, and NOT of the module
     * grid. That is what makes `logoRatio` mean the same thing here and in the stylesheet.
     *
     * Measured before this: the encoder cleared `size * ratio` modules while the CSS box covered
     * `ratio` of the full extent, and the two are different fractions because the quiet zone sits in
     * one and not the other. At version 4 with the default quiet zone that is 7 modules cleared under
     * a cover 8.2 modules wide, so the logo sat on live modules  -  exactly the half-painted cells the
     * clearing exists to avoid, reintroduced by the box that was supposed to fit the hole.
     */
    let span = Math.round((size + quietZone * 2) * logoRatio);
    /* `size - span` must stay even, or the hole lands half a module off centre and the asymmetry is
       visible at small sizes. */
    if ((size - span) % 2 !== 0) span += 1;
    span = Math.min(span, size);
    holeStart = (size - span) / 2;
    holeEnd = holeStart + span - 1;
  }
  const cleared = (x: number, y: number): boolean =>
    x >= holeStart && x <= holeEnd && y >= holeStart && y <= holeEnd;
  const on = (x: number, y: number): boolean => dark(x, y) && !cleared(x, y);

  const parts: string[] = [];
  const offset = quietZone;

  if (shape === "square") {
    /* Horizontal runs merged into one subpath each: the same picture, a third of the bytes, and it
       also removes the hairline seams that adjacent rects show at fractional zoom levels. */
    for (let y = 0; y < size; y++) {
      let x = 0;
      while (x < size) {
        if (!on(x, y)) {
          x++;
          continue;
        }
        let run = 0;
        while (x + run < size && on(x + run, y)) run++;
        parts.push(`M${x + offset} ${y + offset}h${run}v1h-${run}z`);
        x += run;
      }
    }
  } else if (shape === "dot") {
    /* Two arcs per module. `r` a touch under a half so neighbours read as separate dots, which is
       the whole point of asking for this shape. */
    const r = 0.42;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!on(x, y)) continue;
        const cx = x + offset + 0.5;
        const cy = y + offset + 0.5;
        parts.push(`M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0z`);
      }
    }
  } else {
    const r = 0.25;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!on(x, y)) continue;
        const px = x + offset;
        const py = y + offset;
        parts.push(
          `M${px + r} ${py}h${1 - r * 2}a${r} ${r} 0 0 1 ${r} ${r}v${1 - r * 2}` +
            `a${r} ${r} 0 0 1 ${-r} ${r}h${-(1 - r * 2)}a${r} ${r} 0 0 1 ${-r} ${-r}` +
            `v${-(1 - r * 2)}a${r} ${r} 0 0 1 ${r} ${-r}z`,
        );
      }
    }
  }

  const geometry: QrGeometry = {
    path: parts.join(""),
    extent: size + quietZone * 2,
    version: symbol.version,
    level,
  };

  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
  cache.set(key, geometry);
  return geometry;
}

/** `viewBox` for the same symbol, so the two template nodes agree without encoding it twice. */
export function qrViewBox(value: string, options: QrGeometryOptions = {}): string {
  const { extent } = qrGeometry(value, options);
  return `0 0 ${extent} ${extent}`;
}

/**
 * Whether a logo of this size can survive at this level, as an advisory rather than a rule.
 *
 * Error correction recovers a percentage of CODEWORDS, and a centred hole does not spread its damage
 * evenly across blocks, so the usable fraction is well under the level's headline number. The
 * thresholds here are the conservative ones the field settled on rather than anything the standard
 * states: a fifth of the area at H, and nothing worth trusting below Q.
 */
export function qrLogoAdvice(logoRatio: number, level: QrLevel): string | undefined {
  if (logoRatio <= 0) return undefined;
  if (level === "L" || level === "M") {
    return `A logo needs error correction Q or H to stay scannable; this symbol is at ${level}.`;
  }
  /*
   * Compared as AREA, because that is what the hole actually costs: a ratio of 0.4 sounds like
   * "under half" and removes a sixth of the symbol. The budgets are deliberately under each level's
   * headline recovery figure (25% at Q, 30% at H), since a centred hole concentrates its damage in
   * the blocks that happen to run through the middle rather than spreading it evenly.
   */
  const area = logoRatio * logoRatio;
  const budget = level === "H" ? 0.16 : 0.09;
  if (area > budget) {
    return `A logo covering ${Math.round(area * 100)}% of the symbol is past what level ${level} recovers reliably (about ${Math.round(budget * 100)}%).`;
  }
  return undefined;
}

export const qrCodeContract = {
  id: "qr-code",
  css: "@skryensya/core/components/qr-code.css",
  parts: qrCodeParts,

  options: {
    /*
     * The string the symbol carries. `computedInput`, like pagination's page and total: once the
     * matrix exists there is nothing left for the value to be an attribute of, and writing it into
     * the DOM would put a URL in the markup that nothing reads and React has no reason to mirror.
     */
    value: { type: "string", attr: "data-value", computedInput: true },
    /*
     * `Q` (about 25% recovery) AND NOT THE CONVENTIONAL `M`, which is a deliberate departure.
     *
     * `M` is the right default for a bare encoder, where the symbol is undecorated and density is
     * the only axis. This contract is not that: it ships a logo slot, a tint and three module
     * shapes, which are precisely the three things that spend the error budget. A default that only
     * holds for the undecorated case pushes the failure onto whoever uses the features the component
     * advertises, and the failure mode is a code that does not scan  -  invisible until someone is
     * standing in front of it with a phone.
     *
     * The cost is density: `Q` is roughly one version larger than `M` for the same string, and on a
     * screen a version is free. Flip it here if a project's QRs are always plain.
     */
    level: {
      type: "enum",
      values: [...qrLevels],
      default: "Q",
      attr: "data-level",
      computedInput: true,
    },
    moduleShape: {
      type: "enum",
      values: [...qrModuleShapes],
      default: "square",
      attr: "data-module-shape",
      prop: "shape",
      computedInput: true,
    },
    /* An encoder input like `level`: once the symbol exists there is nothing left for it to be an
       attribute of, so it is `computedInput` and never reaches the DOM. */
    mask: {
      type: "enum",
      values: [...qrMasks],
      default: "auto",
      attr: "data-mask",
      computedInput: true,
    },
    quietZone: { type: "number", default: 4, attr: "data-quiet-zone", computedInput: true },
    /*
     * `styleProperty` rather than `computedInput`, unlike every other encoder input here, and the
     * difference is that this one has a SECOND job. It feeds the geometry (which modules to clear)
     * AND it sizes the box the logo sits in, and only the stylesheet can do the second. Declared as
     * `computedInput` it was written nowhere, so `--sk-qr-code-logo-ratio` stayed at its `0` fallback and
     * the logo box computed to `calc(0 * 100% - 2px)`: present in the DOM, negative, invisible.
     *
     * The computation still reads the authored value straight off the tree, so nothing about the
     * cleared modules depends on how it is serialized.
     */
    logoRatio: { type: "number", default: 0, styleProperty: "--sk-qr-code-logo-ratio" },
    /** Module colour. Read by the stylesheet, never by the encoder: a tint changes no bit. */
    tone: {
      type: "enum",
      values: [...qrTones],
      default: "neutral",
      attr: "data-tone",
    },
    /** Which way round the symbol is painted. See `qrPolarities`: this one is about scanning. */
    polarity: {
      type: "enum",
      values: [...qrPolarities],
      default: "auto",
      attr: "data-polarity",
    },
    /** Rendered footprint, and one of the options here that land in the markup, because it is
     *  read by the stylesheet rather than by the encoder. */
    qrSize: {
      type: "enum",
      values: [...qrSizes],
      default: "md",
      attr: "data-size",
      prop: "size",
    },
    /*
     * The accessible name, and required for the same reason a decorative image still has to declare
     * itself: a QR labelled with its own URL is read out character by character, which is worse than
     * no label at all. So the contract asks for what the code DOES ("Menu of the day") and never
     * derives one from the value. An option rather than a slot, the same way `Avatar` names itself.
     */
    label: { type: "string", attr: "aria-label" },
  },

  signatures: {
    QRCode: {
      intent: [
        "qr",
        "qr-code",
        "quick-response-code",
        "2d-barcode",
        "scannable-link",
        "scan-to-open",
        "link-to-a-phone",
      ],
      host: { element: "div" },
      options: [
        "value",
        "level",
        "mask",
        "moduleShape",
        "quietZone",
        "logoRatio",
        "tone",
        "polarity",
        "qrSize",
        "label",
      ],
      requires: ["value", "label"],
      slots: {
        /*
         * A node, not a URL, so the middle can hold anything the kit already publishes: an
         * `ImageFrame`, an `Avatar`, an `Icon`. Pair it with `logoRatio`, which is what actually
         * clears the modules underneath.
         */
        logo: { accepts: "node" },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { role: "img" },
        children: [
          {
            element: "svg",
            part: "frame",
            attrs: { xmlns: "http://www.w3.org/2000/svg", "aria-hidden": "true", focusable: "false" },
            attrComputed: {
              compute: "qr-viewbox",
              from: ["value", "level", "mask", "moduleShape", "quietZone", "logoRatio"],
              attr: "viewBox",
            },
            children: [
              {
                element: "path",
                part: "modules",
                attrs: { fill: "currentColor" },
                attrComputed: {
                  compute: "qr-path",
                  from: ["value", "level", "mask", "moduleShape", "quietZone", "logoRatio"],
                  attr: "d",
                },
              },
            ],
          },
          { element: "div", part: "logo", slot: "logo", whenGiven: "logo" },
        ],
      },
      react: { from: "@skryensya/react/qr-code", name: "QRCode" },
    },
  },
} as const satisfies ComponentContract;
