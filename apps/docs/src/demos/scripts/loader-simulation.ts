const root = document.querySelector("[data-loader-demo]");

if (root) {
  const stage = root.querySelector<HTMLElement>("[data-loader-stage]");
  const start = root.querySelector<HTMLElement>("[data-loader-start]");

  if (stage && start) {
    const run = () => {
      stage.dataset.loaderState = "busy";

      window.setTimeout(() => {
        stage.dataset.loaderState = "ready";
      }, 1400);
    };

    start.addEventListener("click", run);
    run();
  }
}
