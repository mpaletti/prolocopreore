# Design

Sistema visivo di prolocopreore.it — landing fotografica a pagina unica. Le fotografie a tutto schermo sono il design; l'interfaccia è un "chrome d'inchiostro" scuro che le incornicia.

## Theme

Tema scuro fisso (non segue `prefers-color-scheme`): il chrome nasce per convivere con fotografie notturne a tutto schermo. Strategia colore: restrained su fondo scuro — neutri d'inchiostro + un solo accento, il blu dell'acqua del logo.

## Colors

Tutti i colori in OKLCH, definiti come custom properties su `:root` in `index.html`.

| Token | Valore | Uso |
|---|---|---|
| `--ink` | `oklch(16% 0.012 255)` | Fondo pagina, footer |
| `--ink-2` | `oklch(21% 0.014 255)` | Superfici in rilievo (righe footer, controlli) |
| `--line` | `oklch(32% 0.015 255)` | Bordi e separatori |
| `--text` | `oklch(96% 0.004 250)` | Testo principale su ink |
| `--text-dim` | `oklch(76% 0.012 252)` | Testo secondario, etichette (≥4.5:1 su ink) |
| `--accent` | `oklch(75% 0.115 235)` | Link, focus ring, dettagli attivi — dal blu #0091DB del logo |
| Scrim | gradienti `oklch(10% 0.01 255 / …)` | Leggibilità del testo sovrapposto alle foto |

Il logo (china nera + acqua blu) va reso in bianco sul chrome scuro con `filter: brightness(0) invert(1)` — la stessa resa "knockout" usata nei watermark delle foto ufficiali.

## Typography

Famiglia unica: **Bricolage Grotesque** (variabile, pesi 400–800, **self-hostata** in `assets/fonts/*.woff2` — nessuna richiesta a Google, scelta privacy deliberata). Scelta per gli ink-trap e il carattere artigianale che rima con il logo disegnato a china. Il contrasto lo fanno corpo e peso, non una seconda famiglia.

- Display (h1 hero): `clamp(2.4rem, 6.5vw, 4.75rem)`, peso 800, `letter-spacing: -0.025em`, `text-wrap: balance`
- Titoli footer: 0.95rem, peso 700
- Corpo: 1rem / 1.6, peso 400; massimo 70ch
- Dati e didascalie: 0.9rem, `--text-dim`
- Fallback: `system-ui, sans-serif`

## Layout

- Hero = carosello `100svh` a tutta larghezza; header fisso trasparente sopra, con gradiente scrim dall'alto.
- Contenuto hero ancorato in basso a sinistra; controlli carosello in basso a destra. Padding fluido `clamp(1rem, 4vw, 3rem)`.
- Footer a griglia: 3 colonne su desktop (`repeat(auto-fit, minmax(240px, 1fr))`), impilate su mobile.
- Z-index semantico: `--z-slides: 1; --z-scrim: 2; --z-hero-ui: 3; --z-header: 10`.

## Components

- **Carosello**: dissolvenza incrociata 1.1s tra slide, autoavanzamento 5s. "Zoom d'arrivo" sulla slide attiva: da scale 1.09 decelera a 1.02 in 2.6s (ease-out-cubic) e poi si ferma — mai zoom lento continuo, che causa shimmer sub-pixel sui dettagli fini; le immagini hanno transform 3D di base + `will-change` per restare su layer GPU. Controlli: frecce prev/next, pausa/riproduzione (WCAG 2.2.2), indicatori a segmento con riempimento progressivo. Tastiera ←/→, swipe touch, pausa a tab nascosta. Prima slide visibile senza JS. Solo la prima slide ha un `src` reale (con `srcset` 1280w/2048w, `sizes="100vw"`, `fetchpriority="high"`, preload in `<head>` per l'LCP); le slide 2-10 partono con `data-src`/`data-srcset` — sono impilate a `inset:0` nel viewport quindi `loading="lazy"` sarebbe un no-op — e `warm()` nello script del carosello promuove ciascuna al vero `src` solo alla navigazione manuale o quando ha l'intero intervallo di autoplay per caricarsi (slide successiva), per non scaricare ~1,6 MiB di foto insieme al primo paint.
- **Header**: fisso, trasparente su scrim sfumato, logo knockout bianco + wordmark, link "Eventi" che scorre alla sezione `#eventi`.
- **Footer**: dati istituzionali in `<dl>` raggruppati (Associazione / Contatti / Dati fiscali), link con sottolineatura al hover, accento blu.
- **Eventi** (`#eventi`, tra hero e footer): stessa superficie `--ink-2` del footer per le card, bordo `--line`, raggio 14px. Badge data in overlay con giorno della settimana abbreviato su tre lettere (es. "sab 18 lug"). Due gruppi: "Prossimi eventi" (card intere con foto 3:2, sottotitolo facoltativo in `--text` pieno subito sotto il titolo, anteprima descrizione troncata a 3 righe con gli a-capo tra paragrafi/voci elenco preservati — bullet "• " per le voci, non appiattita in un unico blocco di testo —, badge "N foto" quando la galleria ne ha più di una) e "Eventi passati" (card compatte orizzontali, foto 1:1 120px, titolo leggermente ingrandito, sottotitolo facoltativo sotto il titolo, senza descrizione). Ogni card è cliccabile (`role="button"`, focus da tastiera, Invio/Spazio) e apre il **modale di dettaglio**. Stati gestiti via JS: caricamento, vuoto (con rimando ai social), errore; foto mancante = placeholder col logo knockout su `--ink`. Dati letti da Supabase (vedi sotto). La copertina usa `srcset` miniatura(800w)/intera(1600w) con `sizes` sui breakpoint reali della griglia (340-420px piena, 120/88px compatta) quando la foto ha una miniatura (`thumb_url`, generata dall'upload — vedi Gestione eventi); le foto legacy senza miniatura restano sul solo url intero.
- **Modale dettaglio evento**: dialog accessibile (`role="dialog"`, `aria-modal`, focus trap, chiusura con Esc / clic sul backdrop / ✕, focus ripristinato all'uscita, scroll del body bloccato) su backdrop scuro sfumato. Mostra la **galleria foto completa** (immagine `object-fit: contain` così la foto non viene tagliata, frecce prev/next + contatore + strip di miniature quando c'è più di una foto, navigazione con ←/→), titolo, data estesa · ora · luogo, **descrizione integrale** (rich text sanificato — paragrafi, elenchi puntati, `span.rt-small`/`span.rt-big`; le descrizioni legacy in testo semplice restano su `white-space: pre-wrap`) e i link.
- **Gestione eventi** (`/management`, non linkata dalla home, `noindex`): stesso sistema visivo ma layout applicativo (non fotografico) — header statico con bordo invece che overlay, pannelli `--ink-2` per form e lista. Login email/password (Supabase Auth), CRUD eventi, **upload foto multiple** con un solo decode lato client (canvas) che produce due varianti — intera (cap 1600px, per il modale) e miniatura (cap 800px, per le card) — in WebP quando il browser lo supporta (rilevato via `canvas.toDataURL`, non dedotto da un blob nullo: Safari senza encoder WebP fa fallback silenzioso a PNG), altrimenti JPEG q0.82; entrambe caricate sotto lo stesso UUID (`id.ext` / `id-t.ext`) con `cacheControl: 31536000` (nomi immutabili, cache di un anno). Griglia di anteprime (mostrano la miniatura quando c'è) con rimozione per foto e scelta della copertina (★). Il bootstrap dopo il login scatta solo sulla transizione reale logged-out→logged-in, così i refresh di sessione di supabase-js non azzerano il form in compilazione.
- **Editor descrizione** (solo in `/management`): la textarea è sostituita da un'area `contenteditable` (`min-height: 12rem`, cresce col contenuto) con toolbar (`role="toolbar"`) — grassetto, corsivo, elenco puntato e un controllo dimensione testo **stile Word**: campo numerico (px) + freccia dedicata che apre il menu con le misure — 8/9/10/11/12/14/16/18/20/22/24/26/28/36/48/72 — e due bottoni A+/A− per lo step ±2px. Il clic sul *numero* mette solo a fuoco il campo (seleziona il valore corrente, pronto per digitare da tastiera); il clic sulla *freccia* apre il dropdown; qualsiasi valore libero tra 6 e 72 resta digitabile e si conferma con Invio (senza inviare il form). Toolbar e area editabile condividono un unico bordo (`.field-rich`) per leggersi come un solo campo. Formattazione via `document.execCommand`; la dimensione usa il marcatore `<font size="7">` sostituito deterministicamente con span `style="font-size:Npx"` (dimensioni legacy `rt-small`/`rt-big` ancora supportate in lettura), con una guardia di rientranza perché `descriptionEditor.focus()` può innescare sincronicamente un `change` nativo sul campo numerico se questo aveva un valore digitato non confermato. Il markup salvato è sanificato con un allowlist stretta (`assets/richtext.js`, condiviso con la home) sia al salvataggio sia in lettura. Il campo Luogo usa lo stesso combobox custom ma nella variante originale (menu al clic diretto sul campo, coi tre luoghi ricorrenti delle feste della Pro Loco; freccia di affordance come i `<select>`, testo comunque libero). Il combobox (`setupCombobox`, condiviso dai due campi, con supporto opzionale a una freccia-trigger dedicata) sostituisce i `<datalist>` nativi, che in Chromium filtrano le opzioni sul valore già presente nel campo e quindi non mostravano nulla al clic; il menu è un pannello `position: fixed` appeso a `<body>` per uscire dagli `overflow: hidden` dei contenitori — il listener che lo richiude su scroll della pagina ignora lo scroll interno del menu stesso (altrimenti lo `scrollIntoView` che rivela l'opzione preselezionata lo richiuderebbe da solo nello stesso istante in cui si apre).

## Motion

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint) per tutto.
- `prefers-reduced-motion: reduce`: niente Ken Burns, dissolvenze ridotte a 0.3s, niente animazione di riempimento negli indicatori, niente smooth scroll.

## Assets

- `assets/logo.svg` — sorgente vettoriale del logo (850×850, china + blu `#0091DB`), non più referenziata dalle pagine; rasterizzata una tantum in:
  - `assets/logo-small.png` (256×256) — header, footer, placeholder card evento
  - `assets/logo-512.png` — `logo` del JSON-LD Organization
  - `assets/favicon-96.png` / `assets/apple-touch-icon.png` — favicon e icona iOS su tutte le pagine
- `assets/pozfest-*.webp` — 10 fotografie dalle feste al Parco al Poz (POZFEST 2024, 2025 e 2026), risoluzione nativa (2048px, invariata rispetto ai JPG sorgente — la hero è `100svh` a piena larghezza e un downscale avrebbe fatto ingrandire l'immagine dal browser su monitor >1600px, con effetto sgranato), qualità 84, usate con `object-fit: cover` (convertite una tantum da JPG: payload complessivo comunque inferiore ai JPG originali; questi restano in `assets/` come sorgente)
- `assets/og-image.jpg` — 1200×630, crop dedicato per le anteprime social (Open Graph/Twitter Card)
- `assets/fonts/*.woff2` — Bricolage Grotesque variabile self-hostata (subset latin + latin-ext)
- `assets/richtext.js` — modulo condiviso: sanificazione allowlist delle descrizioni rich text (`sanitizeRichText`, `isRichText`, `richTextToPlain`, `plainToRichHtml`), usato sia da `/management` (al salvataggio) sia dalla home (in lettura)
- `privacy.html` — informativa privacy, stesso sistema visivo (chrome d'inchiostro, prosa max 68ch), linkata dal footer
- `404.html` — pagina d'errore brandizzata (stesso chrome, nessun JS), servita automaticamente da GitHub Pages
- `robots.txt` / `sitemap.xml` — indicizzazione: consentito tutto, nessuna esclusione esplicita (`/management` resta protetto da `noindex, nofollow` in pagina, non da `Disallow`); sitemap con la sola home (`privacy.html` è `noindex`, quindi esclusa)
- `favicon.ico` (radice, 16/32/48px) — fallback per crawler/browser che lo richiedono a prescindere dai `<link rel="icon">` in pagina; generato da `assets/logo-512.png`, sorgente non tracciata in repo (rigenerabile con `sharp` + `png-to-ico`)
- JSON-LD in `index.html`: oltre a `Organization`, un blocco `WebSite` (`name` = "Pro Loco Preore", collegato via `@id`/`publisher` all'Organization) e un `SiteNavigationElement` per la voce "Eventi" (`#eventi`) — segnali per il nome-sito e i sitelink nei risultati Google; `og:site_name` allineato allo stesso nome breve
- `assets/vendor/supabase.min.js` — `@supabase/supabase-js` UMD, vendorizzato, caricato **solo da `/management`** (auth, storage, scrittura). La home non lo carica: legge gli eventi in sola lettura con una `fetch()` REST diretta (`fetchEvents()` in `assets/supabase.js`), evitando ~200 KB di libreria inutilizzati su una singola SELECT anonima
- `assets/supabase.js` — helper Supabase condivisi (URL/chiave, formattazione data/ora, `fetchEvents()` per la home, client completo per `/management`)
