const root = document.querySelector(".placeholder-example");
const status = root?.querySelector<HTMLElement>("[data-placeholder-status]");
const swap = root?.querySelector(".placeholder-example__swap");
const loading = root?.querySelector("[data-placeholder-loading]");
const content = root?.querySelector("[data-placeholder-content]");

window.setTimeout(() => {
  root?.setAttribute("aria-busy", "false");
  swap?.setAttribute("data-state", "loaded");
  loading?.setAttribute("aria-hidden", "true");
  content?.setAttribute("aria-hidden", "false");
  // The word comes from the markup, not from this file: it is a translation, and translations live
  // in the tree. Written here, the script would have to be built once per language.
  if (status) status.textContent = status.dataset.loaded ?? "";
}, 5000);
