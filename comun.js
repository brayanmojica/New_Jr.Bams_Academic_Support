/*
 * comun.js - Código compartido por todas las páginas.
 * Cárgalo DESPUÉS de supabase-js y ANTES del script de cada página:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="comun.js"></script>
 *
 * Uso en una página:
 *   const ctx = await App.exigirRol(['secretaria','admin']);   // null = ya redirigió
 *   App.cliente  -> cliente de Supabase (único)
 *   ctx.perfil   -> {nombre, apellido, rol}   (rol principal)
 *   ctx.roles    -> ['profesor','secretaria']  (principal + adicionales)
 */
(function () {
  "use strict";

  var URL_SB = "https://twhdnaiwxpilrevngxkk.supabase.co";
  var KEY_SB = "sb_publishable_lEIcvZOVtVD9HIK8HFwRtg_ik68D5Ad";
  var cliente = window.supabase.createClient(URL_SB, KEY_SB);

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
  var ORDEN = ["admin", "coordinador", "secretaria", "profesor", "estudiante", "padre"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Muestra un mensaje en el elemento con ese id (color opcional)
  function estado(id, msg, color) {
    var e = document.getElementById(id);
    if (!e) return;
    e.style.color = color || "#334155";
    if (!e.hasAttribute("aria-live")) e.setAttribute("aria-live", "polite");
    if (!e.hasAttribute("role")) e.setAttribute("role", "status");
    e.textContent = msg || "";
  }

  function hoy() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  // Trae todas las filas aunque pasen de 1000 (límite de Supabase por consulta)
  async function traerTodo(construir) {
    var todo = [], desde = 0, paso = 1000;
    while (true) {
      var r = await construir().range(desde, desde + paso - 1);
      if (r.error) throw r.error;
      todo = todo.concat(r.data || []);
      if (!r.data || r.data.length < paso) break;
      desde += paso;
    }
    return todo;
  }

  // Sesión + perfil + roles (principal y adicionales). Devuelve null si no hay sesión.
  async function cargarPerfil() {
    var s = await cliente.auth.getSession();
    var session = s.data && s.data.session;
    if (!session) return null;

    var p = await cliente.from("perfiles").select("nombre, apellido, rol, cambiar_clave")
      .eq("id", session.user.id).single();
    if (p.error || !p.data) return { session: session, uid: session.user.id, perfil: null, roles: [] };

    var roles = [p.data.rol];
    // Si la tabla de roles adicionales no existe todavía, se ignora sin romper nada
    var extra = await cliente.from("roles_adicionales").select("rol").eq("perfil_id", session.user.id);
    if (!extra.error && extra.data) {
      extra.data.forEach(function (x) { if (roles.indexOf(x.rol) === -1) roles.push(x.rol); });
    }
    roles.sort(function (a, b) { return ORDEN.indexOf(a) - ORDEN.indexOf(b); });
    return { session: session, uid: session.user.id, perfil: p.data, roles: roles };
  }

  // Deja pasar solo a quien tenga alguno de los roles. Si no, lo manda al inicio.
  async function exigirRol(permitidos) {
    var ctx = await cargarPerfil();
    if (!ctx || !ctx.perfil) { location.href = "index.html"; return null; }
    if (ctx.perfil.cambiar_clave && location.pathname.indexOf("cambiar_clave") === -1) {
      location.href = "cambiar_clave.html";   // primer ingreso: debe crear su propia contraseña
      return null;
    }
    var ok = ctx.roles.some(function (r) { return permitidos.indexOf(r) !== -1; });
    if (!ok) {
      /* v3: sin alerta; al inicio del rol activo (o a elegir rol si hay varios). */
      if (window.RolActivo && RolActivo.alInicio(ctx.roles)) return null;
      location.href = "index.html";
      return null;
    }
    return ctx;
  }

  async function salir() {
    try { sessionStorage.removeItem("rol_activo"); } catch (e) {}
    await cliente.auth.signOut();
    location.href = "index.html";
  }

  window.App = {
    cliente: cliente,
    URL_SB: URL_SB,
    RUTAS: RUTAS,
    NOMBRES: NOMBRES,
    esc: esc,
    estado: estado,
    hoy: hoy,
    traerTodo: traerTodo,
    cargarPerfil: cargarPerfil,
    exigirRol: exigirRol,
    salir: salir
  };
})();
