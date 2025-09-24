// Intentionally uses View Transitions API to showcase a diagnostic
const btnOpen = document.getElementById('open');
const btnClose = document.getElementById('close');
const dlg = document.getElementById('dlg');

btnOpen.addEventListener('click', () => {
  if (document.startViewTransition) {
    document.startViewTransition(() => dlg.showModal());
  } else {
    dlg.showModal();
  }
});

btnClose.addEventListener('click', () => dlg.close());
