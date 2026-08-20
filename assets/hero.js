// Carosello fotografico della home (index.html e en/index.html).
// Stile in assets/hero.css. Le stringhe visibili sono scelte da <html lang>,
// come in assets/events.js.
(function () {
  // Etichette localizzate dall'attributo lang di <html>, come in events.js.
  var IS_EN = String(document.documentElement.lang || 'it').toLowerCase().indexOf('en') === 0;
  var LABEL_PAUSE = IS_EN ? 'Pause the carousel' : 'Metti in pausa il carosello';
  var LABEL_PLAY = IS_EN ? 'Play the carousel' : 'Riproduci il carosello';

  var INTERVAL = 5000;
  var FADE = 1200;

  // .hero e non un id: cosi' il modulo non dipende da un id in italiano
  // e vale identico per index.html e en/index.html.
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var slides = Array.prototype.slice.call(hero.querySelectorAll('.slide'));
  var segs = Array.prototype.slice.call(hero.querySelectorAll('.seg'));
  var toggleBtn = hero.querySelector('[data-action="toggle"]');

  var current = 0;
  var timer = null;
  var leaveTimers = {};
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var playing = !reduced.matches;

  hero.style.setProperty('--interval', INTERVAL + 'ms');

  // Le slide 2-10 partono con solo data-src/data-srcset (vedi markup): sono
  // impilate a inset:0 nel viewport, quindi loading="lazy" sarebbe un no-op e
  // scaricherebbe tutte le ~1,6 MiB insieme al primo paint. warm() promuove la
  // slide n al vero src solo quando sta per essere mostrata (nav manuale) o ha
  // l'intero intervallo di autoplay per caricarsi (slide successiva).
  function warm(n) {
    n = (n + slides.length) % slides.length;
    var img = slides[n].querySelector('img');
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
      img.sizes = img.dataset.sizes || '100vw';
      img.removeAttribute('data-srcset');
      img.removeAttribute('data-sizes');
    }
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
  }

  function go(n) {
    n = (n + slides.length) % slides.length;
    warm(n);
    if (n === current) { restartTimer(); return; }
    var prev = current;

    slides[prev].classList.remove('is-active');
    slides[prev].classList.add('is-leaving');
    slides[prev].setAttribute('aria-hidden', 'true');
    clearTimeout(leaveTimers[prev]);
    leaveTimers[prev] = setTimeout(function () {
      slides[prev].classList.remove('is-leaving');
    }, FADE);

    slides[n].classList.remove('is-leaving');
    slides[n].classList.add('is-active');
    slides[n].removeAttribute('aria-hidden');

    segs.forEach(function (s, i) {
      s.classList.toggle('is-active', i === n);
      if (i === n) { s.setAttribute('aria-current', 'true'); }
      else { s.removeAttribute('aria-current'); }
    });

    current = n;
    restartTimer();
  }

  function restartSegFill() {
    var seg = segs[current];
    seg.classList.remove('is-active');
    void seg.offsetWidth;
    seg.classList.add('is-active');
  }

  function restartTimer() {
    clearTimeout(timer);
    restartSegFill();
    if (playing && !document.hidden) {
      timer = setTimeout(function () { go(current + 1); }, INTERVAL);
    }
  }

  function setPlaying(value) {
    playing = value;
    hero.classList.toggle('is-paused', !playing);
    toggleBtn.setAttribute('aria-label', playing ? LABEL_PAUSE : LABEL_PLAY);
    if (playing) { restartTimer(); }
    else { clearTimeout(timer); }
  }

  hero.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) { return; }
    if (btn.dataset.action === 'prev') { go(current - 1); }
    else if (btn.dataset.action === 'next') { go(current + 1); }
    else if (btn.dataset.action === 'toggle') { setPlaying(!playing); }
    else if (btn.classList.contains('seg')) { go(segs.indexOf(btn)); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(current - 1); }
    else if (e.key === 'ArrowRight') { go(current + 1); }
  });

  var touchX = null;
  hero.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch') { touchX = e.clientX; }
  });
  hero.addEventListener('pointerup', function (e) {
    if (e.pointerType !== 'touch' || touchX === null) { return; }
    var dx = e.clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 45) { go(dx < 0 ? current + 1 : current - 1); }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { clearTimeout(timer); }
    else if (playing) { restartTimer(); }
  });

  setPlaying(playing);
})();
