/* Google Analytics 4 — La Barraquita
 *
 * Lo cargan todas las páginas (index.html y las que genera tools/build-seo.mjs).
 * Para activarlo: poner el Measurement ID real en GA_ID y volver a publicar.
 * Mientras quede "G-XXXXXXXXXX" no se carga nada de Google.
 *
 * Eventos que se mandan (ver window.lbTrack):
 *   whatsapp_click    clic en cualquier link a WhatsApp (ubicacion: ficha, oferta, carrito…)
 *   phone_click       clic en un link tel:
 *   view_item         se abre una ficha de producto (nombre, precio, marca, categoría)
 *   add_to_cart       "Agregar" al pedido (lo dispara js/app.js)
 *   begin_checkout    "Pedir por WhatsApp" desde el carrito (lo dispara js/app.js)
 *   select_promotion  clic en una oferta del mes del carrusel
 *
 * Consentimiento: Consent Mode v2. Arranca todo en "denied" y el banner pide
 * permiso para las cookies de analítica; la publicidad queda siempre denegada.
 *
 * Prueba con DebugView: abrir cualquier página con ?debug_ga=1 (queda activo
 * en esa pestaña hasta cerrarla o abrir ?debug_ga=0). En modo debug también
 * se muestran los eventos en la consola del navegador.
 */
(function(){
  "use strict";

  /* ⚠ Reemplazar por el Measurement ID real (Administrar → Flujos de datos → Web). */
  var GA_ID = "G-3WFF9GKREZ";

  /* Solo se mide en el dominio publicado, para que las pruebas locales no
     ensucien los informes. Con ?debug_ga=1 se mide en cualquier dominio. */
  var DOMINIOS = ["labarraquita.com.uy", "www.labarraquita.com.uy"];

  /* true  = modo avanzado: gtag.js se carga siempre y, sin consentimiento, manda
             pings sin cookies que GA usa para modelar los datos que faltan.
     false = modo básico: no se carga nada de Google hasta que aceptan. */
  var CARGAR_ANTES_DE_ACEPTAR = true;

  /* Tipo de cambio aproximado para sumar en pesos un pedido que mezcla UYU y
     USD (granja y harinas). Es el mismo que usa app.js para ordenar por precio. */
  var TC_USD = 42;

  var CLAVE_CONSENT = "lb_consent";
  var CLAVE_DEBUG = "lb_debug_ga";

  function leer(st, k){ try{ return window[st].getItem(k); }catch(e){ return null; } }
  function guardar(st, k, v){ try{ if(v === null) window[st].removeItem(k); else window[st].setItem(k, v); }catch(e){} }

  var debug = (function(){
    var m = /[?&]debug_ga=([01])/.exec(location.search);
    if(m) guardar("sessionStorage", CLAVE_DEBUG, m[1] === "1" ? "1" : null);
    return leer("sessionStorage", CLAVE_DEBUG) === "1";
  })();
  var configurado = /^G-[A-Z0-9]+$/.test(GA_ID) && GA_ID !== "G-XXXXXXXXXX";
  var dominioOk = DOMINIOS.indexOf(location.hostname) !== -1;
  var medir = configurado && (dominioOk || debug);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  var consent = leer("localStorage", CLAVE_CONSENT);   // "granted" | "denied" | null

  gtag("consent", "default", {
    analytics_storage: consent === "granted" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500
  });
  gtag("set", "ads_data_redaction", true);

  var cargado = false;
  function cargarGtag(){
    if(cargado || !medir) return;
    cargado = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    gtag("js", new Date());
    // debug_mode: false también activa DebugView, por eso solo se manda cuando corresponde.
    gtag("config", GA_ID, debug ? { debug_mode: true } : {});
  }
  if(consent === "granted" || CARGAR_ANTES_DE_ACEPTAR) cargarGtag();

  /* ── API para el resto del sitio ── */
  function track(nombre, params){
    params = params || {};
    if(debug && window.console) console.info("[GA4]", nombre, params, medir ? "" : "(sin enviar: falta GA_ID o dominio)");
    gtag("event", nombre, params);
  }
  window.lbTrack = track;

  /* Item en formato GA4 a partir de los datos de un producto de app.js o de la ficha */
  window.lbItem = function(p, qty){
    var it = { item_id: p.id, item_name: p.name, quantity: qty || 1 };
    if(p.pres) it.item_variant = p.pres;
    if(p.cat) it.item_category = p.cat;
    if(p.brand) it.item_brand = p.brand;
    if(p.price !== null && p.price !== undefined && p.price !== "") it.price = Number(p.price);
    return it;
  };
  /* Arma { currency, value, items } para una lista de [producto, cantidad] */
  window.lbEcommerce = function(lineas){
    var curs = {};
    lineas.forEach(function(l){ if(l[0].price !== null && l[0].price !== undefined) curs[l[0].cur] = 1; });
    var monedas = Object.keys(curs);
    var currency = monedas.length === 1 ? monedas[0] : "UYU";
    var value = 0;
    var items = lineas.map(function(l){
      var p = l[0], q = l[1], it = window.lbItem(p, q);
      if(it.price !== undefined){
        if(p.cur !== currency) it.price = Math.round(it.price * TC_USD);
        value += it.price * q;
      }
      return it;
    });
    return { currency: currency, value: Math.round(value * 100) / 100, items: items };
  };

  /* ── Ficha de producto estática: view_item ── */
  function itemDeFicha(){
    var f = document.querySelector("[data-item-id]");
    if(!f) return null;
    var d = f.dataset;
    return { id: d.itemId, name: d.itemName, pres: d.itemVariant, cat: d.itemCategory,
             brand: d.itemBrand, price: d.itemPrice, cur: d.itemCurrency };
  }
  var fichaActual = null;

  /* ── Dónde estaba el link (parámetro "ubicacion") ── */
  var UBICACIONES = [
    ["#checkout", "carrito"],
    ["a.slide", "oferta"],
    [".m-single", "vista_rapida"],
    ["#btnMayor, .nav-cta", "mayorista"],
    [".btn-wa", "ficha"],
    [".btn-wa-top", "encabezado"],
    ["#nosotros", "nosotros"],
    ["footer", "pie"]
  ];
  function ubicacion(a){
    for(var i = 0; i < UBICACIONES.length; i++){
      if(a.closest(UBICACIONES[i][0])) return UBICACIONES[i][1];
    }
    return "contenido";
  }

  /* En fase de burbuja: si el carrusel cancela el clic (fue un swipe), no se cuenta */
  document.addEventListener("click", function(e){
    if(e.defaultPrevented) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if(!a) return;
    var href = a.getAttribute("href") || "";
    var donde = ubicacion(a);

    if(/^tel:/i.test(href)){
      track("phone_click", { ubicacion: donde, link_url: href });
      return;
    }
    if(!/(^|\/\/)(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//i.test(href)) return;

    var params = { ubicacion: donde, page_type: fichaActual ? "ficha" : "otra" };
    if(donde === "oferta"){
      // Ofertas del mes: select_promotion + whatsapp_click (las arma app.js con data-oferta)
      var promo = { promotion_name: a.dataset.oferta || a.getAttribute("aria-label") || "",
                    creative_name: a.dataset.ofertaImg || "",
                    creative_slot: a.dataset.ofertaPos || "" };
      track("select_promotion", promo);
      params.promotion_name = promo.promotion_name;
    }
    if(a.dataset.gaValue){
      params.currency = a.dataset.gaCurrency || "UYU";
      params.value = Number(a.dataset.gaValue);
    } else if(fichaActual && donde === "ficha"){
      var eco = window.lbEcommerce([[fichaActual, 1]]);
      params.currency = eco.currency; params.value = eco.value; params.items = eco.items;
      params.item_name = fichaActual.name;
    }
    track("whatsapp_click", params);
  });

  /* ── Banner de consentimiento ── */
  function decidir(valor){
    guardar("localStorage", CLAVE_CONSENT, valor);
    gtag("consent", "update", { analytics_storage: valor });
    if(valor === "granted") cargarGtag();
    var b = document.getElementById("lb-cookies");
    if(b) b.parentNode.removeChild(b);
  }
  function banner(){
    if(document.getElementById("lb-cookies")) return;
    var css = document.createElement("style");
    css.textContent =
      "#lb-cookies{position:fixed;left:16px;right:16px;bottom:16px;z-index:90;max-width:560px;margin:0 auto;" +
      "background:#FAF6EF;color:#171210;border:1px solid #ECE3D4;border-radius:14px;padding:16px 18px;" +
      "box-shadow:0 18px 40px -18px rgba(23,18,16,.45);font:500 .9rem/1.45 'Libre Franklin',system-ui,sans-serif}" +
      "#lb-cookies p{margin:0 0 12px}" +
      "#lb-cookies .lbc-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}" +
      "#lb-cookies button{font:700 .88rem 'Libre Franklin',system-ui,sans-serif;border-radius:999px;padding:9px 18px;cursor:pointer;border:2px solid #5C1B26}" +
      "#lb-cookies .lbc-no{background:transparent;color:#5C1B26}" +
      "#lb-cookies .lbc-si{background:#5C1B26;color:#fff}" +
      "#lb-cookies .lbc-si:hover{background:#7A2432;border-color:#7A2432}";
    document.head.appendChild(css);
    var d = document.createElement("div");
    d.id = "lb-cookies";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-label", "Uso de cookies");
    d.innerHTML =
      "<p>Usamos cookies de Google Analytics para saber cómo se usa la página y mejorarla. " +
      "No usamos cookies de publicidad. ¿Nos dejás usarlas?</p>" +
      '<div class="lbc-row"><button type="button" class="lbc-no">No, gracias</button>' +
      '<button type="button" class="lbc-si">Aceptar</button></div>';
    d.querySelector(".lbc-no").addEventListener("click", function(){ decidir("denied"); });
    d.querySelector(".lbc-si").addEventListener("click", function(){ decidir("granted"); });
    document.body.appendChild(d);
  }
  /* Link "Cookies" del pie: vuelve a mostrar el banner para cambiar la elección */
  document.addEventListener("click", function(e){
    var t = e.target.closest && e.target.closest("[data-cookie-prefs]");
    if(!t) return;
    e.preventDefault();
    banner();
  });

  function alCargar(){
    fichaActual = itemDeFicha();
    if(fichaActual){
      var eco = window.lbEcommerce([[fichaActual, 1]]);
      track("view_item", eco);
    }
    if(consent === null && (medir || debug)) banner();
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", alCargar);
  else alCargar();
})();
