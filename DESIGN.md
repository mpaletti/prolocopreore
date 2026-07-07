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

- **Carosello**: dissolvenza incrociata 1.1s tra slide, autoavanzamento 6s. "Zoom d'arrivo" sulla slide attiva: da scale 1.09 decelera a 1.02 in 2.6s (ease-out-cubic) e poi si ferma — mai zoom lento continuo, che causa shimmer sub-pixel sui dettagli fini; le immagini hanno transform 3D di base + `will-change` per restare su layer GPU. Controlli: frecce prev/next, pausa/riproduzione (WCAG 2.2.2), indicatori a segmento con riempimento progressivo. Tastiera ←/→, swipe touch, pausa a tab nascosta. Prima slide visibile senza JS.
- **Header**: fisso, trasparente su scrim sfumato, logo knockout bianco + wordmark, link "Informazioni" che scorre al footer.
- **Footer**: dati istituzionali in `<dl>` raggruppati (Associazione / Contatti / Dati fiscali), link con sottolineatura al hover, accento blu.
- **Eventi** (`#eventi`, tra hero e footer): stessa superficie `--ink-2` del footer per le card, bordo `--line`, raggio 14px. Due gruppi: "Prossimi eventi" (card intere con foto 3:2, badge data in overlay, descrizione, link) e "Archivio" (card compatte orizzontali, foto 1:1 120px, senza descrizione). Stati gestiti via JS: caricamento, vuoto (con rimando ai social), errore; foto mancante = placeholder col logo knockout su `--ink`. Dati letti da Supabase (vedi sotto).
- **Gestione eventi** (`/management`, non linkata dalla home, `noindex`): stesso sistema visivo ma layout applicativo (non fotografico) — header statico con bordo invece che overlay, pannelli `--ink-2` per form e lista. Login email/password (Supabase Auth), CRUD eventi, upload foto con ridimensionamento lato client (canvas, cap 1600px) prima dell'upload sullo storage.

## Motion

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint) per tutto.
- `prefers-reduced-motion: reduce`: niente Ken Burns, dissolvenze ridotte a 0.3s, niente animazione di riempimento negli indicatori, niente smooth scroll.

## Assets

- `assets/logo.svg` — logo vettoriale 850×850 (china + blu `#0091DB`)
- `assets/pozfest-*.jpg` — 12 fotografie dalle feste al Parco al Poz (POZFEST24, POZ Party, POZ FEST 2026; ~2048×1365), ordinate nel carosello alternando persone e cibo, usate con `object-fit: cover`
- `assets/fonts/*.woff2` — Bricolage Grotesque variabile self-hostata (subset latin + latin-ext)
- `privacy.html` — informativa privacy, stesso sistema visivo (chrome d'inchiostro, prosa max 68ch), linkata dal footer
- `assets/vendor/supabase.min.js` — `@supabase/supabase-js` UMD, vendorizzato (nessuna richiesta a CDN di terzi a runtime, coerente con i font self-hostati)
- `assets/supabase.js` — client Supabase condiviso da home e `/management`, più helper di formattazione data/ora
