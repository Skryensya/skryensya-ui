<script lang="ts">
  import { carousel } from "@skryensya/core/machines";
  import { carouselEvents, carouselParts, type CarouselGotoDetail } from "@skryensya/core/carousel";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";
  import { remountIcons } from "../icon.js";

  /*
   * CAROUSEL, enhancer machine-backed sobre `@zag-js/carousel`.
   *
   * Reparte el trabajo por dueño: el TRACK y los SLIDES son markup autorado, así que se escanean y se
   * les parchean los atributos de la máquina (igual que Tabs). Los CONTROLES no son contenido sino
   * chrome derivado del track, así que los renderiza este componente, como el enhancer viejo, y por la
   * misma razón por la que no pueden ser autorados: cuántos dots hay no lo sabe quien escribe el HTML.
   * Lo sabe la máquina, y recién después de MEDIR.
   *
   * Ese es el bug que arregla la máquina. Los snap points reales no son uno por slide: con slides que
   * asoman, los últimos se recortan todos contra el máximo scroll y colapsan en la misma posición. El
   * enhancer viejo dibujaba un dot por slide y llamaba `scrollTo(slide.offsetLeft)`, así que los
   * últimos dots no se podían activar y el botón "siguiente" nunca se deshabilitaba. Zag deriva las
   * páginas de `getScrollSnapPositions` (medidas, recortadas y deduplicadas), por eso acá los dots
   * salen de `api.pageSnapPoints` y no de la cantidad de slides.
   *
   * El tamaño de un slide sigue siendo de CSS (`--sk-carousel-slide-size`), no de la máquina: con
   * `autoSize` Zag no impone anchos, sólo mide. Así la capa sin JS y la enhanceada son el MISMO
   * carrusel, y la máquina no se vuelve dueña del layout.
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

  // La máquina arranca sus effects (mutation/resize/intersection observers) y su entry `setSnapPoints`
  // ANTES de que corra el primer `$effect`, y para eso resuelve la pista por id y los slides por
  // `[data-part=item]`. Se siembran acá, en el cuerpo del script, para que ya estén cuando mida.
  track.id = ids.itemGroup;
  track.setAttribute("data-scope", "carousel");
  track.setAttribute("data-part", "itemGroup");
  slides.forEach((slide, index) => {
    slide.id = ids.item(index);
    slide.setAttribute("data-scope", "carousel");
    slide.setAttribute("data-part", "item");
    slide.setAttribute("data-index", String(index));
    // Lo mismo, pero de estilo: la primera medición lee `scroll-snap-align` COMPUTADO para saber
    // dónde ancla cada slide. La hoja del sistema ya lo declara, pero un consumidor puede montar sin
    // ese CSS, y ahí la máquina no encontraría ni un snap point. Es el mismo valor que Zag escribe.
    slide.style.setProperty("scroll-snap-align", "start");
  });

  /*
   * Autoplay, con el freno puesto por defecto: quien pidió menos movimiento no recibe un carrusel que
   * se mueve solo. La opción queda declarada igual, así que si el usuario cambia de preferencia el
   * markup no miente; simplemente no arranca acá.
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
    // El ancho de un slide lo pone el CSS del sistema; la máquina sólo mide dónde cae cada snap point.
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
   * WCAG 2.2.2 (Pause, Stop, Hide) y el patrón WAI-ARIA de Carousel piden que la rotación automática
   * se detenga apenas el mouse pasa por encima O el teclado entra con foco, y se reanude al salir —
   * salvo que la OTRA condición siga activa. La máquina de Zag (1.42.0) no implementa ninguna de las
   * dos: su estado `autoplay` no reacciona en absoluto a `VIEWPORT.FOCUS` (confirmado leyendo
   * `carousel.machine.js`), y no existe manejo de mouseenter/mouseleave en todo el paquete.
   *
   * `desiredPlaying` es la intención explícita del usuario — lo que el botón de pausa/play pidió por
   * última vez — independiente de la pausa TEMPORAL que hover/foco imponen. Sin esa separación, salir
   * con el mouse reanudaría un carrusel que el usuario detuvo a propósito con el botón.
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
   * Tres razones para no dibujar controles, y las tres son la misma: no hay nada que controlar.
   *   - `data-controls="none"`, el consumidor lo pidió: la pista queda como scroller con snap, se
   *     arrastra o se desliza, y el peek del siguiente slide es lo único que lo anuncia.
   *   - Un solo slide, que no es un carrusel.
   *   - Una sola página medida, o sea que todo entra a la vez y no hay a dónde ir.
   */
  const wantsControls = root.getAttribute("data-controls") !== "none";
  const showControls = $derived(wantsControls && slides.length > 1 && api.pageSnapPoints.length > 1);

  /*
   * Los ESTILOS de `connect` se escriben una sola vez; los ATRIBUTOS, en cada cambio de estado.
   *
   * El style que devuelve Zag acá es configuración estática (display, gap, snap type, overflow,
   * el ancho de un slide), derivada de props que no cambian en la vida del componente. Los
   * atributos no: `data-dragging`, `data-inview`, `aria-hidden` son estado y tienen que seguirlo.
   *
   * Y re-aplicar el style es activamente dañino, porque la máquina también escribe estilos a mano:
   * al empezar un arrastre pone `scroll-snap-type: none` para poder mover el track. Si el effect lo
   * devuelve a `x mandatory` en el mismo frame, el navegador re-snapea en cada píxel arrastrado y
   * mover el mouse 10px salta un slide entero. La configuración es nuestra, el estado es suyo.
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
   * El contrato público de eventos, intacto: `sk-carousel-change` al cambiar de página (por scroll,
   * botón, tecla, arrastre o goto) y `sk-carousel-goto` como comando de entrada. `index` es la PÁGINA,
   * que con el default de un slide por página es el índice del slide.
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
    // Los handlers de la pista (focus/blur/wheel/touch/mousedown) se cablean una vez y se re-leen en
    // cada disparo: la máquina cambia de estado y con ella el closure de Zag.
    cleanups.push(
      bindZagEvents(track, () => api.getItemGroupProps() as DomProps),
    );

    const onGoto = ((event: CustomEvent<CarouselGotoDetail>) => {
      const index = event.detail?.index ?? 0;
      // Pedir la página en la que ya se está no mueve la máquina, así que tampoco movería el scroll.
      // `refresh` re-mide y re-alinea, que es lo que un goto a la página actual tiene que significar.
      if (index === api.page) api.refresh();
      else api.scrollTo(index);
    }) as EventListener;
    root.addEventListener(carouselEvents.goto, onGoto);
    cleanups.push(() => root.removeEventListener(carouselEvents.goto, onGoto));

    // Root-level: "hovering" es cualquier punto del carrusel, no sólo la pista, y `focusin`/`focusout`
    // (a diferencia de `focus`/`blur`) burbujean, así que un único listener detecta foco en CUALQUIER
    // descendiente (un slide, el prev/next, un dot) sin necesidad de capturar en cada uno por separado.
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

    // Los chevrones se autoran como placeholders `data-sk-icon` y los hidrata el set que la app ya
    // registró con `mountIcons` (ADR-15: el set sigue siendo explícito del lado de la app).
    remountIcons(root);

    // Re-medir una vez que el DOM quedó parcheado y los controles renderizados: la primera medición
    // de la máquina corre antes que el `$effect`, y el alto de la fila de controles cambia la caja.
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

    <!-- El glifo lo dibuja el CSS a partir de `data-pressed`, no un icono: pausa/reproducir no están
         en el vocabulario estable de roles, y esto no es motivo para obligar a cada set a dibujarlos. -->
    {#if wantsAutoplay}
      <!--
        `data-pressed` y `aria-label` NO vienen del spread de Zag (que los deriva de `api.isPlaying`,
        el estado MOMENTÁNEO — suprimido mientras el mouse o el foco están encima). Vienen de
        `desiredPlaying`, la última elección EXPLÍCITA del usuario: si el botón mostrara "Reanudar"
        sólo porque el hover ya pausó la rotación, un click ahí haría lo contrario de lo que promete
        (reiniciaría en vez de detener). El `onclick` tampoco delega en el de Zag por la misma razón:
        sólo alterna `desiredPlaying`, y el efecto de arriba es el único que llama a play()/pause().
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
