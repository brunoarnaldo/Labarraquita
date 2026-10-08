/* Google Analytics 4 — visitas y clics en WhatsApp, teléfono, redes y mapa.
 *
 * Se carga en todas las páginas: index.html y las que genera tools/build-seo.mjs.
 * Para activarlo alcanza con pegar el ID de medición en GA_ID; mientras esté
 * vacío no se carga nada.
 *
 * Solo mide en labarraquita.com.uy, así las pruebas en local y las vistas previas
 * no ensucian los datos. Para probar en cualquier lado: abrir una página con
 * ?ga_debug=1 (queda activo en esa pestaña) y mirar Admin › DebugView en GA4.
 *
 * Cada clic manda un evento (clic_whatsapp, clic_telefono, clic_instagram,
 * clic_facebook, clic_mapa, clic_resena) con dos parámetros:
 *   ubicacion → el data-track del enlace, o la zona de la página donde está
 *   producto  → el data-producto del enlace, si lo tiene
 * Para verlos en los informes hay que registrarlos en GA4 como dimensiones
 * personalizadas (Admin › Definiciones personalizadas, alcance "Evento").
 */
(function(){
  "use strict";
  var GA_ID = "";   // ID de medición, ej. "G-AB12CD34EF"
  if(!GA_ID) return;

  var debug = false;
  try{
    if(/[?&]ga_debug=1(&|$)/.test(location.search)) sessionStorage.setItem("ga_debug", "1");
    debug = sessionStorage.getItem("ga_debug") === "1";
  }catch(e){}
  if(!/(^|\.)labarraquita\.com\.uy$/.test(location.hostname) && !debug) return;

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID, debug ? { debug_mode: true } : {});
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);

  /* Canal según a dónde lleva el enlace; los enlaces internos no se miden acá */
  function canal(h){
    if(/^tel:/i.test(h)) return "telefono";
    if(/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(h)) return "whatsapp";
    if(/^https?:\/\/([^\/]+\.)?instagram\.com\//i.test(h)) return "instagram";
    if(/^https?:\/\/([^\/]+\.)?facebook\.com\//i.test(h)) return "facebook";
    if(/^https?:\/\/search\.google\.com\/local\/writereview/i.test(h)) return "resena";
    if(/^https?:\/\/(maps\.google\.[a-z.]+\/|(www\.)?google\.[a-z.]+\/maps)/i.test(h)) return "mapa";
    return null;
  }
  /* Zona de la página, para los enlaces que no traen data-track */
  function zona(a){
    if(a.closest("header")) return "cabecera";
    if(a.closest("footer")) return "pie";
    if(a.closest("#nosotros")) return "nosotros";
    return "contenido";
  }

  /* En fase de burbuja a propósito: el carrusel corta la propagación cuando el
     gesto fue un swipe, y esos no son clics para pedir la oferta. */
  document.addEventListener("click", function(e){
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if(!a) return;
    var c = canal(a.href);
    if(!c) return;
    var params = { ubicacion: a.getAttribute("data-track") || zona(a) };
    var prod = a.getAttribute("data-producto");
    if(prod) params.producto = prod.slice(0, 100);   // GA4 corta los valores en 100 caracteres
    gtag("event", "clic_" + c, params);
  });
})();
