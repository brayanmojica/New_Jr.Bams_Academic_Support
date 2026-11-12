/*
 * rico.js - Texto con formato para las tareas (compartido por profesor y alumno).
 * Requiere DOMPurify cargado ANTES de este archivo.
 *
 *   Rico.limpiar(html)  -> deja solo el formato permitido (negrita, tamaños, listas,
 *                          imágenes del bucket "tareas", enlaces http/https).
 *   Rico.render(tarea)  -> HTML listo para mostrar (usa descripcion_html y, si no
 *                          existe, el texto plano de descripcion).
 */
(function () {
  "use strict";

  var PREFIJO_IMG = "https://twhdnaiwxpilrevngxkk.supabase.co/storage/v1/object/public/tareas/";

  var ETIQUETAS = [
    "b", "strong", "i", "em", "u", "s", "strike", "del", "font", "br", "p", "div", "span",
    "ul", "ol", "li", "h3", "h4", "blockquote", "img", "a", "sub", "sup"
  ];
  var ATRIBUTOS = ["size", "color", "src", "alt", "href", "target", "rel", "loading"];

  var COLOR_CANON = {
    "#111827": "#111827",
    "#dc2626": "#dc2626",
    "#1d4ed8": "#1d4ed8",
    "#15803d": "#15803d",
    "rgb(17,24,39)": "#111827",
    "rgb(220,38,38)": "#dc2626",
    "rgb(29,78,216)": "#1d4ed8",
    "rgb(21,128,61)": "#15803d"
  };

  function normalizarColor(valor) {
    if (valor == null) return "";
    var s = String(valor).trim().toLowerCase().replace(/\s+/g, "");
    return COLOR_CANON[s] || "";
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  if (window.DOMPurify) {
    // Solo se permiten imágenes que estén en nuestro bucket de Supabase
    window.DOMPurify.addHook("uponSanitizeAttribute", function (nodo, dato) {
      if (nodo.tagName === "IMG" && dato.attrName === "src" &&
          String(dato.attrValue).indexOf(PREFIJO_IMG) !== 0) {
        dato.keepAttr = false;
      }
    });
    window.DOMPurify.addHook("afterSanitizeAttributes", function (nodo) {
      if (nodo.tagName === "A") {
        // Solo enlaces http/https (nada de javascript:, data:, etc.)
        if (nodo.hasAttribute("href") && !/^https?:\/\//i.test(nodo.getAttribute("href"))) {
          nodo.removeAttribute("href");
        }
        nodo.setAttribute("target", "_blank");
        nodo.setAttribute("rel", "noopener noreferrer");
      }
      if (nodo.tagName === "IMG") nodo.setAttribute("loading", "lazy");
      if (nodo.tagName === "FONT" && nodo.hasAttribute("color")) {
        var colorOk = normalizarColor(nodo.getAttribute("color"));
        if (colorOk) nodo.setAttribute("color", colorOk);
        else nodo.removeAttribute("color");
      }
    });
  }

  function limpiar(html) {
    if (!window.DOMPurify) return "";
    return window.DOMPurify.sanitize(String(html == null ? "" : html), {
      ALLOWED_TAGS: ETIQUETAS,
      ALLOWED_ATTR: ATRIBUTOS,
      ALLOW_DATA_ATTR: false
    }).trim();
  }

  function render(tarea) {
    if (!tarea) return "";
    var limpio = tarea.descripcion_html ? limpiar(tarea.descripcion_html) : "";
    if (limpio) return '<div class="contenido-rico">' + limpio + "</div>";
    if (tarea.descripcion) {
      return '<div class="contenido-rico">' + esc(tarea.descripcion).replace(/\n/g, "<br>") + "</div>";
    }
    return "";
  }

  /* v4: textos de avisos. La columna "mensaje" es texto: si trae formato (etiquetas
     permitidas) se limpia y se muestra con formato; si es texto normal se escapa.
     En los avisos no se permiten imágenes. */
  var RE_FORMATO = /<\/?(b|strong|i|em|u|s|strike|del|font|br|p|div|span|ul|ol|li|h3|h4|blockquote|a|sub|sup)(\s[^>]*)?\/?>/i;
  function tieneFormato(texto) { return RE_FORMATO.test(String(texto == null ? "" : texto)); }
  function renderTexto(texto) {
    var t = String(texto == null ? "" : texto);
    if (tieneFormato(t) && window.DOMPurify) {
      var limpio = window.DOMPurify.sanitize(t, {
        ALLOWED_TAGS: ETIQUETAS.filter(function (x) { return x !== "img"; }),
        ALLOWED_ATTR: ATRIBUTOS.filter(function (x) { return x !== "src" && x !== "loading"; }),
        ALLOW_DATA_ATTR: false
      }).trim();
      return '<div class="contenido-rico">' + limpio + "</div>";
    }
    return '<div class="contenido-rico">' + esc(t).replace(/\n/g, "<br>") + "</div>";
  }
  /* Texto sin etiquetas (para vistas previas y avisos cortos). */
  function textoPlano(texto) {
    var t = String(texto == null ? "" : texto);
    if (!tieneFormato(t)) return t;
    var div = document.createElement("div");
    div.innerHTML = window.DOMPurify ? window.DOMPurify.sanitize(t, { ALLOWED_TAGS: ["br", "p", "div", "li"], ALLOWED_ATTR: [] }) : esc(t);
    div.querySelectorAll("br,p,div,li").forEach(function (n) { n.insertAdjacentText("afterend", "\n"); });
    return (div.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
  }

  window.Rico = { PREFIJO_IMG: PREFIJO_IMG, limpiar: limpiar, render: render, esc: esc, normalizarColor: normalizarColor,
    tieneFormato: tieneFormato, renderTexto: renderTexto, textoPlano: textoPlano };
})();
