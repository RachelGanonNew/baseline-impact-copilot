// Intentionally uses unguarded View Transitions API to demonstrate codemod
const btnOpen = document.getElementById('open');
const btnClose = document.getElementById('close');
const dlg = document.getElementById('dlg');

btnOpen.addEventListener('click', () => {
  (document.startViewTransition
    ? document.startViewTransition(() => dlg.showModal())
    : (() => dlg.showModal())());
});

btnClose.addEventListener('click', () => dlg.close());
