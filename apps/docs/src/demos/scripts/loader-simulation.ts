const root = document.querySelector("[data-loader-demo]");

if (root) {
  // `hidden` belongs to HTMLElement, not to Element: the three of these are toggled below, so they
  // are queried as the type they are actually used as.
  const busy = root.querySelector<HTMLElement>("[data-loader-busy]");
  const ready = root.querySelector<HTMLElement>("[data-loader-ready]");
  const start = root.querySelector<HTMLElement>("[data-loader-start]");

  if (busy && ready && start) {
    const run = () => {
      busy.hidden = false;
      ready.hidden = true;
      start.hidden = true;

      window.setTimeout(() => {
        busy.hidden = true;
        ready.hidden = false;
        start.hidden = false;
      }, 1400);
    };

    start.addEventListener("click", run);
    run();
  }
}
