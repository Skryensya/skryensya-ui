const trigger = document.querySelector("[data-dialog-demo-open]");
const dialog = document.getElementById("demo-confirm");

trigger?.addEventListener("click", () => {
  if (dialog instanceof HTMLDialogElement) dialog.showModal();
});
