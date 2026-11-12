/*
 * rol-activo.js - El rol con el que la persona eligió entrar (v3).
 * Solo se acepta un valor que ya esté en los roles validados de la sesión
 * (perfiles.rol + roles_adicionales). El sessionStorage, por sí solo,
 * no concede privilegios.
 *
 * v3: cada página comprueba que pertenece al ROL ACTIVO. Si alguien escribe
 * a mano la dirección de otra área, se le devuelve al inicio de su rol activo,
 * aunque su cuenta tenga también ese otro rol. Para usar otra área hay que
 * cambiar de rol de forma explícita (conmutador de la cabecera).
 * Esto es protección de la interfaz: lo que de verdad protege los datos son
 * las políticas RLS de Supabase.
 */
(function () {
  "use strict";

  var RUTAS = {
    admin: "admin.html",
    coordinador: "admin.html",
    secretaria: "asistencia_secretaria.html",
    profesor: "profesor.html",
    estudiante: "familia.html",
    padre: "familia.html"
  };
  var NOMBRES = {
    admin: "Administrador(a)",
    coordinador: "Coordinador(a)",
    secretaria: "Secretaria(o)",
    profesor: "Profesor(a)",
    estudiante: "Alumno(a)",
    padre: "Padre/Tutor"
  };

  /* Páginas que puede abrir cada rol ACTIVO. Lo que no está aquí redirige al inicio del rol. */
  var PAGINAS = {
    admin: ["admin.html", "admin_personal.html", "admin_modulos.html", "admin_horario.html",
      "admin_permisos.html", "avisos.html", "mis_datos.html"],
    /* Coordinación: mismo panel, sin Avisos (la publicación de avisos no tiene
       permiso confirmado para coordinación ni en la interfaz original ni en el servidor). */
    coordinador: ["admin.html", "admin_personal.html", "admin_modulos.html", "admin_horario.html",
      "admin_permisos.html", "mis_datos.html"],
    secretaria: ["asistencia_secretaria.html", "secretaria.html", "directorio_docentes.html", "mis_datos.html"],
    profesor: ["profesor.html", "aula_profesor.html", "asistencia_profesor.html",
      "reporte_alumno.html", "avisos.html", "mis_datos.html"],
    estudiante: ["familia.html", "aula_alumnos.html", "mis_datos.html"],
    padre: ["familia.html", "aula_alumnos.html", "mis_datos.html"]
  };

  function rutas() { return RUTAS; }
  function nombres() { return NOMBRES; }

  function filtrarRoles(lista) {
    var out = [];
    (lista || []).forEach(function (r) {
      if (RUTAS[r] && out.indexOf(r) === -1) out.push(r);
    });
    return out;
  }

  function leerGuardado() {
    try {
      return sessionStorage.getItem("rol_activo") || "";
    } catch (e) {
      return "";
    }
  }

  function fijar(rol, permitidos) {
    var lista = filtrarRoles(permitidos);
    if (!rol || lista.indexOf(rol) === -1 || !RUTAS[rol]) return false;
    try { sessionStorage.setItem("rol_activo", rol); } catch (e) {}
    return true;
  }

  function obtener(permitidos) {
    var lista = filtrarRoles(permitidos);
    var guardado = leerGuardado();
    if (guardado && lista.indexOf(guardado) !== -1) return guardado;
    if (lista.length === 1) {
      fijar(lista[0], lista);
      return lista[0];
    }
    return "";
  }

  function paginaPermitida(rol, pagina) {
    var lista = PAGINAS[rol] || [];
    return lista.indexOf(pagina) !== -1;
  }

  function grupoDeRol(rol) {
    if (rol === "admin") return "admin";
    if (rol === "coordinador") return "coordinador";
    if (rol === "secretaria") return "secretaria";
    if (rol === "profesor") return "profesor";
    if (rol === "estudiante") return "familia";
    if (rol === "padre") return "padre";
    return "";
  }

  function paginaActual() {
    return (location.pathname || "").split("/").pop() || "index.html";
  }

  function redirigir(destino) {
    if (typeof location.replace === "function") location.replace(destino);
    else location.href = destino;
  }

  /*
   * Devuelve los datos visuales del rol activo, o null si ya redirigió.
   * - Sin elección válida y con varios roles: vuelve a index.html para elegir.
   * - Página que no es del rol activo: vuelve al inicio de ese rol.
   */
  function preparar(ctxORoles, pagina, perfil) {
    var roles, perf;
    if (ctxORoles && ctxORoles.roles) {
      roles = ctxORoles.roles;
      perf = ctxORoles.perfil;
    } else {
      roles = ctxORoles;
      perf = perfil;
    }
    var permitidos = filtrarRoles(roles);
    var rol = obtener(permitidos);
    if (!rol) {
      if (permitidos.length > 1) {
        redirigir("index.html");
        return null;
      }
      if (!permitidos.length) {
        redirigir("index.html");
        return null;
      }
      rol = permitidos[0];
      fijar(rol, permitidos);
    }
    var pag = pagina || paginaActual();
    if (!paginaPermitida(rol, pag)) {
      redirigir(RUTAS[rol] || "index.html");
      return null;
    }
    var nombre = "";
    if (perf) nombre = ((perf.nombre || "") + " " + (perf.apellido || "")).trim();
    var visual = {
      rol: rol,
      grupo: grupoDeRol(rol),
      nombre: nombre,
      etiqueta: NOMBRES[rol] || rol,
      roles: permitidos
    };
    /* v4: el marco (menú y botones para cambiar de rol) se pinta aquí mismo, para
       que aparezca en TODAS las páginas aunque luego la página no encuentre datos. */
    if (window.Diseno && typeof Diseno.ofrecerRoles === "function") {
      try {
        if (typeof Diseno.aplicarGrupo === "function") Diseno.aplicarGrupo(visual.grupo);
        Diseno.ofrecerRoles(visual.roles, visual.rol);
        if (typeof Diseno.identificar === "function") Diseno.identificar(visual.nombre, visual.etiqueta, visual.rol);
      } catch (e) {}
    }
    return visual;
  }

  function aplicarDiseno(visual, uid) {
    if (!window.Diseno || !visual) return;
    if (typeof Diseno.identificar === "function") {
      Diseno.identificar(visual.nombre, visual.etiqueta, visual.rol, uid);
    }
    if (typeof Diseno.aplicarGrupo === "function" && visual.grupo) {
      Diseno.aplicarGrupo(visual.grupo);
    }
    if (typeof Diseno.ofrecerRoles === "function") {
      Diseno.ofrecerRoles(visual.roles, visual.rol);
    }
    /* v4: avisos y entregas nuevas (solo lectura). Alumno y familia solo revisan la tabla opcional de leídos. */
    if (typeof Diseno.cargarNovedades === "function") {
      try { Diseno.cargarNovedades(visual.rol); } catch (e) {}
    }
  }

  function irAlInicio(rol, permitidos) {
    if (!fijar(rol, permitidos)) return false;
    location.href = RUTAS[rol];
    return true;
  }

  /* Página que no corresponde: lleva al inicio del rol activo de la sesión.
     Devuelve true si redirigió. Con varios roles sin elegir, a index.html para elegir. */
  function alInicio(roles) {
    var permitidos = filtrarRoles(roles);
    if (!permitidos.length) return false;
    var rol = obtener(permitidos);
    redirigir(rol ? RUTAS[rol] : "index.html");
    return true;
  }

  var api = {
    alInicio: alInicio,
    filtrarRoles: filtrarRoles,
    leerGuardado: leerGuardado,
    fijar: fijar,
    obtener: obtener,
    grupoDeRol: grupoDeRol,
    paginaPermitida: paginaPermitida,
    paginas: function () { return PAGINAS; },
    preparar: preparar,
    aplicarDiseno: aplicarDiseno,
    irAlInicio: irAlInicio,
    nombres: nombres,
    rutas: rutas
  };

  window.RolActivo = api;
  if (window.App) {
    App.obtenerRolActivo = obtener;
    App.fijarRolActivo = fijar;
    App.grupoDeRol = grupoDeRol;
    App.prepararSesionVisual = preparar;
    App.aplicarIdentidadDiseno = aplicarDiseno;
    App.irAlInicioDeRol = irAlInicio;
  }
})();
