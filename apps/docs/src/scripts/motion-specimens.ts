/*
 * Playback for the motion specimens (/motion).
 *
 * The animations live entirely in CSS, gated on `data-motion-playing`. This file only decides
 * WHEN, which is the part CSS can't express: a specimen has to replay on demand, and an animation
 * only restarts if the browser is forced to notice it left the tree first.
 *
 * Playback is a TRANSPORT, not a trigger. A duration is a length of time, and a length is only
 * legible next to another one, so the reader needs the set running side by side for as long as
 * they want to look at it — not one flash per click, and not a replay every time the pointer
 * happens to cross a card. Play keeps the group cycling until pause, and pause drops every tile
 * back on the start line: at rest the lanes are identical, which is what makes them comparable
 * the moment they move.
 *
 * Nothing staggers. Every figure here is a comparison ("el mismo recorrido", "el mismo tiempo"),
 * and a comparison whose subjects start at different moments isn't one.
 *
 * Reduced motion is honoured where the motion would be UNREQUESTED: nothing autoplays. A click is
 * a request, and it keeps working, because these specimens are the documentation OF the values and
 * muting them would leave the page describing a system the reader can't inspect. The tier-2 samples
 * are the honest case: they play the reduced values.
 */

const PLAYING = "data-motion-playing";
/** The beat between rounds: long enough to see everything land, short enough to keep comparing. */
const REST = 700;

const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

interface Group {
  root: HTMLElement;
  specimens: HTMLElement[];
  button: HTMLElement | null;
  /** The group's tracks repeat by themselves (`cycle-*`), so a round never ends on its own. */
  continuous: boolean;
  /** Running: either the one introductory round, or the transport. */
  playing: boolean;
  /** The transport, as opposed to the introductory round, which stops itself. */
  looping: boolean;
  timer: number | null;
}

function play(specimen: HTMLElement) {
  specimen.removeAttribute(PLAYING);
  void specimen.offsetWidth; // reflow: without it the attribute never toggled, so nothing replays
  specimen.setAttribute(PLAYING, "");
}

/** A group may be a specimen itself (one table that plays as a whole) or hold several. */
function specimensOf(group: HTMLElement): HTMLElement[] {
  const inside = [...group.querySelectorAll<HTMLElement>("[data-motion-specimen]")];
  return group.hasAttribute("data-motion-specimen") ? [group, ...inside] : inside;
}

/**
 * How long a round of this group lasts, asked of the running animations rather than of the
 * markup: the specimens are driven by the same tokens a component uses, so a retuned primitive or
 * the reduced-motion block changes the answer, and only the browser knows what it ended up being.
 */
function roundLength(specimens: HTMLElement[]): number {
  let longest = 0;
  for (const specimen of specimens) {
    for (const animation of specimen.getAnimations({ subtree: true })) {
      // A state layer's own transition is chrome, not the specimen running.
      if (!("animationName" in animation)) continue;
      const active = animation.effect?.getComputedTiming().activeDuration;
      if (typeof active === "number" && Number.isFinite(active)) {
        longest = Math.max(longest, active);
      }
    }
  }
  return longest;
}

function round(group: Group) {
  for (const specimen of group.specimens) play(specimen);

  // A loop needs no replay, it IS the replay: restarting it would only cut a cycle in half.
  if (group.continuous) return;

  const wait = roundLength(group.specimens) + REST;
  group.timer = window.setTimeout(() => (group.looping ? round(group) : stop(group)), wait);
}

function start(group: Group, looping: boolean) {
  group.playing = true;
  group.looping = looping;
  if (looping) group.button?.setAttribute("data-playing", "true");
  round(group);
}

function stop(group: Group) {
  if (group.timer !== null) window.clearTimeout(group.timer);
  group.timer = null;
  group.playing = false;
  group.looping = false;
  group.button?.setAttribute("data-playing", "false");
  // Removing the attribute removes the animation, which is what returns every tile to the start.
  for (const specimen of group.specimens) specimen.removeAttribute(PLAYING);
}

export function initMotionSpecimens() {
  const groups = [...document.querySelectorAll<HTMLElement>("[data-motion-group]")].map(
    (root): Group => ({
      root,
      specimens: specimensOf(root),
      button: root.querySelector<HTMLElement>("[data-motion-play]"),
      continuous: root.hasAttribute("data-motion-continuous"),
      playing: false,
      looping: false,
      timer: null,
    }),
  );
  if (groups.length === 0) return;

  for (const group of groups) {
    // Press play mid-introduction and you get the transport from a clean start, not a second
    // round layered over the first.
    group.button?.addEventListener("click", () => {
      const wasLooping = group.looping;
      stop(group);
      if (!wasLooping) start(group, true);
    });

    // A specimen that is a control of its own (the easing cards) plays alone on click, which is
    // how one curve gets looked at without the other six moving.
    for (const specimen of group.specimens) {
      if (specimen.tagName === "BUTTON") specimen.addEventListener("click", () => play(specimen));
    }
  }

  if (calm.matches) return;

  /* First sight: the set introduces itself once and then clears back to the start line. The
   * transport is what makes it run again — a page that never stops moving is harder to read, not
   * easier. A continuous group is the exception: its tracks have no end to stop at, so introducing
   * it means starting the transport for real, button and all, and the reader can pause it. */
  const seen = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        seen.unobserve(entry.target);
        const group = groups.find((g) => g.root === entry.target);
        if (group && !group.playing) start(group, group.continuous);
      }
    },
    { threshold: 0.35 },
  );

  for (const group of groups) seen.observe(group.root);
}
