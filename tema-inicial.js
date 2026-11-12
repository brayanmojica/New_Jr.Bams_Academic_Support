/* v4.1 · Se carga en <head>, antes de los estilos, para que la página salga
   directamente con el tema elegido (sin parpadeo). Usa la copia guardada en este
   navegador; tema.js luego confirma con la base de datos y la actualiza. */
(function () {
  var html = document.documentElement;
  var tema = "academico";
  try {
    var t = localStorage.getItem("tema_plataforma");
    if (t === "clasico" || t === "academico") tema = t;
    var css = localStorage.getItem("tema_css");
    if (css && css.length < 20000 && !document.getElementById("tema-dinamico")) {
      var st = document.createElement("style");
      st.id = "tema-dinamico";
      st.textContent = css;
      document.head.appendChild(st);
    }
  } catch (e) {}
  html.setAttribute("data-tema", tema);
})();
