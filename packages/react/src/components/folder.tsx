import {
  folderAttrs,
  folderClipPath,
  folderContract,
  folderGeometryFrom,
  folderGroundFrom,
  folderTailFrom,
  folderParts,
  folderPath,
  folderTabEndFrom,
} from "@skryensya/core/folder";
import { observeAppearance } from "@skryensya/core/theme-toggle";
import {
  useLayoutEffect,
  useRef,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

const { active: activeOption } = folderContract.options;



/*
 * FOLDER, the React binding.
 *
 * The silhouette is measured, not templated: `useFolderSilhouette` below reads the folder's own box
 * and its tab's, hands both to `folderPath` (`@skryensya/core/folder`) and writes the result
 * straight onto the DOM. The Vanilla enhancer does the identical thing from its own side, and both
 * call the SAME function, which is what keeps the two bindings drawing one shape rather than two
 * that look alike.
 *
 * WHY THE PATH IS WRITTEN TO THE DOM AND NOT HELD IN STATE. A `d` in `useState` re-renders the whole
 * subtree on every resize frame, and the value it renders is one the layout just produced - React
 * would be diffing an echo of the DOM back onto the DOM. `setAttribute` in a layout effect writes it
 * once, before paint, with no render at all. It is also what makes this measurable at all inside a
 * `ResizeObserver` callback, where a state update would schedule the next frame's work rather than
 * the current one's.
 */

export type FolderOwnProps = {
  /** What the tab holds. A heading, usually: the tab is where a folder says what it is. */
  label: ReactNode;
  children: ReactNode;
  /**
   * What fans out above the folder while it is being reached for. Each child is a
   * `FolderPreview` holding whatever you compose (`ImageFrame`, most often). Decorative by
   * construction - the layer is `aria-hidden` and takes no pointer.
   */
  previews?: ReactNode;
  /**
   * This folder is being reached for by something that is neither a pointer nor the keyboard: on
   * touch there is no hover, and a tap on a link navigates rather than settling focus, so without
   * this the fan never appears on a phone. Usually driven by which folder is nearest the middle of
   * the screen. See `folder.ts`'s own option doc for why the policy is the composition's.
   */
  active?: boolean;
};

export type FolderProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & FolderOwnProps;

export type FolderLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> &
  FolderOwnProps & { href: string };

export type FolderPreviewProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export type FolderStackProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** How deeply each folder sits behind the one before it. Any CSS length. */
  overlap?: string;
};

/**
 * Measures the folder and draws its silhouette, for as long as the element lives.
 *
 * Observes BOTH boxes because they change for different reasons and neither implies the other: the
 * root's height follows its content (and its width follows the page), while the tab's width follows
 * the label's text and the font it is finally rendered in. A folder measured before its webfont
 * loads has a tab drawn around the fallback's metrics, and nothing about the root's box changes when
 * that swap happens - which is exactly the bug a root-only observer would ship.
 */
function useFolderSilhouette<Root extends HTMLElement>(
  rootRef: RefObject<Root | null>,
  shapeRef: RefObject<SVGSVGElement | null>,
  pathRef: RefObject<SVGPathElement | null>,
  tabRef: RefObject<HTMLElement | null>,
): void {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const shape = shapeRef.current;
    const path = pathRef.current;
    const tab = tabRef.current;
    if (!root || !shape || !path || !tab) return;

    const draw = () => {
      /*
       * `offsetWidth`/`offsetHeight`, never `getBoundingClientRect()`. The rect is the TRANSFORMED
       * box, so a folder inside any scaled ancestor - the docs' own preview frame scales to fit -
       * measures smaller than it lays out, and the silhouette is then drawn to the scaled number
       * inside a viewBox the browser scales again. Measured live: a 108px-tall folder in a 0.9
       * preview drew a 97px path and the corners came out visibly squashed.
       */
      const width = root.offsetWidth;
      const height = root.offsetHeight;
      const styles = getComputedStyle(root);
      const geometry = folderGeometryFrom(styles);
      const d = folderPath({
        ...geometry,
        // The tab is as tall as its label plus its own padding, so the FOLD is measured too, not
        // read off the stylesheet: a title a size larger than the hook expected would otherwise
        // hang over its own crease. The hook stays the tab's minimum.
        tabHeight: tab.offsetHeight || geometry.tabHeight,
        width,
        height,
        tabEnd: folderTabEndFrom(root, tab, styles.direction === "rtl"),
        mirror: styles.direction === "rtl",
      });
      // An unmeasurable folder (a `display: none` ancestor, a zero-height box mid-transition) keeps
      // whatever it last drew rather than being blanked: the shape it had is a better answer than no
      // shape at all, and the next real measurement replaces it.
      if (!d) return;
      shape.setAttribute("viewBox", `0 0 ${width} ${height}`);
      path.setAttribute("d", d);
      root.style.setProperty("--sk-folder-clip", folderClipPath(d));
      // The ground the folder is invisible against at rest. Read here rather than named in the
      // stylesheet because no rule can ask what colour is behind an element; `null` leaves the
      // property unset so `folder.css`'s own default stands.
      const ground = folderGroundFrom(root, (element) => {
        const style = getComputedStyle(element);
        return { color: style.backgroundColor, image: style.backgroundImage };
      });
      if (ground) root.style.setProperty("--sk-folder-ground", ground);
      else root.style.removeProperty("--sk-folder-ground");
      /*
       * How much of this folder's empty tail the next one may hide. Measured, because the height of
       * the copy is what decides whether a stack reads as stacked or as clipped, and a single tuned
       * number cannot know it. `folder.css` reads it as a negative bottom margin.
       */
      const content = root.querySelector<HTMLElement>(`.${folderParts.content}`);
      const contentBottom = content ? content.offsetTop + content.offsetHeight : height;
      const breathing = Number.parseFloat(styles.getPropertyValue("--sk-folder-inset-y")) || 0;
      // The tilt turns about the BOTTOM edge, so the top rises and the painted box comes out
      // TALLER than the layout one. That difference is exactly how much sooner the next folder arrives.
      const foreshortening = Math.max(0, root.getBoundingClientRect().height - height);
      root.style.setProperty(
        "--sk-folder-tail",
        `${folderTailFrom(height, contentBottom, breathing, foreshortening)}px`,
      );
      root.setAttribute(folderAttrs.ready, "");
    };

    draw();

    /*
     * A SCHEME FLIP IS A REDRAW, and it is not a resize. The ground above is sampled as a literal
     * colour, so it is wrong the moment light and dark swap - and every box on the page is exactly
     * where it was, so the observer below would never come back for it. Measured before this
     * existed: the folder kept painting the light ground several seconds into dark mode, until
     * something unrelated resized the page.
     */
    const stopWatchingScheme = observeAppearance(root.ownerDocument.documentElement, draw);

    if (typeof ResizeObserver === "undefined") return stopWatchingScheme;
    const observer = new ResizeObserver(draw);
    observer.observe(root);
    observer.observe(tab);
    return () => {
      observer.disconnect();
      stopWatchingScheme();
    };
    // Mount-only: every reason to redraw is a size change, and both boxes are observed. Re-running
    // this on each render would tear down and rebuild a ResizeObserver for a measurement that has
    // not moved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** The silhouette and the two content boxes: identical in both signatures, so written once. */
function FolderShape({
  label,
  children,
  previews,
  shapeRef,
  pathRef,
  tabRef,
}: {
  label: ReactNode;
  children: ReactNode;
  previews?: ReactNode;
  shapeRef: RefObject<SVGSVGElement | null>;
  pathRef: RefObject<SVGPathElement | null>;
  tabRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      {/* Decorative by construction: this is the folder's BACK, and what names a folder is whatever
          its tab holds. No `viewBox` and no `d` until the effect above has measured. */}
      <svg
        aria-hidden="true"
        className={folderParts.shape}
        focusable="false"
        preserveAspectRatio="none"
        ref={shapeRef}
      >
        <path className={folderParts.path} ref={pathRef} />
      </svg>
      <div className={folderParts.tab} ref={tabRef}>
        {label}
      </div>
      <div className={folderParts.content}>{children}</div>
      {previews ? (
        <div aria-hidden="true" className={folderParts.previews}>
          {previews}
        </div>
      ) : null}
    </>
  );
}

/** A folder-shaped surface. */
export function Folder({
  active = false,
  children,
  className,
  label,
  previews,
  ...props
}: FolderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tabRef = useRef<HTMLDivElement>(null);
  useFolderSilhouette(rootRef, shapeRef, pathRef, tabRef);

  return (
    <div
      {...props}
      className={cx(folderParts.root, className)}
      ref={rootRef}
      {...{ [activeOption.attr]: active ? activeOption.trueValue : undefined }}
    >
      <FolderShape label={label} pathRef={pathRef} previews={previews} shapeRef={shapeRef} tabRef={tabRef}>
        {children}
      </FolderShape>
    </div>
  );
}

/**
 * The whole folder as one link, the same move `TileLink` makes: a surface that goes somewhere is an
 * `<a>`, never a box with a handler. It is also what gives `reveal="interaction"` a keyboard: the
 * root takes focus itself, so `:focus-within` fires without anything else inside being focusable.
 */
export function FolderLink({
  active = false,
  children,
  className,
  label,
  previews,
  ...props
}: FolderLinkProps) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const shapeRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tabRef = useRef<HTMLDivElement>(null);
  useFolderSilhouette(rootRef, shapeRef, pathRef, tabRef);

  return (
    <a
      {...props}
      className={cx(folderParts.root, "sk-interactive", className)}
      ref={rootRef}
      {...{ [activeOption.attr]: active ? activeOption.trueValue : undefined }}
    >
      <FolderShape label={label} pathRef={pathRef} previews={previews} shapeRef={shapeRef} tabRef={tabRef}>
        {children}
      </FolderShape>
    </a>
  );
}

/**
 * One preview's box. It exists because a real component clips itself - `ImageFrame` sets
 * `clip-path`, which removes any shadow the fan would cast on it - so the mat and the shadow that
 * separate one preview from the next need a wrapper the folder owns. Same move `Carousel` makes
 * with `CarouselSlide`.
 */
export function FolderPreview({ children, className, ...props }: FolderPreviewProps) {
  return (
    <div {...props} className={cx(folderParts.preview, className)}>
      {children}
    </div>
  );
}

/** Folders overlapped the way they sit in a drawer. The overlap is one CSS rule between siblings. */
export function FolderStack({ children, className, overlap, style, ...props }: FolderStackProps) {
  const stackStyle: (CSSProperties & { "--sk-folder-stack-overlap"?: string }) | undefined = overlap
    ? { ...style, "--sk-folder-stack-overlap": overlap }
    : style;

  return (
    <div
      {...props}
      className={cx(folderParts.stack, className)}
      style={stackStyle}
    >
      {children}
    </div>
  );
}
