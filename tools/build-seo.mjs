/*  Generador de páginas estáticas para SEO — La Barraquita
 *
 *  Lee los productos desde js/app.js (fuente única de verdad) y escribe:
 *    /catalogo/index.html                        → índice de todos los productos
 *    /catalogo/<categoria>/index.html            → 6 páginas de categoría
 *    /catalogo/<categoria>/<producto>/index.html → 1 ficha por producto
 *    /marcas/<marca>/index.html                  → páginas de marca (2+ productos)
 *    /sitemap.xml                                → todas las URLs
 *    /js/rutas.js                                → mapa id→URL que usa el catálogo
 *
 *  IMPORTANTE: cada vez que cambien precios, productos o fotos en js/app.js
 *  hay que volver a correr:  node tools/build-seo.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import DESCRIPCIONES from "./descripciones.mjs";
import FAQ from "./faq.mjs";
import GUIAS from "./guias.mjs";
import FICHAS from "./fichas.mjs";
import {
  bloquePrecio, bloqueRacion, bloqueFichaTecnica, bloqueComparativa,
  faqProducto, bloqueFaq, precioUnitario, parsePres,
  bloqueVariantes, familiaDe
} from "./contenido.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://labarraquita.com.uy";
const WA = "59892109806";
const TEL_WA = "092 109 806";
const HOY = new Date().toISOString().slice(0, 10);

/* ── 1. Datos ─────────────────────────────────────────────────────── */
const app = fs.readFileSync(path.join(ROOT, "js/app.js"), "utf8");
const PRODUCTS = JSON.parse(app.match(/var PRODUCTS\s*=\s*(\[[\s\S]*?\]);/)[1]);
const IMGS = JSON.parse(app.match(/var IMGS\s*=\s*(\{[\s\S]*?\});/)[1]);

const CATS = {
  perro:   { slug:"perros",  label:"Perros",  h1:"Raciones y alimento balanceado para perros",
             tipo:"Alimento balanceado para perros",
             intro:"Trabajamos con las marcas líderes en ración para perros: Astro, Bravo, Frost, Equilibrio, Criolla, Connie, Old Prince, Pedigree y muchas más. Tenemos fórmulas para cachorros, adultos, razas pequeñas, razas grandes y perros mayores de 7 años, en bolsas desde 7 kg hasta 25 kg, con bonificación de kilos en la mayoría de las presentaciones." },
  gato:    { slug:"gatos",   label:"Gatos",   h1:"Raciones y alimento balanceado para gatos",
             tipo:"Alimento balanceado para gatos",
             intro:"Ración para gatos adultos y castrados de las mejores marcas —Atacama, Frost, Le Roy, Fámil, Equilibrio, Criolla, Connie— más la variedad más completa de piedras sanitarias de Minas. Vendemos por mayor y por menor, con envío en el día a todo el país." },
  granja:  { slug:"granja",  label:"Granja",  h1:"Raciones para animales de granja",
             tipo:"Ración para animales de granja",
             intro:"Somos los únicos avalados por el MGAP en la zona. Raciones para aves ponedoras, pollos parrilleros, vacunos, terneros, cerdos, lechones, ovinos y conejos, en bolsas de 25 kg, más suplementos proteicos y vitamínicos. Precios mayoristas para productores y comercios." },
  granos:  { slug:"granos",  label:"Granos",  h1:"Granos e insumos a granel",
             tipo:"Grano e insumo a granel",
             intro:"Maíz entero, maíz quebrado, arroz y avena para caballos, en bolsas de 25 y 35 kg. Insumos para alimentar aves de corral, cerdos, vacunos y equinos, con entrega en tu casa o tu establecimiento." },
  cuidado: { slug:"sanidad", label:"Sanidad", h1:"Sanidad animal y control de plagas",
             tipo:"Producto de sanidad animal y control de plagas",
             intro:"Antiparasitarios internos y externos, pipetas, Simparica Trio para perros de 5 a 60 kg, mata pulgas y garrapatas, venenos para hormigas y cucarachas. Consultá siempre al veterinario por la dosis según el peso del animal." },
  harina:  { slug:"harinas", label:"Harinas", h1:"Harina de trigo por bolsa y por pack",
             tipo:"Harina de trigo",
             intro:"Harina de trigo 00, 000, 0000 e integral en bolsas de 25 kg, y packs de 12 unidades de Harina Uruguay y Primor. Precios mayoristas para panaderías, pizzerías y comercios de Minas y todo el país." }
};

/* Marcas que valen una página propia (se generan solo si tienen 2+ productos) */
const MARCAS = [
  { nombre:"Astro", re:/^astro\b/i,
    desc:"Astro es la línea premium especial de Supra: raciones con proteína de alta calidad, cuidado de piel y pelaje y salud oral. Tiene fórmulas específicas para adultos, razas pequeñas y perros senior mayores de 7 años, con croqueta adaptada a cada etapa. Es una de las marcas que más recomendamos cuando se busca calidad sin irse a lo más caro del mercado." },
  { nombre:"Bravo", re:/^bravo\b/i,
    desc:"Bravo es una ración de muy buena relación precio–calidad con línea completa: Original para adultos, Baby para cachorros, Light para control de peso y Razas Pequeñas con croqueta chica. La mayoría de sus presentaciones vienen con kilos de regalo, lo que la hace muy conveniente para casas con más de un perro." },
  { nombre:"Frost", re:/^frost\b/i,
    desc:"Frost es una ración premium con fórmulas por etapa y tamaño: cachorros, razas pequeñas, razas grandes, light y una línea para gatos castrados. Se destaca por la digestibilidad, el cuidado articular en razas grandes y el control de calorías en las versiones light." },
  { nombre:"Criolla", re:/^criolla\b/i,
    desc:"Criolla es la ración económica más vendida del mostrador: alimento completo para perros adultos, cachorros y gatos a un precio muy accesible. Sus combos XL (25 kg + 7 kg en perros, 7 kg que rinden 10 kg en gatos) son la opción más rendidora del catálogo." },
  { nombre:"Connie", re:/^connie\b/i,
    desc:"Connie es una marca uruguaya de raciones para perros y gatos adultos, con buena aceptación y precio justo, en presentaciones de 8, 9 y 25 kg. También fabrica una piedra sanitaria económica para la bandeja de todos los días." },
  { nombre:"Equilibrio", re:/^equilibrio\b/i,
    desc:"Equilibrio es una ración super premium de Total Alimentos, con proteínas de alta calidad, prebióticos para la digestión y cuidado dental. Tiene fórmulas para razas pequeñas, razas medianas y gatos adultos. Al ser más concentrada, el perro come menos gramos por día." },
  { nombre:"Le Roy", re:/^le roy\b/i,
    desc:"Le Roy Premium es una ración para gatos adultos con sabores de alta aceptación, como pescado (Cocktail do Mar) y carne, en bolsas de 10,1 kg. Buena opción para gatos exigentes que rechazan otras raciones." },
  { nombre:"Prot", re:/^prot\b/i,
    desc:"Prot es una ración estándar para perros y gatos adultos, con nutrición completa a un precio accesible. La presentación de 20 kg + 3 kg de regalo es una de las más elegidas para el día a día." },
  { nombre:"Fámil Premium", re:/^f[áa]mil\b/i,
    desc:"Fámil Premium es una ración premium para perros y gatos adultos de todas las razas, alimento completo y balanceado con kilo de regalo en la versión para gatos." },
  { nombre:"Atacama", re:/^atacama\b/i,
    desc:"Atacama es una ración premium con una línea para perros adultos y una fórmula específica para gatos castrados, pensada para controlar el peso y cuidar el tracto urinario después de la castración." },
  { nombre:"Nhock", re:/^nhock\b/i,
    desc:"Nhock Premium es una ración brasileña para perros adultos de todas las razas. Su combo de 25 kg + 10 kg de regalo es una de las mejores relaciones precio por kilo en ración premium." },
  { nombre:"Oriunda", re:/^oriunda\b/i,
    desc:"Oriunda es una ración estándar para perros adultos, con buen rendimiento y precio accesible, en bolsas de 7 kg y de 20 kg + 2 kg de regalo." },
  { nombre:"Hiport Dog", re:/^hiport\b/i,
    desc:"Hiport Dog es una ración para perros adultos de todas las razas, alimento completo y balanceado, en bolsas de 7 y 20 kg." },
  { nombre:"Macanudo", re:/^macanudo\b/i,
    desc:"Macanudo es una ración económica para perros y gatos adultos, en bolsas chicas de 5 y 7 kg, práctica para un solo animal." },
  { nombre:"Golden", re:/^golden\b/i,
    desc:"Golden es la línea de PremieRpet, con fórmulas de ingredientes naturales para perros adultos (Special), perros de 7 años o más (Senior) y gatos castrados. Es una ración premium brasileña de croqueta bien aceptada, que en las presentaciones grandes suele venir con balde de regalo." },
  { nombre:"Simparica", re:/^simparica\b/i,
    desc:"Simparica Trio es el antiparasitario mensual de Zoetis en comprimido masticable: protege contra pulgas, garrapatas, gusano del corazón y parásitos intestinales en una sola toma. Viene en cuatro presentaciones según el peso del perro, de 5 a 60 kg. Consultá con tu veterinario la dosis correcta." }
];

/* Marcas sin página propia: van al "brand" del marcado Product (Google avisa si
   falta) y al renglón sobre el título, sin enlace. Las que no están en el nombre
   del producto salen de la bolsa de la foto, confirmadas por el cliente el
   2026-09-26. Los granos a granel y los genéricos de sanidad quedan sin marca. */
const OTRAS_MARCAS = [
  { nombre:"Hiprot", re:/^hiprot\b/i },
  { nombre:"Premier", re:/^premier\b/i },
  { nombre:"Monkcat", re:/^monkcat\b/i },
  { nombre:"Stonecat", re:/^stonecat\b/i },
  { nombre:"Trigato", re:/^trigato\b/i },
  { nombre:"The Best", re:/^the best\b/i },
  { nombre:"Sepicat", re:/^sepicat\b/i },
  { nombre:"Old Prince", re:/^old prince\b/i },
  { nombre:"Falucho", re:/^falucho\b/i },
  { nombre:"Bandido's", re:/^bandido/i },
  { nombre:"Fridy", re:/^fridy\b/i },
  { nombre:"Nero", re:/^nero\b/i },
  { nombre:"Pedigree", re:/^pedigree\b/i },
  { nombre:"Gran Plus", re:/^gran plus\b/i },
  { nombre:"Natural Dog", re:/^natural dog\b/i },
  { nombre:"Lager", re:/^lager\b/i },
  { nombre:"Primocão", re:/^primoc[aã]o/i },
  { nombre:"Dogui", re:/^dogui\b/i },
  { nombre:"Charrua", re:/^charr[uú]a\b/i },
  { nombre:"The Golden Choice", re:/^the golden choice\b/i },
  { nombre:"Rex", re:/^rex\b/i },
  { nombre:"Vagoneta", re:/^vagoneta\b/i },
  { nombre:"Estampa", re:/^estampa\b/i },
  { nombre:"Finn", re:/^finn\b/i },
  { nombre:"Uruguay", re:/^harina uruguay\b/i },
  { nombre:"Primor", re:/^harina primor\b/i },
  { nombre:"Racionísima", ids:["f01","f02","f03","f04","f05","f06","f07","f08","f09","f10","f11","f12","f13"] },
  { nombre:"San José", ids:["h01","h02","h03","h04","h05"] },
  { nombre:"Vetnil", ids:["f14","f15"] }
];

/* ── 2. Utilidades ────────────────────────────────────────────────── */
function slug(s){
  return String(s)
    .replace(/\+/g, " mas ")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’´`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function esc(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function fmtUYU(n){ return "$ " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function fmtUSD(n){ return "US$ " + n.toFixed(2).replace(".", ","); }
function precio(p){
  if(p.price === null || p.price === undefined) return "Consultar";
  return p.cur === "USD" ? fmtUSD(p.price) : fmtUYU(p.price);
}
function waHref(texto){
  return "https://wa.me/" + WA + "?text=" + encodeURIComponent(texto);
}
function write(rel, html){
  const dest = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, "utf8");
}

/* ── 3. Modelo enriquecido ────────────────────────────────────────── */
const usados = new Set();
const items = PRODUCTS.map(function(p){
  const cat = CATS[p.cat];
  const base = slug(p.name + (p.pres ? " " + p.pres : ""));
  let s = base, n = 2;
  while(usados.has(cat.slug + "/" + s)){ s = base + "-" + (n++); }
  usados.add(cat.slug + "/" + s);
  const marca = MARCAS.find(function(m){ return m.re.test(p.name); });
  const otra = marca ? null : OTRAS_MARCAS.find(function(m){
    return m.ids ? m.ids.includes(p.id) : m.re.test(p.name);
  });
  return {
    ...p,
    cat_slug: cat.slug,
    cat_label: cat.label,
    tipo: /sanitaria/i.test(p.name) ? "Piedra sanitaria absorbente para gatos" : cat.tipo,
    slug: s,
    url: "/catalogo/" + cat.slug + "/" + s + "/",
    img: IMGS[p.img] ? "/" + IMGS[p.img] : null,
    titulo: p.name + (p.pres ? " " + p.pres : ""),
    marca: marca ? marca.nombre : null,
    marcaSinPagina: otra ? otra.nombre : null,
    precio: precio(p),
    desc: DESCRIPCIONES[p.id] || ""
  };
});
const porCat = {};
items.forEach(function(it){ (porCat[it.cat] = porCat[it.cat] || []).push(it); });

/* Ficha técnica por SKU: fichas.mjs se indexa por fórmula, acá se expande
   a cada bolsa que la comparte. */
const fichaDe = {};
Object.values(FICHAS).forEach(function(f){
  f.ids.forEach(function(id){ fichaDe[id] = f; });
});

/* Presentaciones hermanas: mismo producto, distinta bolsa. Se agrupan por
   nombre + categoría, que es lo que distingue una fórmula en el catálogo. */
const porLinea = {};
items.forEach(function(it){
  const k = it.cat + "|" + it.name.toLowerCase();
  (porLinea[k] = porLinea[k] || []).push(it);
});
function hermanosDe(it){
  return (porLinea[it.cat + "|" + it.name.toLowerCase()] || [])
    .filter(function(o){ return o.id !== it.id; });
}

/* Familias dosificadas por peso del animal (antiparasitarios). */
const porFamilia = {};
items.forEach(function(it){
  if(it.cat !== "cuidado") return;
  const base = familiaDe(it.name);
  if(base === it.name) return;              // sin franja entre paréntesis
  (porFamilia[base] = porFamilia[base] || []).push(it);
});

const marcas = MARCAS.map(function(m){
  const lista = items.filter(function(it){ return it.marca === m.nombre; });
  return { ...m, slug: slug(m.nombre), url: "/marcas/" + slug(m.nombre) + "/", items: lista };
}).filter(function(m){ return m.items.length >= 2; });

/* ── 4. Plantilla base ────────────────────────────────────────────── */
function layout(o){
  return `<!doctype html>
<html lang="es-UY">
<head>
<meta charset="utf-8">
<title>${esc(o.title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(o.desc)}">
<meta name="theme-color" content="#5c1b26">
<link rel="canonical" href="${SITE}${o.url}">
<link rel="icon" href="/img/brand-logo.png" type="image/png">
<link rel="apple-touch-icon" href="/img/brand-logo.png">
<meta property="og:type" content="${o.ogType || "website"}">
<meta property="og:site_name" content="La Barraquita">
<meta property="og:title" content="${esc(o.ogTitle || o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:image" content="${SITE}${o.image || "/img/og-cover.jpg"}">
<meta property="og:url" content="${SITE}${o.url}">
<meta property="og:locale" content="es_UY">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(o.ogTitle || o.title)}">
<meta name="twitter:description" content="${esc(o.desc)}">
<meta name="twitter:image" content="${SITE}${o.image || "/img/og-cover.jpg"}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Libre+Franklin:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/pagina.css">
<script type="application/ld+json">
${JSON.stringify(o.jsonld, null, 2)}
</script>
</head>
<body>

<div class="bar">Envíos en el día con flota propia a todo el país · <b>Únicos avalados por el MGAP</b></div>

<header class="top">
  <div class="wrap top-row">
    <a class="brandmark" href="/" aria-label="La Barraquita, inicio">
      <img class="brand-logo" src="/img/brand-logo.png" alt="La Barraquita — Raciones Balanceadas">
    </a>
    <nav class="pagenav" aria-label="Categorías">
      ${Object.values(CATS).map(function(c){
        return `<a href="/catalogo/${c.slug}/">${c.label}</a>`;
      }).join("\n      ")}
    </nav>
    <a class="btn-wa-top" href="${waHref("Hola La Barraquita! Vengo desde la web y quiero hacer un pedido.")}" target="_blank" rel="noopener">${TEL_WA}</a>
  </div>
</header>

<nav class="crumbs" aria-label="Migas de pan">
  <div class="wrap">
    ${o.crumbs.map(function(c, i){
      const last = i === o.crumbs.length - 1;
      return last ? `<span aria-current="page">${esc(c.n)}</span>`
                  : `<a href="${c.u}">${esc(c.n)}</a><span class="sep">›</span>`;
    }).join("\n    ")}
  </div>
</nav>

<main>
${o.body}
</main>

<footer>
  <div class="wrap foot-grid">
    <div>
      <div class="foot-wordmark">LA BARRAQUITA</div>
      <div class="foot-tagline">Raciones balanceadas</div>
      <p class="foot-p">Negocio familiar de Minas desde 2002. Raciones para perros, gatos y granja, granos, sanidad y harinas. Únicos avalados por el MGAP, con flota propia y envíos en el día a todo el país.</p>
    </div>
    <div>
      <h4>Catálogo</h4>
      <ul>
        <li><a href="/catalogo/">Todos los productos</a></li>
        ${Object.values(CATS).map(function(c){
          return `<li><a href="/catalogo/${c.slug}/">${c.label}</a></li>`;
        }).join("\n        ")}
        <li><a href="/guias/">Guías y consejos</a></li>
        <li><a href="/preguntas-frecuentes/">Preguntas frecuentes</a></li>
        <li><a href="/politica-de-devoluciones/">Cambios y devoluciones</a></li>
      </ul>
    </div>
    <div>
      <h4>Marcas</h4>
      <ul class="foot-marcas">
        ${marcas.map(function(m){
          return `<li><a href="${m.url}">${esc(m.nombre)}</a></li>`;
        }).join("\n        ")}
      </ul>
    </div>
    <div>
      <h4>Dónde estamos</h4>
      <p class="foot-p">Intendente Lois 523<br>Minas, Lavalleja</p>
      <h4 class="mt">Horarios</h4>
      <p class="foot-p">Lunes a viernes 8:00–12:30 y 14:00–18:30<br>Sábados 8:00–13:00</p>
      <h4 class="mt">Contacto</h4>
      <p class="foot-p">WhatsApp ${TEL_WA}<br>Teléfono 4442 4021</p>
    </div>
  </div>
  <div class="foot-bottom">
    <div class="wrap">
      <p>Los precios pueden variar; confirmá stock y valores al hacer tu pedido. Productos de granja y harinas expresados en dólares.</p>
      <span>© ${new Date().getFullYear()} La Barraquita · Minas, Lavalleja</span>
    </div>
  </div>
</footer>

</body>
</html>
`;
}

/* Mismo @id que el PetStore declarado en index.html; se repite nombre y tipo
   para que cada ficha sea válida por sí sola en el validador de Google. */
const NEGOCIO = { "@type": ["PetStore", "Store"], "@id": SITE + "/#negocio", "name": "La Barraquita", "url": SITE + "/" };

/* Política de devoluciones — la pide Google Merchant Center. El plazo tiene que
   coincidir con el que se cargue en Merchant Center y con el texto de la página
   /politica-de-devoluciones/ (sección 8d). Ley 17.250, art. 16: el mínimo legal
   para compras a distancia es de 5 días hábiles; 10 corridos lo cubre siempre. */
const DIAS_DEVOLUCION = 10;
const POLITICA_DEVOLUCION = {
  "@type": "MerchantReturnPolicy",
  "@id": SITE + "/politica-de-devoluciones/#politica",
  "url": SITE + "/politica-de-devoluciones/",
  "applicableCountry": "UY",
  "returnPolicyCountry": "UY",
  "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
  "merchantReturnDays": DIAS_DEVOLUCION,
  "returnMethod": ["https://schema.org/ReturnInStore", "https://schema.org/ReturnByMail"],
  "returnFees": "https://schema.org/FreeReturn",
  "refundType": "https://schema.org/FullRefund",
  "itemCondition": "https://schema.org/NewCondition"
};

/* Envío — sin costo en Minas y con costo variable al resto del país (según
   zona y volumen, faq.mjs). Google no admite zonas por ciudad ni departamento
   en Uruguay, solo el país entero, así que no hay forma de declarar el envío
   gratis de Minas sin que parezca gratis a todo el país: se declara destino y
   plazo, y shippingRate queda afuera. Plazo: en el día en Minas, menos de 24 h
   en el resto. */
const ENVIO = {
  "@type": "OfferShippingDetails",
  "shippingDestination": { "@type":"DefinedRegion", "addressCountry":"UY" },
  "deliveryTime": {
    "@type": "ShippingDeliveryTime",
    "handlingTime": { "@type":"QuantitativeValue", "minValue":0, "maxValue":0, "unitCode":"DAY" },
    "transitTime":  { "@type":"QuantitativeValue", "minValue":0, "maxValue":1, "unitCode":"DAY" }
  }
};

function breadcrumbLD(crumbs){
  return {
    "@type": "BreadcrumbList",
    "itemListElement": crumbs.map(function(c, i){
      return { "@type":"ListItem", "position": i + 1, "name": c.n, "item": SITE + c.u };
    })
  };
}

/* Las respuestas son las mismas que se ven en la página: el bloque de FAQ y
   este marcado salen del mismo array de preguntas. */
function faqLD(preguntas){
  if(!preguntas || !preguntas.length) return null;
  return {
    "@type": "FAQPage",
    "mainEntity": preguntas.map(function(p){
      return { "@type":"Question", "name": p.q, "acceptedAnswer": { "@type":"Answer", "text": p.a } };
    })
  };
}

/* Tarjeta de producto reutilizable en índices */
function card(it){
  return `<li class="card">
        <a href="${it.url}">
          <span class="card-art">${it.img ? `<img src="${it.img}" alt="${esc(it.titulo)} — ${esc(it.tipo)}" loading="lazy" decoding="async">` : ""}</span>
          <span class="card-cat">${esc(it.cat_label)}</span>
          <span class="card-name">${esc(it.name)}</span>
          ${it.pres ? `<span class="card-pres">${esc(it.pres)}</span>` : ""}
          <span class="card-price">${esc(it.precio)}</span>
        </a>
      </li>`;
}

/* ── 5. Fichas de producto ────────────────────────────────────────── */
items.forEach(function(it){
  const crumbs = [
    { n:"Inicio", u:"/" },
    { n:"Catálogo", u:"/catalogo/" },
    { n:it.cat_label, u:"/catalogo/" + it.cat_slug + "/" },
    { n:it.titulo, u:it.url }
  ];
  const pedido = `Hola La Barraquita! Quiero pedir: ${it.name}${it.pres ? " (" + it.pres + ")" : ""}. ¿Está disponible?`;
  const relacionados = porCat[it.cat].filter(function(o){ return o.id !== it.id; }).slice(0, 8);

  /* Contenido propio de esta ficha: precio por kilo, rendimiento, análisis
     garantizado y preguntas, todo derivado de los datos del producto. */
  const ficha = fichaDe[it.id];
  const hermanos = hermanosDe(it);
  const preguntas = faqProducto(it, ficha, hermanos);
  const htmlPrecio = bloquePrecio(it, hermanos);
  const htmlRacion = bloqueRacion(it, ficha);
  const htmlTecnica = bloqueFichaTecnica(ficha);
  const htmlComparativa = bloqueComparativa(it, porCat[it.cat], it.cat_label);
  const htmlFaq = bloqueFaq(preguntas, it.name);
  const familia = porFamilia[familiaDe(it.name)];
  const htmlVariantes = familia && familia.length > 1 ? bloqueVariantes(it, familia) : "";

  const desc = `${it.name}${it.pres ? " de " + it.pres : ""} — ${it.precio} en La Barraquita, Minas (Lavalleja). ${it.desc || it.tipo + "."} Envío en el día a todo el país. WhatsApp ${TEL_WA}.`;

  const offer = {
    "@type": "Offer",
    "url": SITE + it.url,
    "priceCurrency": it.cur,
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": NEGOCIO,
    "areaServed": { "@type":"Country", "name":"Uruguay" },
    "shippingDetails": ENVIO,
    "hasMerchantReturnPolicy": POLITICA_DEVOLUCION
  };
  if(it.price !== null && it.price !== undefined) offer.price = it.price;

  const producto = {
    "@type": "Product",
    "@id": SITE + it.url + "#producto",
    "name": it.titulo,
    "sku": it.id,
    "category": it.cat_label,
    "description": `${it.desc || it.tipo + "."}${it.pres ? " Presentación de " + it.pres + "." : ""} Disponible en La Barraquita, Minas, Lavalleja, con envío a todo el Uruguay.`,
    "offers": offer
  };
  if(it.img) producto.image = SITE + it.img;
  const marcaLD = it.marca || it.marcaSinPagina;
  if(marcaLD) producto.brand = { "@type":"Brand", "name": marcaLD };

  /* Peso neto y análisis garantizado como propiedades del producto, para que
     Google entienda la ficha y no solo el precio. */
  const presParsed = parsePres(it.pres);
  if(presParsed.tipo === "peso"){
    producto.weight = { "@type":"QuantitativeValue", "value": presParsed.kg, "unitCode":"KGM" };
  }
  if(ficha?.analisis){
    const etiquetas = {
      proteina:"Proteína cruda (mín.)", grasa:"Grasa (mín.)", fibra:"Fibra cruda (máx.)",
      humedad:"Humedad (máx.)", cenizas:"Cenizas (máx.)", calcio:"Calcio", fosforo:"Fósforo",
      em:"Energía metabolizable"
    };
    producto.additionalProperty = Object.keys(etiquetas)
      .filter(function(k){ return ficha.analisis[k] !== undefined && ficha.analisis[k] !== null; })
      .map(function(k){
        return {
          "@type": "PropertyValue",
          "name": etiquetas[k],
          "value": String(ficha.analisis[k]).replace(".", ","),
          "unitText": k === "em" ? "kcal/kg" : "%"
        };
      });
  }

  const body = `
<article class="ficha wrap">
  <div class="ficha-art">
    ${it.img ? `<img src="${it.img}" alt="${esc(it.titulo)}: ${esc(it.tipo).toLowerCase()} — La Barraquita, Minas" decoding="async">` : ""}
  </div>
  <div class="ficha-info">
    <p class="eyebrow"><a href="/catalogo/${it.cat_slug}/">${esc(it.cat_label)}</a>${it.marca ? ` · <a href="/marcas/${slug(it.marca)}/">${esc(it.marca)}</a>` : it.marcaSinPagina ? ` · ${esc(it.marcaSinPagina)}` : ""}</p>
    <h1 class="display">${esc(it.name)}</h1>
    ${it.pres ? `<p class="ficha-pres">Presentación: <b>${esc(it.pres)}</b></p>` : ""}
    ${it.desc ? `<p class="ficha-desc">${esc(it.desc)}</p>` : ""}
    <p class="ficha-precio">${esc(it.precio)}</p>
    <a class="btn-wa" href="${waHref(pedido)}" target="_blank" rel="noopener">Pedir por WhatsApp ${TEL_WA}</a>
    <p class="ficha-nota">Coordinás pago y entrega directo por WhatsApp. El precio es de referencia: confirmá stock y valor al hacer el pedido.</p>
    <ul class="ficha-ventajas">
      <li>Envío en el día a todo el país con flota propia</li>
      <li>Únicos avalados por el MGAP en la zona</li>
      <li>Venta por mayor y por menor</li>
      <li>Efectivo, transferencias y todas las tarjetas</li>
    </ul>
    ${htmlComparativa}
  </div>
</article>
${htmlPrecio}
${htmlRacion}
${htmlVariantes}
${htmlTecnica}
${htmlFaq}
<section class="wrap bloque">
  <h2 class="display">Dónde comprar ${esc(it.name)} en Minas</h2>
  <p>${esc(it.tipo)}${it.pres ? ` en presentación de <b>${esc(it.pres)}</b>` : ""}. Lo retirás en <b>Intendente Lois 523, Minas (Lavalleja)</b> o te lo llevamos con flota propia en menos de 24 horas, a Minas y a todo el país. Pedidos por WhatsApp al <b>${TEL_WA}</b>.</p>
  <p><a class="link-mas" href="/preguntas-frecuentes/">Cómo comprar, envíos y formas de pago →</a></p>
</section>

${relacionados.length ? `<section class="wrap bloque">
  <h2 class="display">Otros productos de ${esc(it.cat_label.toLowerCase())}</h2>
  <ul class="grid">
    ${relacionados.map(card).join("\n    ")}
  </ul>
  <p><a class="link-mas" href="/catalogo/${it.cat_slug}/">Ver todo el catálogo de ${esc(it.cat_label.toLowerCase())} →</a></p>
</section>` : ""}
`;

  write("catalogo/" + it.cat_slug + "/" + it.slug + "/index.html", layout({
    title: `${it.titulo} — Precio y envío | La Barraquita`,
    ogTitle: `${it.titulo} · ${it.precio}`,
    desc: desc.slice(0, 300),
    url: it.url,
    image: it.img || "/img/og-cover.jpg",
    ogType: "product",
    crumbs: crumbs,
    jsonld: { "@context":"https://schema.org", "@graph":[ producto, faqLD(preguntas), breadcrumbLD(crumbs) ].filter(Boolean) },
    body: body
  }));
});

/* ── 6. Páginas de categoría ──────────────────────────────────────── */
Object.keys(CATS).forEach(function(key){
  const c = CATS[key];
  const lista = porCat[key] || [];
  const crumbs = [ { n:"Inicio", u:"/" }, { n:"Catálogo", u:"/catalogo/" }, { n:c.label, u:"/catalogo/" + c.slug + "/" } ];
  const marcasCat = marcas.filter(function(m){ return m.items.some(function(i){ return i.cat === key; }); });

  const body = `
<section class="wrap encabezado">
  <p class="eyebrow">Catálogo · ${esc(c.label)}</p>
  <h1 class="display">${esc(c.h1)}</h1>
  <p class="lead">${esc(c.intro)}</p>
  <p class="conteo">${lista.length} ${lista.length === 1 ? "producto" : "productos"} · precios actualizados al ${HOY.split("-").reverse().join("/")}</p>
  ${marcasCat.length ? `<p class="chips">Marcas: ${marcasCat.map(function(m){ return `<a href="${m.url}">${esc(m.nombre)}</a>`; }).join(" ")}</p>` : ""}
</section>

<section class="wrap bloque">
  <ul class="grid">
    ${lista.map(card).join("\n    ")}
  </ul>
</section>

<section class="wrap bloque">
  <h2 class="display">Envíos y formas de pago</h2>
  <p>Llevamos tu pedido de ${esc(c.label.toLowerCase())} <b>en el día</b> a Minas y a todo el Uruguay con flota propia. Vendemos <b>por mayor y por menor</b> y aceptamos efectivo, transferencias bancarias y todas las tarjetas de crédito y débito.</p>
  <p>Escribinos al WhatsApp <a href="${waHref("Hola La Barraquita! Quiero consultar por " + c.label.toLowerCase() + ".")}" target="_blank" rel="noopener"><b>${TEL_WA}</b></a> o pasá por Intendente Lois 523, Minas, Lavalleja.</p>
</section>
`;

  write("catalogo/" + c.slug + "/index.html", layout({
    title: `${c.label}: ${lista.length} productos con precio | La Barraquita`,
    ogTitle: `${c.h1} — La Barraquita`,
    desc: `${c.h1} en La Barraquita, Minas (Lavalleja). ${lista.length} productos con precio, envío en el día a todo el país, por mayor y por menor. WhatsApp ${TEL_WA}.`,
    url: "/catalogo/" + c.slug + "/",
    crumbs: crumbs,
    jsonld: { "@context":"https://schema.org", "@graph":[
      {
        "@type": "CollectionPage",
        "@id": SITE + "/catalogo/" + c.slug + "/#pagina",
        "name": c.h1,
        "isPartOf": { "@id": SITE + "/#sitio" },
        "about": NEGOCIO,
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": lista.length,
          "itemListElement": lista.map(function(it, i){
            return { "@type":"ListItem", "position": i + 1, "url": SITE + it.url, "name": it.titulo };
          })
        }
      },
      breadcrumbLD(crumbs)
    ] },
    body: body
  }));
});

/* ── 7. Índice general del catálogo ───────────────────────────────── */
{
  const crumbs = [ { n:"Inicio", u:"/" }, { n:"Catálogo", u:"/catalogo/" } ];
  const body = `
<section class="wrap encabezado">
  <p class="eyebrow">Catálogo completo</p>
  <h1 class="display">Todos nuestros productos, con precio</h1>
  <p class="lead">${items.length} productos entre raciones para perros y gatos, alimento de granja, granos, sanidad animal y harinas. Somos La Barraquita, un negocio familiar de Minas (Lavalleja) desde 2002, los únicos avalados por el MGAP en la zona, con envío en el día a todo el Uruguay y venta por mayor y por menor.</p>
  <p class="chips">${Object.values(CATS).map(function(c){ return `<a href="/catalogo/${c.slug}/">${c.label}</a>`; }).join(" ")}</p>
</section>
${Object.keys(CATS).map(function(key){
  const c = CATS[key];
  const lista = porCat[key] || [];
  return `<section class="wrap bloque" id="${c.slug}">
  <h2 class="display"><a href="/catalogo/${c.slug}/">${esc(c.label)}</a> <span class="n">${lista.length}</span></h2>
  <ul class="grid">
    ${lista.map(card).join("\n    ")}
  </ul>
</section>`;
}).join("\n")}
`;
  write("catalogo/index.html", layout({
    title: `Catálogo de raciones y alimento balanceado | La Barraquita`,
    ogTitle: "Catálogo completo con precios — La Barraquita",
    desc: `Catálogo completo de La Barraquita: ${items.length} productos con precio — raciones para perros y gatos, granja, granos, sanidad y harinas. Minas, Lavalleja. Envío en el día a todo el país. WhatsApp ${TEL_WA}.`,
    url: "/catalogo/",
    crumbs: crumbs,
    jsonld: { "@context":"https://schema.org", "@graph":[
      {
        "@type": "CollectionPage",
        "@id": SITE + "/catalogo/#pagina",
        "name": "Catálogo de La Barraquita",
        "isPartOf": { "@id": SITE + "/#sitio" },
        "about": NEGOCIO,
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": items.length,
          "itemListElement": items.map(function(it, i){
            return { "@type":"ListItem", "position": i + 1, "url": SITE + it.url, "name": it.titulo };
          })
        }
      },
      breadcrumbLD(crumbs)
    ] },
    body: body
  }));
}

/* ── 8. Páginas de marca ──────────────────────────────────────────── */
marcas.forEach(function(m){
  const crumbs = [ { n:"Inicio", u:"/" }, { n:"Catálogo", u:"/catalogo/" }, { n:m.nombre, u:m.url } ];
  const cats = [...new Set(m.items.map(function(i){ return i.cat_label; }))];
  const body = `
<section class="wrap encabezado">
  <p class="eyebrow">Marca</p>
  <h1 class="display">${esc(m.nombre)} en Minas y todo Uruguay</h1>
  <p class="lead">${esc(m.desc)}</p>
  <p class="lead">Todas las presentaciones de <b>${esc(m.nombre)}</b> que tenemos en stock, con precio actualizado. ${cats.length === 1 ? "Línea de " + cats[0].toLowerCase() + "." : "Líneas de " + cats.join(" y ").toLowerCase() + "."} Comprala en La Barraquita, Intendente Lois 523, Minas (Lavalleja), con envío en el día a todo el país y venta por mayor y por menor.</p>
  <p class="conteo">${m.items.length} presentaciones disponibles</p>
</section>

<section class="wrap bloque">
  <ul class="grid">
    ${m.items.map(card).join("\n    ")}
  </ul>
</section>

<section class="wrap bloque">
  <h2 class="display">¿Necesitás asesoramiento?</h2>
  <p>Escribinos al WhatsApp <a href="${waHref("Hola La Barraquita! Quiero consultar por " + m.nombre + ".")}" target="_blank" rel="noopener"><b>${TEL_WA}</b></a> y te ayudamos a elegir la presentación y la fórmula que mejor le va a tu animal. Si comprás cantidad, pedinos la lista mayorista.</p>
  <p><a class="link-mas" href="/catalogo/">Ver el catálogo completo →</a></p>
</section>
`;
  write("marcas/" + m.slug + "/index.html", layout({
    title: `${m.nombre}: precios y presentaciones | La Barraquita`,
    ogTitle: `${m.nombre} — precios en La Barraquita`,
    desc: `${m.nombre} en La Barraquita, Minas (Lavalleja): ${m.items.length} presentaciones con precio actualizado. Envío en el día a todo el Uruguay, por mayor y por menor. WhatsApp ${TEL_WA}.`,
    url: m.url,
    crumbs: crumbs,
    jsonld: { "@context":"https://schema.org", "@graph":[
      {
        "@type": "CollectionPage",
        "@id": SITE + m.url + "#pagina",
        "name": m.nombre + " — La Barraquita",
        "isPartOf": { "@id": SITE + "/#sitio" },
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": m.items.length,
          "itemListElement": m.items.map(function(it, i){
            return { "@type":"ListItem", "position": i + 1, "url": SITE + it.url, "name": it.titulo };
          })
        }
      },
      breadcrumbLD(crumbs)
    ] },
    body: body
  }));
});

/* ── 8b. Preguntas frecuentes (FAQPage) ───────────────────────────── */
{
  const crumbs = [ { n:"Inicio", u:"/" }, { n:"Preguntas frecuentes", u:"/preguntas-frecuentes/" } ];
  const body = `
<section class="wrap encabezado">
  <p class="eyebrow">Ayuda</p>
  <h1 class="display">Preguntas frecuentes</h1>
  <p class="lead">Todo lo que nos preguntan sobre pedidos, envíos, pagos, venta por mayor y qué ración elegir. Si tu duda no está acá, escribinos por WhatsApp al <a href="${waHref("Hola La Barraquita! Tengo una consulta.")}" target="_blank" rel="noopener"><b>${TEL_WA}</b></a>.</p>
</section>
<section class="wrap bloque faq">
  ${FAQ.map(function(f){
    return `<details>
    <summary><h2>${esc(f.q)}</h2></summary>
    <p>${esc(f.a)}</p>
  </details>`;
  }).join("\n  ")}
</section>
<section class="wrap bloque">
  <p><a class="link-mas" href="/catalogo/">Ver el catálogo completo →</a> &nbsp;·&nbsp; <a class="link-mas" href="/guias/">Guías y consejos →</a></p>
</section>
`;
  write("preguntas-frecuentes/index.html", layout({
    title: "Preguntas frecuentes: envíos, pagos y pedidos | La Barraquita",
    ogTitle: "Preguntas frecuentes — La Barraquita",
    desc: `Cómo pedir, envíos en el día a todo el Uruguay, formas de pago, venta por mayor, precios en dólares y qué ración elegir. La Barraquita, Minas, Lavalleja. WhatsApp ${TEL_WA}.`,
    url: "/preguntas-frecuentes/",
    crumbs: crumbs,
    jsonld: { "@context":"https://schema.org", "@graph":[
      {
        "@type": "FAQPage",
        "@id": SITE + "/preguntas-frecuentes/#faq",
        "isPartOf": { "@id": SITE + "/#sitio" },
        "about": NEGOCIO,
        "mainEntity": FAQ.map(function(f){
          return { "@type":"Question", "name": f.q, "acceptedAnswer": { "@type":"Answer", "text": f.a } };
        })
      },
      breadcrumbLD(crumbs)
    ] },
    body: body
  }));
}

/* ── 8d. Política de cambios y devoluciones ───────────────────────── */
{
  const url = "/politica-de-devoluciones/";
  const crumbs = [ { n:"Inicio", u:"/" }, { n:"Cambios y devoluciones", u:url } ];
  const wa = waHref("Hola La Barraquita! Quiero hacer un cambio o devolución.");
  const body = `
<article class="wrap guia">
  <p class="eyebrow">Ayuda</p>
  <h1 class="display">Política de cambios y devoluciones</h1>
  <p class="lead">Si algo no está bien con tu pedido, lo solucionamos. Tenés <b>${DIAS_DEVOLUCION} días corridos</b> desde que recibís o retirás tu compra para pedir un cambio o la devolución de tu dinero.</p>
  <div class="guia-cuerpo">
    <h2>Plazo</h2>
    <p>Podés pedir el cambio o la devolución dentro de los ${DIAS_DEVOLUCION} días corridos siguientes a la entrega o al retiro en el local. Este plazo incluye el derecho de arrepentimiento que la Ley 17.250 de Defensa del Consumidor da a las compras hechas a distancia (por WhatsApp, teléfono o la web).</p>

    <h2>Qué productos se pueden devolver</h2>
    <ul>
      <li><b>Por arrepentimiento o porque te equivocaste de producto:</b> el producto tiene que estar sin abrir, con la bolsa o el envase original cerrado y en buen estado.</li>
      <li><b>Producto fallado, vencido, dañado en el transporte o distinto al que pediste:</b> lo cambiamos o te devolvemos el dinero, aunque el envase esté abierto. Mandanos una foto del producto y de la etiqueta con el lote y el vencimiento.</li>
    </ul>

    <h2>Qué productos no se pueden devolver</h2>
    <p>Salvo que tengan un defecto, no aceptamos devoluciones de:</p>
    <ul>
      <li>Bolsas de ración, granos o harinas abiertas, o productos fraccionados o vendidos sueltos a pedido.</li>
      <li>Productos de sanidad (pipetas, antiparasitarios, comprimidos y similares) con el envase abierto o el precinto roto, por seguridad de los animales.</li>
    </ul>

    <h2>Cómo pedir un cambio o devolución</h2>
    <ul>
      <li>Escribinos por WhatsApp al <a href="${wa}" target="_blank" rel="noopener">${TEL_WA}</a> o llamanos al 4442 4021, contándonos qué compraste y qué pasó.</li>
      <li>Podés traer el producto al local (Intendente Lois 523, Minas) en nuestro horario, o coordinamos para retirarlo con nuestra flota.</li>
      <li>La devolución no tiene costo para vos: el retiro del producto corre por nuestra cuenta.</li>
    </ul>

    <h2>Reembolso</h2>
    <p>Una vez que recibimos y revisamos el producto, elegís entre cambiarlo por otro o recibir el reembolso total de lo que pagaste, incluido el envío si el problema fue nuestro. El reembolso se hace por el mismo medio de pago: en efectivo en el local, por transferencia bancaria o con la anulación en tu tarjeta de crédito o débito. Lo procesamos dentro de los 7 días hábiles siguientes a recibir el producto; en tarjetas, el crédito puede tardar lo que demore el emisor en reflejarlo.</p>

    <h2>Ventas por mayor</h2>
    <p>Para comercios y establecimientos, los cambios y devoluciones se rigen por esta misma política, salvo que se haya acordado otra cosa por escrito.</p>
  </div>
  <p class="guia-cta">¿Tenés un problema con tu pedido? Escribinos por WhatsApp al <a href="${wa}" target="_blank" rel="noopener"><b>${TEL_WA}</b></a> y lo resolvemos.</p>
</article>
`;
  write("politica-de-devoluciones/index.html", layout({
    title: "Política de cambios y devoluciones | La Barraquita",
    ogTitle: "Cambios y devoluciones — La Barraquita",
    desc: `Tenés ${DIAS_DEVOLUCION} días desde la entrega para cambiar o devolver tu compra en La Barraquita, Minas. Retiro sin costo y reembolso total por el mismo medio de pago. WhatsApp ${TEL_WA}.`,
    url: url,
    crumbs: crumbs,
    jsonld: { "@context":"https://schema.org", "@graph":[
      {
        "@type": "WebPage",
        "@id": SITE + url,
        "url": SITE + url,
        "name": "Política de cambios y devoluciones",
        "isPartOf": { "@id": SITE + "/#sitio" },
        "about": NEGOCIO,
        "mainEntity": { "@id": POLITICA_DEVOLUCION["@id"] }
      },
      POLITICA_DEVOLUCION,
      breadcrumbLD(crumbs)
    ] },
    body: body
  }));
}

/* ── 8c. Guías (Article) ──────────────────────────────────────────── */
GUIAS.forEach(function(g){
  const url = "/guias/" + g.slug + "/";
  const crumbs = [ { n:"Inicio", u:"/" }, { n:"Guías", u:"/guias/" }, { n:g.titulo, u:url } ];
  const otras = GUIAS.filter(function(o){ return o.slug !== g.slug; });
  const body = `
<article class="wrap guia">
  <p class="eyebrow">Guía</p>
  <h1 class="display">${esc(g.titulo)}</h1>
  <p class="lead">${esc(g.desc)}</p>
  <div class="guia-cuerpo">
${g.cuerpo}
  </div>
  <p class="guia-cta">¿Te quedó alguna duda? Escribinos por WhatsApp al <a href="${waHref("Hola La Barraquita! Leí la guía «" + g.titulo + "» y tengo una consulta.")}" target="_blank" rel="noopener"><b>${TEL_WA}</b></a> y te asesoramos.</p>
</article>
${otras.length ? `<section class="wrap bloque">
  <h2 class="display">Otras guías</h2>
  <ul class="guia-lista">
    ${otras.map(function(o){ return `<li><a href="/guias/${o.slug}/"><b>${esc(o.titulo)}</b><span>${esc(o.desc)}</span></a></li>`; }).join("\n    ")}
  </ul>
</section>` : ""}
`;
  write("guias/" + g.slug + "/index.html", layout({
    title: `${g.titulo} | La Barraquita`,
    ogTitle: g.titulo,
    desc: g.desc,
    url: url,
    ogType: "article",
    crumbs: crumbs,
    jsonld: { "@context":"https://schema.org", "@graph":[
      {
        "@type": "Article",
        "@id": SITE + url + "#articulo",
        "headline": g.titulo,
        "description": g.desc,
        "inLanguage": "es-UY",
        "datePublished": g.fecha,
        "dateModified": HOY,
        "author": NEGOCIO,
        "publisher": NEGOCIO,
        "image": SITE + "/img/og-cover.jpg",
        "mainEntityOfPage": SITE + url,
        "isPartOf": { "@id": SITE + "/#sitio" }
      },
      breadcrumbLD(crumbs)
    ] },
    body: body
  }));
});
{
  const crumbs = [ { n:"Inicio", u:"/" }, { n:"Guías", u:"/guias/" } ];
  const body = `
<section class="wrap encabezado">
  <p class="eyebrow">Consejos</p>
  <h1 class="display">Guías para alimentar bien a tus animales</h1>
  <p class="lead">Lo que aprendimos en más de 20 años vendiendo raciones en Minas, explicado simple: cuánto darle, qué línea elegir, cómo alimentar a las gallinas y qué harina usar.</p>
</section>
<section class="wrap bloque">
  <ul class="guia-lista">
    ${GUIAS.map(function(g){ return `<li><a href="/guias/${g.slug}/"><b>${esc(g.titulo)}</b><span>${esc(g.desc)}</span></a></li>`; }).join("\n    ")}
  </ul>
</section>
`;
  write("guias/index.html", layout({
    title: "Guías: cuánta ración dar, qué línea elegir y más | La Barraquita",
    ogTitle: "Guías y consejos — La Barraquita",
    desc: "Guías prácticas de La Barraquita: cuánta ración darle a un perro, qué línea elegir según edad y tamaño, cómo alimentar gallinas ponedoras y qué harina usar para cada preparación.",
    url: "/guias/",
    crumbs: crumbs,
    jsonld: { "@context":"https://schema.org", "@graph":[
      {
        "@type": "CollectionPage",
        "@id": SITE + "/guias/#pagina",
        "name": "Guías y consejos de La Barraquita",
        "isPartOf": { "@id": SITE + "/#sitio" },
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": GUIAS.map(function(g, i){
            return { "@type":"ListItem", "position": i + 1, "url": SITE + "/guias/" + g.slug + "/", "name": g.titulo };
          })
        }
      },
      breadcrumbLD(crumbs)
    ] },
    body: body
  }));
}

/* ── 9. Sitemap ───────────────────────────────────────────────────── */
{
  const urls = [
    { loc:"/", prio:"1.0", freq:"weekly", img:"/img/og-cover.jpg" },
    { loc:"/catalogo/", prio:"0.9", freq:"weekly" },
    ...Object.values(CATS).map(function(c){ return { loc:"/catalogo/" + c.slug + "/", prio:"0.8", freq:"weekly" }; }),
    ...marcas.map(function(m){ return { loc:m.url, prio:"0.7", freq:"weekly" }; }),
    { loc:"/guias/", prio:"0.7", freq:"monthly" },
    ...GUIAS.map(function(g){ return { loc:"/guias/" + g.slug + "/", prio:"0.7", freq:"monthly" }; }),
    { loc:"/preguntas-frecuentes/", prio:"0.7", freq:"monthly" },
    { loc:"/politica-de-devoluciones/", prio:"0.5", freq:"yearly" },
    ...items.map(function(it){ return { loc:it.url, prio:"0.6", freq:"weekly", img:it.img }; })
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(function(u){
  return `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${HOY}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.prio}</priority>${u.img ? `
    <image:image><image:loc>${SITE}${u.img}</image:loc></image:image>` : ""}
  </url>`;
}).join("\n")}
</urlset>
`;
  write("sitemap.xml", xml);
}

/* ── 10. Mapa de rutas para el catálogo dinámico ──────────────────── */
{
  const mapa = {};
  items.forEach(function(it){ mapa[it.id] = it.url; });
  const cats = {};
  Object.keys(CATS).forEach(function(k){ cats[k] = "/catalogo/" + CATS[k].slug + "/"; });
  const js = `/* Generado por tools/build-seo.mjs — no editar a mano.
   Mapa id de producto → URL de su ficha estática, para que las tarjetas
   del catálogo sean enlaces rastreables por Google. */
window.LB_RUTAS = ${JSON.stringify(mapa)};
window.LB_CATS = ${JSON.stringify(cats)};
`;
  write("js/rutas.js", js);
}

/* ── 10b. Enlaces a marcas en el home (entre marcadores) ─────────── */
{
  const idx = path.join(ROOT, "index.html");
  let html = fs.readFileSync(idx, "utf8");
  const nl = html.includes("\r\n") ? "\r\n" : "\n";   // index.html usa CRLF
  const re = /(<!-- marcas:start -->)[\s\S]*?(<!-- marcas:end -->)/;
  if (re.test(html)) {
    const lis = marcas.map(function(m){ return "        <li><a href=\"" + m.url + "\">" + esc(m.nombre) + "</a></li>"; }).join(nl);
    html = html.replace(re, function(_, a, b){ return a + nl + lis + nl + "        " + b; });
    fs.writeFileSync(idx, html);
  } else {
    console.warn("index.html: no se encontraron los marcadores <!-- marcas:start/end -->");
  }
}

/* ── 11. Resumen ──────────────────────────────────────────────────── */
console.log("Fichas de producto : " + items.length);
console.log("Categorías         : " + Object.keys(CATS).length);
console.log("Marcas             : " + marcas.length + " (" + marcas.map(function(m){ return m.nombre + "×" + m.items.length; }).join(", ") + ")");
console.log("Guías              : " + GUIAS.length + " · FAQ: " + FAQ.length + " preguntas");
console.log("URLs en sitemap    : " + (fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").match(/<url>/g) || []).length);
