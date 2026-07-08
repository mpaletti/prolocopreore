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

- **Carosello**: dissolvenza incrociata 1.1s tra slide, autoavanzamento 5s. "Zoom d'arrivo" sulla slide attiva: da scale 1.09 decelera a 1.02 in 2.6s (ease-out-cubic) e poi si ferma — mai zoom lento continuo, che causa shimmer sub-pixel sui dettagli fini; le immagini hanno transform 3D di base + `will-change` per restare su layer GPU. Controlli: frecce prev/next, pausa/riproduzione (WCAG 2.2.2), indicatori a segmento con riempimento progressivo. Tastiera ←/→, swipe touch, pausa a tab nascosta. Prima slide visibile senza JS.
- **Header**: fisso, trasparente su scrim sfumato, logo knockout bianco + wordmark, link "Eventi" che scorre alla sezione `#eventi`.
- **Footer**: dati istituzionali in `<dl>` raggruppati (Associazione / Contatti / Dati fiscali), link con sottolineatura al hover, accento blu.
- **Eventi** (`#eventi`, tra hero e footer): stessa superficie `--ink-2` del footer per le card, bordo `--line`, raggio 14px. Badge data in overlay con giorno della settimana abbreviato su tre lettere (es. "sab 18 lug"). Due gruppi: "Prossimi eventi" (card intere con foto 3:2, sottotitolo facoltativo in `--text` pieno subito sotto il titolo, descrizione troncata a 4 righe, badge "N foto" quando la galleria ne ha più di una) e "Eventi passati" (card compatte orizzontali, foto 1:1 120px, titolo leggermente ingrandito, sottotitolo facoltativo sotto il titolo, senza descrizione). Ogni card è cliccabile (`role="button"`, focus da tastiera, Invio/Spazio) e apre il **modale di dettaglio**. Stati gestiti via JS: caricamento, vuoto (con rimando ai social), errore; foto mancante = placeholder col logo knockout su `--ink`. Dati letti da Supabase (vedi sotto).
- **Modale dettaglio evento**: dialog accessibile (`role="dialog"`, `aria-modal`, focus trap, chiusura con Esc / clic sul backdrop / ✕, focus ripristinato all'uscita, scroll del body bloccato) su backdrop scuro sfumato. Mostra la **galleria foto completa** (immagine `object-fit: contain` così la foto non viene tagliata, frecce prev/next + contatore + strip di miniature quando c'è più di una foto, navigazione con ←/→), titolo, data estesa · ora · luogo, **descrizione integrale** (rich text sanificato — paragrafi, elenchi puntati, `span.rt-small`/`span.rt-big`; le descrizioni legacy in testo semplice restano su `white-space: pre-wrap`) e i link.
- **Gestione eventi** (`/management`, non linkata dalla home, `noindex`): stesso sistema visivo ma layout applicativo (non fotografico) — header statico con bordo invece che overlay, pannelli `--ink-2` per form e lista. Login email/password (Supabase Auth), CRUD eventi, **upload foto multiple** con ridimensionamento lato client (canvas, cap 1600px) prima dell'upload sullo storage; griglia di anteprime con rimozione per foto e scelta della copertina (★). Il bootstrap dopo il login scatta solo sulla transizione reale logged-out→logged-in, così i refresh di sessione di supabase-js non azzerano il form in compilazione.
- **Editor descrizione** (solo in `/management`): la textarea è sostituita da un'area `contenteditable` con toolbar (`role="toolbar"`) — grassetto, corsivo, elenco puntato e dimensione testo in pixel (campo con **combobox custom**: menu a tendina con le misure stile Word — 10/11/12/14/16/18/20/22/24/26/28/36/40/44/48 — che si apre al clic mostrando sempre tutte le opzioni, ma qualsiasi valore libero tra 6 e 72 resta digitabile) — toolbar e area editabile condividono un unico bordo (`.field-rich`) per leggersi come un solo campo. Formattazione via `document.execCommand`; la dimensione usa il marcatore `<font size="7">` sostituito deterministicamente con span `style="font-size:Npx"` (dimensioni legacy `rt-small`/`rt-big` ancora supportate in lettura). Il markup salvato è sanificato con un allowlist stretta (`assets/richtext.js`, condiviso con la home) sia al salvataggio sia in lettura. Il campo Luogo usa lo stesso combobox custom (menu al clic coi tre luoghi ricorrenti delle feste della Pro Loco, freccia di affordance come i `<select>`, testo comunque libero). Il combobox (`setupCombobox`, condiviso dai due campi) sostituisce i `<datalist>` nativi, che in Chromium filtrano le opzioni sul valore già presente nel campo e quindi non mostravano nulla al clic; il menu è un pannello `position: fixed` appeso a `<body>` per uscire dagli `overflow: hidden` dei contenitori.

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
- `assets/vendor/supabase.min.js` — `@supabase/supabase-js` UMD, vendorizzato, caricato **solo da `/management`** (auth, storage, scrittura). La home non lo carica: legge gli eventi in sola lettura con una `fetch()` REST diretta (`fetchEvents()` in `assets/supabase.js`), evitando ~200 KB di libreria inutilizzati su una singola SELECT anonima
- `assets/supabase.js` — helper Supabase condivisi (URL/chiave, formattazione data/ora, `fetchEvents()` per la home, client completo per `/management`)
