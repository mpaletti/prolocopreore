# Product

## Register

brand

## Users

Abitanti di Preore e Tre Ville, giudicariesi delle valli vicine, turisti e famiglie che cercano informazioni sull'associazione e sui suoi eventi (in primis il POZ FEST al Parco al Poz). Contesto d'uso tipico: telefono, di giorno, arrivando da una ricerca o da un link social. Cercano una risposta rapida: chi è la Pro Loco, quali sono i prossimi eventi, come contattarla, che aria si respira alle sue feste. Enti e fornitori arrivano invece per i dati fiscali (P.IVA, CF, PEC), che devono restare facili da trovare. Una minoranza rilevante e' straniera: turisti nelle Giudicarie e nelle Dolomiti di Brenta, e chi verifica l'associazione dall'estero (piattaforme di donazione, programmi per non profit). Per loro il sito esiste anche in inglese.

## Product Purpose

Sito ufficiale dell'Associazione Pro Loco di Preore APS (prolocopreore.it, GitHub Pages, HTML statico). È il biglietto da visita pubblico dell'associazione: mostra la vita degli eventi attraverso la fotografia, elenca gli eventi in programma e passati, e tiene i dati istituzionali sempre raggiungibili. Dalla versione multi-pagina (2026) il sito è anche il luogo dove l'associazione dimostra di essere un ente reale e verificabile: missione dichiarata, ID RUNTS, indirizzo fisico e statuto integrale sono raggiungibili in un clic dalla navigazione, non solo citati in fondo alla home. Successo = un visitatore capisce in cinque secondi che questa è una comunità viva, trova gli eventi e i contatti senza cercare, e chi verifica l'associazione (piattaforme di donazione, enti, fornitori) trova i dati istituzionali senza doverli chiedere.

Struttura: home (carosello + prossimi eventi), `/chi-siamo/` (missione, attività, organizzazione), `/eventi/` (calendario completo, prossimi e passati), `/contatti/` (sede, telefono, email, PEC, social), `/trasparenza/` (dati dell'ente, organi sociali, rendiconti) e `/statuto/` (i 24 articoli trascritti, con il PDF originale depositato nel RUNTS). Header e footer sono identici su tutte le pagine pubbliche; la navigazione (Chi siamo · Eventi · Contatti · Trasparenza) è testo nell'header su desktop e un pannello a tutto schermo sotto i 760px.

**Bilingue, italiano di default.** Dal 2026 ogni pagina pubblica esiste in due lingue: l'italiano resta sugli URL canonici (`/`, `/chi-siamo/`, …) e l'inglese vive sotto `/en/` con slug inglesi (`/en/`, `/en/about/`, `/en/events/`, `/en/contact/`, `/en/transparency/`, `/en/statute/`, `/en/privacy.html`). L'italiano è il default perché il pubblico è in larghissima maggioranza italofono; l'inglese serve i turisti stranieri e chi verifica l'ente dall'estero.

**La lingua la scegli tu: nessun rilevamento automatico.** Il sito non indovina la lingua e non reindirizza mai — né via IP (impossibile su GitHub Pages, che serve file statici senza codice server) né via `navigator.language` in JavaScript. È una scelta deliberata, non una mancanza: l'IP dice dove sei, non che lingua parli (un turista tedesco in valle ha un IP italiano; un preorese all'estero no), i redirect automatici impediscono ai crawler di indicizzare entrambe le versioni, e togliere all'utente il controllo dell'URL è un danno che nessun automatismo ripaga. Al suo posto: un selettore `IT / EN` sempre visibile nell'header che porta alla **stessa pagina** nell'altra lingua, più le annotazioni `hreflang` che lasciano ai motori di ricerca il compito di mostrare la versione giusta a chi cerca. **Non aggiungere rilevamento automatico della lingua.**

Gli eventi sono gestiti dai volontari dell'associazione tramite `/management`, una pagina non linkata dalla nav e protetta da login (email + password, Supabase Auth). Ogni evento può avere più foto (galleria) e una descrizione lunga: la card mostra copertina, data e anteprima, e il clic apre un dettaglio con la galleria completa e il testo integrale. I dati (eventi + foto) vivono su Supabase, l'unica dipendenza esterna del sito: piano gratuito, nessun costo oltre al dominio.

## Brand Personality

Notturno, autentico, artigianale. La voce del sito è sobria ed elegante: le fotografie portano l'energia del festival, il "chrome" (header, footer, controlli) resta scuro, discreto e curato. Il logo — un disegno a china del paese con l'acqua blu — è l'ancora dell'identità: fatto a mano, non corporate.

## Anti-references

- Il sito-vetrina Pro Loco datato: sfondi bianchi, clip-art, testo centrato Comic-Sans-adjacent, banner animati.
- Il template SaaS: hero con claim + due bottoni, griglie di card identiche, gradient text.
- La grafica "festival acido" (rosso/crema/verde del logo POZ FEST) applicata a tutto il sito: quell'identità appartiene al singolo evento, non all'associazione.

## Design Principles

1. **La fotografia è il design.** Le immagini a tutto schermo raccontano; l'interfaccia si limita a incorniciarle.
2. **Chrome d'inchiostro.** Header e footer scuri e quieti, come la china del logo: mai in competizione con le foto.
3. **I dati si trovano, non si cercano.** Informazioni fiscali e contatti sempre in fondo alla pagina (footer condiviso) e su pagine dedicate (Contatti, Trasparenza, Statuto), leggibili e copiabili.
4. **Fatto a mano, non fatto in serie.** Dettagli con carattere (tipografia con personalità, didascalie con voce) al posto di pattern da template.
5. **Leggero come una pagina statica.** Niente framework, niente build: HTML/CSS/JS che GitHub Pages serve così com'è; l'unica chiamata di rete in più è verso Supabase per leggere gli eventi.

## Accessibility & Inclusion

WCAG 2.1 AA. Testo sovrapposto alle foto sempre su scrim con contrasto ≥4.5:1. Il carosello auto-avanzante ha controllo pausa/riproduzione (WCAG 2.2.2), frecce e indicatori con target ≥44px, navigazione da tastiera e alt text descrittivi in italiano. `prefers-reduced-motion` disattiva Ken Burns e riduce le transizioni a dissolvenze rapide. Ogni pagina dichiara la propria lingua in `<html lang>` (`it` o `en`) e marca con `lang` i frammenti nell'altra lingua (la ragione sociale italiana in una pagina inglese, i nomi delle feste), così gli screen reader cambiano voce dove serve; il selettore di lingua è un `<nav>` etichettato con la lingua corrente marcata `aria-current` e ogni voce ha un'area di tocco di 44px.
