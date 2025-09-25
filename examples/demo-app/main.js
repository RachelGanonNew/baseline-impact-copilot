// Intentionally uses unguarded View Transitions API to demonstrate codemod
const btnOpen = document.getElementById('open');
const btnClose = document.getElementById('close');
const dlg = document.getElementById('dlg');
const btnInfo = document.getElementById('info');

btnOpen.addEventListener('click', () => {
  (document.startViewTransition
    ? document.startViewTransition(() => dlg.showModal())
    : (() => dlg.showModal())());
});

btnClose.addEventListener('click', () => dlg.close());

// Popover API (JS) demo — intentionally unguarded to showcase detection
btnInfo.addEventListener('click', () => {
  btnInfo.showPopover();
});
