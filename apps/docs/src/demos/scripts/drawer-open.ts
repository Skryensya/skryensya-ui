const trigger = document.querySelector("[data-drawer-demo-open]");
const drawer = document.getElementById("demo-drawer");

trigger?.addEventListener("click", () => {
  if (drawer instanceof HTMLDialogElement && !drawer.open) drawer.showModal();
});
