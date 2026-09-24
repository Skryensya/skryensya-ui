import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";
import { DEMO_IMAGE_FRAME_SRC } from "./image-frame";

/*
 * Every demo stands on a real surface, and that is not decoration: a folder is the colour of its own
 * GROUND until it is reached for, so a preview that paints no background has nothing for it to
 * disappear against. It is also the honest documentation - a ground is the one thing a folder needs
 * from whatever holds it.
 *
 * The two grounds below are the point of `folderGroundsTree`: the binding reads whatever actually
 * paints behind the folder, so the same composition vanishes into a sunken panel and into a raised
 * one without anybody setting a colour.
 */
const on = (surface: "sunken" | "raised", children: UsageTree | UsageTree[]): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface, padding: "xl" },
  slots: {
    /*
     * The stack is CENTRED in a full-width panel rather than the panel shrinking to it. A folder is
     * capped at `--size-wrapper-sm`, so a panel that hugged it would be a different width in every
     * preview and would drift again the moment that cap changed; a full-width ground with the stack
     * centred in it is the same picture at any viewport, and it is also how a folder meets a real
     * page - a band of surface, with the column of content sitting in it.
     */
    children: {
      contract: "layout",
      signature: "Stack",
      options: { align: "center" },
      slots: { children },
    },
  },
});

/*
 * One preview, and every one of them is the SAME picture on purpose: a fan of screenshots from one
 * project looks alike by nature, so that is the case the design has to survive. What tells one from
 * the next is its own mat and shadow, not luck about the pixels.
 *
 * `alt=""` on all of them: the layer they land in is `aria-hidden` anyway, and what they show is
 * what the folder already says in words. A picture carrying meaning of its own belongs in the body,
 * where a reader can reach it.
 */
const preview = (): UsageTree => ({
  contract: "folder",
  signature: "FolderPreview",
  slots: {
    children: {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { src: DEMO_IMAGE_FRAME_SRC, alt: "", aspect: "4/3", radius: "control" },
    },
  },
});

const heading = (text: string): UsageTree => ({
  contract: "typography",
  signature: "Heading",
  options: { headingSize: "h2", flush: true },
  children: text,
});

const body = (text: string): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { size: "sm", tone: "secondary" },
  children: text,
});

type FolderSpec = { title: string; body: string; href: string; previews?: number; active?: boolean };

const folder = ({ title, body: copy, href, previews = 0, active }: FolderSpec): UsageTree => ({
  contract: "folder",
  signature: "FolderLink",
  options: { href, ...(active ? { active: true } : {}) },
  slots: {
    label: heading(title),
    children: body(copy),
    ...(previews ? { previews: Array.from({ length: previews }, preview) } : {}),
  },
});

/*
 * One folder held `active`, with previews fanned, so tab, content, silhouette and preview all exist
 * to be named. A folder at rest is invisible against its ground; without `active` the diagram would
 * name parts the eye cannot see.
 *
 * NOT wrapped in the demo `Box`: that ground is useful for live stacks, but as an Annotated subject
 * it inflates the measured middle track and puts every leader one padding away from the folder.
 * Ground and fan headroom come from `folderAnatomyCss` instead.
 *
 * WHAT IS NAMED (and what is not):
 *   - root, tab, content, shape-path, preview (all three, one label)
 *   - NOT `shape` (absolute inset 0, same box as the root) and NOT `previews` (`block-size: 0`, a
 *     zero-height strip across the top that drew a hairline ring and nothing else)
 *
 * FLAT: the live lean (`perspective` + `rotateX`) turns every getBoundingClientRect into a skewed
 * AABB no ring can honestly wrap. The diagram drops it; the demos below keep it.
 */
export const folderAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject {
  /* Same headroom FolderStack reserves for the first folder's fan. */
  padding-block-start: var(--sk-folder-preview-rise, 92px);
  padding-block-end: var(--space-inset-lg);
  padding-inline: var(--space-inset-xl);
  background: var(--color-bg-sunken);
  text-align: center;
}

.sk-annotated__subject > .sk-folder,
.sk-annotated__subject > .sk-folder[data-active] {
  transform: none;
  translate: none;
  margin-inline: auto;
  /* What a Box ground would have given the binding to copy. */
  --sk-folder-ground: var(--color-bg-sunken);
}`;

export const folderAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("folderPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: folder({
      title: t("demo.folder.radioTitle"),
      body: t("demo.folder.radioBody"),
      href: "#folder-anatomy",
      previews: 3,
      active: true,
    }),
    items: [
      namePart(".sk-folder", "block-start", { mark: "bracket", ringPlacement: "offset", ringDistance: 12 }),
      namePart(".sk-folder__shape-path", "inline-start", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-folder__tab", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-folder__content", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-folder__preview", "block-start", {
        match: "all",
        ringPlacement: "offset",
        ringDistance: 3,
      }),
    ],
  },
});

const projects = (t: Translate): FolderSpec[] => [
  { title: t("demo.folder.radioTitle"), body: t("demo.folder.radioBody"), href: "#folder-radio" },
  { title: t("demo.folder.printerTitle"), body: t("demo.folder.printerBody"), href: "#folder-printer" },
  { title: t("demo.folder.wadaTitle"), body: t("demo.folder.wadaBody"), href: "#folder-wada" },
];

const stack = (specs: FolderSpec[]): UsageTree => ({
  contract: "folder",
  signature: "FolderStack",
  options: { overlap: "100px" },
  slots: { children: specs.map(folder) },
});

/*
 * THE COMPONENT, as it is meant to be used: a stack, invisible until you reach into it, with a fan
 * of previews behind the folder you are on. This opens the page because it is the whole idea in one
 * specimen - a single folder is a fragment of it, and a stack with the shapes always painted is a
 * different component (a `Box` with a heading in it).
 */
export const folderTree = (t: Translate): UsageTree =>
  on("sunken", stack(projects(t).map((spec, index) => ({ ...spec, previews: index === 0 ? 3 : 2 }))));

/** The same stack with nothing behind the folders: previews are a flourish, never the mechanism. */
export const folderPlainTree = (t: Translate): UsageTree => on("sunken", stack(projects(t)));

/*
 * The same composition on two grounds, as TWO specimens rather than one stacked pair: side by side
 * in a single preview they read as one demo whose halves differ, which is the opposite of the point.
 * Apart, each is a folder disappearing into the surface it was given, and the reader compares them
 * the way they would compare two pages.
 *
 * Nothing is configured per ground: the binding copies whatever actually paints behind each folder,
 * the elevation wash over the colour included, so this is the proof rather than an illustration.
 */
export const folderSunkenTree = (t: Translate): UsageTree => on("sunken", stack(projects(t).slice(0, 2)));

export const folderRaisedTree = (t: Translate): UsageTree => on("raised", stack(projects(t).slice(0, 2)));

/*
 * `active` held on, which is the only way to SEE it on a desktop: the option exists for touch, where
 * there is no hover to demonstrate it with. The second folder is the one being reached for.
 */
export const folderActiveTree = (t: Translate): UsageTree =>
  on(
    "sunken",
    stack(projects(t).slice(0, 3).map((spec, index) => ({
      ...spec,
      previews: index === 1 ? 3 : 0,
      active: index === 1,
    }))),
  );
