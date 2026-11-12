/* Propuesta visual de la copia local (v3). No altera permisos, sesión ni guardados.
 * v3: menús por rol activo (incluye coordinación y padre/tutor por separado),
 * apartados sin recarga en familia.html y profesor.html, accesibilidad
 * (salto al contenido, título h1 por apartado, foco, regiones vivas, etiquetas,
 * tablas) y transiciones/precarga entre páginas para que el marco no "parpadee".
 */
(function () {
  "use strict";

  var ICONS = {
    inicio: '<path d="M4.5 11.2 12 4.8l7.5 6.4"/><path d="M6.5 10.2V19h11V10.2"/>',
    curso: '<path d="M4.5 7.5h15v11h-15z"/><path d="M8 7.5V5.8h8v1.7"/>',
    estudiantes: '<path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M5.5 19c.8-3 3.2-4.5 6.5-4.5s5.7 1.5 6.5 4.5"/>',
    materias: '<path d="M12 6.5c-1.8-1.2-4.2-1.7-7-1.2V18c2.8-.5 5.2 0 7 1.2"/><path d="M12 6.5c1.8-1.2 4.2-1.7 7-1.2V18c-2.8-.5-5.2 0-7 1.2"/><path d="M12 6.5V19.2"/>',
    personal: '<path d="M9.5 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M4.5 19c.6-2.4 2.4-3.6 5-3.6"/><path d="M16 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M13.2 19c.5-2 1.8-3.1 3.8-3.1 2 0 3.3 1.1 3.8 3.1"/>',
    modulos: '<path d="M5 6.5h6.5V13H5z"/><path d="M12.5 6.5H19V10h-6.5z"/><path d="M12.5 11.5H19V19h-6.5z"/><path d="M5 14.5h6.5V19H5z"/>',
    avisos: '<path d="M12 4.5A5.5 5.5 0 0 0 6.5 10c0 3.2-1 4.5-1 4.5h13s-1-1.3-1-4.5A5.5 5.5 0 0 0 12 4.5Z"/><path d="M10 19.2a2 2 0 0 0 4 0"/>',
    solicitudes: '<path d="M6 4.5h9l3 3v12H6z"/><path d="M9 11h6M9 14.5h6M9 18h3"/><path d="M15 4.5v3h3"/>',
    asistencia: '<path d="M7 4.5v3M17 4.5v3"/><path d="M5.5 7.5h13v12h-13z"/><path d="M5.5 11h13"/><path d="M9 15.2l2 2 4.2-4.2"/>',
    directorio: '<path d="M6 5.5h8.5l3.5 3.5V19H6z"/><path d="M14.5 5.5V9H18"/>',
    calificaciones: '<path d="M4.5 19.5h15"/><path d="M7 19.5V12M12 19.5V6.5M17 19.5v-4"/>',
    aula: '<path d="M4.5 19h15"/><path d="M6 19V8l6-3 6 3v11"/><path d="M10 19v-5h4v5"/>',
    tareas: '<path d="M8 6.5h11.5M8 12h11.5M8 17.5h11.5"/><path d="M4.5 6.5l1 1 2-2.2M4.5 12l1 1 2-2.2M4.5 17.5l1 1 2-2.2"/>',
    datos: '<path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M6 19.2c.9-3 3.1-4.5 6-4.5s5.1 1.5 6 4.5"/>',
    resumen: '<path d="M5 6.5h14v13H5z"/><path d="M8 10h8M8 13.5h8M8 17h5"/>',
    horario: '<path d="M7 4.5v3M17 4.5v3"/><path d="M5.5 7.5h13v12h-13z"/><path d="M5.5 11h13"/><path d="M9 15h2M13 15h2"/>',
    permisos: '<path d="M12 4.5 19 7.5v5.2c0 4-3 6.6-7 7.8-4-1.2-7-3.8-7-7.8V7.5Z"/><path d="M9 12.2l2 2 4-4"/>',
    reporte: '<path d="M7 4.5h7.5L19 9v11.5H7z"/><path d="M14.5 4.5V9H19"/><path d="M10 13h6M10 16h6"/>',
    salir: '<path d="M10 19.5H5.5v-15H10"/><path d="M10 12h9"/><path d="M16 8.5 19.5 12 16 15.5"/>'
  };

  var SALIR = { accion: "salir", label: "Cerrar sesión", icon: "salir" };
  var MIS_DATOS = { href: "mis_datos.html", label: "Mis datos", icon: "datos" };
  /* v4: «Curso» y «Estudiantes» se unieron en «Cursos y alumnos». */
  var MENU_ADMIN_BASE = [
    { pagina: "admin.html", seccion: "cursos", label: "Cursos y alumnos", icon: "curso" },
    { pagina: "admin.html", seccion: "materias", label: "Materias y profesores", icon: "materias" },
    { href: "admin_personal.html", label: "Personal y roles", icon: "personal" },
    { href: "admin_horario.html", label: "Horarios", icon: "horario" },
    { href: "admin_permisos.html", label: "Permisos de alumnos", icon: "permisos" },
    { href: "admin_modulos.html", label: "Configuración", icon: "modulos" }
  ];

  var MENU = {
    admin: MENU_ADMIN_BASE.concat([
      { href: "avisos.html", label: "Avisos", icon: "avisos", alerta: "avisos" },
      MIS_DATOS,
      SALIR
    ]),
    /* Coordinación: mismo panel que administración, sin Avisos (no tiene permiso confirmado). */
    coordinador: MENU_ADMIN_BASE.concat([MIS_DATOS, SALIR]),
    secretaria: [
      { href: "asistencia_secretaria.html", label: "Asistencia", icon: "asistencia" },
      { pagina: "secretaria.html", tab: "alumnos", label: "Alumnos", icon: "estudiantes" },
      { pagina: "secretaria.html", tab: "avisos", label: "Solicitudes y documentos", icon: "solicitudes", contador: "solicitudes" },
      { pagina: "secretaria.html", tab: "docentes", label: "Docentes", icon: "personal" },
      { href: "directorio_docentes.html", label: "Directorio de docentes", icon: "directorio" },
      MIS_DATOS,
      SALIR
    ],
    profesor: [
      { pagina: "profesor.html", seccion: "inicio", label: "Inicio", icon: "inicio" },
      { pagina: "profesor.html", seccion: "calificaciones", label: "Calificaciones", icon: "calificaciones" },
      { href: "aula_profesor.html", label: "Aula (tareas)", icon: "aula", alerta: "entregas" },
      { href: "asistencia_profesor.html", label: "Asistencias", icon: "asistencia" },
      { href: "reporte_alumno.html", label: "Reporte de alumno", icon: "reporte" },
      { href: "avisos.html", label: "Avisos", icon: "avisos", alerta: "avisos" },
      MIS_DATOS,
      SALIR
    ],
    /* Alumno (v4): Inicio, Materias, Calendario, Calificaciones, Mis datos.
       Horario va en Calendario; Asistencia en Calificaciones; los avisos en Inicio y en cada materia. */
    familia: [
      { pagina: "familia.html", seccion: "inicio", label: "Inicio", icon: "inicio" },
      { pagina: "familia.html", seccion: "materias", label: "Materias", icon: "materias", alerta: "tareas" },
      { pagina: "familia.html", seccion: "calendario", label: "Calendario", icon: "horario" },
      { pagina: "familia.html", seccion: "notas", label: "Calificaciones", icon: "calificaciones" },
      MIS_DATOS,
      SALIR
    ],
    /* Padre/tutor: seguimiento del hijo o hija; sin entregar tareas. */
    padre: [
      { pagina: "familia.html", seccion: "inicio", label: "Resumen de mi hijo(a)", icon: "resumen" },
      { pagina: "familia.html", seccion: "materias", label: "Materias y tareas", icon: "materias", alerta: "tareas" },
      { pagina: "familia.html", seccion: "calendario", label: "Calendario de entregas", icon: "horario" },
      { pagina: "familia.html", seccion: "notas", label: "Calificaciones y asistencia", icon: "calificaciones" },
      MIS_DATOS,
      SALIR
    ]
  };

  /* Dónde lleva la campana de la cabecera, según el menú. */
  var CAMPANA = {
    familia: { pagina: "familia.html", seccion: "inicio", foco: "cajaAvisos" },
    padre: { pagina: "familia.html", seccion: "inicio", foco: "cajaAvisos" },
    profesor: { href: "avisos.html" },
    admin: { href: "avisos.html" }
  };

  /* Apartados que se cambian sin recargar. El bloque visible depende del apartado;
     lo que la página oculta por permisos (style.display = "none") sigue oculto. */
  var SECCIONES = {
    "familia.html": {
      inicio: ["cajaResumen", "cajaAvisos"],
      materias: ["cajaMaterias", "cajaDetalleMateria"],
      calendario: ["cajaCalendario", "cajaHorario"],
      notas: ["cajaNotas", "cajaFiltro", "cajaSinNotas", "detalle", "cajaAsist"]
    },
    "profesor.html": {
      inicio: ["cajaInicioProfesor"],
      calificaciones: ["seccionSelector", "seccionNotas"]
    }
  };
  /* Direcciones viejas que siguen funcionando (enlaces guardados, aula_alumnos.html). */
  var ALIAS = {
    "familia.html": { horario: "calendario", asistencia: "notas", avisos: "inicio", tareas: "materias" },
    "admin.html": { curso: "cursos", estudiantes: "cursos" }
  };
  var SECCION_INICIAL = {
    "familia.html": "materias",
    "profesor.html": "inicio"
  };
  /* Bloques que la propia página muestra u oculta dentro de su apartado. */
  var INTERNOS = { cajaDetalleMateria: 1 };

  /* v4: textos de ayuda para personas, no para técnicos. Dicen qué se puede hacer y el paso siguiente. */
  var AYUDAS = {
    "admin.html": {
      cursos: "Elige un curso arriba. Debajo puedes agregar alumnos, crear sus cuentas, descargar boletines y ver la lista del curso.",
      materias: "Agrega profesores y asigna cada materia a su profesor. Cuando termines, el profesor ya puede poner notas y tareas.",
      "": "Elige un curso para empezar."
    },
    "admin_personal.html": { "": "Crea cuentas para el personal y elige qué puede hacer cada persona. Para darle otro rol a una persona, búscala en la lista y pulsa «Agregar»." },
    "admin_modulos.html": { "": "Elige el tema (Académico o Clásico), los colores y la letra de la plataforma, marca días sin clases y revisa la asistencia del año. Los cambios se ven para todos al pulsar «Guardar»." },
    "admin_horario.html": { "": "Elige un curso y escribe sus clases por hora. Pulsa «Guardar y publicar horario» para que alumnos y familias lo vean en su Calendario." },
    "admin_permisos.html": { "": "Elige un curso y marca qué puede ver o hacer cada alumno (notas, tareas, asistencia). Luego pulsa «Guardar permisos de este curso»." },
    "secretaria.html": {
      alumnos: "Busca un alumno por nombre o matrícula y abre su expediente para ver o corregir sus datos.",
      avisos: "Aquí llegan los cambios de datos, los documentos y los pedidos de permiso para subir documentos. Revisa cada uno y pulsa «Aprobar» o «Rechazar».",
      docentes: "Lista de docentes. Abre el expediente de un docente para ver sus datos y documentos.",
      "": "Usa el menú para ir a Asistencia, Alumnos, Solicitudes y documentos o Docentes."
    },
    "asistencia_secretaria.html": { "": "Elige el curso y la fecha, marca a cada alumno y pulsa «Guardar asistencia». Abajo puedes descargar el PDF del mes." },
    "directorio_docentes.html": { "": "Busca un docente para ver su contacto. Puedes descargar la lista completa." },
    "familia.html": {
      inicio: "Aquí ves cómo vas: tus tareas pendientes, tu promedio, tu asistencia y los avisos del liceo. Toca una materia para ver más.",
      materias: "Toca «Entrar» en una materia para ver sus tareas y entregarlas, tus notas de esa materia y los avisos.",
      calendario: "Los puntos de colores marcan las fechas de entrega. Toca un día para ver qué hay que entregar. Debajo está tu horario de clases.",
      notas: "Tus notas de todas las materias y tu asistencia. Elige una materia para ver el detalle de cada período.",
      "": "Usa el menú para moverte entre tus materias, el calendario y tus notas."
    },
    "familia.html#padre": {
      inicio: "Resumen de tu hijo(a): tareas pendientes, promedio, asistencia y avisos. Revisa las materias que necesitan atención.",
      materias: "Entra a una materia para ver las tareas de tu hijo(a), si ya las entregó y sus notas. Las entregas las hace el alumno.",
      calendario: "Fechas de entrega de las tareas de tu hijo(a). Toca un día para ver qué tiene pendiente. Debajo está su horario.",
      notas: "Notas de tu hijo(a) en todas las materias y su asistencia.",
      "": "Seguimiento de tu hijo(a)."
    },
    "profesor.html": {
      inicio: "Tus pendientes: entregas por calificar, tus materias y los avisos recientes. Toca una entrega para calificarla.",
      calificaciones: "Elige la materia y el período, escribe las notas y pulsa «Guardar notas».",
      "": ""
    },
    "aula_profesor.html": { "": "Para asignar una tarea, elige la materia, escribe las instrucciones y pulsa «Asignar a todo el curso». Debajo están tus tareas por materia; toca una para calificar las entregas." },
    "asistencia_profesor.html": { "": "Elige el curso y la fecha, marca a cada alumno y pulsa «Guardar asistencia». Abajo puedes descargar el PDF del mes." },
    "reporte_alumno.html": { "": "Elige el curso y el alumno para ver sus notas y su asistencia. Pulsa «Descargar reporte en PDF» para guardarlo o imprimirlo." },
    "mis_datos.html": { "": "Revisa tus datos y tus documentos. Si algo está mal, corrígelo y envíalo: la secretaría lo revisa. Para subir un documento, pulsa «Pedir permiso» si te aparece; cuando la secretaría lo apruebe podrás subirlo." },
    "avisos.html": { "": "Elige a quién va dirigido, escribe el título y el mensaje y pulsa «Publicar aviso». Puedes dar formato al texto con la barra." }
  };

  var estado = {
    grupo: "",
    pagina: "",
    seccion: "",
    nombre: "",
    rol: "",
    rolClave: "",
    uid: "",
    contadores: {},
    alertas: {},
    animar: {}
  };
  var NOMBRE_NOVEDAD = { avisos: "aviso", tareas: "tarea", entregas: "entrega" };
  var NOMBRE_NOVEDAD_PL = { avisos: "avisos", tareas: "tareas", entregas: "entregas" };
  var mq = window.matchMedia ? matchMedia("(max-width: 760px)") : { matches: false, addEventListener: function () {} };

  function paginaActual() {
    var p = (location.pathname || "").split("/").pop() || "index.html";
    return p;
  }

  function salir() {
    try { sessionStorage.removeItem("aviso_tareas_visto"); } catch (e) {}
    try {
      if (window.App && typeof App.salir === "function") return App.salir();
    } catch (e) {}
    if (typeof window.salir === "function" && window.salir !== salir) return window.salir();
    location.href = "index.html";
  }

  function actualizarMenu(ampliado) {
    var layout = document.getElementById("diseno-layout");
    var btn = document.getElementById("diseno-btn-menu");
    if (!layout || !btn) return;
    layout.classList.toggle("es-ampliada", !!ampliado);
    btn.setAttribute("aria-expanded", String(!!ampliado));
    btn.setAttribute("aria-label", ampliado ? "Contraer el menú" : "Ampliar el menú con nombres");
    if (!mq.matches) {
      try { sessionStorage.setItem("diseno_barra_ampliada", ampliado ? "1" : "0"); } catch (e) {}
    }
  }

  function svg(nombre) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[nombre] || ICONS.inicio) + "</svg>";
  }

  function itemActivo(item) {
    var pag = estado.pagina || paginaActual();
    if (item.accion) return false;
    if (item.href && !item.seccion && !item.tab) return pag === item.href;
    if (item.pagina && item.pagina !== pag) return false;
    if (item.tab) return estado.seccion === item.tab || (!estado.seccion && item.tab === "alumnos" && pag === "secretaria.html");
    if (item.seccion) return estado.seccion === item.seccion;
    return pag === item.pagina;
  }

  function itemActual() {
    var items = MENU[estado.grupo] || [];
    for (var i = 0; i < items.length; i++) if (itemActivo(items[i])) return items[i];
    return null;
  }

  var precargadas = {};
  function precargar(url) {
    var base = String(url || "").split("#")[0];
    if (!base || precargadas[base] || base === paginaActual()) return;
    precargadas[base] = 1;
    try {
      var l = document.createElement("link");
      l.rel = "prefetch";
      l.href = base;
      document.head.appendChild(l);
    } catch (e) {}
  }

  function pintarNav() {
    var nav = document.getElementById("diseno-nav");
    if (!nav) return;
    var items = MENU[estado.grupo] || [];
    var enfocado = document.activeElement && nav.contains(document.activeElement)
      ? document.activeElement.getAttribute("data-clave") : null;
    nav.textContent = "";
    var lista = document.createElement("ul");
    lista.className = "diseno-lista";
    items.forEach(function (item, idx) {
      var li = document.createElement("li");
      var el = item.accion ? document.createElement("button") : document.createElement("a");
      el.setAttribute("data-clave", String(idx) + ":" + item.label);
      if (item.accion) {
        el.type = "button";
        el.className = "diseno-enlace" + (item.accion === "salir" ? " diseno-salir" : "");
        /* v4.1: «Cerrar sesión» es el último elemento del menú, junto a los demás */
        if (item.accion === "salir") li.className = "diseno-item-salir";
      } else if (item.href && !item.seccion && !item.tab) {
        el.href = item.href;
      } else if (item.pagina && item.pagina !== paginaActual()) {
        el.href = item.pagina + (item.seccion ? "#" + item.seccion : item.tab ? "#" + item.tab : "");
      } else {
        el.href = "#" + (item.seccion || item.tab || "");
      }
      var n = item.contador ? estado.contadores[item.contador] : 0;
      var nuevos = item.alerta ? (estado.alertas[item.alerta] || 0) : 0;
      var textoNuevos = nuevos ? " " + nuevos + (nuevos === 1 ? " " + (NOMBRE_NOVEDAD[item.alerta] || "novedad") + " nueva" : " " + (NOMBRE_NOVEDAD_PL[item.alerta] || "novedades") + " nuevas") : "";
      el.setAttribute("aria-label", item.label + (n ? " " + n + (n === 1 ? " pendiente" : " pendientes") : "") + textoNuevos);
      if (nuevos) {
        el.classList.add("diseno-alerta");
        if (estado.animar[item.alerta]) el.classList.add("es-animar");
      }
      el.innerHTML = svg(item.icon);
      var et = document.createElement("span");
      et.className = "diseno-etiqueta";
      et.textContent = item.label;
      var tip = document.createElement("span");
      tip.className = "diseno-tooltip";
      tip.setAttribute("aria-hidden", "true");
      tip.textContent = item.label;
      el.appendChild(et);
      if (n || nuevos) {
        et.appendChild(document.createTextNode(" "));
        var badge = document.createElement("span");
        badge.className = "diseno-contador";
        badge.setAttribute("aria-hidden", "true");
        badge.textContent = String(n || nuevos);
        el.appendChild(badge);
      }
      el.appendChild(tip);
      if (itemActivo(item)) el.setAttribute("aria-current", "page");
      if (el.tagName === "A" && el.getAttribute("href") && el.getAttribute("href").charAt(0) !== "#") {
        var url = el.getAttribute("href");
        el.addEventListener("pointerenter", function () { precargar(url); });
        el.addEventListener("focus", function () { precargar(url); });
        el.addEventListener("touchstart", function () { precargar(url); }, { passive: true });
      }
      el.addEventListener("click", function (ev) {
        if (item.accion === "salir") {
          ev.preventDefault();
          salir();
          return;
        }
        if (item.pagina && item.pagina !== paginaActual()) return;
        if (item.tab) {
          ev.preventDefault();
          if (typeof window.mostrar === "function") window.mostrar(item.tab);
          estado.seccion = item.tab;
          recordarSeccion(item.tab);
          pintarNav();
          actualizarAyuda(item.tab);
          actualizarTitulo(true);
          if (mq.matches) actualizarMenu(false);
          return;
        }
        if (item.seccion) {
          ev.preventDefault();
          mostrarSeccion(item.seccion, true);
          if (mq.matches) actualizarMenu(false);
        }
      });
      li.appendChild(el);
      lista.appendChild(li);
    });
    nav.appendChild(lista);
    if (enfocado) {
      var otra = nav.querySelector('[data-clave="' + enfocado.replace(/"/g, '\\"') + '"]');
      if (otra) otra.focus();
    }
  }

  function recordarSeccion(seccion) {
    try {
      if (history.replaceState) history.replaceState(null, "", "#" + seccion);
    } catch (e) {}
  }

  function mostrarAdmin(seccion) {
    var cursoBar = document.getElementById("barraCursoFija");
    var curso = document.getElementById("seccionCurso");
    var est = document.getElementById("seccionEstudiantes");
    var mat = document.getElementById("seccionMaestros");
    if (!curso && !est && !mat) return;
    seccion = resolverAlias("admin.html", seccion);
    if (["cursos", "materias"].indexOf(seccion) === -1) seccion = "cursos";
    if (cursoBar) cursoBar.hidden = seccion !== "cursos";
    if (curso) curso.hidden = seccion !== "cursos";
    if (est) est.hidden = seccion !== "cursos";
    if (mat) mat.hidden = seccion !== "materias";
    estado.seccion = seccion;
    pintarNav();
  }

  function resolverAlias(pag, seccion) {
    var a = ALIAS[pag];
    return a && a[seccion] ? a[seccion] : seccion;
  }

  function aplicarSecciones(mapa, seccion) {
    var orden = Object.keys(mapa);
    seccion = resolverAlias(estado.pagina || paginaActual(), seccion);
    if (!seccion || !mapa[seccion]) seccion = SECCION_INICIAL[estado.pagina] || orden[0];
    orden.forEach(function (clave) {
      mapa[clave].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (clave !== seccion) { el.hidden = true; return; }
        if (INTERNOS[id]) return;   // lo decide la página (p. ej. el detalle de una materia)
        el.hidden = false;
      });
    });
    /* Al volver a Materias desde el menú se ve la lista, no el detalle anterior. */
    if (seccion === "materias") {
      var det = document.getElementById("cajaDetalleMateria");
      var rej = document.getElementById("cajaMaterias");
      if (det && rej && estado._volverALista) { det.hidden = true; rej.hidden = false; }
    }
    estado.seccion = seccion;
    pintarNav();
  }

  function mostrarSeccion(seccion, porUsuario) {
    var pag = estado.pagina || paginaActual();
    if (pag === "admin.html") {
      mostrarAdmin(seccion);
    } else if (SECCIONES[pag]) {
      estado._volverALista = !!porUsuario;
      aplicarSecciones(SECCIONES[pag], seccion);
      estado._volverALista = false;
    } else {
      estado.seccion = seccion || "";
      pintarNav();
    }
    if (porUsuario) recordarSeccion(estado.seccion);
    actualizarAyuda(estado.seccion);
    actualizarTitulo(!!porUsuario);
    if (porUsuario) {
      try { window.scrollTo(0, 0); } catch (e) {}
      document.dispatchEvent(new CustomEvent("diseno:seccion", { detail: { seccion: estado.seccion } }));
    }
  }

  function textoDe(el) {
    return el ? (el.textContent || "").trim() : "";
  }

  function interpretarIdentidad() {
    var saludo = textoDe(document.getElementById("saludo"));
    var chip = "";
    var chipEl = document.querySelector(".chip, #chipRol");
    if (chipEl) chip = textoDe(chipEl);
    var nombre = "", rol = "", clave = "";
    var pares = [
      ["Padre/Tutor:", "padre", "Padre/Tutor"],
      ["Alumno(a):", "estudiante", "Alumno(a)"],
      ["Administrador(a):", "admin", "Administrador(a)"],
      ["Coordinador(a):", "coordinador", "Coordinador(a)"],
      ["Profesor(a):", "profesor", "Profesor(a)"],
      ["Secretaría:", "secretaria", "Secretaria(o)"]
    ];
    for (var i = 0; i < pares.length; i++) {
      if (saludo.indexOf(pares[i][0]) === 0) {
        nombre = saludo.slice(pares[i][0].length).trim();
        clave = pares[i][1];
        rol = pares[i][2];
        break;
      }
    }
    if (!nombre && saludo.indexOf("Hola, ") === 0) {
      nombre = saludo.slice(6).trim();
    }
    /* El rol mostrado lo fija el rol activo validado (identificar); el texto del chip
       solo se usa si todavía no hay uno. */
    if (!estado.rolClave && !rol && chip) {
      if (/coordinador/i.test(chip)) { rol = "Coordinador(a)"; clave = "coordinador"; }
      else if (/admin/i.test(chip)) { rol = "Administrador(a)"; clave = "admin"; }
      else if (/profesor/i.test(chip)) { rol = "Profesor(a)"; clave = "profesor"; }
      else if (/secretar/i.test(chip)) { rol = "Secretaria(o)"; clave = "secretaria"; }
    }
    if (nombre && nombre !== "Cargando..." && !estado._nombreFijo) estado.nombre = nombre;
    if (rol && !estado._rolFijo) estado.rol = rol;
    if (clave && !estado._rolFijo) estado.rolClave = clave;
    pintarIdentidad();
  }

  function pintarIdentidad() {
    var nom = document.getElementById("diseno-nombre");
    var rol = document.getElementById("diseno-rol");
    if (nom) nom.textContent = estado.nombre || "";
    if (rol) rol.textContent = estado.rol || "";
  }

  /* Oculta la cabecera vieja de cada página (la que lleva su h1), pero no otras barras internas. */
  function esconderChrome() {
    var main = document.querySelector(".diseno-main");
    if (!main) return;
    var franja = document.getElementById("diseno-franja");
    if (!franja) {
      franja = document.createElement("div");
      franja.id = "diseno-franja";
      franja.className = "diseno-franja";
      main.insertBefore(franja, main.firstChild);
    }
    var titulo = document.getElementById("diseno-titulo");
    if (!titulo) {
      titulo = document.createElement("h1");
      titulo.id = "diseno-titulo";
      titulo.className = "diseno-titulo";
      titulo.tabIndex = -1;
      main.insertBefore(titulo, franja);
    }
    var ayuda = document.getElementById("diseno-ayuda");
    if (!ayuda) {
      ayuda = document.createElement("p");
      ayuda.id = "diseno-ayuda";
      ayuda.className = "diseno-ayuda";
      franja.insertBefore(ayuda, franja.firstChild);
    }
    ["datosAlumno", "cupo", "btnImprimir"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && !franja.contains(el)) franja.appendChild(el);
    });
    var estadoEl = document.getElementById("estado");
    var cabeceras = [];
    document.querySelectorAll(".barra-header, .barra").forEach(function (el) {
      if (el.querySelector("h1")) cabeceras.push(el);
    });
    /* El #estado de la cabecera vieja pasa a la franja (si estaba dentro de ella). */
    if (estadoEl && cabeceras.some(function (c) { return c.parentNode && c.parentNode.contains(estadoEl); }) && !franja.contains(estadoEl)) {
      franja.appendChild(estadoEl);
    }
    cabeceras.forEach(function (el) {
      el.hidden = true;
      var tituloViejo = el.querySelector("h1");
      if (tituloViejo && !estado.tituloPagina) estado.tituloPagina = textoDe(tituloViejo);
      var caja = el.parentNode;
      if (caja && caja.classList && caja.classList.contains("caja")) {
        var util = false;
        for (var i = 0; i < caja.children.length; i++) {
          var ch = caja.children[i];
          if (ch === el || ch.hidden) continue;
          if (ch.classList.contains("tabs") && document.getElementById("vistaAvisos")) continue;
          util = true;
        }
        if (!util) caja.hidden = true;
      }
    });
    var tabs = document.querySelector(".tabs");
    if (tabs && document.getElementById("vistaAvisos")) tabs.hidden = true;
    actualizarAyuda(estado.seccion);
    actualizarTitulo(false);
  }

  function actualizarTitulo(enfocar) {
    var h = document.getElementById("diseno-titulo");
    if (!h) return;
    var item = itemActual();
    var txt = (item && item.label) || estado.tituloPagina || document.title || "";
    if (estado.pagina === "familia.html" && estado.rolClave === "padre" && estado.hijo && item) {
      txt = item.label + " · " + estado.hijo;
    }
    h.textContent = txt;
    var liceo = (window.LICEO && LICEO.nombre) || "";
    try { document.title = txt + (liceo ? " · " + liceo : ""); } catch (e) {}
    if (enfocar) {
      try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); }
    }
  }

  function textoAyuda(seccion) {
    var pag = estado.pagina || paginaActual();
    var clave = pag === "familia.html" && estado.rolClave === "padre" ? "familia.html#padre" : pag;
    var mapa = AYUDAS[clave] || {};
    if (seccion && mapa[seccion]) return mapa[seccion];
    if (mapa[""]) return mapa[""];
    return "";
  }

  function actualizarAyuda(seccion) {
    var ayuda = document.getElementById("diseno-ayuda");
    if (!ayuda) return;
    var txt = textoAyuda(seccion);
    ayuda.textContent = txt;
    ayuda.hidden = !txt;
    var franja = document.getElementById("diseno-franja");
    if (franja) franja.hidden = false;
  }

  function escudoSvg() {
    return '<svg class="diseno-escudo" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M3 20.2h18"/>' +
      '<path d="M4.6 20.2V10.6L12 4.8l7.4 5.8v9.6"/>' +
      '<path d="M9.4 20.2v-4.6h5.2v4.6"/>' +
      '<path d="M7.8 11h2.2v2.2H7.8zM14 11h2.2v2.2H14z"/>' +
      '<path d="M12 4.8V3.2"/>' +
      "</svg>";
  }

  function leerBarraPref() {
    try { return sessionStorage.getItem("diseno_barra_ampliada"); } catch (e) { return null; }
  }

  /* ===== Accesibilidad que se aplica a todo lo que la página dibuja ===== */
  function nombreAccesible(el) {
    if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")) return true;
    if (el.closest("label")) return true;
    if (el.id) {
      try { if (document.querySelector('label[for="' + el.id.replace(/"/g, '\\"') + '"]')) return true; } catch (e) {}
    }
    return false;
  }

  /* Control dentro de una tabla: «columna — fila» (p. ej. «Estado — Pérez, Juan»). */
  function rotuloDeCelda(el) {
    var celda = el.closest("td, th");
    var fila = el.closest("tr");
    var tabla = el.closest("table");
    if (!celda || !fila || !tabla) return "";
    var idx = Array.prototype.indexOf.call(fila.cells, celda);
    var col = "";
    var cab = tabla.querySelector("thead tr:last-child") || tabla.querySelector("tr");
    if (cab && cab !== fila && cab.cells[idx]) col = textoDe(cab.cells[idx]);
    var nombre = "";
    var thFila = fila.querySelector("th[scope=row]");
    if (thFila) nombre = textoDe(thFila);
    if (!nombre) {
      for (var i = 0; i < fila.cells.length; i++) {
        var t = textoDe(fila.cells[i]);
        if (fila.cells[i] !== celda && /[A-Za-zÁÉÍÓÚÑáéíóúñ]{2}/.test(t) && !fila.cells[i].querySelector("input, select, textarea")) { nombre = t; break; }
      }
    }
    return [col, nombre.slice(0, 80)].filter(Boolean).join(" — ");
  }

  function repararAccesibilidad(raiz) {
    raiz = raiz || document;
    raiz.querySelectorAll("input, select, textarea").forEach(function (el) {
      if (el.type === "hidden" || nombreAccesible(el)) return;
      var t = el.getAttribute("placeholder") || el.getAttribute("title") || "";
      if (!t && el.type === "file") t = "Elegir archivo";
      if (!t && el.type === "checkbox") {
        var fila = el.closest("tr");
        if (fila) t = "Seleccionar " + textoDe(fila.querySelector("td:not(:first-child), th")).slice(0, 60);
      }
      if (!t) t = rotuloDeCelda(el);
      if (t) el.setAttribute("aria-label", t);
    });
    raiz.querySelectorAll("button, [role=button]").forEach(function (b) {
      if (b.getAttribute("aria-label")) return;
      var txt = textoDe(b).replace(/[\s\u2715\u00d7\u2190\u2192\u2191\u2193\u{1F5D1}\u{1F512}\u270E\u2714]/gu, "");
      if (!txt) {
        var t = b.getAttribute("title") || (/[\u2715\u00d7]/.test(textoDe(b)) ? "Cerrar" : "");
        if (t) b.setAttribute("aria-label", t);
      }
    });
    raiz.querySelectorAll("img:not([alt])").forEach(function (img) { img.setAttribute("alt", ""); });
    raiz.querySelectorAll("table").forEach(function (tb) {
      tb.querySelectorAll("thead th").forEach(function (th) {
        if (!th.hasAttribute("scope")) th.setAttribute("scope", th.colSpan > 1 ? "colgroup" : "col");
      });
      tb.querySelectorAll("tbody th").forEach(function (th) {
        if (!th.hasAttribute("scope")) th.setAttribute("scope", "row");
      });
      var cont = tb.parentElement;
      if (cont && cont.classList.contains("desliza") && !cont.hasAttribute("tabindex")) {
        cont.setAttribute("tabindex", "0");
        cont.setAttribute("role", "region");
        var cap = tb.querySelector("caption");
        cont.setAttribute("aria-label", cap ? textoDe(cap) : "Tabla (se puede desplazar hacia los lados)");
      } else if (cont && !cont.classList.contains("desliza") && !cont.classList.contains("diseno-desliza") && !tb.closest(".desliza, .diseno-desliza") && cont.tagName !== "TD") {
        var envoltura = document.createElement("div");
        envoltura.className = "diseno-desliza";
        envoltura.setAttribute("tabindex", "0");
        envoltura.setAttribute("role", "region");
        var cap2 = tb.querySelector("caption");
        envoltura.setAttribute("aria-label", cap2 ? textoDe(cap2) : "Tabla (se puede desplazar hacia los lados)");
        cont.insertBefore(envoltura, tb);
        envoltura.appendChild(tb);
      }
    });
    /* Mensajes de estado: que el lector de pantalla los anuncie. */
    raiz.querySelectorAll("#estado, #mensaje, #msgBoletin, #cupo, [id^=estado], [id^=msg]").forEach(function (el) {
      if (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName)) return;
      if (!el.hasAttribute("aria-live")) el.setAttribute("aria-live", "polite");
      if (!el.hasAttribute("role")) el.setAttribute("role", "status");
    });
    /* Elementos que solo responden al clic: hacerlos usables con teclado. */
    raiz.querySelectorAll("[onclick]:not(button):not(a):not(input):not(select):not(textarea):not(label)").forEach(function (el) {
      if (el.hasAttribute("tabindex")) return;
      el.setAttribute("tabindex", "0");
      if (!el.getAttribute("role")) el.setAttribute("role", "button");
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
      });
    });
  }

  var reparoPendiente = false;
  function observarAccesibilidad() {
    if (!window.MutationObserver) return;
    var main = document.querySelector(".diseno-main") || document.body;
    new MutationObserver(function () {
      if (reparoPendiente) return;
      reparoPendiente = true;
      (window.requestAnimationFrame || setTimeout)(function () {
        reparoPendiente = false;
        repararAccesibilidad(main);
      });
    }).observe(main, { childList: true, subtree: true });
  }

  function saltoAlContenido(destinoId) {
    if (document.getElementById("diseno-saltar")) return;
    var a = document.createElement("a");
    a.id = "diseno-saltar";
    a.className = "diseno-saltar";
    a.href = "#" + destinoId;
    a.textContent = "Saltar al contenido";
    a.addEventListener("click", function (e) {
      var d = document.getElementById(destinoId);
      if (!d) return;
      e.preventDefault();
      d.focus();
    });
    document.body.insertBefore(a, document.body.firstChild);
  }

  function construirShell() {
    if (document.getElementById("diseno-layout")) return;
    var layout = document.createElement("div");
    layout.className = "diseno-layout";
    layout.id = "diseno-layout";
    var header = document.createElement("header");
    header.className = "diseno-header";
    header.innerHTML =
      '<button type="button" class="diseno-btn-menu" id="diseno-btn-menu" aria-controls="diseno-barra" aria-expanded="false" aria-label="Ampliar el menú con nombres">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>' +
      "</button>" +
      '<div class="diseno-identidad">' +
      '<p class="diseno-espacio">El espacio de <span id="diseno-nombre"></span></p>' +
      '<p class="diseno-rol" id="diseno-rol"></p>' +
      '<div class="diseno-roles" id="diseno-roles" role="group" aria-label="Cambiar de rol" hidden></div>' +
      "</div>" +
      '<div class="diseno-acciones-cab">' +
      '<button type="button" class="diseno-campana sin-tema" id="diseno-campana" hidden aria-label="Avisos">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS.avisos + "</svg>" +
      '<span class="diseno-campana-punto" aria-hidden="true" hidden></span></button>' +
      "</div>";
    var aside = document.createElement("aside");
    aside.id = "diseno-barra";
    aside.setAttribute("aria-label", "Menú lateral");
    var marca = document.createElement("div");
    marca.className = "diseno-marca";
    marca.id = "diseno-marca";
    marca.innerHTML = '<span class="diseno-escudo-caja">' + escudoSvg() + '</span><span class="diseno-nombre-liceo" id="diseno-nombre-liceo"></span>';
    var nombreLiceo = marca.querySelector("#diseno-nombre-liceo");
    if (nombreLiceo) nombreLiceo.textContent = (window.LICEO && LICEO.nombre) || "";
    var nav = document.createElement("nav");
    nav.id = "diseno-nav";
    nav.setAttribute("aria-label", "Navegación principal");
    aside.appendChild(marca);
    aside.appendChild(nav);
    var main = document.createElement("main");
    main.className = "diseno-main";
    main.id = "diseno-contenido";
    main.tabIndex = -1;
    var movers = [];
    for (var i = 0; i < document.body.children.length; i++) {
      var ch = document.body.children[i];
      if (ch.tagName !== "SCRIPT" && ch.tagName !== "STYLE") movers.push(ch);
    }
    movers.forEach(function (el) { main.appendChild(el); });
    layout.appendChild(header);
    layout.appendChild(aside);
    layout.appendChild(main);
    document.body.insertBefore(layout, document.body.firstChild);
    document.body.classList.add("es-diseno");
    saltoAlContenido("diseno-contenido");
    var btn = document.getElementById("diseno-btn-menu");
    btn.addEventListener("click", function () {
      actualizarMenu(!layout.classList.contains("es-ampliada"));
    });
    /* v4: en computadora la barra queda contraída (solo íconos) salvo que la persona la haya ampliado */
    var alCambiarPantalla = function () { actualizarMenu(mq.matches ? false : leerBarraPref() === "1"); };
    if (mq.addEventListener) mq.addEventListener("change", alCambiarPantalla);
    else if (mq.addListener) mq.addListener(alCambiarPantalla);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mq.matches && layout.classList.contains("es-ampliada")) {
        actualizarMenu(false);
        btn.focus();
      }
    });
    /* v4: la barra empieza contraída (solo iconos; el nombre aparece al pasar el
       ratón o con el teclado). El botón la amplía y se recuerda en esta sesión. */
    var pref = leerBarraPref();
    if (mq.matches) actualizarMenu(false);
    else actualizarMenu(pref === "1");
    var campana = document.getElementById("diseno-campana");
    if (campana) campana.addEventListener("click", abrirAvisosDesdeCampana);
    /* La barra lateral queda fija al bajar: se coloca justo debajo de la cabecera. */
    var medir = function () {
      layout.style.setProperty("--alto-cabecera", header.offsetHeight + "px");
    };
    medir();
    if (window.ResizeObserver) new ResizeObserver(medir).observe(header);
    else window.addEventListener("resize", medir);
    avisoArchivoLocal();
    esconderChrome();
    /* v4.1: los créditos van a la derecha de la cabecera (los crea tema.js) */
    if (typeof window.colocarFirma === "function") window.colocarFirma();
  }

  function montarAcceso() {
    document.body.classList.add("es-acceso");
    if (document.querySelector(".diseno-header-acceso")) return;
    var bar = document.createElement("header");
    bar.className = "diseno-header-acceso";
    bar.innerHTML = escudoSvg() + '<span id="diseno-acceso-nombre"></span>';
    var accNom = bar.querySelector("#diseno-acceso-nombre");
    if (accNom) accNom.textContent = (window.LICEO && LICEO.nombre) || "";
    var cont = document.createElement("main");
    cont.id = "diseno-contenido";
    cont.tabIndex = -1;
    var movers = [];
    for (var i = 0; i < document.body.children.length; i++) {
      var ch = document.body.children[i];
      if (ch.tagName !== "SCRIPT" && ch.tagName !== "STYLE") movers.push(ch);
    }
    movers.forEach(function (el) { cont.appendChild(el); });
    document.body.insertBefore(cont, document.body.firstChild);
    document.body.insertBefore(bar, cont);
    saltoAlContenido("diseno-contenido");
    repararAccesibilidad(document);
    observarAccesibilidad();
  }

  function seccionDelHash() {
    return (location.hash || "").replace("#", "");
  }

  function montar(opts) {
    opts = opts || {};
    if (opts.modo === "acceso") {
      montarAcceso();
      return;
    }
    estado.pagina = opts.pagina || paginaActual();
    estado.grupo = opts.grupo || "";
    estado.grupoDinamico = !!opts.grupoDinamico;
    construirShell();
    /* Sin rol activo confirmado no se muestra un menú inventado: llega con aplicarGrupo. */
    pintarNav();
    interpretarIdentidad();
    var hash = seccionDelHash();
    if (estado.pagina === "admin.html") mostrarAdmin(hash || "cursos");
    else if (SECCIONES[estado.pagina]) {
      aplicarSecciones(SECCIONES[estado.pagina], hash);
    } else if (estado.pagina === "secretaria.html") {
      estado.seccion = hash || "alumnos";
      if (typeof window.mostrar === "function") window.mostrar(estado.seccion);
    }
    actualizarAyuda(estado.seccion);
    actualizarTitulo(false);
    window.addEventListener("hashchange", function () {
      var h = seccionDelHash();
      if (!h || h === estado.seccion || h === "diseno-contenido") return;
      if (estado.pagina === "secretaria.html") {
        if (typeof window.mostrar === "function") window.mostrar(h);
        estado.seccion = h; pintarNav(); actualizarAyuda(h); actualizarTitulo(true);
      } else if (estado.pagina === "admin.html" || SECCIONES[estado.pagina]) {
        mostrarSeccion(h, true);
      }
    });
    if (window.LICEO && LICEO.nombre) {
      var nl = document.getElementById("diseno-nombre-liceo");
      if (nl) nl.textContent = LICEO.nombre;
    }
    var saludo = document.getElementById("saludo");
    if (saludo && window.MutationObserver) {
      new MutationObserver(interpretarIdentidad).observe(saludo, { childList: true, characterData: true, subtree: true });
    }
    var chip = document.querySelector(".chip, #chipRol");
    if (chip && window.MutationObserver) {
      new MutationObserver(interpretarIdentidad).observe(chip, { childList: true, characterData: true, subtree: true });
    }
    repararAccesibilidad(document);
    observarAccesibilidad();
  }

  /* ===================== v4: campana, novedades y archivo local ===================== */

  /* Si la plataforma se abrió como archivo (file://), se explica cómo abrirla bien. */
  function avisoArchivoLocal() {
    if (location.protocol !== "file:" || document.getElementById("diseno-aviso-archivo")) return;
    var main = document.querySelector(".diseno-main");
    if (!main) return;
    var p = document.createElement("p");
    p.id = "diseno-aviso-archivo";
    p.className = "diseno-aviso-archivo";
    p.setAttribute("role", "note");
    p.textContent = "Abriste la plataforma como un archivo de tu computadora. Así algunos navegadores no comparten la sesión entre páginas y las listas pueden salir vacías. Ábrela desde un servidor (por ejemplo, la dirección del sitio publicado o http://localhost).";
    main.insertBefore(p, main.firstChild);
  }

  function abrirAvisosDesdeCampana() {
    var destino = CAMPANA[estado.grupo];
    if (!destino) return;
    if (destino.href) { location.href = destino.href; return; }
    if (destino.pagina && destino.pagina !== (estado.pagina || paginaActual())) {
      location.href = destino.pagina + "#" + destino.seccion;
      return;
    }
    mostrarSeccion(destino.seccion, false);
    var caja = destino.foco && document.getElementById(destino.foco);
    if (caja) {
      var h = caja.querySelector("h2, h3") || caja;
      if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1");
      try { caja.scrollIntoView({ block: "start" }); } catch (e) {}
      try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); }
    }
    novedades.marcarVistos("avisos");
  }

  function pintarCampana() {
    var b = document.getElementById("diseno-campana");
    if (!b) return;
    var destino = CAMPANA[estado.grupo];
    b.hidden = !destino;
    if (!destino) return;
    var n = estado.alertas.avisos || 0;
    var punto = b.querySelector(".diseno-campana-punto");
    if (punto) { punto.hidden = !n; punto.textContent = n ? String(n) : ""; }
    b.classList.toggle("diseno-alerta", !!n);
    b.classList.toggle("es-animar", !!(n && estado.animar.avisos));
    b.setAttribute("aria-label", n ? "Avisos: " + n + (n === 1 ? " aviso nuevo" : " avisos nuevos") : "Avisos: no hay avisos nuevos");
  }

  /*
   * Novedades («visto / no visto»). Se guardan en este dispositivo (localStorage),
   * por cuenta. Si existe la tabla opcional avisos_leidos (sql/05), los avisos
   * leídos también se guardan en el servidor para verlos en otros dispositivos.
   */
  var novedades = (function () {
    var actuales = {};      // tipo -> [{id, fecha}]
    var servidor = { avisos: null, cliente: null, ok: false };
    var animados = {};
    var DIAS_NUEVO = 7;

    function clave(tipo) { return "novedades:" + (estado.uid || "sesion") + ":" + tipo; }
    function leer(tipo) {
      try { return JSON.parse(localStorage.getItem(clave(tipo)) || "null"); } catch (e) { return null; }
    }
    function guardar(tipo, dato) {
      try { localStorage.setItem(clave(tipo), JSON.stringify(dato)); } catch (e) {}
    }
    function calcular(tipo) {
      var lista = actuales[tipo] || [];
      var reg = leer(tipo);
      var vistos = {};
      if (reg && reg.vistos) reg.vistos.forEach(function (id) { vistos[String(id)] = 1; });
      if (tipo === "avisos" && servidor.avisos) servidor.avisos.forEach(function (id) { vistos[String(id)] = 1; });
      var limite = Date.now() - DIAS_NUEVO * 86400000;
      var n = 0;
      lista.forEach(function (x) {
        if (vistos[String(x.id)]) return;
        /* Primera vez en este dispositivo: solo cuenta lo de los últimos 7 días. */
        if (!reg && x.fecha && new Date(x.fecha).getTime() < limite) return;
        n++;
      });
      return n;
    }
    function actualizar(tipo) {
      var n = calcular(tipo);
      var antes = estado.alertas[tipo] || 0;
      estado.alertas[tipo] = n;
      /* Animación de 5 segundos cuando aparecen novedades (una vez por página). */
      if (n > 0 && n > antes && !animados[tipo]) {
        animados[tipo] = 1;
        estado.animar[tipo] = true;
        setTimeout(function () { estado.animar[tipo] = false; pintarNav(); pintarCampana(); }, 5000);
      }
      pintarNav();
      pintarCampana();
    }
    /* Abrir la página de Avisos o el Aula cuenta como «visto». */
    var VISTO_AL_ABRIR = { "avisos.html": "avisos", "aula_profesor.html": "entregas" };
    function fijar(tipo, lista) {
      actuales[tipo] = (lista || []).map(function (x) {
        return typeof x === "object" && x ? { id: x.id, fecha: x.fecha || x.creado_en || null } : { id: x, fecha: null };
      });
      if (VISTO_AL_ABRIR[estado.pagina || paginaActual()] === tipo) { marcarVistos(tipo); return; }
      actualizar(tipo);
    }
    function marcarVistos(tipo, ids) {
      var reg = leer(tipo) || { vistos: [] };
      var set = {};
      reg.vistos.forEach(function (id) { set[String(id)] = 1; });
      var nuevos = [];
      var lista = ids || (actuales[tipo] || []).map(function (x) { return x.id; });
      lista.forEach(function (id) { if (!set[String(id)]) { set[String(id)] = 1; nuevos.push(id); } });
      reg.vistos = Object.keys(set).slice(-800);
      guardar(tipo, reg);
      if (tipo === "avisos" && servidor.ok && servidor.cliente && nuevos.length && estado.uid) {
        servidor.cliente.from("avisos_leidos").upsert(nuevos.map(function (id) {
          return { perfil_id: estado.uid, aviso_id: id };
        }), { onConflict: "perfil_id,aviso_id" }).then(function () {}, function () {});
      }
      actualizar(tipo);
    }
    /* Lectura ligera (solo consultas) para saber si hay avisos o entregas nuevas en
       las páginas que no los cargan por su cuenta. Se guarda 2 minutos en la sesión. */
    async function cargarDesdeServidor(cliente, rol) {
      if (!cliente || !estado.uid) return;
      servidor.cliente = cliente;
      /* La tabla opcional solo se consulta si sql/05 dejó el ajuste v4_avisos_leidos = 1
         en config_sistema (así no aparecen errores cuando todavía no existe). */
      try {
        var conf = await banderas(cliente);
        if (conf.v4_avisos_leidos) {
          var r = await cliente.from("avisos_leidos").select("aviso_id").eq("perfil_id", estado.uid).limit(1000);
          if (!r.error) {
            servidor.ok = true;
            servidor.avisos = (r.data || []).map(function (x) { return x.aviso_id; });
            if (actuales.avisos) actualizar("avisos");
          }
        }
      } catch (e) {}
      if (rol === "estudiante" || rol === "padre") return;   // la página de familia carga sus datos
      var cacheClave = "novedades-cache:" + estado.uid + ":" + rol;
      var cache = null;
      try { cache = JSON.parse(sessionStorage.getItem(cacheClave) || "null"); } catch (e) {}
      if (cache && Date.now() - cache.t < 120000) {
        Object.keys(cache.d).forEach(function (tipo) { if (!actuales[tipo]) fijar(tipo, cache.d[tipo]); });
        return;
      }
      var datos = {};
      try {
        if (CAMPANA[estado.grupo] && !actuales.avisos) {
          var hoy = new Date();
          var hoyTxt = hoy.getFullYear() + "-" + String(hoy.getMonth() + 1).padStart(2, "0") + "-" + String(hoy.getDate()).padStart(2, "0");
          var av = await cliente.from("avisos").select("id, creado_en")
            .or("fecha_expira.is.null,fecha_expira.gte." + hoyTxt)
            .order("creado_en", { ascending: false }).limit(30);
          if (!av.error) { datos.avisos = (av.data || []).map(function (x) { return { id: x.id, fecha: x.creado_en }; }); fijar("avisos", datos.avisos); }
        }
        if (rol === "profesor" && !actuales.entregas) {
          var as = await cliente.from("asignaturas").select("id").eq("profesor_id", estado.uid);
          var ids = (as.data || []).map(function (x) { return x.id; });
          if (!as.error && ids.length) {
            var ta = await cliente.from("tareas").select("id").in("asignatura_id", ids);
            var tids = (ta.data || []).map(function (x) { return x.id; });
            if (!ta.error && tids.length) {
              var en = await cliente.from("entregas").select("id, tarea_id, entregado_en").in("tarea_id", tids).eq("estado", "entregada");
              if (!en.error) { datos.entregas = (en.data || []).map(function (x) { return { id: x.id || (x.tarea_id + ":" + x.entregado_en), fecha: x.entregado_en }; }); fijar("entregas", datos.entregas); }
            }
          }
        }
        try { sessionStorage.setItem(cacheClave, JSON.stringify({ t: Date.now(), d: datos })); } catch (e) {}
      } catch (e) { /* sin red o sin permiso: no se marca nada */ }
    }
    return { fijar: fijar, marcarVistos: marcarVistos, cargarDesdeServidor: cargarDesdeServidor, cuantos: function (t) { return estado.alertas[t] || 0; } };
  })();

  /* Ajustes v4 que activan los SQL opcionales (tabla config_sistema, ya existente).
     Se leen una sola vez por sesión del navegador (5 minutos). */
  var promesaBanderas = null;
  function banderas(cliente) {
    if (promesaBanderas) return promesaBanderas;
    cliente = cliente || buscarCliente();
    promesaBanderas = (async function () {
      var cacheClave = "v4-banderas";
      try {
        var c = JSON.parse(sessionStorage.getItem(cacheClave) || "null");
        if (c && Date.now() - c.t < 300000) return c.d;
      } catch (e) {}
      var d = {};
      if (!cliente) return d;
      try {
        var r = await cliente.from("config_sistema").select("clave, valor").in("clave", ["v4_permisos_subida", "v4_avisos_leidos"]);
        if (!r.error) (r.data || []).forEach(function (x) {
          var v = String(x.valor == null ? "" : x.valor).replace(/"/g, "").trim().toLowerCase();
          d[x.clave] = v === "1" || v === "si" || v === "true";
        });
      } catch (e) {}
      try { sessionStorage.setItem(cacheClave, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
      return d;
    })();
    return promesaBanderas;
  }

  function buscarCliente() {
    if (window.App && App.cliente) return App.cliente;
    try { /* las páginas declaran «const cliente» en su script */
      // eslint-disable-next-line no-undef
      if (typeof cliente !== "undefined" && cliente && cliente.from) return cliente;
    } catch (e) {}
    return null;
  }

  /* ===================== v4: colores y portadas de materias ===================== */

  /* Paleta fija (sin rojo), con contraste AA con texto blanco y sobre el fondo crema. */
  var COLORES_MATERIA = ["#1e3a8a", "#15803d", "#6d28d9", "#0f766e", "#854d0e", "#3730a3", "#a21caf", "#155e75", "#4d7c0f", "#0369a1", "#334155", "#5b21b6"];
  function colorMateria(i) { return COLORES_MATERIA[((Number(i) || 0) % COLORES_MATERIA.length + COLORES_MATERIA.length) % COLORES_MATERIA.length]; }

  function quitarAcentos(t) { return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

  /* Dibujo por defecto según el nombre de la materia (sin imágenes externas). */
  function portadaSvg(nombre, color) {
    var n = quitarAcentos(nombre);
    var c = color || "#334155";
    var base = '<svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect width="320" height="120" fill="' + c + '"/>';
    var circ = '<circle cx="262" cy="20" r="50" fill="rgba(255,255,255,.16)"/><circle cx="40" cy="104" r="34" fill="rgba(255,255,255,.10)"/>';
    var dibujo;
    if (/educacion fisica|deport/.test(n)) {
      dibujo = '<circle cx="150" cy="62" r="28" fill="none" stroke="#fff" stroke-width="3"/><path d="M150 34c18 10 18 46 0 56 M150 34c-18 10-18 46 0 56 M122 62h56" stroke="#fff" stroke-width="2" fill="none"/><circle cx="230" cy="70" r="10" fill="#fff"/>';
    } else if (/matemat|algebra|geometr|calculo|estadist/.test(n)) {
      dibujo = '<text x="36" y="58" fill="#fff" font-size="28" font-family="Georgia, serif" font-weight="700">π</text><text x="86" y="80" fill="#fff" font-size="22" font-family="Georgia, serif">∑</text><text x="196" y="52" fill="#fff" font-size="20" font-family="Georgia, serif">a²+b²</text><circle cx="240" cy="84" r="16" fill="none" stroke="#fff" stroke-width="3"/><polygon points="140,90 170,40 200,90" fill="none" stroke="#fff" stroke-width="3"/>';
    } else if (/lengua|espanol|literat|lectura|redacc/.test(n)) {
      dibujo = '<path d="M70 88 L70 36 C70 36 110 28 160 36 L160 88 C110 80 70 88 70 88Z" fill="#fff" opacity=".95"/><path d="M250 88 L250 36 C250 36 210 28 160 36 L160 88 C210 80 250 88 250 88Z" fill="#fff" opacity=".85"/><path d="M160 36 V88" stroke="' + c + '" stroke-width="3"/><path d="M90 52 h50 M90 64 h40 M186 52 h44 M186 64 h34" stroke="' + c + '" stroke-width="2" opacity=".7"/>';
    } else if (/social|histor|geograf|civica|ciudadan/.test(n)) {
      dibujo = '<circle cx="168" cy="62" r="34" fill="none" stroke="#fff" stroke-width="3"/><ellipse cx="168" cy="62" rx="16" ry="34" fill="none" stroke="#fff" stroke-width="2"/><path d="M134 62h68 M168 28v68" stroke="#fff" stroke-width="2"/>';
    } else if (/natural|ciencia|biolog|quimic|fisica|laborat/.test(n)) {
      dibujo = '<path d="M90 92 C90 60 130 48 130 48 C130 48 150 78 130 96 C110 110 90 92 90 92Z" fill="#fff"/><rect x="200" y="50" width="22" height="40" rx="2" fill="none" stroke="#fff" stroke-width="3"/><path d="M200 58h22 M211 50v-10" stroke="#fff" stroke-width="3"/><circle cx="211" cy="72" r="6" fill="#fff" opacity=".7"/>';
    } else if (/ingles|frances|idioma|english|lengua extranjera/.test(n)) {
      dibujo = '<text x="70" y="78" fill="#fff" font-size="42" font-family="Georgia, serif" font-weight="700">ABC</text><rect x="230" y="36" width="44" height="52" rx="4" fill="none" stroke="#fff" stroke-width="3"/><path d="M238 52h28 M238 64h20" stroke="#fff" stroke-width="2"/>';
    } else if (/formacion|religi|moral|humana|etica/.test(n)) {
      dibujo = '<path d="M160 82 c-16-18-36-8-36 8 c0 22 36 30 36 30 c0 0 36-8 36-30 c0-16-20-26-36-8Z" fill="#fff"/><circle cx="232" cy="46" r="14" fill="none" stroke="#fff" stroke-width="3"/>';
    } else if (/artist|arte|music|dibujo|danza|teatro/.test(n)) {
      dibujo = '<path d="M90 88c0-24 36-36 52-8 c4-20 28-28 36-8 c2-16 24-24 32-2 v28H90Z" fill="#fff" opacity=".9"/><circle cx="108" cy="72" r="6" fill="' + c + '"/><circle cx="130" cy="64" r="6" fill="' + c + '"/><circle cx="154" cy="72" r="6" fill="' + c + '"/>';
    } else if (/informat|tecnolog|computa|robot|program/.test(n)) {
      dibujo = '<rect x="110" y="34" width="100" height="60" rx="6" fill="none" stroke="#fff" stroke-width="3"/><path d="M96 100h128" stroke="#fff" stroke-width="4"/><path d="M140 56l-10 8 10 8 M180 56l10 8-10 8" stroke="#fff" stroke-width="3" fill="none"/>';
    } else {
      /* Genérico: un cuaderno con líneas. */
      dibujo = '<rect x="118" y="26" width="84" height="70" rx="6" fill="#fff" opacity=".95"/><path d="M134 44h52 M134 56h52 M134 68h40 M134 80h46" stroke="' + c + '" stroke-width="2.5"/><path d="M118 26v70" stroke="' + c + '" stroke-width="5"/>';
    }
    return base + circ + dibujo + "</svg>";
  }

  /* Portada personal (imagen elegida por el alumno): se guarda en este dispositivo. */
  var MAX_IMG = 2 * 1024 * 1024;
  var TIPOS = { "image/jpeg": 1, "image/png": 1, "image/webp": 1 };
  function clavePortada(materia) { return "demo-escolar-portada:" + (estado.uid || "sesion") + ":" + materia; }
  function leerPortada(materia) { try { var r = localStorage.getItem(clavePortada(materia)); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function guardarPortada(materia, valor) { try { localStorage.setItem(clavePortada(materia), JSON.stringify(valor)); return true; } catch (e) { return false; } }
  function borrarPortada(materia) { try { localStorage.removeItem(clavePortada(materia)); return true; } catch (e) { return false; } }
  function aDataURL(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(new Error("lectura")); };
      r.readAsDataURL(file);
    });
  }
  function comprimir(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(url);
        var maxLado = 1280, w = img.width, h = img.height;
        var escala = Math.min(1, maxLado / Math.max(w, h, 1));
        w = Math.max(1, Math.round(w * escala)); h = Math.max(1, Math.round(h * escala));
        var canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("canvas")); return; }
        ctx.drawImage(img, 0, 0, w, h);
        var q = 0.8, out = canvas.toDataURL("image/jpeg", q);
        while (out.length > MAX_IMG * 1.37 && q > 0.4) { q -= 0.1; out = canvas.toDataURL("image/jpeg", q); }
        resolve(out);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("imagen")); };
      img.src = url;
    });
  }

  var PALETA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4a8 8 0 1 0 0 16c1.3 0 2-.8 2-1.7 0-.6-.3-1.1-.3-1.6 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 3-6.6A8 8 0 0 0 12 4Z"/><circle cx="8" cy="10" r="1.1" fill="currentColor" stroke="none"/><circle cx="11" cy="7.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.2" cy="8.2" r="1.1" fill="currentColor" stroke="none"/><circle cx="8.4" cy="13.5" r="1.1" fill="currentColor" stroke="none"/></svg>';

  /* Llena un contenedor .diseno-cubierta con el dibujo o la imagen personal y,
     si se permite, el botón de paleta con su menú «Cambiar imagen / Quitar imagen». */
  function montarPortada(cont, nombre, color, puedeCambiar) {
    if (!cont) return;
    cont.style.setProperty("--materia", color);
    cont.innerHTML = '<div class="diseno-cubierta-dibujo">' + portadaSvg(nombre, color) + "</div>";
    var img = document.createElement("img");
    img.className = "diseno-cubierta-img";
    img.alt = "";
    img.hidden = true;
    cont.appendChild(img);
    var vivo = document.createElement("span");
    vivo.className = "sr-only";
    vivo.setAttribute("role", "status");
    vivo.setAttribute("aria-live", "polite");
    cont.appendChild(vivo);
    function pintar() {
      var d = leerPortada(nombre);
      var hay = !!(d && d.dataUrl);
      img.hidden = !hay;
      if (hay) img.src = d.dataUrl; else img.removeAttribute("src");
      if (quitar) quitar.setAttribute("aria-disabled", hay ? "false" : "true");
    }
    var quitar = null;
    if (puedeCambiar) {
      var idMenu = "menu-portada-" + Math.random().toString(36).slice(2, 8);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "diseno-paleta sin-tema";
      btn.setAttribute("aria-haspopup", "menu");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", idMenu);
      btn.setAttribute("aria-label", "Cambiar la portada de " + nombre);
      btn.innerHTML = PALETA_SVG;
      var menu = document.createElement("div");
      menu.className = "diseno-menu-portada";
      menu.id = idMenu;
      menu.setAttribute("role", "menu");
      menu.setAttribute("aria-label", "Portada de " + nombre);
      menu.hidden = true;
      var cambiar = document.createElement("button");
      cambiar.type = "button"; cambiar.className = "sin-tema"; cambiar.setAttribute("role", "menuitem"); cambiar.textContent = "Cambiar imagen";
      quitar = document.createElement("button");
      quitar.type = "button"; quitar.className = "sin-tema"; quitar.setAttribute("role", "menuitem"); quitar.textContent = "Quitar imagen";
      menu.appendChild(cambiar); menu.appendChild(quitar);
      var input = document.createElement("input");
      input.type = "file";
      input.className = "sr-only";
      input.tabIndex = -1;
      input.accept = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
      input.setAttribute("aria-label", "Imagen de portada para " + nombre);
      cont.appendChild(btn); cont.appendChild(menu); cont.appendChild(input);
      var items = [cambiar, quitar];
      items.forEach(function (it) { it.tabIndex = -1; });
      var abrir = function (enfocarPrimero) {
        menu.hidden = false; btn.setAttribute("aria-expanded", "true");
        if (enfocarPrimero !== false) cambiar.focus();
        setTimeout(function () { document.addEventListener("click", fuera, true); }, 0);
      };
      var cerrar = function (devolverFoco) {
        menu.hidden = true; btn.setAttribute("aria-expanded", "false");
        document.removeEventListener("click", fuera, true);
        if (devolverFoco) btn.focus();
      };
      var fuera = function (ev) { if (!menu.contains(ev.target) && ev.target !== btn && !btn.contains(ev.target)) cerrar(false); };
      btn.addEventListener("click", function () { if (menu.hidden) abrir(); else cerrar(true); });
      btn.addEventListener("keydown", function (ev) {
        if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { ev.preventDefault(); abrir(); if (ev.key === "ArrowUp") quitar.focus(); }
      });
      menu.addEventListener("keydown", function (ev) {
        var i = items.indexOf(document.activeElement);
        if (ev.key === "Escape") { ev.preventDefault(); cerrar(true); }
        else if (ev.key === "ArrowDown") { ev.preventDefault(); items[(i + 1) % items.length].focus(); }
        else if (ev.key === "ArrowUp") { ev.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        else if (ev.key === "Home") { ev.preventDefault(); items[0].focus(); }
        else if (ev.key === "End") { ev.preventDefault(); items[items.length - 1].focus(); }
        else if (ev.key === "Tab") { cerrar(false); }
      });
      cambiar.addEventListener("click", function () { cerrar(false); input.click(); });
      quitar.addEventListener("click", function () {
        if (quitar.getAttribute("aria-disabled") === "true") { cerrar(true); vivo.textContent = "Esta materia ya usa el dibujo de siempre."; return; }
        borrarPortada(nombre); pintar(); cerrar(true);
        vivo.textContent = "Se quitó la imagen. Vuelve el dibujo de la materia.";
      });
      input.addEventListener("change", function () {
        var file = input.files && input.files[0];
        input.value = "";
        if (!file) return;
        var tipoOk = TIPOS[file.type] || /\.(jpe?g|png|webp)$/i.test(file.name || "");
        if (!tipoOk) { vivo.textContent = "Elige una foto en formato JPG, PNG o WebP."; btn.focus(); return; }
        var tarea = file.size > MAX_IMG ? comprimir(file) : aDataURL(file);
        tarea.then(function (dataUrl) {
          var datos = { dataUrl: dataUrl };
          if (!guardarPortada(nombre, datos)) {
            return comprimir(file).then(function (red) { datos.dataUrl = red; guardarPortada(nombre, datos); pintar(); vivo.textContent = "Portada cambiada."; });
          }
          pintar();
          vivo.textContent = "Portada cambiada.";
        }).catch(function () { vivo.textContent = "No se pudo usar esa imagen. Prueba con otra foto."; })
          .then(function () { btn.focus(); });
      });
    }
    pintar();
  }

  window.Diseno = {
    montar: montar,
    identificar: function (nombre, rol, clave, uid) {
      if (nombre) { estado.nombre = nombre; estado._nombreFijo = true; }
      if (rol) { estado.rol = rol; estado._rolFijo = true; }
      if (clave) estado.rolClave = clave;
      if (uid) estado.uid = uid;
      pintarIdentidad();
      actualizarAyuda(estado.seccion);
    },
    aplicarGrupo: function (grupo) {
      estado.grupo = grupo;
      pintarNav();
      pintarCampana();
      actualizarTitulo(false);
      /* Precarga discreta de las demás páginas del menú (solo el HTML; sin datos). */
      var items = MENU[grupo] || [];
      var lanzar = function () {
        items.forEach(function (it) { if (it.href) precargar(it.href); else if (it.pagina) precargar(it.pagina); });
      };
      if (window.requestIdleCallback) requestIdleCallback(lanzar, { timeout: 3000 });
      else setTimeout(lanzar, 1500);
    },
    ofrecerRoles: function (roles, activo) {
      var caja = document.getElementById("diseno-roles");
      if (!caja) return;
      /* v4: siempre el mismo orden; el rol activo se resalta en su sitio (no se mueve). */
      var ORDEN_FIJO = ["admin", "coordinador", "profesor", "secretaria", "estudiante", "padre"];
      var lista = (roles || []).filter(function (r, i, a) { return a.indexOf(r) === i; })
        .sort(function (a, b) {
          var ia = ORDEN_FIJO.indexOf(a), ib = ORDEN_FIJO.indexOf(b);
          return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });
      caja.textContent = "";
      if (lista.length < 2) { caja.hidden = true; return; }
      caja.hidden = false;
      var nombres = (window.RolActivo && RolActivo.nombres && RolActivo.nombres()) || (window.App && App.NOMBRES) || {};
      lista.forEach(function (r) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "diseno-rol-btn sin-tema";
        var etq = nombres[r] || r;
        b.textContent = etq;
        b.setAttribute("aria-pressed", r === activo ? "true" : "false");
        b.setAttribute("aria-label", r === activo ? "Rol activo: " + etq : "Cambiar al rol " + etq);
        if (r === activo) b.classList.add("es-activo");
        b.addEventListener("click", function () {
          if (r === activo) return;
          if (window.RolActivo) RolActivo.irAlInicio(r, lista);
          else if (window.App && App.irAlInicioDeRol) App.irAlInicioDeRol(r, lista);
        });
        caja.appendChild(b);
      });
    },
    actualizarAyuda: actualizarAyuda,
    mostrarSeccion: function (s, enfocar) { mostrarSeccion(s, enfocar !== false); },
    seccionActual: function () { return estado.seccion; },
    /* La página avisa que cambió de apartado por su cuenta (p. ej. Secretaría al volver de un expediente). */
    marcarSeccion: function (s) {
      estado.seccion = s || "";
      pintarNav();
      actualizarAyuda(estado.seccion);
      actualizarTitulo(false);
    },
    contador: function (clave, n) {
      estado.contadores[clave] = Number(n) || 0;
      pintarNav();
    },
    fijarHijo: function (texto) {
      estado.hijo = texto || "";
      actualizarTitulo(false);
    },
    sincronizarBloques: function () {
      var pag = estado.pagina || paginaActual();
      if (SECCIONES[pag]) aplicarSecciones(SECCIONES[pag], estado.seccion || SECCION_INICIAL[pag]);
      actualizarAyuda(estado.seccion);
      actualizarTitulo(false);
    },
    repararAccesibilidad: repararAccesibilidad,
    /* v4 */
    novedades: novedades,
    banderas: function (cliente) { return banderas(cliente); },
    cargarNovedades: function (rol) { return novedades.cargarDesdeServidor(buscarCliente(), rol || estado.rolClave); },
    colorMateria: colorMateria,
    COLORES_MATERIA: COLORES_MATERIA,
    portadaSvg: portadaSvg,
    montarPortada: montarPortada,
    ayuda: textoAyuda,
    estado: estado
  };
})();
