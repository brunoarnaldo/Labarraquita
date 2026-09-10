/* ─────────────────────────────────────────────────────────────────────
   fichas.mjs — Datos técnicos verificados, por línea de producto.

   Una entrada por FÓRMULA, no por bolsa: Connie Adultos de 8 kg y de 25 kg
   son el mismo alimento, así que comparten ficha. El campo `ids` lista los
   SKU de js/app.js que usan esa fórmula.

   REGLA IMPORTANTE — no se carga nada sin fuente. Todas las cifras de acá
   salen de la web del fabricante o del distribuidor oficial, y la URL queda
   guardada en `fuente` para poder auditarla. Un producto sin entrada
   simplemente no muestra el bloque de análisis garantizado: la ficha sigue
   funcionando con el resto del contenido calculado.

   Campos de `analisis` (todos opcionales):
     proteina, grasa, fibra, humedad, cenizas  → número, en %
     calcio, fosforo                           → texto, admite rangos
     em                                        → número, kcal/kg
   `em` alimenta el cálculo de ración; si falta se usa un valor de
   referencia y la ficha lo aclara.
   ──────────────────────────────────────────────────────────────────── */

export default {

  "connie-adultos": {
    ids: ["p01", "p02"],
    analisis: { proteina: 22, grasa: 10, fibra: 3, humedad: 10, cenizas: 8, calcio: "1,0–1,6", fosforo: "0,7–1,3", em: 3500 },
    fuente: { nombre: "Agrofeed, fabricante", url: "https://www.agrofeed.com.uy/web_connie_adultos.html" }
  },

  "criolla-adultos": {
    ids: ["p05", "p06"],
    analisis: { proteina: 18, grasa: 4, fibra: 5, humedad: 11, cenizas: 10, calcio: "1,0–2,0", fosforo: "0,8–1,5" },
    ingredientes: "Harina de carne y hueso, harina de soja Hi-Pro, maíz, trigo, grasa animal estabilizada, afrechillo de trigo, arroz quebrado, pulpa de remolacha, zeolita, extracto de yucca, vísceras hidrolizadas de cerdo y ave, aceite vegetal, lisina, metionina, minerales y premezcla vitamínica (A, D3, E, K3 y complejo B) con probióticos.",
    fuente: { nombre: "Raval, fabricante", url: "https://raval.com.uy/producto/criolla-perro-adulto/" }
  },

  "criolla-cachorros": {
    ids: ["p07"],
    analisis: { proteina: 25, grasa: 9, fibra: 4, humedad: 10, cenizas: 10, calcio: "1,0–2,0", fosforo: "0,6–1,0" },
    ingredientes: "Harina de carne y hueso, harina de pescado, gluten meal, harina de soja Hi-Pro, arroz, maíz, trigo, grasas estabilizadas, complejo vitamínico y mineral con probióticos y prebióticos.",
    fuente: { nombre: "Raval, fabricante", url: "https://raval.com.uy/producto/criolla-perro-cachorro/" }
  },

  "oriunda-adultos": {
    ids: ["p19", "p20"],
    analisis: { proteina: 18, grasa: 4, fibra: 5, humedad: 11, cenizas: 10, calcio: "1,0–2,0", fosforo: "0,8–1,5" },
    ingredientes: "Harina de carne y hueso, harina de soja Hi-Pro, maíz, trigo, grasa animal estabilizada, afrechillo de trigo, arroz quebrado, con probióticos, antioxidantes, antifúngicos y complejo vitamínico-mineral (A, D3, E, K3, grupo B, zinc, cobre, hierro y selenio).",
    fuente: { nombre: "Remiplat, distribuidor oficial", url: "https://remiplat.com.uy/producto/oriunda/" }
  },

  "bravo-original": {
    ids: ["p30"],
    analisis: { proteina: 21, grasa: 9, fibra: 3.5 },
    fuente: { nombre: "Remiplat, distribuidor oficial", url: "https://remiplat.com.uy/producto/bravo-original/" }
  },

  "bravo-baby": {
    ids: ["p27", "p28"],
    analisis: { proteina: 29, em: 3699 },
    fuente: { nombre: "Remiplat, distribuidor oficial", url: "https://remiplat.com.uy/producto/bravo-baby/" }
  },

  /* Frost Castrados 7,5 kg = Frost Cat Indoor Sterilized, misma bolsa de
     7,5 kg con 1 kg de bonificación. */
  "frost-castrados": {
    ids: ["g02"],
    analisis: { proteina: 35, grasa: 12, fibra: 4, humedad: 10, cenizas: 8, calcio: "0,8–1,2", fosforo: "0,8 mín." },
    ingredientes: "Harina de vísceras de aves, harina de salmón, harina de pescados, plasma sanguíneo deshidratado de cerdo, harina de chicharrón, huevo integral, hidrolizado de hígado de cerdo, arroz integral, harina de trigo, con L-carnitina, bisulfato de sodio, fibra de arveja y antioxidantes naturales (romero, té verde y menta).",
    fuente: { nombre: "Club Pets Uruguay", url: "https://clubpets.uy/producto/frost-cat-indoor-sterilized-gatos-castrados/" }
  }

};
