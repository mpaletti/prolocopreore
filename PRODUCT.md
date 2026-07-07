# Product

## Register

brand

## Users

Abitanti di Preore e Tre Ville, giudicariesi delle valli vicine, turisti e famiglie che cercano informazioni sull'associazione e sui suoi eventi (in primis il POZ FEST al Parco al Poz). Contesto d'uso tipico: telefono, di giorno, arrivando da una ricerca o da un link social. Cercano una risposta rapida: chi è la Pro Loco, quali sono i prossimi eventi, come contattarla, che aria si respira alle sue feste. Enti e fornitori arrivano invece per i dati fiscali (P.IVA, CF, PEC), che devono restare facili da trovare.

## Product Purpose

Sito ufficiale dell'Associazione Pro Loco di Preore APS (prolocopreore.it, GitHub Pages, HTML statico). È il biglietto da visita pubblico dell'associazione: mostra la vita degli eventi attraverso la fotografia, elenca gli eventi in programma e passati, e tiene i dati istituzionali sempre raggiungibili. Successo = un visitatore capisce in cinque secondi che questa è una comunità viva, trova gli eventi e i contatti senza cercare.

Gli eventi sono gestiti dai volontari dell'associazione tramite `/management`, una pagina non linkata dalla home e protetta da login (email + password, Supabase Auth). I dati (eventi + foto) vivono su Supabase, l'unica dipendenza esterna del sito: piano gratuito, nessun costo oltre al dominio.

## Brand Personality

Notturno, autentico, artigianale. La voce del sito è sobria ed elegante: le fotografie portano l'energia del festival, il "chrome" (header, footer, controlli) resta scuro, discreto e curato. Il logo — un disegno a china del paese con l'acqua blu — è l'ancora dell'identità: fatto a mano, non corporate.

## Anti-references

- Il sito-vetrina Pro Loco datato: sfondi bianchi, clip-art, testo centrato Comic-Sans-adjacent, banner animati.
- Il template SaaS: hero con claim + due bottoni, griglie di card identiche, gradient text.
- La grafica "festival acido" (rosso/crema/verde del logo POZ FEST) applicata a tutto il sito: quell'identità appartiene al singolo evento, non all'associazione.

## Design Principles

1. **La fotografia è il design.** Le immagini a tutto schermo raccontano; l'interfaccia si limita a incorniciarle.
2. **Chrome d'inchiostro.** Header e footer scuri e quieti, come la china del logo: mai in competizione con le foto.
3. **I dati si trovano, non si cercano.** Informazioni fiscali e contatti sempre in fondo alla pagina, leggibili e copiabili.
4. **Fatto a mano, non fatto in serie.** Dettagli con carattere (tipografia con personalità, didascalie con voce) al posto di pattern da template.
5. **Leggero come una pagina statica.** Niente framework, niente build: HTML/CSS/JS che GitHub Pages serve così com'è; l'unica chiamata di rete in più è verso Supabase per leggere gli eventi.

## Accessibility & Inclusion

WCAG 2.1 AA. Testo sovrapposto alle foto sempre su scrim con contrasto ≥4.5:1. Il carosello auto-avanzante ha controllo pausa/riproduzione (WCAG 2.2.2), frecce e indicatori con target ≥44px, navigazione da tastiera e alt text descrittivi in italiano. `prefers-reduced-motion` disattiva Ken Burns e riduce le transizioni a dissolvenze rapide.
