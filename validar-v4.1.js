/* Pruebas automáticas locales de la v4.1 (v4 + tema Clásico/Académico, «Cerrar sesión»
   junto al menú y créditos sin franja). No se conectan a Supabase ni escriben datos.
   Uso: node validar-v4.1.js   (Node 18 o superior; sin dependencias)
   Las pruebas en el navegador (capturas, axe, contraste) están en pruebas-navegador/. */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const os = require("os");
const { execFileSync } = require("child_process");

const root = __dirname;
let fallos = 0, total = 0;
function ok(cond, msg) {
  total++;
  if (cond) console.log("  OK  " + msg);
  else { console.log("  FALLO  " + msg); fallos++; }
}
const leer = (n) => fs.readFileSync(path.join(root, n), "utf8");
const paginas = fs.readdirSync(root).filter((f) => f.endsWith(".html")).sort();

function extraerScripts(html) {
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) if (!/\bsrc\s*=/i.test(m[1] || "")) out.push(m[2]);
  return out;
}
function sinScripts(html) { return html.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, ""); }
function sintaxis(archivo) {
  try { execFileSync(process.execPath, ["--check", archivo], { stdio: "pipe" }); return ""; }
  catch (e) { return ((e.stderr && e.stderr.toString()) || e.message).split("\n").slice(0, 4).join(" "); }
}

console.log("1) Sintaxis de los .js");
fs.readdirSync(root).filter((f) => f.endsWith(".js")).forEach((f) => {
  const err = sintaxis(path.join(root, f));
  ok(!err, f + (err ? " :: " + err : ""));
});

console.log("2) Sintaxis de los scripts dentro de cada HTML");
paginas.forEach((f) => {
  extraerScripts(leer(f)).forEach((src, i) => {
    const tmp = path.join(os.tmpdir(), "v4-" + f + "-" + i + ".js");
    fs.writeFileSync(tmp, src);
    const err = sintaxis(tmp);
    ok(!err, f + " script " + (i + 1) + (err ? " :: " + err : ""));
  });
});

console.log("3) Rol activo: cada página respeta el rol con el que entraste");
function contexto(pagina) {
  const almacen = {};
  const ctx = {
    location: { href: pagina, pathname: "/" + pagina, redirigidoA: null, replace(u) { this.redirigidoA = u; } },
    sessionStorage: {
      getItem: (k) => (Object.prototype.hasOwnProperty.call(almacen, k) ? almacen[k] : null),
      setItem: (k, v) => { almacen[k] = String(v); },
      removeItem: (k) => { delete almacen[k]; }
    }
  };
  ctx.window = ctx;
  vm.runInNewContext(leer("rol-activo.js"), ctx);
  return ctx;
}
const PERFIL = { nombre: "Prueba", apellido: "Local" };
function abrir(pagina, roles, activo) {
  const c = contexto(pagina);
  if (activo) c.sessionStorage.setItem("rol_activo", activo);
  const v = c.RolActivo.preparar({ perfil: PERFIL, roles }, pagina);
  return { v, a: c.location.redirigidoA, c };
}
const MATRIZ = {
  admin: ["admin.html", "admin_personal.html", "admin_modulos.html", "admin_horario.html", "admin_permisos.html", "avisos.html", "mis_datos.html"],
  coordinador: ["admin.html", "admin_personal.html", "admin_modulos.html", "admin_horario.html", "admin_permisos.html", "mis_datos.html"],
  secretaria: ["asistencia_secretaria.html", "secretaria.html", "directorio_docentes.html", "mis_datos.html"],
  profesor: ["profesor.html", "aula_profesor.html", "asistencia_profesor.html", "reporte_alumno.html", "avisos.html", "mis_datos.html"],
  estudiante: ["familia.html", "aula_alumnos.html", "mis_datos.html"],
  padre: ["familia.html", "aula_alumnos.html", "mis_datos.html"]
};
const INICIO = { admin: "admin.html", coordinador: "admin.html", secretaria: "asistencia_secretaria.html", profesor: "profesor.html", estudiante: "familia.html", padre: "familia.html" };
const todas = Object.keys(MATRIZ).reduce((a, k) => a.concat(MATRIZ[k]), []).filter((x, i, a) => a.indexOf(x) === i);
let matrizBien = true;
Object.keys(MATRIZ).forEach((rol) => {
  todas.forEach((pag) => {
    // cuenta con TODOS los roles, pero entró con este: solo valen las páginas de este rol
    const r = abrir(pag, Object.keys(MATRIZ), rol);
    const debe = MATRIZ[rol].indexOf(pag) !== -1;
    const bien = debe ? (r.v && r.v.rol === rol && !r.a) : (!r.v && r.a === INICIO[rol]);
    if (!bien) { matrizBien = false; console.log("    · " + rol + " en " + pag + " -> " + (r.v ? "abre" : "va a " + r.a)); }
  });
});
ok(matrizBien, "matriz completa rol activo × página (" + Object.keys(MATRIZ).length + " roles × " + todas.length + " páginas): solo se abre lo del rol activo; lo demás va a su inicio");
ok(abrir("admin.html", ["profesor", "admin"], "profesor").a === "profesor.html", "profesor con rol admin en la cuenta, entrando como profesor, no abre admin.html");
ok(abrir("profesor.html", ["profesor", "admin"], "").a === "index.html", "con varios roles y sin elegir, se vuelve a elegir rol");
ok(abrir("admin.html", ["estudiante"], "admin").a === "familia.html", "un rol_activo falsificado en el navegador no da acceso");
ok(abrir("familia.html", ["estudiante"], "").v.rol === "estudiante", "con un solo rol se usa ese");
ok(abrir("avisos.html", ["coordinador"], "coordinador").a === "admin.html", "coordinación no abre Avisos (sin permiso confirmado)");
ok(abrir("familia.html", ["padre"], "padre").v.grupo === "padre", "padre/tutor tiene su propio menú");
ok(abrir("admin.html", ["coordinador"], "coordinador").v.grupo === "coordinador", "coordinación tiene su propio menú");
{
  const c = contexto("avisos.html");
  c.sessionStorage.setItem("rol_activo", "coordinador");
  ok(c.RolActivo.alInicio(["coordinador"]) === true && c.location.redirigidoA === "admin.html", "alInicio lleva al inicio del rol activo sin alerta");
}
ok(abrir("x.html", ["hacker"], "hacker").a === "index.html", "roles desconocidos se descartan");

console.log("4) Guardias en cada página");
["admin.html", "admin_horario.html", "admin_modulos.html", "admin_permisos.html", "avisos.html", "aula_profesor.html", "asistencia_profesor.html", "familia.html", "profesor.html", "reporte_alumno.html"].forEach((f) => {
  const h = leer(f);
  ok(/RolActivo\.preparar\(/.test(h) && /if \(!visual\) return|if \(window\.RolActivo && !visual\) return/.test(h), f + " corta la carga si la página no es del rol activo");
  ok(h.includes("RolActivo.alInicio(_roles)"), f + " sin alerta: vuelve al inicio del rol activo");
});
["secretaria.html", "directorio_docentes.html", "asistencia_secretaria.html", "admin_personal.html", "mis_datos.html"].forEach((f) => {
  const h = leer(f);
  ok(/RolActivo\.preparar\(ctx/.test(h) && /if \((window\.RolActivo && )?!visual\) return/.test(h), f + " valida el rol activo tras exigirRol");
});
ok(leer("comun.js").includes("RolActivo.alInicio(ctx.roles)"), "comun.js exigirRol devuelve al inicio del rol activo");
ok(leer("admin_personal.html").includes("rolActivoActual() === 'admin'"), "Personal y roles decide admin/coordinación por el rol activo");
ok(leer("secretaria.html").includes("esAdmin = visual.rol === 'admin'"), "Secretaría no usa «cualquier rol admin de la cuenta»");
ok(leer("mis_datos.html").includes("rolAct = (visual && visual.rol)") && leer("mis_datos.html").includes("esDoc = !est && rolAct === 'profesor'"), "Mis datos decide docente por el rol activo");

console.log("5) Menús y navegación");
const diseno = leer("diseno.js");
function menu(grupo) {
  const i = diseno.indexOf("    " + grupo + ": ");
  const j = diseno.indexOf("\n    ],", i);
  return diseno.slice(i, j);
}
ok(/coordinador: MENU_ADMIN_BASE\.concat\(\[MIS_DATOS, SALIR\]\)/.test(diseno) && !/avisos\.html/.test(diseno.slice(diseno.indexOf("MENU_ADMIN_BASE = ["), diseno.indexOf("var MENU = {"))), "coordinación sin Avisos en el menú");
ok(/avisos\.html/.test(diseno.slice(diseno.indexOf("admin: MENU_ADMIN_BASE"), diseno.indexOf("coordinador: MENU_ADMIN_BASE"))), "administración conserva Avisos");
const sec = menu("secretaria");
ok(sec.indexOf('label: "Asistencia"') < sec.indexOf('label: "Alumnos"') && sec.indexOf('label: "Alumnos"') < sec.indexOf("Solicitudes y documentos") && sec.indexOf("Solicitudes y documentos") < sec.indexOf('label: "Docentes"'), "Secretaría: Asistencia → Alumnos → Solicitudes y documentos → Docentes → Directorio");
ok(!/label: "Avisos"/.test(sec), "Secretaría ya no dice «Avisos»");
ok(leer("comun.js").includes('secretaria: "asistencia_secretaria.html"') && leer("rol-activo.js").includes('secretaria: "asistencia_secretaria.html"'), "Secretaría abre en Asistencia");
const fam = menu("familia");
ok(!/seccion: "tareas"/.test(fam) && !/aula_alumnos/.test(fam), "alumno: sin «Tareas» suelto ni «Mi Aula» en el menú");
{
  const etiquetas = (fam.match(/label: "([^"]+)"/g) || []).map((x) => x.slice(8, -1));
  ok(JSON.stringify(etiquetas) === JSON.stringify(["Inicio", "Materias", "Calendario", "Calificaciones"]) && /MIS_DATOS,\s*SALIR/.test(fam), "alumno: menú exacto Inicio, Materias, Calendario, Calificaciones, Mis datos y Cerrar sesión");
  ok(/horario: "calendario", asistencia: "notas", avisos: "inicio"/.test(diseno), "Horario va en Calendario, Asistencia en Calificaciones y Avisos en Inicio (enlaces viejos siguen)");
}
ok(/padre: \[/.test(diseno) && /Resumen de mi hijo\(a\)/.test(diseno), "padre/tutor: menú propio centrado en su hijo(a)");
ok(/seccion: "inicio", label: "Inicio"/.test(menu("profesor")) && /seccion: "calificaciones"/.test(menu("profesor")), "profesor: Inicio y Calificaciones sin recargar");
ok(/rel = "prefetch"/.test(diseno) && leer("diseno.css").includes("@view-transition"), "precarga y transición entre páginas (marco persistente)");
ok(/diseno_barra_ampliada/.test(diseno), "la barra recuerda si estaba abierta");
ok(leer("aula_alumnos.html").includes("location.replace('familia.html#"), "aula_alumnos.html redirige (enlaces viejos no se rompen)");

console.log("6) Accesibilidad (comprobaciones estáticas)");
ok(diseno.includes("Saltar al contenido"), "enlace «Saltar al contenido»");
ok(diseno.includes('setAttribute("aria-current", "page")'), "aria-current en el menú activo");
ok(diseno.includes('"aria-pressed"') && diseno.includes('role="group" aria-label="Cambiar de rol"'), "conmutador de rol con aria-pressed y grupo con nombre");
ok(diseno.includes('titulo = document.createElement("h1")'), "cada pantalla tiene un h1 con el apartado");
ok(diseno.includes('aria-expanded') && diseno.includes('aria-controls="diseno-barra"'), "botón del menú con aria-expanded/aria-controls");
ok(diseno.includes('"aria-live", "polite"'), "mensajes de estado en regiones vivas");
ok(diseno.includes('scope", th.colSpan > 1 ? "colgroup" : "col"'), "cabeceras de tabla con scope");
const css = leer("diseno.css");
ok(css.includes(":focus-visible") && css.includes("outline: 3px solid"), "foco visible");
ok(css.includes("prefers-reduced-motion"), "respeta movimiento reducido");
ok(/min-height: 44px/.test(css), "objetivos táctiles de 44 px en móvil");
const prof = leer("profesor.html");
ok(prof.includes('id="capTabla"') && prof.includes("n.scope = 'row'") && prof.includes("rotuloNota("), "tabla de notas: caption, alumno como cabecera de fila y etiqueta por alumno y competencia");
ok(prof.includes('aria-controls="panelNotas"') && prof.includes("ArrowRight"), "pestañas de notas con flechas y aria-controls");
let sinEtiqueta = [], sinAlt = [], botonesMudos = [], sinLang = [];
paginas.forEach((f) => {
  const html = leer(f);
  if (!/<html lang="es"/.test(html)) sinLang.push(f);
  const h = sinScripts(html);
  const re = /<(input|select|textarea)\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(h))) {
    const attrs = m[2];
    if (/type="hidden"/.test(attrs)) continue;
    if (/aria-label(ledby)?=/.test(attrs)) continue;
    const id = (attrs.match(/\bid="([^"]+)"/) || [])[1];
    if (id && new RegExp('<label[^>]*for="' + id + '"').test(h)) continue;
    const antes = h.slice(0, m.index);
    if (antes.lastIndexOf("<label") > antes.lastIndexOf("</label>")) continue;
    sinEtiqueta.push(f + ": " + m[0].slice(0, 70));
  }
  const reImg = /<img\b([^>]*)>/gi;
  while ((m = reImg.exec(h))) if (!/\balt=/.test(m[1])) sinAlt.push(f);
  const reBtn = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  while ((m = reBtn.exec(h))) {
    const texto = m[2].replace(/<[^>]+>/g, "").replace(/[\s✕×]/g, "");
    if (!texto && !/aria-label=/.test(m[1])) botonesMudos.push(f + ": " + m[0].slice(0, 60));
  }
});
ok(!sinLang.length, "todas las páginas con lang=\"es\"" + (sinLang.length ? " :: " + sinLang.join(", ") : ""));
ok(!sinEtiqueta.length, "todos los campos del HTML tienen etiqueta" + (sinEtiqueta.length ? " :: " + sinEtiqueta.join(" | ") : ""));
ok(!sinAlt.length, "todas las imágenes del HTML tienen alt");
ok(!botonesMudos.length, "ningún botón sin nombre" + (botonesMudos.length ? " :: " + botonesMudos.join(" | ") : ""));
ok(diseno.includes("function repararAccesibilidad") && diseno.includes("rotuloDeCelda"), "lo que se dibuja después (tablas, campos) se etiqueta al vuelo");

console.log("7) Alumno, familia, Secretaría, profesor y lo que se conserva");
const famH = leer("familia.html");
ok(famH.includes("from('entregas').upsert(") && famH.includes("onConflict: 'tarea_id,estudiante_id'"), "entregar dentro de la materia usa la misma operación de antes");
ok(famH.includes("from('comentarios_tarea').insert("), "comentarios dentro de la materia");
ok(!famH.includes('id="cajaTareas"') && !famH.includes("Ir a Mi Aula"), "ya no hay bloque de Tareas suelto");
ok(/if \(esPadre\(\) \|\| !permisos\.entregar_tareas\) return;/.test(famH) && /if \(!esPadre\(\)\) \{\s*if \(!cerrada && permisos\.entregar_tareas\)/.test(famH), "padre/tutor: sin botones de entregar (y la función lo rechaza)");
ok(famH.includes("Información de tu hijo(a)") && famH.includes("diseno-nota-familia"), "padre/tutor: se aclara que es la información del hijo(a)");
ok(famH.includes("avisos son del curso o del liceo"), "el detalle aclara el alcance de los avisos");
const secH = leer("secretaria.html");
ok(secH.includes(">Solicitudes y documentos <span") && secH.includes("Diseno.contador('solicitudes'"), "Secretaría: «Solicitudes y documentos» (y contador en el menú)");
ok(prof.includes('id="cajaInicioProfesor"') && prof.includes("async function cargarInicio") && !/\.(insert|update|upsert|delete)\(/.test(prof.slice(prof.indexOf("async function cargarInicio"), prof.indexOf("// ================= CARGAR DATOS DE LA MATERIA"))), "Inicio del profesor solo lee datos");
const rep = leer("reporte_alumno.html");
ok(!rep.includes("avisoDisenoPendiente") && rep.includes("function descargarPDF") && rep.includes("reporte-cabecera"), "reporte con diseño nuevo y el mismo PDF");
const aula = leer("aula_profesor.html");
ok(aula.includes("No se han asignado tareas"), "texto vacío exacto de tareas");
ok(["#111827", "#dc2626", "#1d4ed8", "#15803d"].every((c) => aula.includes('data-color="' + c + '"')), "editor con negro, rojo, azul y verde");
ok(aula.includes("cargarTodasLasTareas") && aula.includes("cargarAlumnosDeCurso"), "tareas agrupadas por materia y alumnos del curso de la tarea");
ok(css.includes("--acento: #7c2d12") && css.includes("border-top: 3px solid #7c2d12") && css.includes("border-left: 4px solid #7c2d12") && leer("tema.js").includes('color_principal: "#7c2d12"'), "bordes institucionales ahora terracota (v4)");
ok(diseno.includes("escudoSvg"), "marca del liceo");
ok(prof.includes("descargarBoletinPDF") && prof.includes("descargarBoletinExcel"), "boletines PDF y Excel siguen");
ok(!paginas.some((f) => /descarga-listados|exportarListado/i.test(leer(f))), "no se incluyó la descarga de listados (va aparte)");
ok(leer("comun.js").includes("twhdnaiwxpilrevngxkk.supabase.co"), "se conserva la conexión real (no se probaron escrituras)");

console.log("8) Rico: solo cuatro colores");
const ricoCtx = { console };
ricoCtx.window = ricoCtx;
vm.runInNewContext(leer("rico.js"), ricoCtx);
const N = ricoCtx.Rico.normalizarColor;
ok(N("#111827") === "#111827" && N("#dc2626") === "#dc2626" && N("#1d4ed8") === "#1d4ed8" && N("#15803d") === "#15803d", "los cuatro colores se aceptan");
ok(N("#1e3a8a") === "" && N("purple") === "" && N("#00ff00") === "", "otros colores se rechazan");

console.log("9) SQL manual (no se ejecuta aquí)");
const mig = fs.readFileSync(path.join(root, "sql", "02-migracion-avisos-profesor.sql"), "utf8").split("\n").filter((l) => !/^\s*--/.test(l)).join("\n");
ok(!/a\.curso_id = curso_id/.test(mig) && /a\.curso_id = avisos\.curso_id/.test(mig), "migración corregida: compara con avisos.curso_id (la v2 comparaba la columna consigo misma)");
ok(/roles_adicionales/.test(mig), "la migración reconoce admin como rol adicional");
ok(!/^\s*(insert|update|delete|alter|create|drop)\b/im.test(fs.readFileSync(path.join(root, "sql", "01-preflight-solo-lectura.sql"), "utf8")), "el preflight es solo de lectura");
ok(!/^\s*(insert|update|delete|alter|create|drop)\b/im.test(fs.readFileSync(path.join(root, "sql", "03-verificacion-manual.sql"), "utf8")), "la verificación es solo de lectura");

console.log("10) Novedades de la v4");
const v3dir = path.join(root, "..", "plataforma-nuevo-diseno-v3");
function funcion(texto, nombre) {
  const i = texto.indexOf("function " + nombre + "(");
  if (i < 0) return "";
  let n = 0, j = texto.indexOf("{", i);
  for (let k = j; k < texto.length; k++) { if (texto[k] === "{") n++; else if (texto[k] === "}") { n--; if (!n) return texto.slice(i, k + 1); } }
  return "";
}
if (fs.existsSync(path.join(v3dir, "familia.html"))) {
  ok(funcion(famH, "avisarPendientes") === funcion(fs.readFileSync(path.join(v3dir, "familia.html"), "utf8"), "avisarPendientes"), "el aviso de tareas de 10 segundos está igual que en la v3");
} else ok(famH.includes("setTimeout(() => aviso.remove(), 10000)"), "el aviso de tareas de 10 segundos se conserva");
ok(famH.includes("No se han asignado tareas") && aula.includes("No se han asignado tareas"), "texto vacío exacto «No se han asignado tareas»");
ok(!paginas.some((f) => /Archivo elegido|Se guarda solo en este navegador/.test(leer(f))) && !/Archivo elegido|Se guarda solo en este navegador/.test(diseno), "sin «Archivo elegido…» ni «Se guarda solo en este navegador»");
{
  const numerados = [];
  paginas.forEach((f) => {
    const h = leer(f);
    const re = /<h[1-4][^>]*>\s*\d+\.\s/gi; let m;
    while ((m = re.exec(h))) numerados.push(f + ": " + m[0]);
    const re2 = /(subtitulo\(|<h3>)'?\d+\.\s/g;
    while ((m = re2.exec(h))) numerados.push(f + ": " + m[0]);
  });
  ok(!numerados.length, "títulos sin numeración" + (numerados.length ? " :: " + numerados.join(" | ") : ""));
}
{
  const B = ["Bloque 1: Comunicativa", "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas", "Científica y Tecnológica; Ambiental y de la Salud", "Ética y Ciudadana; Desarrollo Personal y Espiritual"];
  ["familia.html", "reporte_alumno.html"].forEach((f) => ok(B.every((b) => leer(f).includes(b)), f + ": nombres de los 4 bloques"));
  ok(B.slice(1).every((b) => prof.includes(b)) && prof.includes("'Bloque ' + c + ': '"), "profesor.html: bloques en tablas, PDF y Excel");
  ok(leer("admin.html").includes("'Bloque 1', 'Bloque 2', 'Bloque 3', 'Bloque 4'") && leer("admin.html").includes("LEYENDA_BLOQUES"), "admin.html: boletín PDF/Excel con bloques y leyenda");
  ok(!paginas.some((f) => /'PC1'|>PC1</.test(leer(f))), "ya no aparece PC1…PC4 en tablas ni boletines");
}
const tema = leer("tema.js");
ok(tema.includes('th[scope=row]{background:" + (t.tema === "clasico" ? "#f8fafc" : "#fffaf3")') && tema.includes('color:" + (t.tema === "clasico" ? "#0f172a" : "#1c1917")') && tema.includes("th:not([scope=row])"), "tema: las cabeceras de fila (bloques, alumnos) siempre claras con texto oscuro");
ok(/table th\[scope="row"\][\s\S]{0,40}background: #fffaf3 !important/.test(css), "diseno.css refuerza el contraste de las cabeceras de fila");
ok(diseno.includes('ORDEN_FIJO = ["admin", "coordinador", "profesor", "secretaria", "estudiante", "padre"]'), "botones de rol en orden fijo");
ok(leer("rol-activo.js").includes("Diseno.ofrecerRoles(visual.roles, visual.rol)") && aula.indexOf("RolActivo.preparar(") < aula.indexOf("from('asignaturas')"), "Aula: los botones de rol aparecen antes de buscar materias");
ok(/#diseno-barra \{\s*position: sticky;/.test(css) && /\.diseno-header \{\s*position: sticky;/.test(css), "barra lateral y cabecera fijas al bajar");
ok(diseno.includes('else actualizarMenu(pref === "1");') && diseno.includes('leerBarraPref() === "1"'), "barra contraída (solo íconos) por defecto; el botón la amplía");
ok(css.includes("@keyframes diseno-campana-latido") && /prefers-reduced-motion: reduce\)[\s\S]{0,200}animation: none !important/.test(css), "campana roja con animación y solo color con movimiento reducido");
ok(diseno.includes("setTimeout(function () { estado.animar[tipo] = false;") && diseno.includes(", 5000)"), "la animación dura 5 segundos");
{
  const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const pal = JSON.parse(diseno.match(/COLORES_MATERIA = (\[[^\]]+\])/)[1]);
  const malos = pal.filter((c) => ratio(c, "#ffffff") < 4.5 || ratio(c, "#fffaf3") < 4.5);
  const rojos = pal.filter((c) => { const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16); return r > 150 && g < 60 && b < 60; });
  ok(pal.length >= 10 && !malos.length && !rojos.length, "colores de materias: " + pal.length + ", sin rojo y con contraste AA" + (malos.length ? " :: " + malos.join(",") : ""));
}
ok(diseno.includes('aria-haspopup", "menu"') && diseno.includes("Cambiar imagen") && diseno.includes("Quitar imagen") && diseno.includes('"Escape"'), "paleta de portada con menú accesible por teclado");
ok(famH.includes("Diseno.montarPortada(c, m.nombre, colorDeMateria(m.id), !esPadre())"), "padre/tutor no puede cambiar portadas");
ok(famH.includes("franja-pendiente") && famH.includes("'Tarea pendiente'") && famH.includes("' tareas pendientes'"), "franja roja «Tarea pendiente» / «N tareas pendientes»");
ok(famH.includes("function pintarCalendario") && famH.includes("irATarea(") && famH.includes('aria-pressed="'), "calendario mensual con días como botones y abrir la tarea en su materia");
ok(leer("avisos.html").includes('role="toolbar"') && leer("avisos.html").includes("Rico.renderTexto") && famH.includes("Rico.renderTexto"), "avisos con la barra de formato y mostrados limpios");
ok(leer("rico.js").includes("function renderTexto") && /ETIQUETAS\.filter\(function \(x\) \{ return x !== "img"; \}\)/.test(leer("rico.js")), "Rico.renderTexto limpia el HTML y no permite imágenes en avisos");
ok(/FUENTES = \{[\s\S]*sistema:[\s\S]*atkinson:[\s\S]*lexend:[\s\S]*nunito:/.test(tema) && tema.includes('if (f.google && !document.getElementById("fuente-google-" + clave))'), "letra: lista de letras legibles; Google Fonts solo si se elige");
ok(leer("admin_modulos.html").includes("{ clave: 'fuente', valor: k }"), "la letra se guarda en config_tema (clave fuente)");
const md = leer("mis_datos.html");
ok(md.includes("SUBEN_DIRECTO = ['admin', 'secretaria', 'profesor']") && md.includes("Solicitud enviada, espera la respuesta de secretaría.") && md.includes("btn-pedir-permiso") && md.includes("flags.v4_permisos_subida"), "Mis documentos: pedir permiso, estado y modo sin SQL");
ok(secH.includes("resolver_permiso_subida") && secH.includes("Permisos para subir documentos"), "Secretaría aprueba o rechaza permisos");
const idx = leer("index.html");
ok(idx.includes("signInWithPassword") && idx.includes("location.href = 'cambiar_clave.html'") && idx.includes("DOMINIO_ALUMNOS") && idx.includes("aria-invalid") && !/muestra del diseño/i.test(idx), "login nuevo con la lógica real (roles, primer ingreso, errores)");
ok(leer("cambiar_clave.html").includes("marcar_clave_cambiada") && leer("cambiar_clave.html").includes("acceso.css"), "cambiar contraseña con el mismo diseño y la lógica real");
["04a-preflight-documentos-solo-lectura.sql", "05a-preflight-avisos-leidos-solo-lectura.sql", "06a-preflight-letra-solo-lectura.sql", "04c-verificacion-permisos-subida.sql", "05c-verificacion-avisos-leidos.sql"].forEach((f) => {
  const t = fs.readFileSync(path.join(root, "sql", f), "utf8").split("\n").filter((l) => !/^\s*--/.test(l)).join("\n");
  ok(!/\b(insert|update|delete|alter|create|drop|grant|revoke)\b\s/i.test(t), "sql/" + f + " es solo de lectura");
});
{
  const m4 = fs.readFileSync(path.join(root, "sql", "04b-migracion-permisos-subida.sql"), "utf8");
  ok(/enable row level security/.test(m4) && (m4.match(/security definer/g) || []).length === 5 && (m4.match(/set search_path = public/g) || []).length === 5 && /^begin;/m.test(m4) && /^commit;/m.test(m4), "sql/04b: RLS, funciones seguras y en una transacción");
}


console.log("11) Novedades de la v4.1 (tema, Cerrar sesión, créditos)");
{
  const paginasHtml = fs.readdirSync(root).filter((f) => f.endsWith(".html"));
  const malas = paginasHtml.filter((f) => {
    const h = leer(f); const head = h.slice(0, h.search(/<\/head>/i));
    const i = head.indexOf('<script src="tema-inicial.js"></script>');
    const primero = head.search(/<link rel="stylesheet"|<script|<style/);
    return i === -1 || i !== primero;
  });
  ok(malas.length === 0, "tema-inicial.js va primero en el <head> de las " + paginasHtml.length + " páginas (sin parpadeo)" + (malas.length ? ": falta en " + malas.join(", ") : ""));
  // tema-inicial.js: simulación
  const ti = leer("tema-inicial.js");
  const probar = (guardado) => {
    const attrs = {}; const head = { children: [], appendChild(e) { this.children.push(e); } };
    const ls = { tema_plataforma: guardado, tema_css: ":root{--acento:#1e3a8a}" };
    const sandbox = { localStorage: { getItem: (k) => (k in ls ? ls[k] : null) }, document: { documentElement: { setAttribute: (k, v) => { attrs[k] = v; } }, head, getElementById: () => null, createElement: () => ({}) } };
    vm.runInNewContext(ti, sandbox);
    return { tema: attrs["data-tema"], estilos: head.children.length };
  };
  const a = probar("clasico"), b = probar(null), c = probar("<script>");
  ok(a.tema === "clasico" && a.estilos === 1 && b.tema === "academico" && c.tema === "academico", "tema-inicial.js: usa el tema guardado; si no hay o es raro, Académico");
  ok(tema.includes('clasico: {') && tema.includes('academico: {') && tema.includes('document.documentElement.setAttribute("data-tema", t.tema)') && tema.includes('localStorage.setItem("tema_plataforma", t.tema)') && tema.includes('localStorage.setItem("tema_css", css)') && tema.includes('if (!temaValido(tema.tema)) tema.tema = "academico"'), "tema.js: dos temas, se guarda en el navegador y Académico por defecto");
  ok(/DEFECTOS\s*=\s*\{[\s\S]*clasico:\s*\{\s*color_principal: "#1e3a8a"/.test(tema), "tema.js: Clásico con los colores de la v3");
  const cssT = leer("diseno.css");
  const comps = [".franja-pendiente", ".cal-dia", ".diseno-paleta", ".diseno-menu-portada", ".diseno-rol-btn", ".diseno-campana.es-animar", ".tarjeta-materia.v4", ".btn-pedir-permiso", "#diseno-barra"];
  const faltan = comps.filter((x) => !cssT.includes(':where(html[data-tema="clasico"]) ' + x));
  ok(faltan.length === 0, "diseno.css: el tema Clásico incluye todas las piezas de la v4" + (faltan.length ? " (faltan " + faltan.join(", ") + ")" : ""));
  ok(cssT.includes(':where(html:not([data-tema="clasico"])) .diseno-header') && cssT.includes('@media (prefers-reduced-motion: reduce) {\n  :where(html[data-tema="clasico"])'), "diseno.css: Académico y Clásico separados con data-tema; movimiento reducido en los dos");
  ok(!/diseno-lista li:last-child\s*\{[^}]*margin-top:\s*auto/.test(cssT), "«Cerrar sesión» ya no se empuja al fondo de la barra");
  ok(diseno.includes('(item.accion === "salir" ? " diseno-salir" : "")') && cssT.includes('#diseno-nav .diseno-salir'), "«Cerrar sesión» con estilo de salida en los dos temas");
  const menus = ["familia", "padre", "profesor", "admin", "coordinador", "secretaria"].filter((g) => { const m = diseno.match(new RegExp("\\n    " + g + ": [\\s\\S]*?\\n    \\]")) || diseno.match(new RegExp("\\n    " + g + ": MENU_ADMIN_BASE[^\\n]*\\n[\\s\\S]*?\\]\\)")); return !(m && /MIS_DATOS,\s*SALIR\s*\]/.test(m[0])); });
  ok(menus.length === 0, "«Cerrar sesión» es el último de cada menú, después de «Mis datos»" + (menus.length ? " (revisar " + menus.join(", ") + ")" : ""));
  ok(!/firma-creador\{position:fixed/.test(tema) && tema.includes('document.querySelector(".diseno-acciones-cab")') && tema.includes('document.querySelector(".escena .tarjeta")') && diseno.includes("window.colocarFirma()"), "créditos: sin franja fija; en la cabecera o dentro de la tarjeta de entrada");
  ok(cssT.includes(".firma-creador {\n  position: static !important;\n  background: none !important;\n  border: 0 !important;") && leer("acceso.css").includes(".tarjeta .firma-creador"), "créditos: solo texto (sin fondo ni borde)");
  const am = leer("admin_modulos.html");
  ok(am.includes('id="selTema"') && am.includes("upsert([{ clave: 'tema', valor: k }], { onConflict: 'clave' })") && am.includes("function vistaTema()") && am.includes("Volver al tema guardado") && am.includes("Vista previa"), "Configuración: «Tema de la plataforma» con vista previa, guardar y volver");
  const ix = leer("index.html"), ac = leer("acceso.css");
  ok(ix.includes('<div class="solo-clasico">') && ix.includes("<h1>Sistema Escolar</h1>") && ix.includes('class="solo-academico">Hola, te damos la bienvenida') && ac.includes(':where(html[data-tema="clasico"]) .tarjeta'), "la entrada sigue el tema (Clásico = aspecto v3, Académico = login 4)");
  ok(ix.includes("signInWithPassword") && ix.includes("DOMINIO_ALUMNOS") && ix.includes("cambiar_clave"), "la lógica real de inicio de sesión no cambió");
}
console.log("\nResultado: " + (total - fallos) + " de " + total + " comprobaciones correctas.");
if (fallos) { console.log(fallos + " fallo(s)."); process.exit(1); }
console.log("Todas las comprobaciones automáticas pasaron.");
