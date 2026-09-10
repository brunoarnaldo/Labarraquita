/* ─────────────────────────────────────────────────────────────────────
   contenido.mjs — Contenido único por ficha, derivado de los datos.

   Todo lo que sale de acá se calcula a partir de PRODUCTS (js/app.js) y,
   cuando existe, de la ficha técnica cargada en fichas.mjs. La idea es que
   cada producto tenga texto propio sin que nadie lo escriba a mano: precio
   por kilo, cuánto rinde la bolsa, cuánto sale el día de comida y cómo se
   ubica frente al resto del catálogo.

   Regla: si un dato no está verificado, no se inventa. Las cifras estimadas
   se muestran como rango y se avisa que son estimadas.
   ──────────────────────────────────────────────────────────────────── */

/* ── Presentaciones ───────────────────────────────────────────────────
   "20 kg + 3 kg" → 23 kg reales. La bonificación es parte de lo que se
   lleva el cliente, así que cuenta para el precio por kilo. */
export function parsePres(pres){
  const txt = String(pres || "").trim();
  if(!txt) return { tipo: "otro", kg: null, texto: "" };

  const num = (s) => parseFloat(String(s).replace(",", "."));
  const partes = txt.split("+").map((s) => s.trim());
  let kg = 0, litros = 0, unidades = 0, ok = false;

  for(const parte of partes){
    let m;
    if((m = parte.match(/^([\d.,]+)\s*kg$/i)))       { kg += num(m[1]); ok = true; }
    else if((m = parte.match(/^([\d.,]+)\s*g$/i)))   { kg += num(m[1]) / 1000; ok = true; }
    else if((m = parte.match(/^([\d.,]+)\s*l$/i)))   { litros += num(m[1]); ok = true; }
    else if((m = parte.match(/^([\d.,]+)\s*uds?\.?$/i))) { unidades += num(m[1]); ok = true; }
  }
  if(!ok) return { tipo: "otro", kg: null, texto: txt };

  if(kg > 0){
    const base = (() => { const m = partes[0].match(/^([\d.,]+)\s*kg$/i); return m ? num(m[1]) : kg; })();
    return { tipo: "peso", kg, base, bonus: +(kg - base).toFixed(3), texto: txt };
  }
  if(litros > 0) return { tipo: "volumen", litros, kg: null, texto: txt };
  return { tipo: "unidades", unidades, kg: null, texto: txt };
}

/* ── Formato ──────────────────────────────────────────────────────── */
const nf = (n, d = 0) => n.toLocaleString("es-UY", { minimumFractionDigits: d, maximumFractionDigits: d });
export function money(valor, cur, dec){
  const d = dec !== undefined ? dec : (cur === "USD" ? 2 : 0);
  return (cur === "USD" ? "US$ " : "$ ") + nf(valor, d);
}
const kgTxt = (n) => nf(n, Number.isInteger(n) ? 0 : 1) + " kg";

/* ── Precio por unidad de medida ─────────────────────────────────── */
export function precioUnitario(it){
  if(it.price === null || it.price === undefined) return null;
  const p = parsePres(it.pres);
  if(p.tipo === "peso" && p.kg > 0)
    return { valor: it.price / p.kg, unidad: "kilo", abrev: "kg", cantidad: p.kg, pres: p };
  if(p.tipo === "volumen" && p.litros > 0)
    return { valor: it.price / p.litros, unidad: "litro", abrev: "L", cantidad: p.litros, pres: p };
  if(p.tipo === "unidades" && p.unidades > 0)
    return { valor: it.price / p.unidades, unidad: "unidad", abrev: "u.", cantidad: p.unidades, pres: p };
  return null;
}

/* ── Requerimiento energético ─────────────────────────────────────────
   Perros: MER ≈ 110 × peso^0,75 kcal/día (adulto de actividad normal).
   Gatos:  MER ≈ 65 × peso corporal kcal/día.
   Son las fórmulas estándar de mantenimiento; el resultado se muestra
   siempre como rango porque cada animal varía. */
const FACTOR = {
  adulto:   1.00,
  cachorro: 1.60,   // crecimiento
  senior:   0.90,
  light:    0.85    // planes de reducción de peso
};

function etapa(nombre){
  const n = nombre.toLowerCase();
  if(/cachorro|baby|puppy|junior/.test(n)) return "cachorro";
  if(/senior/.test(n)) return "senior";
  if(/light/.test(n)) return "light";
  return "adulto";
}

/* kcal/kg de referencia cuando el fabricante no la declara. */
const EM_DEFECTO = { gato: 3900, perro: 3500 };

export function racion(it, ficha){
  if(it.cat !== "perro" && it.cat !== "gato") return null;
  if(/sanitaria/i.test(it.name)) return null;
  const pu = precioUnitario(it);
  if(!pu || pu.unidad !== "kilo") return null;

  const em = ficha?.analisis?.em || EM_DEFECTO[it.cat];
  const emEstimada = !ficha?.analisis?.em;
  const f = FACTOR[etapa(it.name)];
  const pesos = it.cat === "gato" ? [3, 4, 5, 6] : [5, 10, 20, 30, 40];

  const filas = pesos.map(function(kgAnimal){
    const kcal = (it.cat === "gato" ? 65 * kgAnimal : 110 * Math.pow(kgAnimal, 0.75)) * f;
    const g = kcal / (em / 1000);                       // gramos por día
    const min = Math.round(g * 0.90 / 5) * 5;
    const max = Math.round(g * 1.10 / 5) * 5;
    const dias = Math.floor(pu.cantidad * 1000 / g);    // duración de la bolsa
    return {
      animal: kgAnimal,
      gramos: `${min}–${max} g`,
      dias,
      costoDia: money(pu.valor * (g / 1000), it.cur, it.cur === "USD" ? 2 : 0)
    };
  });

  return { filas, em, emEstimada, etapa: etapa(it.name), esGato: it.cat === "gato" };
}

/* ── Comparación entre presentaciones de la misma línea ──────────── */
export function comparaPresentaciones(it, hermanos){
  const mio = precioUnitario(it);
  if(!mio || hermanos.length === 0) return null;

  const otros = hermanos
    .map((h) => ({ it: h, pu: precioUnitario(h) }))
    .filter((h) => h.pu && h.pu.unidad === mio.unidad && h.it.cur === it.cur);
  if(otros.length === 0) return null;

  const todos = [...otros, { it, pu: mio }].sort((a, b) => a.pu.valor - b.pu.valor);
  const barata = todos[0];
  const soyLaMasBarata = barata.it.id === it.id;
  const dif = soyLaMasBarata
    ? Math.round((todos[todos.length - 1].pu.valor / mio.valor - 1) * 100)
    : Math.round((mio.valor / barata.pu.valor - 1) * 100);

  return { todos, soyLaMasBarata, dif, barata, unidad: mio.unidad };
}

/* ── Posición por precio dentro de la categoría ──────────────────── */
export function posicionPrecio(it, categoria){
  const mio = precioUnitario(it);
  if(!mio) return null;
  /* Las piedras sanitarias no se comparan contra el alimento de gatos. */
  const esPiedra = (o) => /sanitaria/i.test(o.name);
  const pares = categoria
    .filter((o) => o.cur === it.cur && esPiedra(o) === esPiedra(it))
    .map((o) => ({ o, pu: precioUnitario(o) }))
    .filter((x) => x.pu && x.pu.unidad === mio.unidad)
    .sort((a, b) => a.pu.valor - b.pu.valor);
  if(pares.length < 4) return null;

  const idx = pares.findIndex((x) => x.o.id === it.id);
  if(idx < 0) return null;
  const mediana = pares[Math.floor(pares.length / 2)].pu.valor;
  return {
    puesto: idx + 1,
    total: pares.length,
    mediana,
    porDebajo: mio.valor < mediana,
    dif: Math.abs(Math.round((mio.valor / mediana - 1) * 100)),
    unidad: mio.unidad
  };
}

/* ── Bloques HTML ─────────────────────────────────────────────────── */
const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

export function bloquePrecio(it, hermanos){
  const pu = precioUnitario(it);
  if(!pu) return "";
  const p = pu.pres;
  const comp = comparaPresentaciones(it, hermanos);

  const filas = [];
  if(p.tipo === "peso"){
    filas.push(["Contenido total", kgTxt(p.kg) + (p.bonus > 0 ? ` (${kgTxt(p.base)} + ${kgTxt(p.bonus)} de regalo)` : "")]);
  }
  filas.push(["Precio", money(it.price, it.cur)]);
  filas.push([`Precio por ${pu.unidad}`, `<b>${money(pu.valor, it.cur, it.cur === "USD" ? 2 : 0)}</b>`]);
  if(p.bonus > 0){
    const sinBonus = it.price / p.base;
    const ahorro = Math.round((1 - pu.valor / sinBonus) * 100);
    if(ahorro >= 1) filas.push(["Ahorro por la bonificación", `${ahorro} % menos por kilo`]);
  }

  return `
<section class="wrap bloque" id="precio">
  <h2 class="display">Precio por ${pu.unidad} de ${esc(it.name)}${it.pres ? " " + esc(it.pres) : ""}</h2>
  <table class="tabla">
    <tbody>
      ${filas.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join("\n      ")}
    </tbody>
  </table>
  ${comp ? `<p>${comp.todos.length > 1 ? presentacionesTexto(it, comp) : ""}</p>` : ""}
</section>`;
}

function presentacionesTexto(it, comp){
  const lista = comp.todos.map((x) =>
    `<a href="${x.it.url}">${esc(x.it.pres || x.it.titulo)}</a> a ${money(x.pu.valor, x.it.cur, x.it.cur === "USD" ? 2 : 0)} por ${comp.unidad}`
  ).join(", ");
  const cierre = comp.soyLaMasBarata
    ? `Esta presentación es la que <b>mejor rinde</b>: hasta ${comp.dif} % más barata por ${comp.unidad} que la más chica.`
    : `La presentación de <a href="${comp.barata.it.url}">${esc(comp.barata.it.pres)}</a> te sale <b>${comp.dif} % más barata por ${comp.unidad}</b>; esta conviene si preferís comprar de a poco o no tenés dónde guardar la bolsa grande.`;
  return `Tenemos ${esc(it.name)} en ${comp.todos.length} presentaciones: ${lista}. ${cierre}`;
}

export function bloqueRacion(it, ficha){
  const r = racion(it, ficha);
  if(!r) return "";
  const animal = r.esGato ? "gato" : "perro";
  const etiqueta = { cachorro: "cachorro", senior: "perro senior", light: "perro en plan de descenso", adulto: `${animal} adulto` }[r.etapa];

  return `
<section class="wrap bloque" id="racion">
  <h2 class="display">Cuánto rinde y cuánto sale el día</h2>
  <p>Para un <b>${etiqueta}</b> de actividad normal, esto es lo que aporta ${esc(it.name)}${it.pres ? " de " + esc(it.pres) : ""}:</p>
  <div class="tabla-scroll">
    <table class="tabla tabla-racion">
      <thead>
        <tr><th>Peso del ${animal}</th><th>Ración por día</th><th>Dura</th><th>Costo por día</th></tr>
      </thead>
      <tbody>
        ${r.filas.map((f) => `<tr><td>${f.animal} kg</td><td>${f.gramos}</td><td>${f.dias} días</td><td>${f.costoDia}</td></tr>`).join("\n        ")}
      </tbody>
    </table>
  </div>
  <p class="nota-calculo">Cálculo orientativo sobre el requerimiento energético de mantenimiento (${r.esGato ? "65 kcal por kilo de peso" : "110 × peso^0,75 kcal por día"})${r.etapa !== "adulto" ? ` ajustado para ${etiqueta}` : ""} y una energía metabolizable de <b>${nf(r.em)} kcal/kg</b>${r.emEstimada ? ", valor típico de referencia para este tipo de alimento" : " declarada por el fabricante"}. Cada animal es distinto: la cantidad exacta está en la tabla del envase y conviene ajustarla según la condición corporal.</p>
</section>`;
}

export function bloqueFichaTecnica(ficha){
  if(!ficha?.analisis) return "";
  const a = ficha.analisis;
  const filas = [
    ["Proteína cruda", a.proteina, "% mín."],
    ["Grasa (extracto etéreo)", a.grasa, "% mín."],
    ["Fibra cruda", a.fibra, "% máx."],
    ["Humedad", a.humedad, "% máx."],
    ["Cenizas / materia mineral", a.cenizas, "% máx."],
    ["Calcio", a.calcio, "%"],
    ["Fósforo", a.fosforo, "%"],
    ["Energía metabolizable", a.em, "kcal/kg"]
  ].filter(([, v]) => v !== undefined && v !== null);
  if(filas.length === 0) return "";

  return `
<section class="wrap bloque" id="analisis">
  <h2 class="display">Análisis garantizado</h2>
  <table class="tabla">
    <tbody>
      ${filas.map(([k, v, u]) => `<tr><th scope="row">${k}</th><td>${typeof v === "number" ? nf(v, Number.isInteger(v) ? 0 : 1) : esc(v)} ${u}</td></tr>`).join("\n      ")}
    </tbody>
  </table>
  ${ficha.ingredientes ? `<h3>Ingredientes</h3><p>${esc(ficha.ingredientes)}</p>` : ""}
  ${ficha.fuente ? `<p class="nota-calculo">Datos declarados por el fabricante${ficha.fuente.url ? ` · <a href="${esc(ficha.fuente.url)}" rel="nofollow noopener" target="_blank">${esc(ficha.fuente.nombre)}</a>` : ` (${esc(ficha.fuente.nombre)})`}. Las formulaciones pueden cambiar: el envase manda.</p>` : ""}
</section>`;
}

export function bloqueComparativa(it, categoria, catLabel){
  const pos = posicionPrecio(it, categoria);
  if(!pos) return "";
  /* Solo se muestra cuando el producto está por debajo de la mediana: avisarle
     al cliente que lo que está mirando es de los caros no ayuda a nadie, y para
     Google no aporta nada que no diga ya la tabla de precio por kilo. */
  if(!pos.porDebajo) return "";

  const que = /sanitaria/i.test(it.name) ? "piedras sanitarias" : `opciones de ${catLabel.toLowerCase()}`;
  const med = money(pos.mediana, it.cur, it.cur === "USD" ? 2 : 0);
  return `<p class="nota-comparativa">${esc(it.name)} es la <b>${pos.puesto}.ª más económica por ${pos.unidad}</b> de las ${pos.total} ${que} que tenemos, <b>${pos.dif} % por debajo</b> de la mediana del rubro (${med} por ${pos.unidad}).</p>`;
}

/* ── Familias por franja de peso ──────────────────────────────────────
   Los antiparasitarios se venden por rango de peso del animal ("Simparica
   Trio (10–20 kg)"). Cada ficha muestra la familia completa para que el
   cliente elija la que le corresponde sin volver al catálogo. */
export const familiaDe = (nombre) => String(nombre).replace(/\s*\([^)]*\)\s*/g, " ").trim();

export function bloqueVariantes(it, familia){
  const otras = familia.filter((o) => o.id !== it.id);
  if(otras.length === 0) return "";
  const banda = (n) => { const m = String(n).match(/\(([^)]*)\)/); return m ? m[1] : n; };
  const mia = banda(it.name);
  const todas = [...familia].sort((a, b) => (parseFloat(banda(a.name)) || 0) - (parseFloat(banda(b.name)) || 0));

  return `
<section class="wrap bloque" id="variantes">
  <h2 class="display">Elegí la presentación según el peso de tu perro</h2>
  <p>${esc(familiaDe(it.name))} se dosifica por peso: esta caja es la de <b>${esc(mia)}</b>. Si tu perro está fuera de ese rango, la que te sirve es otra:</p>
  <table class="tabla">
    <tbody>
      ${todas.map((o) => `<tr><th scope="row">${esc(banda(o.name))}</th><td>${o.id === it.id ? `<b>esta presentación</b> — ${esc(o.precio)}` : `<a href="${o.url}">ver ficha</a> — ${esc(o.precio)}`}</td></tr>`).join("\n      ")}
    </tbody>
  </table>
  <p class="nota-calculo">Pesá al perro antes de comprar: dar una franja que no corresponde deja al animal sub o sobredosificado. Ante la duda, consultá con tu veterinario.</p>
</section>`;
}

/* ── Preguntas frecuentes por producto ────────────────────────────────
   Se arman con los mismos números de la tabla, así que la respuesta que
   ve el usuario y la que ve Google son la misma. */
export function faqProducto(it, ficha, hermanos){
  const preguntas = [];
  const pu = precioUnitario(it);
  const r = racion(it, ficha);

  if(pu) preguntas.push({
    q: `¿Cuánto sale el ${pu.unidad} de ${it.name}${it.pres ? " " + it.pres : ""}?`,
    a: `La presentación de ${it.pres} sale ${money(it.price, it.cur)}, o sea ${money(pu.valor, it.cur, it.cur === "USD" ? 2 : 0)} por ${pu.unidad}. Es precio de referencia: confirmá el valor del día por WhatsApp.`
  });

  /* Una sola pregunta sobre rendimiento: la de "cuánta comida por día" queda
     respondida por la tabla de ración que está justo arriba. */
  if(r){
    const ref = r.esGato ? r.filas[1] : r.filas[2];
    const animal = r.esGato ? "gato" : "perro";
    preguntas.push({
      q: `¿Cuánto dura una bolsa de ${it.name} de ${it.pres} para un ${animal} de ${ref.animal} kg?`,
      a: `Alrededor de ${ref.dias} días, dando ${ref.gramos} por día, que es la ración de mantenimiento orientativa para un ${animal} de ${ref.animal} kg. El costo diario ronda los ${ref.costoDia}.`
    });
  }

  const comp = comparaPresentaciones(it, hermanos);
  if(comp && !comp.soyLaMasBarata) preguntas.push({
    q: `¿Conviene más la bolsa grande de ${it.name}?`,
    a: `Sí: la presentación de ${comp.barata.it.pres} rinde ${comp.dif} % más barata por ${comp.unidad}. Esta de ${it.pres} conviene si comprás de a poco o no tenés lugar para guardar la bolsa grande.`
  });

  /* Nada de preguntas genéricas de envío: eran idénticas en las 104 fichas y
     ya están respondidas en /preguntas-frecuentes/. */
  return preguntas;
}

export function bloqueFaq(preguntas, nombre){
  if(!preguntas.length) return "";
  return `
<section class="wrap bloque" id="faq">
  <h2 class="display">Preguntas frecuentes sobre ${esc(nombre)}</h2>
  <dl class="faq-prod">
    ${preguntas.map((p) => `<dt>${esc(p.q)}</dt>\n    <dd>${esc(p.a)}</dd>`).join("\n    ")}
  </dl>
</section>`;
}
