<script lang="ts">
  import { carousel } from "@skryensya/core/machines";
  import { carouselEvents, carouselParts, type CarouselGotoDetail } from "@skryensya/core/carousel";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";
  import { remountIcons } from "../icon.js";

  /*
   * CAROUSEL, a machine-backed enhancer over `@zag-js/carousel`.
   *
   * It splits the work by owner: the TRACK and the SLIDES are authored markup, so they are scanned and
   * patched with the machine's attributes (same as Tabs). The CONTROLS are not content but chrome
   * derived from the track, so this component renders them, like the old enhancer, and for the same
   * reason they cannot be authored: how many dots there are is not known by whoever writes the HTML.
   * The machine knows, and only after MEASURING.
   *
   * That is the bug the machine fixes. The real snap points are not one per slide: with slides that
   * peek, the last ones all clamp against the maximum scroll and collapse onto the same position. The
   * old enhancer drew one dot per slide and called `scrollTo(slide.offsetLeft)`, so the last dots could
   * not be activated and the "next" button never disabled itself. Zag derives the pages from
   * `getScrollSnapPositions` (measured, clamped and deduplicated), which is why the dots here come from
   * `api.pageSnapPoints` and not from the number of slides.
   *
   * A slide's size still belongs to CSS (`--sk-carousel-slide-size`), not to the machine: with
   * `autoSize` Zag imposes no widths, it only measures. That way the no-JS layer and the enhanced one
   * are the SAME carousel, and the machine does not become the owner of the layout.
   */
  const root = getRoot();

  const track = root.querySelector<HTMLElement>(`.${carouselParts.track}`);
  if (!track) throw new Error(`[data-sk-carousel] necesita una pista .${carouselParts.track}.`);
  const slides = Array.from(track.querySelectorAll<HTMLElement>(`.${carouselParts.slide}`));

  if (!root.id) root.id = uniqueId("sk-carousel");
  const ids = {
    root: root.id,
    itemGroup: `${root.id}-track`,
    item: (index: number) => `${root.id}-slide-${index}`,
    prevTrigger: `${root.id}-prev`,
    nextTrigger: `${root.id}-next`,
    indicatorGroup: `${root.id}-dots`,
    indicator: (index: number) => `${root.id}-dot-${index}`,
  };

  // The machine starts its effects (mutation/resize/intersection observers) and its `setSnapPoints`
  // entry BEFORE the first `$effect` runs, and for that it resolves the track by id and the slides by
  // `[data-part=item]`. They are seeded here, in the script body, so they are already there when it measures.
  track.id = ids.itemGroup;
  track.setAttribute("data-scope", "carousel");
  track.setAttribute("data-part", "itemGroup");
  slides.forEach((slide, index) => {
    slide.id = ids.item(index);
    slide.setAttribute("data-scope", "carousel");
    slide.setAttribute("data-part", "item");
    slide.setAttribute("data-index", String(index));
    // The same, but for style: the first measurement reads the COMPUTED `scroll-snap-align` to know
    // where each slide anchors. The system's sheet already declares it, but a consumer may mount without
    // that CSS, and then the machine would not find a single snap point. It is the same value Zag writes.
    slide.style.setProperty("scroll-snap-align", "start");
  });

  /*
   * Autoplay, with the brake on by default: whoever asked for less motion does not get a carousel that
   * moves on its own. The option stays declared anyway, so if the user changes their preference the
   * markup does not lie; it simply does not start here.
   */
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const autoplayAttr = root.getAttribute("data-autoplay");
  const autoplayDelay = Number(autoplayAttr);
  const wantsAutoplay = autoplayAttr !== null;
  const autoplay =
    !wantsAutoplay || prefersReducedMotion
      ? false
      : Number.isFinite(autoplayDelay) && autoplayDelay > 0
        ? { delay: autoplayDelay }
        : true;

  const service = useMachine(carousel.machine, () => ({
    id: root.id,
    ids,
    slideCount: slides.length,
    orientation: (root.getAttribute("data-orientation") === "vertical" ? "vertical" : "horizontal") as
      | "vertical"
      | "horizontal",
    dir: (root.closest("[dir=rtl]") ? "rtl" : "ltr") as "ltr" | "rtl",
    loop: root.hasAttribute("data-loop"),
    autoplay,
    // ON by default. A vertical wheel scrolls the PAGE, not a horizontal track, so a mouse has no
    // other way through: without this a desktop pointer cannot move a carousel that has no controls.
    // `data-mouse-drag="off"` opts out, for slides whose text is meant to be selectable.
    allowMouseDrag: root.getAttribute("data-mouse-drag") !== "off",
    // A slide's width is set by the system's CSS; the machine only measures where each snap point falls.
    autoSize: true,
    spacing: "var(--sk-carousel-gap)",
    translations: {
      nextTrigger: "Siguiente",
      prevTrigger: "Anterior",
      indicator: (index: number) => `Ir a la diapositiva ${index + 1}`,
      item: (index: number, count: number) => `${index + 1} de ${count}`,
      autoplayStart: "Reanudar la rotación",
      autoplayStop: "Pausar la rotación",
    },
  }));

  const api = $derived(carousel.connect(service, normalizeProps));

  /*
   * WCAG 2.2.2 (Pause, Stop, Hide) and the WAI-ARIA Carousel pattern ask that automatic rotation stop
   * as soon as the mouse passes over it OR the keyboard enters with focus, and resume on leaving -
   * unless the OTHER condition is still active. Zag's machine (1.42.0) implements neither: its
   * `autoplay` state does not react at all to `VIEWPORT.FOCUS` (confirmed by reading
   * `carousel.machine.js`), and there is no mouseenter/mouseleave handling anywhere in the package.
   *
   * `desiredPlaying` is the user's explicit intent. What the pause/play button last asked for.
   * Independent of the TEMPORARY pause that hover/focus impose. Without that separation, moving the
   * mouse out would resume a carousel the user stopped on purpose with the button.
   */
  let hovering = $state(false);
  let focused = $state(false);
  let desiredPlaying = $state(Boolean(autoplay));

  $effect(() => {
    if (!wantsAutoplay) return;
    const shouldPlay = desiredPlaying && !hovering && !focused;
    if (shouldPlay === api.isPlaying) return;
    if (shouldPlay) api.play();
    else api.pause();
  });

  /*
   * Three reasons not to draw controls, and all three are the same one: there is nothing to control.
   *   - `data-controls="none"`, the consumer asked for it: the track stays a snap scroller, dragged or
   *     swiped, and the peek of the next slide is the only thing that announces it.
   *   - A single slide, which is not a carousel.
   *   - A single measured page, meaning everything fits at once and there is nowhere to go.
   */
  const wantsControls = root.getAttribute("data-controls") !== "none";
  const showControls = $derived(wantsControls && slides.length > 1 && api.pageSnapPoints.length > 1);

  /*
   * `connect`'s STYLES are written once; its ATTRIBUTES, on every state change.
   *
   * The style Zag returns here is static configuration (display, gap, snap type, overflow, a slide's
   * width), derived from props that do not change over the component's life. The attributes are not:
   * `data-dragging`, `data-inview`, `aria-hidden` are state and have to follow it.
   *
   * And re-applying the style is actively harmful, because the machine also writes styles by hand: when
   * a drag starts it sets `scroll-snap-type: none` so it can move the track. If the effect returns it to
   * `x mandatory` in the same frame, the browser re-snaps on every dragged pixel and moving the mouse
   * 10px jumps a whole slide. The configuration is ours, the state is the machine's.
   */
  let stylesWritten = false;
  $effect(() => {
    const style = !stylesWritten;
    applyZagProps(root, api.getRootProps() as DomProps, { style });
    applyZagProps(track, api.getItemGroupProps() as DomProps, { style });
    slides.forEach((slide, index) => {
      applyZagProps(slide, api.getItemProps({ index }) as DomProps, { style });
    });
    stylesWritten = true;
  });

  /*
   * The public event contract, untouched: `sk-carousel-change` on page change (by scroll, button, key,
   * drag or goto) and `sk-carousel-goto` as an input command. `index` is the PAGE, which with the
   * default of one slide per page is the slide's index.
   */
  let lastPage = -1;
  $effect(() => {
    const index = api.page;
    const count = api.pageSnapPoints.length;
    if (index === lastPage) return;
    const isInitial = lastPage === -1;
    lastPage = index;
    if (isInitial) return;
    root.dispatchEvent(new CustomEvent(carouselEvents.change, { bubbles: true, detail: { index, count } }));
  });

  const cleanups: Array<() => void> = [];
  onMount(() => {
    // The track's handlers (focus/blur/wheel/touch/mousedown) are wired once and re-read on every
    // firing: the machine changes state and with it Zag's closure.
    cleanups.push(
      bindZagEvents(track, () => api.getItemGroupProps() as DomProps),
    );

    const onGoto = ((event: CustomEvent<CarouselGotoDetail>) => {
      const index = event.detail?.index ?? 0;
      // Asking for the page you are already on does not move the machine, so it would not move the scroll
      // either. `refresh` re-measures and re-aligns, which is what a goto to the current page has to mean.
      if (index === api.page) api.refresh();
      else api.scrollTo(index);
    }) as EventListener;
    root.addEventListener(carouselEvents.goto, onGoto);
    cleanups.push(() => root.removeEventListener(carouselEvents.goto, onGoto));

    // Root-level: "hovering" is any point of the carousel, not just the track, and `focusin`/`focusout`
    // (unlike `focus`/`blur`) bubble, so a single listener detects focus on ANY descendant (a slide, the
    // prev/next, a dot) without having to capture on each one separately.
    if (wantsAutoplay) {
      const onMouseEnter = () => {
        hovering = true;
      };
      const onMouseLeave = () => {
        hovering = false;
      };
      const onFocusIn = () => {
        focused = true;
      };
      const onFocusOut = (event: FocusEvent) => {
        if (root.contains(event.relatedTarget as Node | null)) return;
        focused = false;
      };
      root.addEventListener("mouseenter", onMouseEnter);
      root.addEventListener("mouseleave", onMouseLeave);
      root.addEventListener("focusin", onFocusIn);
      root.addEventListener("focusout", onFocusOut);
      cleanups.push(() => {
        root.removeEventListener("mouseenter", onMouseEnter);
        root.removeEventListener("mouseleave", onMouseLeave);
        root.removeEventListener("focusin", onFocusIn);
        root.removeEventListener("focusout", onFocusOut);
      });
    }

    // The chevrons are authored as `data-sk-icon` placeholders and hydrated by the set the app already
    // registered with `mountIcons` (ADR-15: the set stays explicit on the app's side).
    remountIcons(root);

    // Re-measure once the DOM has been patched and the controls rendered: the machine's first
    // measurement runs before the `$effect`, and the height of the controls row changes the box.
    api.refresh();
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
  });
</script>

{#if showControls}
  <div class={carouselParts.controls} {...api.getControlProps()}>
    <button {...api.getPrevTriggerProps()} class="{carouselParts.button} sk-interactive">
      <span data-sk-icon="chevron-left" data-sk-icon-size="sm"></span>
    </button>

    <div class={carouselParts.dots} {...api.getIndicatorGroupProps()}>
      {#each api.pageSnapPoints as _, index (index)}
        <button
          {...api.getIndicatorProps({ index })}
          class="{carouselParts.dot} sk-interactive"
          aria-current={index === api.page ? "true" : undefined}
        ></button>
      {/each}
    </div>

    <button {...api.getNextTriggerProps()} class="{carouselParts.button} sk-interactive">
      <span data-sk-icon="chevron-right" data-sk-icon-size="sm"></span>
    </button>

    <!-- The glyph is drawn by CSS from `data-pressed`, not an icon: pause/play are not in the stable
         vocabulary of roles, and this is not reason enough to force every set to draw them. -->
    {#if wantsAutoplay}
      <!--
        `data-pressed` and `aria-label` do NOT come from Zag's spread (which derives them from
        `api.isPlaying`, the MOMENTARY state. Suppressed while the mouse or the focus is over it). They
        come from `desiredPlaying`, the user's last EXPLICIT choice: if the button showed "Resume" just
        because hover had already paused the rotation, a click there would do the opposite of what it
        promises (it would restart instead of stop). The `onclick` does not delegate to Zag's either, for
        the same reason: it only toggles `desiredPlaying`, and the effect above is the only one that
        calls play()/pause().
      -->
      <button
        {...api.getAutoplayTriggerProps()}
        class="{carouselParts.button} {carouselParts.autoplay} sk-interactive"
        data-pressed={desiredPlaying ? "" : undefined}
        aria-label={desiredPlaying ? "Pausar la rotación" : "Reanudar la rotación"}
        onclick={(event) => {
          if (event.defaultPrevented) return;
          desiredPlaying = !desiredPlaying;
        }}
      ></button>
    {/if}
  </div>
{/if}
