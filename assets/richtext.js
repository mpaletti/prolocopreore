// Sanificazione e utilità per le descrizioni evento in rich text.
// Usato sia da management/index.html (pulizia al salvataggio) sia da index.html
// (pulizia in lettura, difesa in profondità sopra le policy RLS di Supabase).
//
// Formato consentito: p, br, strong, b, em, i, ul, li, più span con class
// esattamente "rt-small" o "rt-big" (le dimensioni di carattere dell'editor).
// Ogni altro tag viene "unwrapped" (si tiene il testo, si butta il tag);
// script/style/iframe/object vengono rimossi con tutto il contenuto.

const ALLOWED_TAGS = new Set(["P", "BR", "STRONG", "B", "EM", "I", "UL", "LI"]);
const REMOVE_TAGS = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "LINK", "META", "BASE", "NOSCRIPT", "TEMPLATE", "SVG", "MATH"]);
const SPAN_CLASSES = new Set(["rt-small", "rt-big"]);

function stripAttrs(el) {
  Array.from(el.attributes).forEach(function (attr) { el.removeAttribute(attr.name); });
}

// Rimuove il tag mantenendo i figli al suo posto (già puliti da walk()).
export function unwrapElement(el) {
  var parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}

function renameTo(el, tagName) {
  var replacement = el.ownerDocument.createElement(tagName);
  while (el.firstChild) replacement.appendChild(el.firstChild);
  el.parentNode.replaceChild(replacement, el);
  return replacement;
}

function walk(parent) {
  var child = parent.firstChild;
  while (child) {
    var next = child.nextSibling;
    if (child.nodeType === 1) {
      walk(child); // pulisce i discendenti prima di decidere sul nodo stesso
      var tag = child.tagName;
      if (REMOVE_TAGS.has(tag)) {
        child.remove();
      } else if (tag === "SPAN") {
        var cls = (child.classList.length === 1 && SPAN_CLASSES.has(child.classList[0]))
          ? child.classList[0]
          : null;
        if (cls) {
          stripAttrs(child);
          child.setAttribute("class", cls);
        } else {
          unwrapElement(child);
        }
      } else if (tag === "DIV") {
        stripAttrs(child);
        renameTo(child, "p");
      } else if (ALLOWED_TAGS.has(tag)) {
        stripAttrs(child);
      } else {
        unwrapElement(child);
      }
    } else if (child.nodeType !== 3) {
      parent.removeChild(child); // commenti e altri tipi di nodo
    }
    child = next;
  }
}

export function sanitizeRichText(html) {
  var tpl = document.createElement("template");
  tpl.innerHTML = String(html == null ? "" : html);
  walk(tpl.content);
  var out = document.createElement("div");
  out.appendChild(tpl.content);
  return out.innerHTML.trim();
}

// Euristica per distinguere le descrizioni legacy (testo semplice) da quelle
// già in rich text: un "<" seguito da una lettera è quasi certamente un tag.
export function isRichText(str) {
  return /<[a-z][^>]*>/i.test(String(str || ""));
}

// Testo piatto per l'anteprima card (clamp a 3 righe): sanifica e poi
// appiattisce spazi/interruzioni, sia per contenuto rich sia legacy.
export function richTextToPlain(html) {
  var tpl = document.createElement("template");
  tpl.innerHTML = sanitizeRichText(html);
  return (tpl.content.textContent || "").replace(/\s+/g, " ").trim();
}

// Migrazione one-way delle descrizioni legacy quando vengono aperte in modifica.
export function plainToRichHtml(text) {
  var str = String(text == null ? "" : text);
  if (!str) return "";
  return str.split(/\r\n|\r|\n/).map(function (line) {
    return "<p>" + line.replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    }) + "</p>";
  }).join("");
}
