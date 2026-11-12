/* =====================================================================
   CONFIGURACIÓN DEL LICEO  (cambia SOLO estas líneas)
   Se aplica en todas las páginas que cargan tema.js.
   ===================================================================== */
window.LICEO = {
  // Nombre que se muestra en las páginas y en los PDF
  nombre: "Liceo Brayan Jr. Mojica Severino",

  // Tu firma: aparece abajo en todas las páginas. Si lo dejas vacío (""), no aparece.
  creador: "Lic. Brayan Mojica",

  // Opcional: teléfono, correo o página web que se ve junto a tu firma. Vacío = no se muestra.
  contacto: ""
};

(function () {
  "use strict";

  var URL_SB = "https://twhdnaiwxpilrevngxkk.supabase.co";
  var KEY_SB = "sb_publishable_lEIcvZOVtVD9HIK8HFwRtg_ik68D5Ad";

  /* v4.1: dos temas. «academico» (terracota y crema, el de la v4, por defecto)
     y «clasico» (blanco y azul, el aspecto de la v3). Se guarda en config_tema
     con clave = 'tema', igual que la letra. */
  var TEMAS = {
    academico: { nombre: "Académico (terracota y crema)" },
    clasico: { nombre: "Clásico (blanco y azul, como antes)" }
  };
  var DEFECTOS = {
    academico: {
      color_principal: "#7c2d12",
      color_fondo: "#f6efe4",
      color_suave: "#fbf3e8",
      color_borde: "#e0c49a",
      color_alerta: "#b91c1c"
    },
    clasico: {
      color_principal: "#1e3a8a",
      color_fondo: "#eef2f7",
      color_suave: "#eff6ff",
      color_borde: "#bfdbfe",
      color_alerta: "#b91c1c"
    }
  };
  function temaValido(v) {
    v = typeof v === "string" ? v.trim().toLowerCase() : "";
    return TEMAS[v] ? v : "";
  }
  function temaActual() {
    var t = temaValido(document.documentElement.getAttribute("data-tema"));
    if (!t) { try { t = temaValido(localStorage.getItem("tema_plataforma")); } catch (e) {} }
    return t || "academico";
  }
  var DEFECTO = DEFECTOS[temaActual()];

  /* v4: tipos de letra que la administración puede elegir para todos. */
  var FUENTES = {
    sistema: { nombre: "Letra del sistema (recomendada)", pila: '"Segoe UI", system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif' },
    arial: { nombre: "Arial", pila: "Arial, Helvetica, sans-serif" },
    verdana: { nombre: "Verdana (más ancha, muy legible)", pila: "Verdana, Geneva, Tahoma, sans-serif" },
    tahoma: { nombre: "Tahoma", pila: "Tahoma, Verdana, Geneva, sans-serif" },
    georgia: { nombre: "Georgia (con remates)", pila: 'Georgia, "Times New Roman", serif' },
    atkinson: { nombre: "Atkinson Hyperlegible (pensada para baja visión)", pila: '"Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif', google: "Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400" },
    lexend: { nombre: "Lexend (lectura cómoda)", pila: 'Lexend, "Segoe UI", system-ui, sans-serif', google: "Lexend:wght@400;600;700" },
    nunito: { nombre: "Nunito (redondeada)", pila: 'Nunito, "Segoe UI", system-ui, sans-serif', google: "Nunito:wght@400;600;700" }
  };

  function aplicarFuente(clave) {
    var f = FUENTES[clave] || FUENTES.sistema;
    if (f.google && !document.getElementById("fuente-google-" + clave)) {
      var l = document.createElement("link");
      l.rel = "stylesheet";
      l.id = "fuente-google-" + clave;
      l.href = "https://fonts.googleapis.com/css2?family=" + f.google + "&display=swap";
      document.head.appendChild(l);
    }
    var el = document.getElementById("tema-fuente");
    if (!el) {
      el = document.createElement("style");
      el.id = "tema-fuente";
      document.head.appendChild(el);
    }
    el.textContent = clave && FUENTES[clave] && clave !== "sistema"
      ? ":root{--fuente-plataforma:" + f.pila + "}body,button,input,select,textarea{font-family:" + f.pila + " !important}"
      : "";
  }

  function colorValido(valor, valorPorDefecto) {
    if (typeof valor !== "string") return valorPorDefecto;

    var color = valor.trim();
    return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)
      ? color
      : valorPorDefecto;
  }

  function normalizarTema(tema) {
    tema = tema || {};
    var nombre = temaValido(tema.tema) || temaActual();
    var D = DEFECTOS[nombre];
    var OTRO = DEFECTOS[nombre === "clasico" ? "academico" : "clasico"];
    /* Los colores de fábrica del OTRO tema (por ejemplo, los azules guardados
       por la versión anterior) se entienden como «sin personalizar» y se usan
       los de fábrica del tema elegido. Cualquier otro color elegido se respeta. */
    var t2 = {};
    Object.keys(tema).forEach(function (k) {
      var v = typeof tema[k] === "string" ? tema[k].trim().toLowerCase() : tema[k];
      t2[k] = k !== "color_alerta" && OTRO[k] && v === OTRO[k] ? D[k] : tema[k];
    });
    tema = t2;

    return {
      color_principal: colorValido(tema.color_principal, D.color_principal),
      color_fondo: colorValido(tema.color_fondo, D.color_fondo),
      color_suave: colorValido(tema.color_suave, D.color_suave),
      color_borde: colorValido(tema.color_borde, D.color_borde),
      color_alerta: colorValido(tema.color_alerta, D.color_alerta),
      fuente: typeof tema.fuente === "string" && FUENTES[tema.fuente] ? tema.fuente : "sistema",
      tema: nombre
    };
  }

  function aplicar(tema, guardar) {
    var t = normalizarTema(tema);
    document.documentElement.setAttribute("data-tema", t.tema);
    DEFECTO = DEFECTOS[t.tema];
    window.TEMA_DEFECTO = DEFECTO;
    var css =
      ":root,body.es-diseno,body.es-acceso,.diseno-layout{--acento:" + t.color_principal + ";--acento-suave:" + t.color_suave + ";--acento-borde:" + t.color_borde + ";--fondo-liceo:" + t.color_fondo + "}" +
      "body{background:" + t.color_fondo + " !important}" +
      "h1,h2,h3{color:" + t.color_principal + " !important}" +
      ".contenido-rico h1,.contenido-rico h2,.contenido-rico h3,.area-ed h1,.area-ed h2,.area-ed h3{color:inherit !important}" +
      '.contenido-rico font[color="#111827"],.area-ed font[color="#111827"]{color:#111827 !important}' +
      '.contenido-rico font[color="#dc2626"],.area-ed font[color="#dc2626"]{color:#dc2626 !important}' +
      '.contenido-rico font[color="#1d4ed8"],.area-ed font[color="#1d4ed8"]{color:#1d4ed8 !important}' +
      '.contenido-rico font[color="#15803d"],.area-ed font[color="#15803d"]{color:#15803d !important}' +
      "button:not(.peligro):not(.pestania):not(.btn-orden):not(.maestro-nombre):not(.sec):not(.color):not(.barra-ed button):not(.diseno-btn-menu):not(.diseno-enlace):not(.diseno-btn-portada):not(.diseno-rol-btn):not(.sin-tema){background:" + t.color_principal + " !important}" +
      /* v4: las cabeceras de COLUMNA llevan el color principal con texto blanco;
         las cabeceras de FILA (nombre de la competencia, del alumno, la hora…)
         van con fondo claro y texto oscuro, para que siempre se lean. */
      "th:not([scope=row]){background:" + t.color_principal + " !important;color:#fff !important}" +
      "tbody th[scope=row],th[scope=row]{background:" + (t.tema === "clasico" ? "#f8fafc" : "#fffaf3") + " !important;color:" + (t.tema === "clasico" ? "#0f172a" : "#1c1917") + " !important}" +
      ".chip{background:" + t.color_suave + " !important;color:" + t.color_principal + " !important;border-color:" + t.color_borde + " !important}" +
      ".caja-curso,#detalle .caja,.caja{border-top-color:" + t.color_principal + " !important;border-left-color:" + t.color_principal + " !important}" +
      ".subcaja{border-left-color:" + t.color_principal + " !important}" +
      "td.pc{background:" + t.color_suave + " !important}" +
      ".rojo{color:" + t.color_alerta + " !important}";

    var elemento = document.getElementById("tema-dinamico");

    if (!elemento) {
      elemento = document.createElement("style");
      elemento.id = "tema-dinamico";
      document.head.appendChild(elemento);
    }

    elemento.textContent = css;
    /* Al final del <head>, para que gane a los estilos de la página (tema-inicial.js
       pudo crearlo antes, al principio). */
    document.head.appendChild(elemento);
    aplicarFuente(t.fuente);

    if (guardar) {
      try {
        localStorage.setItem("tema_colores", JSON.stringify(t));
        localStorage.setItem("tema_plataforma", t.tema);
        localStorage.setItem("tema_css", css);
      } catch (error) {
        console.warn("No se pudo guardar el tema en el navegador.", error);
      }
    }
  }

  window.aplicarTema = aplicar;
  window.TEMA_DEFECTO = DEFECTO;
  window.TEMA_DEFECTOS = DEFECTOS;
  window.TEMA_NOMBRES = TEMAS;
  window.temaActual = temaActual;
  window.TEMA_FUENTES = FUENTES;
  window.aplicarFuente = aplicarFuente;
  window.normalizarTema = normalizarTema;

  try {
    var guardado = JSON.parse(localStorage.getItem("tema_colores") || "null");
    /* v4: siempre se aplica un tema (el guardado o el de la identidad nueva), así
       la página se ve igual con o sin configuración en la base de datos. */
    /* El tema elegido (tema-inicial.js ya lo puso en <html>) manda sobre la copia de colores */
    var base = guardado || {};
    base.tema = temaActual();
    aplicar(base, false);
  } catch (error) {
    console.warn("No se pudo leer el tema guardado.", error);
  }

  async function cargarTemaDesdeSupabase() {
    try {
      var supabaseGlobal = window.supabase;
      var cliente;

      if (window.App && window.App.cliente) {
        cliente = window.App.cliente;   // reutiliza el cliente de comun.js
      } else if (supabaseGlobal && typeof supabaseGlobal.createClient === "function") {
        cliente = supabaseGlobal.createClient(URL_SB, KEY_SB);
      } else if (supabaseGlobal && typeof supabaseGlobal.from === "function") {
        cliente = supabaseGlobal;
      } else {
        console.error("No se encontró supabase-js. Carga su script antes de tema.js.");
        return;
      }

      var resultado = await cliente
        .from("config_tema")
        .select("clave, valor");

      if (resultado.error) {
        console.error("Error al leer config_tema:", resultado.error);
        return null;
      }

      var tema = {};
      (resultado.data || []).forEach(function (fila) {
        tema[fila.clave] = fila.valor;
      });
      /* v4: otras partes leen ajustes de aquí (p. ej. «avisos_leidos» = "si" cuando
         se instaló la tabla opcional sql/05). */
      window.CONFIG_TEMA = tema;

      /* Sin filas (por ejemplo, si la base no deja leer antes de iniciar sesión)
         se queda lo guardado en este navegador. */
      if (!resultado.data || resultado.data.length === 0) return tema;
      /* Hay configuración pero sin fila «tema»: el tema es «Académico» (el de la v4) */
      if (!temaValido(tema.tema)) tema.tema = "academico";
      aplicar(tema, true);
      return tema;
    } catch (error) {
      console.error("No se pudo cargar el tema desde Supabase:", error);
      return null;
    }
  }

  // ===== Nombre del liceo y firma del creador =====
  var NOMBRE_VIEJO = "Liceo Experimental María Mercedes López López";

  // Cambia el nombre antiguo por el nuevo en el texto de la página (incluye páginas que no tienen etiqueta)
  function reemplazarTexto(viejo, nuevo) {
    var recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodos = [];
    var n;
    while ((n = recorrido.nextNode())) {
      var padre = n.parentNode && n.parentNode.nodeName;
      if (padre !== "SCRIPT" && padre !== "STYLE" && n.nodeValue.indexOf(viejo) !== -1) nodos.push(n);
    }
    nodos.forEach(function (nodo) {
      nodo.nodeValue = nodo.nodeValue.split(viejo).join(nuevo);
    });
  }

  function ponerMarca() {
    var L = window.LICEO || {};
    var nombre = typeof L.nombre === "string" ? L.nombre.trim() : "";

    if (nombre) {
      if (nombre !== NOMBRE_VIEJO) {
        reemplazarTexto(NOMBRE_VIEJO, nombre);
        document.title = document.title.split(NOMBRE_VIEJO).join(nombre);
      }
      Array.prototype.forEach.call(document.querySelectorAll("[data-liceo-nombre]"), function (el) {
        el.textContent = nombre;
      });
    }

    var creador = typeof L.creador === "string" ? L.creador.trim() : "";
    if (creador && !document.getElementById("firma-creador")) {
      /* v4.1: solo texto, sin franja ni fondo. Va a la derecha de la cabecera
         (con sesión) o abajo dentro de la tarjeta (inicio de sesión). */
      var estilo = document.createElement("style");
      estilo.textContent =
        ".firma-creador{margin:0;font-size:12px;line-height:1.3;color:#57534e;background:none;border:0}" +
        "@media print{.firma-creador{display:none}}";
      document.head.insertBefore(estilo, document.head.firstChild);

      var pie = document.createElement("p");
      pie.id = "firma-creador";
      pie.className = "firma-creador";
      var prefijo = document.createElement("span");
      prefijo.className = "firma-prefijo";
      prefijo.textContent = "Sistema desarrollado por ";
      pie.appendChild(prefijo);
      var negrita = document.createElement("b");
      negrita.textContent = creador;
      pie.appendChild(negrita);
      var contacto = typeof L.contacto === "string" ? L.contacto.trim() : "";
      if (contacto) {
        var c = document.createElement("span");
        c.className = "firma-prefijo";
        c.textContent = " · " + contacto;
        pie.appendChild(c);
      }
      document.body.appendChild(pie);
      if (!colocarFirma() && window.MutationObserver) {
        var obs = new MutationObserver(function () { if (colocarFirma()) obs.disconnect(); });
        obs.observe(document.body, { childList: true, subtree: true });
      }
    }
  }

  function colocarFirma() {
    var pie = document.getElementById("firma-creador");
    if (!pie) return false;
    var destino = document.querySelector(".diseno-acciones-cab");
    if (destino) {
      if (pie.parentNode !== destino) destino.insertBefore(pie, destino.firstChild);
    } else {
      destino = document.querySelector(".escena .tarjeta");
      if (destino && pie.parentNode !== destino) destino.appendChild(pie);
    }
    pie.classList.toggle("firma-suelta", !destino);
    return !!destino;
  }
  window.colocarFirma = colocarFirma;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ponerMarca);
  } else {
    ponerMarca();
  }

  window.TEMA_LISTO = cargarTemaDesdeSupabase();

  var nombreLiceo = document.getElementById("diseno-nombre-liceo");
  if (nombreLiceo && window.LICEO && LICEO.nombre) nombreLiceo.textContent = LICEO.nombre;
  else {
    var marca = document.getElementById("diseno-marca");
    if (marca && window.LICEO && LICEO.nombre && !marca.querySelector("svg")) marca.textContent = LICEO.nombre;
  }
  var accesoNombre = document.getElementById("diseno-acceso-nombre");
  if (accesoNombre && window.LICEO && LICEO.nombre) accesoNombre.textContent = LICEO.nombre;
  else {
    var acceso = document.querySelector(".diseno-header-acceso");
    if (acceso && window.LICEO && LICEO.nombre && !acceso.querySelector("svg") && !acceso.textContent) acceso.textContent = LICEO.nombre;
  }
})();
