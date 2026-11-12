/*
 * listado-alumnos.js  (v4.1.1)
 * Módulo independiente para descargar el listado de alumnos que ya está
 * visible o cargado en una página de la plataforma.
 * Es el mismo módulo preparado para la plataforma original, con dos
 * añadidos para la v4.1.1: los avisos salen en pantalla (cuadro
 * #estadoListado, leído por lectores de pantalla) en vez de una ventana
 * emergente, y la ayuda textoCurso('curso') para leer el curso elegido.
 *
 * No consulta la base, no usa claves de servicio y no cambia permisos.
 * Solo exporta las columnas explícitas del listado (No., matrícula,
 * apellidos, nombres, curso).
 *
 * Uso típico, cuando ya tienes el arreglo de la página:
 *   DescargaListados.descargarAlumnos(alumnosCurso, { curso: '4to A' });
 */
(function (raiz) {
  "use strict";

  var ZONA_FECHA = "America/Santo_Domingo";

  /* Espacios y marcas invisibles que alguien podría poner delante de = + - @ */
  var RE_DELANTE = /^[\s\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF\u200B\u200C\u200D\u2060\u00AD]+/;

  /* = + - @, tabulador, controles, y variantes de ancho completo */
  var RE_PELIGRO = /^[=+\-@\t\r\n\v\f\x00-\x1F\uFF1D\uFF0B\uFF0D\uFF20\u2212\uFE63\uFF0D]/;

  var COLUMNAS = [
    { clave: "no", titulo: "No.", comoTexto: false },
    { clave: "matricula", titulo: "Matrícula", comoTexto: true },
    { clave: "apellidos", titulo: "Apellidos", comoTexto: true },
    { clave: "nombres", titulo: "Nombres", comoTexto: true },
    { clave: "curso", titulo: "Curso", comoTexto: true }
  ];

  function esVacio(v) {
    return v == null || String(v).trim() === "";
  }

  function texto(v) {
    if (v == null) return "";
    return String(v);
  }

  function inicioVisible(s) {
    return texto(s).replace(RE_DELANTE, "");
  }

  /*
   * Protección contra inyección de fórmulas en Excel/Calc.
   * Si, quitando espacios u otros caracteres invisibles del inicio, el valor
   * empezaría por = + - @, tabulador u otro control, se antepone un
   * apóstrofo. Así la celda queda como texto y no se usa una fórmula.
   *
   * Los ceros a la izquierda (matrícula, etc.) se conservan con el mismo
   * apóstrofo, NUNCA con una fórmula del tipo ="00123". En Excel el
   * apóstrofo inicial suele no verse; en otros programas puede verse.
   */
  function protegerCelda(valor, comoTexto) {
    var s = texto(valor);
    if (s === "") return s;
    var visible = inicioVisible(s);
    var peligro = RE_PELIGRO.test(s) || RE_PELIGRO.test(visible);
    var pareceNumero = /^-?\d/.test(visible) || /^0/.test(s) ||
      /^-?\d+[eE][+\-]?\d+/.test(visible.replace(/,/g, "."));
    if (peligro || (comoTexto && pareceNumero)) {
      if (s.charAt(0) !== "'") return "'" + s;
    }
    return s;
  }

  function celdaCsv(valor) {
    var s = texto(valor);
    if (/[",\r\n]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function armarCsv(filas, columnas) {
    columnas = columnas || COLUMNAS;
    var lineas = [];
    lineas.push(columnas.map(function (c) { return celdaCsv(c.titulo); }).join(","));
    (filas || []).forEach(function (fila) {
      lineas.push(columnas.map(function (c) {
        return celdaCsv(protegerCelda(fila[c.clave], c.comoTexto));
      }).join(","));
    });
    return lineas.join("\r\n");
  }

  function fechaLocal(fecha) {
    var d = fecha || new Date();
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: ZONA_FECHA,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(d);
    } catch (e) {
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, "0");
      var dia = String(d.getDate()).padStart(2, "0");
      return y + "-" + m + "-" + dia;
    }
  }

  function sanearNombre(s) {
    var t = texto(s).trim();
    try {
      t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    } catch (e) {}
    t = t.replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/[\x00-\x1F\x7F]/g, "")
      .replace(/[^A-Za-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[.-]+|[.-]+$/g, "");
    return t || "curso";
  }

  function nombreArchivo(curso, fecha) {
    var parteCurso = curso ? sanearNombre(curso) : "curso";
    return "listado-alumnos_" + parteCurso + "_" + fechaLocal(fecha) + ".csv";
  }

  function nombreCursoDeFila(a) {
    if (!a) return "";
    if (!esVacio(a.curso) && typeof a.curso === "string") return String(a.curso).trim();
    var c = a.cursos;
    if (c && !esVacio(c.grado)) {
      return String(c.grado) + (c.seccion != null && String(c.seccion) !== "" ? " " + c.seccion : "");
    }
    return "";
  }

  /*
   * Toma el arreglo de alumnos que ya tiene la página y deja SOLO las
   * columnas del listado. No copia id, teléfonos, notas, permisos ni
   * otros campos que el objeto original pudiera traer.
   * El No. es la posición en el listado mostrado (1, 2, 3…), que es el
   * número de lista que ya se ve en casi todas estas pantallas.
   */
  function mapearAlumnos(lista, opciones) {
    opciones = opciones || {};
    var cursoFijo = opciones.curso != null ? String(opciones.curso).trim() : "";
    return (lista || []).map(function (a, i) {
      var curso = nombreCursoDeFila(a) || cursoFijo;
      return {
        no: i + 1,
        matricula: a && a.matricula != null ? a.matricula : "",
        apellidos: a && a.apellido != null ? a.apellido : "",
        nombres: a && a.nombre != null ? a.nombre : "",
        curso: curso
      };
    });
  }

  /* v4.1.1: el aviso se escribe en el cuadro #estadoListado de la página
     (role="status": lo leen los lectores de pantalla). Si la página no lo
     tiene, se usa la ventana de aviso de siempre. */
  function cuadroEstado(opciones) {
    if (typeof document === "undefined" || !document.getElementById) return null;
    var id = (opciones && opciones.estado) || "estadoListado";
    return document.getElementById(id);
  }

  function avisar(mensaje, opciones, tipo) {
    if (opciones && typeof opciones.avisar === "function") {
      opciones.avisar(mensaje);
      return;
    }
    var cuadro = cuadroEstado(opciones);
    if (cuadro) {
      cuadro.textContent = mensaje;
      cuadro.setAttribute("data-tipo", tipo || "aviso");
      return;
    }
    if (typeof alert === "function") alert(mensaje);
  }

  /* Texto del curso elegido en un <select> (vacío si no hay curso elegido) */
  function textoCurso(idSelect) {
    if (typeof document === "undefined") return "";
    var sel = document.getElementById(idSelect || "curso");
    var opt = (sel && sel.selectedIndex >= 0) ? sel.options[sel.selectedIndex] : null;
    return (opt && opt.value && opt.text) ? opt.text.trim() : "";
  }

  function descargarCsv(contenido, nombre) {
    var blob = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
    return true;
  }

  function descargarAlumnos(lista, opciones) {
    opciones = opciones || {};
    if (typeof document === "undefined" || !document.createElement) {
      throw new Error("descargarAlumnos solo funciona en el navegador");
    }
    if (!lista || !lista.length) {
      avisar(opciones.mensajeVacio || "No hay alumnos en este listado para descargar.", opciones, "vacio");
      return false;
    }
    var filas = mapearAlumnos(lista, opciones);
    var csv = armarCsv(filas, COLUMNAS);
    var nombre = opciones.nombreArchivo || nombreArchivo(opciones.curso, opciones.fecha);
    descargarCsv(csv, nombre);
    if (!opciones.avisar) {
      var cuadro = cuadroEstado(opciones);
      if (cuadro) {
        cuadro.textContent = "Listo: se descargó «" + nombre + "» con " + filas.length +
          (filas.length === 1 ? " alumno." : " alumnos.") + " Lo encontrarás en la carpeta de descargas.";
        cuadro.setAttribute("data-tipo", "ok");
      }
    }
    return true;
  }

  raiz.DescargaListados = {
    ZONA_FECHA: ZONA_FECHA,
    COLUMNAS: COLUMNAS,
    protegerCelda: protegerCelda,
    celdaCsv: celdaCsv,
    armarCsv: armarCsv,
    fechaLocal: fechaLocal,
    sanearNombre: sanearNombre,
    nombreArchivo: nombreArchivo,
    mapearAlumnos: mapearAlumnos,
    descargarAlumnos: descargarAlumnos,
    textoCurso: textoCurso
  };
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
