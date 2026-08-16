const trigger = document.querySelector("[data-dialog-vaul-demo-open]");
const dialog = document.getElementById("demo-dialog-vaul");

trigger?.addEventListener("click", () => {
  if (dialog instanceof HTMLDialogElement) dialog.showModal();
});
