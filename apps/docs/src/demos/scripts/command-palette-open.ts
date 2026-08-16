const trigger = document.querySelector("[data-cmdk-demo-open]");
const dialog = document.getElementById("demo-cmdk-tree");

trigger?.addEventListener("click", () => {
  if (dialog instanceof HTMLDialogElement && !dialog.open) dialog.showModal();
});
