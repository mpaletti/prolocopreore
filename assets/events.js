// Rendering della sezione eventi (card + modale di dettaglio), condiviso da
// index.html (solo "Prossimi eventi") ed /eventi/ (prossimi + archivio).
// initEvents({ showPast }) monta lo stato sui nodi già presenti nel DOM
// (vedi il markup di .events in entrambe le pagine).
import { isConfigured, fetchEvents, fmtDate, fmtDateShort, fmtTime, todayISO, getPhotos } from './supabase.js';
import { sanitizeRichText, isRichText, richTextToPreview } from './richtext.js';

// Stringhe dell'interfaccia, scelte da <html lang> come il locale delle date in
// supabase.js. Solo il contorno è tradotto: titolo, sottotitolo e descrizione
// degli eventi restano come li scrivono i volontari nel gestionale (il database
// non ha colonne per lingua) — di norma sono nomi propri (POZFEST, Sagra di
// Santa Maria Maddalena) che non andrebbero tradotti comunque.
var IS_EN = String(document.documentElement.lang || 'it').toLowerCase().indexOf('en') === 0;
var T = IS_EN ? {
  more: 'Details →',
  openEvent: 'Open event details: ',
  showPhoto: 'Show photo ',
  notConfigured: 'The events section is being set up — check back soon.',
  loadError: 'We could not load the events right now — please try again later.'
} : {
  more: 'Dettagli →',
  openEvent: 'Apri i dettagli dell\'evento: ',
  showPhoto: 'Mostra foto ',
  notConfigured: 'Sezione eventi in allestimento — torna a trovarci a breve.',
  loadError: 'Non è stato possibile caricare gli eventi al momento — riprova più tardi.'
};

export function initEvents(opts) {
  var showPast = !!(opts && opts.showPast);

  var status = document.querySelector('.events-status');
  var upcomingList = document.querySelector('[data-group="prossimi"] .events-grid');
  var upcomingEmpty = document.querySelector('[data-group="prossimi"] .events-empty');
  var archiveGroup = showPast ? document.querySelector('[data-group="passati"]') : null;
  var archiveList = archiveGroup ? archiveGroup.querySelector('.events-grid') : null;
  var eventsSection = document.querySelector('.events');

  var eventsById = {};

  var MULTI_ICON = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<rect x="3" y="3" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/>' +
    '<path d="M8 21h11a2 2 0 0 0 2-2V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderCard(ev, compact) {
    var badge = fmtDateShort(ev.event_date);
    var meta = [fmtTime(ev.start_time), ev.location].filter(Boolean).join(' · ');
    var photos = getPhotos(ev);
    var cover = photos.length ? photos[0] : null;

    // Con thumb_url (foto caricate dopo l'introduzione delle miniature): srcset
    // thumb/full con i breakpoint reali della card (.events-grid, 340-420px piena,
    // 120/88px compatta) cosi' le card non scaricano piu' il jpg da 1600px intero.
    // Le foto legacy senza thumb_url restano sul solo url (nessun srcset).
    var coverSrcset = (cover && cover.thumb_url)
      ? ' srcset="' + escapeHtml(cover.thumb_url) + ' 800w, ' + escapeHtml(cover.url) + ' 1600w"' +
        ' sizes="' + (compact ? '120px' : '(max-width: 680px) 92vw, 420px') + '"'
      : '';
    var photoHtml = cover
      ? '<div class="event-photo"><img src="' + escapeHtml(cover.thumb_url || cover.url) + '"' + coverSrcset + ' alt="" loading="lazy" decoding="async">'
      : '<div class="event-photo is-placeholder"><img src="/assets/logo-small.png" width="256" height="256" alt="" loading="lazy">';
    photoHtml += '<span class="event-date-badge"><span>' + badge.weekday + '</span><strong>' + badge.day + '</strong><span>' + badge.month + '</span></span>';
    if (!compact && photos.length > 1) {
      photoHtml += '<span class="event-photo-count" aria-hidden="true">' + MULTI_ICON + photos.length + '</span>';
    }
    photoHtml += '</div>';

    var subtitleHtml = ev.subtitle ? '<p class="event-subtitle">' + escapeHtml(ev.subtitle) + '</p>' : '';
    var metaHtml = meta ? '<p class="event-meta">' + escapeHtml(meta) + '</p>' : '';
    var descText = isRichText(ev.description) ? richTextToPreview(ev.description) : ev.description;
    var descHtml = (!compact && descText) ? '<p class="event-desc">' + escapeHtml(descText) + '</p>' : '';
    var moreHtml = compact ? '' : '<span class="event-more" aria-hidden="true">' + T.more + '</span>';

    return '<li><div class="event-card' + (compact ? ' event-card--compact' : '') + '"' +
      ' data-id="' + escapeHtml(ev.id) + '" role="button" tabindex="0"' +
      ' aria-label="' + T.openEvent + escapeHtml(ev.title) + '">' + photoHtml +
      '<div class="event-body"><h4>' + escapeHtml(ev.title) + '</h4>' + subtitleHtml + metaHtml + descHtml + moreHtml + '</div></div></li>';
  }

  /* ---------- Modale di dettaglio ---------- */

  var modal = document.getElementById('event-modal');
  var modalDialog = modal.querySelector('.event-modal-dialog');
  var modalClose = modal.querySelector('.event-modal-close');
  var modalGallery = modal.querySelector('.event-modal-gallery');
  var modalImg = modal.querySelector('.event-modal-img');
  var galleryPrev = modal.querySelector('.gallery-prev');
  var galleryNext = modal.querySelector('.gallery-next');
  var galleryCounter = modal.querySelector('.gallery-counter');
  var modalThumbs = modal.querySelector('.event-modal-thumbs');
  var modalTitle = modal.querySelector('#modal-title');
  var modalSubtitle = modal.querySelector('.event-modal-subtitle');
  var modalMeta = modal.querySelector('.event-modal-meta');
  var modalDesc = modal.querySelector('.event-modal-desc');
  var modalLinks = modal.querySelector('.event-modal-links');

  var galleryPhotos = [];
  var galleryIndex = 0;
  var lastFocused = null;

  function showPhoto(i) {
    var n = galleryPhotos.length;
    if (!n) return;
    galleryIndex = (i + n) % n;
    modalImg.src = galleryPhotos[galleryIndex].url;
    var multi = n > 1;
    galleryPrev.hidden = galleryNext.hidden = !multi;
    galleryCounter.hidden = !multi;
    galleryCounter.textContent = (galleryIndex + 1) + ' / ' + n;
    Array.prototype.forEach.call(modalThumbs.children, function (t, idx) {
      t.classList.toggle('is-active', idx === galleryIndex);
    });
  }

  function renderThumbs() {
    if (galleryPhotos.length > 1) {
      modalThumbs.innerHTML = galleryPhotos.map(function (p, idx) {
        return '<button type="button" class="event-modal-thumb" data-idx="' + idx +
          '" aria-label="' + T.showPhoto + (idx + 1) + '"><img src="' + escapeHtml(p.thumb_url || p.url) + '" alt=""></button>';
      }).join('');
      modalThumbs.hidden = false;
    } else {
      modalThumbs.innerHTML = '';
      modalThumbs.hidden = true;
    }
  }

  function openModal(ev) {
    galleryPhotos = getPhotos(ev);
    galleryIndex = 0;

    modalTitle.textContent = ev.title || '';
    modalSubtitle.textContent = ev.subtitle || '';
    modalSubtitle.hidden = !ev.subtitle;
    modalMeta.textContent = [fmtDate(ev.event_date), fmtTime(ev.start_time), ev.location].filter(Boolean).join(' · ');

    if (isRichText(ev.description)) {
      modalDesc.classList.remove('is-plain');
      modalDesc.innerHTML = sanitizeRichText(ev.description);
    } else {
      modalDesc.classList.add('is-plain');
      modalDesc.textContent = ev.description || '';
    }
    modalDesc.hidden = !ev.description;

    var links = Array.isArray(ev.links) ? ev.links : [];
    if (links.length) {
      modalLinks.innerHTML = links.map(function (l) {
        var isButton = l.style === 'button';
        return '<li><a class="' + (isButton ? 'event-link-btn' : 'event-link-text') + '" href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener">' +
          escapeHtml(l.label || l.url) + '</a></li>';
      }).join('');
      modalLinks.hidden = false;
    } else {
      modalLinks.innerHTML = '';
      modalLinks.hidden = true;
    }

    modalGallery.hidden = galleryPhotos.length === 0;
    renderThumbs();
    if (galleryPhotos.length) showPhoto(0); else modalImg.removeAttribute('src');

    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modalDialog.scrollTop = 0;
    modalClose.focus();
    document.addEventListener('keydown', onModalKeydown);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', onModalKeydown);
    modalImg.removeAttribute('src');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onModalKeydown(e) {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'ArrowLeft' && galleryPhotos.length > 1) { showPhoto(galleryIndex - 1); return; }
    if (e.key === 'ArrowRight' && galleryPhotos.length > 1) { showPhoto(galleryIndex + 1); return; }
    if (e.key === 'Tab') {
      var focusables = Array.prototype.filter.call(
        modalDialog.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])'),
        function (el) { return !el.hidden && el.offsetParent !== null; }
      );
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  galleryPrev.addEventListener('click', function () { showPhoto(galleryIndex - 1); });
  galleryNext.addEventListener('click', function () { showPhoto(galleryIndex + 1); });
  modal.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) closeModal(); });
  modalThumbs.addEventListener('click', function (e) {
    var t = e.target.closest('.event-modal-thumb');
    if (t) showPhoto(parseInt(t.dataset.idx, 10));
  });

  function cardActivate(e) {
    var card = e.target.closest('.event-card');
    if (!card || !card.dataset.id) return;
    if (e.type === 'keydown') {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
    }
    var ev = eventsById[card.dataset.id];
    if (ev) openModal(ev);
  }
  eventsSection.addEventListener('click', cardActivate);
  eventsSection.addEventListener('keydown', cardActivate);

  /* ---------- Caricamento ---------- */

  async function loadEvents() {
    if (!isConfigured) {
      status.textContent = T.notConfigured;
      return;
    }

    try {
      var data = await fetchEvents();

      eventsById = {};
      data.forEach(function (e) { eventsById[e.id] = e; });

      var today = todayISO();
      var upcoming = data.filter(function (e) { return e.event_date >= today; });

      status.hidden = true;

      if (upcoming.length) {
        upcomingList.innerHTML = upcoming.map(function (e) { return renderCard(e, false); }).join('');
        upcomingEmpty.hidden = true;
      } else {
        upcomingList.innerHTML = '';
        upcomingEmpty.hidden = false;
      }

      if (archiveList) {
        var past = data.filter(function (e) { return e.event_date < today; }).reverse();
        if (past.length) {
          archiveList.innerHTML = past.map(function (e) { return renderCard(e, true); }).join('');
          archiveGroup.hidden = false;
        }
      }
    } catch (err) {
      console.error('Errore nel caricamento degli eventi', err);
      status.hidden = false;
      status.textContent = T.loadError;
    }
  }

  loadEvents();
}
