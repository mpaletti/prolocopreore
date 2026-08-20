// Toggle del menu mobile a tutto viewport (.nav-panel), condiviso da tutte le
// pagine pubbliche. Riusa lo stesso schema di focus trap / Esc / scroll-lock
// della modale di dettaglio evento (vedi assets/events.js).
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.getElementById('nav-panel');
  if (!toggle || !panel) return;

  var lastFocused = null;

  function focusables() {
    return Array.prototype.filter.call(
      panel.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null; }
    );
  }

  function open() {
    lastFocused = document.activeElement;
    panel.hidden = false;
    document.body.classList.add('modal-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', onKeydown);
    var els = focusables();
    if (els.length) els[0].focus();
  }

  function close() {
    panel.hidden = true;
    document.body.classList.remove('modal-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    var els = focusables();
    if (!els.length) return;
    var first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  toggle.addEventListener('click', function () {
    if (panel.hidden) open(); else close();
  });
  panel.addEventListener('click', function (e) {
    if (e.target.closest('[data-nav-close]')) close();
  });
  window.addEventListener('resize', function () {
    if (!panel.hidden && window.innerWidth >= 760) close();
  });
})();
