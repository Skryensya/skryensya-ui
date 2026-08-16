/*
 * Open the composition-journey dialog on the landing page.
 * Mirrors demos/scripts/dialog-confirm.ts: showModal() is a call, not markup.
 */
document.querySelectorAll<HTMLElement>("[data-landing-dialog-open]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const dialog = document.getElementById("landing-compose-dialog");
    if (dialog instanceof HTMLDialogElement) dialog.showModal();
  });
});
