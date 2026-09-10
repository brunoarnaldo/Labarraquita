(function(){
  "use strict";
  // ⚠ Número de demo: reemplazar por el WhatsApp real del negocio.
  var WA = "59892109806";
  /* ── Ofertas del mes ──
     Cada oferta es un slide del carrusel y se toca para pedirla por WhatsApp.
     Para cambiar las promos del mes: reemplazar las imágenes (3:4, 1200 × 1600) y el texto de "msg". */
  var OFERTAS = [
    {
      img: "img/ofertas/nhock-premium-25-10.jpg",
      alt: "Nhock Premium para perros adultos: 25 kg + 10 kg a $ 1855",
      msg: "Nhock Premium perros adultos — 25 kg + 10 kg por $ 1855"
    },
    {
      img: "img/ofertas/combo-oriunda-20-2-7.jpg",
      alt: "Combo Oriunda para perros adultos: 20 kg + 2 kg de regalo + 7 kg a $ 1205",
      msg: "Combo Oriunda perros adultos — 20 kg + 2 kg de regalo + 7 kg por $ 1205"
    },
    {
      img: "img/ofertas/bravo-baby-10-1.jpg",
      alt: "Bravo Baby leche y cereales: 10 kg + 1 kg de regalo a $ 1200",
      msg: "Bravo Baby leche y cereales — 10 kg + 1 kg de regalo por $ 1200"
    },
    {
      img: "img/ofertas/le-roy-gatos-castrados-10-1.jpg",
      alt: "Le Roy Grillé de Carnes para gatos castrados: 10,1 kg + 1 kg de regalo a $ 1255",
      msg: "Le Roy Premium Grillé de Carnes gatos castrados — 10,1 kg + 1 kg de regalo por $ 1255"
    },
    {
      img: "img/ofertas/le-roy-gatos-castrados-20kg.jpg",
      alt: "Ofertón Le Roy Grillé de Carnes para gatos castrados: 20 kg a $ 2288",
      msg: "Le Roy Premium Grillé de Carnes gatos castrados — 20 kg por $ 2288"
    },
    {
      img: "img/ofertas/oriunda-7kg-comerciantes.jpg",
      alt: "Oriunda Adultos 7 kg para comerciantes: llevando 5 bolsas, $ 270 cada una",
      msg: "Oriunda Adultos 7 kg — 5 bolsas a $ 270 cada una (precio comerciantes)"
    },
    {
      img: "img/ofertas/100-nutricion.jpg",
      alt: "100 % nutrición para tu mascota: hacé tu pedido",
      msg: null
    }
  ];

  var ICONS = {
    perro:  '<svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 20c0-6 4-10 10-10s10 4 10 10v4c0 7-4 12-10 12s-10-5-10-12z"/><path d="M14 18l-5-6 2 10"/><path d="M34 18l5-6-2 10"/><circle cx="20" cy="22" r="1" fill="currentColor"/><circle cx="28" cy="22" r="1" fill="currentColor"/><ellipse cx="24" cy="26.5" rx="1.8" ry="1.2" fill="currentColor"/></svg>',
    gato:   '<svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 22c0-2 .5-4 1.5-5.5L13 8l7 4c1.2-.4 2.6-.6 4-.6s2.8.2 4 .6l7-4-2.5 8.5C33.5 18 34 20 34 22v4c0 6.5-4.5 10-10 10s-10-3.5-10-10z"/><circle cx="20" cy="23" r="1" fill="currentColor"/><circle cx="28" cy="23" r="1" fill="currentColor"/><path d="M24 27.5v1.5"/></svg>',
    granja: '<svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6l14 7v5H10v-5z"/><path d="M12 18v18h24V18"/><path d="M20 36V26h8v10"/></svg>',
    granos: '<svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6v34"/><path d="M24 14c-3-3-7-3-9-2 1 3 4 6 9 6m0-4c3-3 7-3 9-2-1 3-4 6-9 6m0 4c-3-3-7-3-9-2 1 3 4 6 9 6m0-4c3-3 7-3 9-2-1 3-4 6-9 6"/></svg>',
    cuidado:'<svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6l13 5v8c0 8-5.5 15-13 18-7.5-3-13-10-13-18v-8z"/><path d="M24 17v10M19 22h10"/></svg>',
    harina: '<svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14h20l-2 26H16z"/><path d="M14 14l3-6h14l3 6"/><path d="M20 22h8M19 30h10"/></svg>'
  };

  /* Iconos chicos para las pestañas de categoría */
  function ti(paths){
    return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      paths.map(function(d){ return '<path d="' + d + '"/>'; }).join("") + '</svg>';
  }
  var TAB_ICONS = {
    perro:   ti(["M10 5.2 8 4C6 4 4.5 5.5 4 8l1 6-1 4h3l1-3h6l1 3h3l-1-6c.5-3-1-6-4-7l-2 1.2a3 3 0 0 1-2 0Z"]),
    gato:    ti(["M4 20v-7l-2-6 4 3h8l4-3-2 6v7","M8 15h.01","M14 15h.01"]),
    granja:  ti(["M3 21V10l9-6 9 6v11","M9 21v-6h6v6"]),
    granos:  ti(["M12 3v18","M12 7c-3-1-5-3-5-3s0 4 5 4Z","M12 7c3-1 5-3 5-3s0 4-5 4Z","M12 13c-3-1-5-3-5-3s0 4 5 4Z","M12 13c3-1 5-3 5-3s0 4-5 4Z"]),
    cuidado: ti(["M12 21s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.7-7 10-7 10Z","M12 8v6","M9 11h6"]),
    harina:  ti(["M6 3h12l-1 4H7Z","M7 7l-2 14h14L17 7"])
  };

  var CATS = [
    {id:"todos", label:"Todos"},
    {id:"perro", label:"Perros"},
    {id:"gato", label:"Gatos"},
    {id:"granja", label:"Granja"},
    {id:"granos", label:"Granos"},
    {id:"cuidado", label:"Sanidad"},
    {id:"harina", label:"Harinas"}
  ];

  var IMGS = {"g01": "img/web/atacama-castrados.jpg", "g02": "img/web/frost-castrados.jpg", "g03": "img/web/famil-premium-gatos.jpg", "g05": "img/web/le-roy-premium-carne.jpg", "g06": "img/web/le-roy-premium.jpg", "g07": "img/web/hiprot-cat-premium.jpg", "g08": "img/web/macanudo-cat.jpg", "g09": "img/web/connie-gatos.jpg", "g11": "img/web/criolla-gatos.jpg", "g12": "img/web/equilibrio-gatos.jpg", "g13": "img/web/monkcat-piedra-sanitaria.jpg", "g14": "img/web/stonecat-piedra-sanitaria.jpg", "g15": "img/web/connie-piedra-sanitaria.jpg", "g16": "img/web/trigato-piedra-sanitaria.jpg", "g17": "img/web/the-best-piedra-sanitaria.jpg", "g18": "img/web/sepicat-piedra-sanitaria.jpg", "p01": "img/web/connie-adultos.jpg", "p04": "img/web/prot-adultos.jpg", "p05": "img/web/criolla-adultos.jpg", "p06": "img/web/criolla-adultos-p06.jpg", "p07": "img/web/criolla-cachorros.jpg", "p08": "img/web/old-prince-adulto.jpg", "p09": "img/web/nhock-premium.jpg", "p10": "img/web/nhock-premium-p10.jpg", "p11": "img/web/atacama-adultos.jpg", "p12": "img/web/macanudo.jpg", "p13": "img/web/astro-razas-pequenas.jpg", "p14": "img/web/astro-razas-pequenas-p14.jpg", "p15": "img/web/astro-senior.jpg", "p16": "img/web/astro-senior-p16.jpg", "p17": "img/web/astro-adultos.jpg", "p19": "img/web/oriunda-adultos.jpg", "p20": "img/web/oriunda-adultos-p20.jpg", "p21": "img/web/bandido-s.jpg", "p22": "img/web/fridy.jpg", "p23": "img/web/hiport-dog-adultos.jpg", "p24": "img/web/hiport-dog-adultos-p24.jpg", "p25": "img/web/bravo-light.jpg", "p26": "img/web/bravo-light-p26.jpg", "p27": "img/web/bravo-baby.jpg", "p28": "img/web/bravo-baby-p28.jpg", "p29": "img/web/bravo-razas-pequenas.jpg", "p30": "img/web/bravo-original.jpg", "p31": "img/web/famil-premium-perros.jpg", "p32": "img/web/nero-original.jpg", "p33": "img/web/frost-light-razas-pequenas.jpg", "p34": "img/web/frost-razas-pequenas.jpg", "p35": "img/web/frost-razas-pequenas-p35.jpg", "p36": "img/web/frost-razas-grandes.jpg", "p37": "img/web/frost-cachorros.jpg", "p38": "img/web/pedigree-adulto.jpg", "p39": "img/web/gran-plus.jpg", "p40": "img/web/equilibrio-razas-pequenas.jpg", "p41": "img/web/equilibrio-razas-medianas.jpg", "p42": "img/web/equilibrio-razas-medianas-p42.jpg", "p43": "img/web/natural-dog.jpg", "p44": "img/web/lager-adultos.jpg", "p45": "img/web/primocao.jpg", "p46": "img/web/dogui-adultos.jpg", "p47": "img/web/charrua-adultos.jpg", "p48": "img/web/the-golden-choice.jpg", "p49": "img/web/rex-adultos.jpg", "f01": "img/web/ponedora-granulada-fase-1.jpg", "f02": "img/web/ponedora-molida-fase-2.jpg", "f03": "img/web/ponedora-granulada-fase-2.jpg", "f04": "img/web/ponedora-recria.jpg", "f05": "img/web/pollito-bebe.jpg", "f06": "img/web/pollo-terminacion.jpg", "f07": "img/web/mantenimiento-vacunos.jpg", "f08": "img/web/terneros.jpg", "f09": "img/web/cerdos-engorde.jpg", "f10": "img/web/lechones.jpg", "f11": "img/web/cerdas-gestantes-y-lactantes.jpg", "f12": "img/web/ovinos.jpg", "f13": "img/web/conejos.jpg", "s01": "img/web/arroz.jpg", "s02": "img/web/maiz-entero.jpg", "s03": "img/web/maiz-quebrado.jpg", "s04": "img/web/avena-para-caballos.jpg", "f14": "img/web/suplemento-proteico.jpg", "f15": "img/web/suplemento-vitaminico.jpg", "c01": "img/web/antiparasitario-pipeta.jpg", "c02": "img/web/simparica-trio-510-kg.jpg", "c03": "img/web/simparica-trio-2040-kg.jpg", "c04": "img/web/simparica-trio-1020-kg.jpg", "c05": "img/web/simparica-trio-4060-kg.jpg", "c06": "img/web/finn-gel-veneno-para-cucarachas.jpg", "c07": "img/web/antiparasitario-interno-y-externo.jpg", "c08": "img/web/veneno-hormigas-granulado.jpg", "c09": "img/web/veneno-hormigas-en-polvo.jpg", "c10": "img/web/auxiliar-educativo.jpg", "c11": "img/web/mata-pulgas-y-garrapatas.jpg", "h01": "img/web/harina-de-trigo.jpg", "h02": "img/web/harina-de-trigo-0000.jpg", "h03": "img/web/harina-de-trigo-000.jpg", "h04": "img/web/harina-de-trigo-00.jpg", "h05": "img/web/harina-de-trigo-integral.jpg", "h06": "img/web/harina-uruguay-0000-pack.jpg", "g04": "img/web/le-roy-premium-gato.jpg", "g10": "img/web/prot-gatos.jpg", "p02": "img/web/connie-adultos-25kg.jpg", "p03": "img/web/prot-adultos-8kg.jpg", "p18": "img/web/falucho.jpg", "h07": "img/web/harina-primor-0000-pack.jpg", "g19": "img/web/golden-gatos-castrados.jpg", "g20": "img/web/premier-gatos-castrados.jpg", "p50": "img/web/golden-special-adultos.jpg", "p51": "img/web/golden-senior.jpg", "p52": "img/web/vagoneta-adultos.jpg", "p53": "img/web/estampa-criadores.jpg"};

  var PRODUCTS = [{"id": "g01", "cat": "gato", "name": "Atacama Castrados", "pres": "10 kg", "price": 1785, "cur": "UYU", "img": "g01"}, {"id": "g02", "cat": "gato", "name": "Frost Castrados", "pres": "7,5 kg + 1 kg", "price": 2340, "cur": "UYU", "img": "g02"}, {"id": "g03", "cat": "gato", "name": "Fámil Premium Gatos", "pres": "10 kg + 1 kg", "price": 1450, "cur": "UYU", "img": "g03"}, {"id": "g04", "cat": "gato", "name": "Le Roy Premium", "pres": "10,1 kg", "price": 1470, "cur": "UYU", "img": "g04"}, {"id": "g05", "cat": "gato", "name": "Le Roy Premium Carne", "pres": "10,1 kg", "price": 2540, "cur": "UYU", "img": "g05"}, {"id": "g06", "cat": "gato", "name": "Le Roy Premium", "pres": "10,1 kg + 1 kg", "price": 1470, "cur": "UYU", "img": "g06"}, {"id": "g07", "cat": "gato", "name": "Hiprot Cat Premium", "pres": "5 kg", "price": 590, "cur": "UYU", "img": "g07"}, {"id": "g08", "cat": "gato", "name": "Macanudo Cat", "pres": "5 kg", "price": 470, "cur": "UYU", "img": "g08"}, {"id": "g09", "cat": "gato", "name": "Connie Gatos", "pres": "9 kg", "price": 975, "cur": "UYU", "img": "g09"}, {"id": "g10", "cat": "gato", "name": "Prot Gatos", "pres": "8 kg", "price": 690, "cur": "UYU", "img": "g10"}, {"id": "g11", "cat": "gato", "name": "Criolla Gatos", "pres": "7 kg", "price": 620, "cur": "UYU", "img": "g11"}, {"id": "g12", "cat": "gato", "name": "Equilibrio Gatos", "pres": "7 kg + 750 g", "price": 2147, "cur": "UYU", "img": "g12"}, {"id": "g13", "cat": "gato", "name": "Monkcat Piedra Sanitaria", "pres": "4 kg", "price": 190, "cur": "UYU", "img": "g13"}, {"id": "g14", "cat": "gato", "name": "Stonecat Piedra Sanitaria", "pres": "4 kg", "price": 350, "cur": "UYU", "img": "g14"}, {"id": "g15", "cat": "gato", "name": "Connie Piedra Sanitaria", "pres": "3.8 L", "price": 297, "cur": "UYU", "img": "g15"}, {"id": "g16", "cat": "gato", "name": "Trigato Piedra Sanitaria", "pres": "2.5 kg", "price": 406, "cur": "UYU", "img": "g16"}, {"id": "g17", "cat": "gato", "name": "The Best Piedra Sanitaria", "pres": "1.8 kg", "price": 102, "cur": "UYU", "img": "g17"}, {"id": "g18", "cat": "gato", "name": "Sepicat Piedra Sanitaria", "pres": "6 kg", "price": 490, "cur": "UYU", "img": "g18"}, {"id": "g19", "cat": "gato", "name": "Golden Gatos Castrados", "pres": "10,1 kg", "price": 1930, "cur": "UYU", "img": "g19"}, {"id": "g20", "cat": "gato", "name": "Premier Gatos Castrados", "pres": "7,5 kg", "price": 1783, "cur": "UYU", "img": "g20"}, {"id": "p01", "cat": "perro", "name": "Connie Adultos", "pres": "8 kg", "price": 670, "cur": "UYU", "img": "p01"}, {"id": "p02", "cat": "perro", "name": "Connie Adultos", "pres": "25 kg", "price": 1580, "cur": "UYU", "img": "p02"}, {"id": "p03", "cat": "perro", "name": "Prot Adultos", "pres": "8 kg", "price": 515, "cur": "UYU", "img": "p03"}, {"id": "p04", "cat": "perro", "name": "Prot Adultos", "pres": "20 kg + 3 kg", "price": 1193, "cur": "UYU", "img": "p04"}, {"id": "p05", "cat": "perro", "name": "Criolla Adultos", "pres": "7 kg", "price": 426, "cur": "UYU", "img": "p05"}, {"id": "p06", "cat": "perro", "name": "Criolla Adultos", "pres": "25 kg + 7 kg", "price": 1500, "cur": "UYU", "img": "p06"}, {"id": "p07", "cat": "perro", "name": "Criolla Cachorros", "pres": "7 kg", "price": 601, "cur": "UYU", "img": "p07"}, {"id": "p08", "cat": "perro", "name": "Old Prince Adulto", "pres": "15 kg + 3 kg", "price": 2295, "cur": "UYU", "img": "p08"}, {"id": "p09", "cat": "perro", "name": "Nhock Premium", "pres": "15 kg", "price": 990, "cur": "UYU", "img": "p09"}, {"id": "p10", "cat": "perro", "name": "Nhock Premium", "pres": "25 kg + 10 kg", "price": 1855, "cur": "UYU", "img": "p10"}, {"id": "p11", "cat": "perro", "name": "Atacama Adultos", "pres": "20 kg + 2 kg", "price": 2940, "cur": "UYU", "img": "p11"}, {"id": "p12", "cat": "perro", "name": "Macanudo", "pres": "7 kg", "price": 329, "cur": "UYU", "img": "p12"}, {"id": "p13", "cat": "perro", "name": "Astro Razas Pequeñas", "pres": "7 kg", "price": 1444, "cur": "UYU", "img": "p13"}, {"id": "p14", "cat": "perro", "name": "Astro Razas Pequeñas", "pres": "14 kg", "price": 2741, "cur": "UYU", "img": "p14"}, {"id": "p15", "cat": "perro", "name": "Astro Senior", "pres": "7 kg", "price": 1440, "cur": "UYU", "img": "p15"}, {"id": "p16", "cat": "perro", "name": "Astro Senior", "pres": "14 kg + 2 kg", "price": 2708, "cur": "UYU", "img": "p16"}, {"id": "p17", "cat": "perro", "name": "Astro Adultos", "pres": "14 kg + 3 kg", "price": 2258, "cur": "UYU", "img": "p17"}, {"id": "p18", "cat": "perro", "name": "Falucho", "pres": "7 kg", "price": 325, "cur": "UYU", "img": "p18"}, {"id": "p19", "cat": "perro", "name": "Oriunda Adultos", "pres": "7 kg", "price": 325, "cur": "UYU", "img": "p19"}, {"id": "p20", "cat": "perro", "name": "Oriunda Adultos", "pres": "20 kg + 2 kg", "price": 950, "cur": "UYU", "img": "p20"}, {"id": "p21", "cat": "perro", "name": "Bandido's", "pres": "7 kg", "price": 335, "cur": "UYU", "img": "p21"}, {"id": "p22", "cat": "perro", "name": "Fridy", "pres": "7 kg", "price": 328, "cur": "UYU", "img": "p22"}, {"id": "p23", "cat": "perro", "name": "Hiport Dog Adultos", "pres": "7 kg", "price": 535, "cur": "UYU", "img": "p23"}, {"id": "p24", "cat": "perro", "name": "Hiport Dog Adultos", "pres": "20 kg", "price": 1165, "cur": "UYU", "img": "p24"}, {"id": "p25", "cat": "perro", "name": "Bravo Light", "pres": "10 kg", "price": 1150, "cur": "UYU", "img": "p25"}, {"id": "p26", "cat": "perro", "name": "Bravo Light", "pres": "15 kg + 2 kg", "price": 1600, "cur": "UYU", "img": "p26"}, {"id": "p27", "cat": "perro", "name": "Bravo Baby", "pres": "10 kg + 1 kg", "price": 1250, "cur": "UYU", "img": "p27"}, {"id": "p28", "cat": "perro", "name": "Bravo Baby", "pres": "15 kg + 2 kg", "price": 1665, "cur": "UYU", "img": "p28"}, {"id": "p29", "cat": "perro", "name": "Bravo Razas Pequeñas", "pres": "10 kg + 1 kg", "price": 1200, "cur": "UYU", "img": "p29"}, {"id": "p30", "cat": "perro", "name": "Bravo Original", "pres": "15 kg", "price": 1365, "cur": "UYU", "img": "p30"}, {"id": "p31", "cat": "perro", "name": "Fámil Premium Perros", "pres": "15 kg", "price": 1335, "cur": "UYU", "img": "p31"}, {"id": "p32", "cat": "perro", "name": "Nero Original", "pres": "25 kg", "price": 2003, "cur": "UYU", "img": "p32"}, {"id": "p33", "cat": "perro", "name": "Frost Light Razas Pequeñas", "pres": "10 kg", "price": 3205, "cur": "UYU", "img": "p33"}, {"id": "p34", "cat": "perro", "name": "Frost Razas Pequeñas", "pres": "15 kg", "price": 3762, "cur": "UYU", "img": "p34"}, {"id": "p35", "cat": "perro", "name": "Frost Razas Pequeñas", "pres": "10,1 kg", "price": 2585, "cur": "UYU", "img": "p35"}, {"id": "p36", "cat": "perro", "name": "Frost Razas Grandes", "pres": "15 kg + 2 kg", "price": 3192, "cur": "UYU", "img": "p36"}, {"id": "p37", "cat": "perro", "name": "Frost Cachorros", "pres": "15 kg + 2 kg", "price": 4057, "cur": "UYU", "img": "p37"}, {"id": "p38", "cat": "perro", "name": "Pedigree Adulto", "pres": "21 kg", "price": 2820, "cur": "UYU", "img": "p38"}, {"id": "p39", "cat": "perro", "name": "Gran Plus", "pres": "15 kg + 1,5 kg", "price": 2990, "cur": "UYU", "img": "p39"}, {"id": "p40", "cat": "perro", "name": "Equilibrio Razas Pequeñas", "pres": "7,5 kg", "price": 2047, "cur": "UYU", "img": "p40"}, {"id": "p41", "cat": "perro", "name": "Equilibrio Razas Medianas", "pres": "15 kg + 3 kg", "price": 3479, "cur": "UYU", "img": "p41"}, {"id": "p42", "cat": "perro", "name": "Equilibrio Razas Medianas", "pres": "15 kg", "price": 3434, "cur": "UYU", "img": "p42"}, {"id": "p43", "cat": "perro", "name": "Natural Dog", "pres": "22 kg + 2 kg", "price": 2350, "cur": "UYU", "img": "p43"}, {"id": "p44", "cat": "perro", "name": "Lager Adultos", "pres": "22 kg + 10 kg", "price": 2475, "cur": "UYU", "img": "p44"}, {"id": "p45", "cat": "perro", "name": "Primocao", "pres": "22 kg", "price": 2003, "cur": "UYU", "img": "p45"}, {"id": "p46", "cat": "perro", "name": "Dogui Adultos", "pres": "21 kg", "price": 1990, "cur": "UYU", "img": "p46"}, {"id": "p47", "cat": "perro", "name": "Charrua Adultos", "pres": "22 kg", "price": 1850, "cur": "UYU", "img": "p47"}, {"id": "p48", "cat": "perro", "name": "The Golden Choice", "pres": "16 kg + 2 kg", "price": 2640, "cur": "UYU", "img": "p48"}, {"id": "p49", "cat": "perro", "name": "Rex Adultos", "pres": "25 kg", "price": 1280, "cur": "UYU", "img": "p49"}, {"id": "p50", "cat": "perro", "name": "Golden Special Adultos", "pres": "20 kg", "price": 2000, "cur": "UYU", "img": "p50"}, {"id": "p51", "cat": "perro", "name": "Golden Senior", "pres": "15 kg", "price": 2000, "cur": "UYU", "img": "p51"}, {"id": "p52", "cat": "perro", "name": "Vagoneta Adultos", "pres": "20 kg", "price": 1460, "cur": "UYU", "img": "p52"}, {"id": "p53", "cat": "perro", "name": "Estampa Criadores Adultos", "pres": "15 kg", "price": 1500, "cur": "UYU", "img": "p53"}, {"id": "f01", "cat": "granja", "name": "Ponedora Granulada Fase 1", "pres": "25 kg", "price": 13.3, "cur": "USD", "img": "f01"}, {"id": "f02", "cat": "granja", "name": "Ponedora Molida Fase 2", "pres": "25 kg", "price": 13.0, "cur": "USD", "img": "f02"}, {"id": "f03", "cat": "granja", "name": "Ponedora Granulada Fase 2", "pres": "25 kg", "price": 13.38, "cur": "USD", "img": "f03"}, {"id": "f04", "cat": "granja", "name": "Ponedora Recría", "pres": "25 kg", "price": 13.38, "cur": "USD", "img": "f04"}, {"id": "f05", "cat": "granja", "name": "Pollito Bebé", "pres": "25 kg", "price": 15.17, "cur": "USD", "img": "f05"}, {"id": "f06", "cat": "granja", "name": "Pollo Terminación", "pres": "25 kg", "price": 14.58, "cur": "USD", "img": "f06"}, {"id": "f07", "cat": "granja", "name": "Mantenimiento Vacunos", "pres": "25 kg", "price": 9.9, "cur": "USD", "img": "f07"}, {"id": "f08", "cat": "granja", "name": "Terneros", "pres": "25 kg", "price": 10.93, "cur": "USD", "img": "f08"}, {"id": "f09", "cat": "granja", "name": "Cerdos Engorde", "pres": "25 kg", "price": 11.71, "cur": "USD", "img": "f09"}, {"id": "f10", "cat": "granja", "name": "Lechones", "pres": "25 kg", "price": 14.61, "cur": "USD", "img": "f10"}, {"id": "f11", "cat": "granja", "name": "Cerdas Gestantes y Lactantes", "pres": "25 kg", "price": 13.3, "cur": "USD", "img": "f11"}, {"id": "f12", "cat": "granja", "name": "Ovinos", "pres": "25 kg", "price": 10.54, "cur": "USD", "img": "f12"}, {"id": "f13", "cat": "granja", "name": "Conejos", "pres": "25 kg", "price": 13.51, "cur": "USD", "img": "f13"}, {"id": "s01", "cat": "granos", "name": "Arroz", "pres": "25 kg", "price": 565, "cur": "UYU", "img": "s01"}, {"id": "s02", "cat": "granos", "name": "Maíz Entero", "pres": "25 kg", "price": 10.5, "cur": "USD", "img": "s02"}, {"id": "s03", "cat": "granos", "name": "Maíz Quebrado", "pres": "25 kg", "price": 10.6, "cur": "USD", "img": "s03"}, {"id": "s04", "cat": "granos", "name": "Avena para Caballos", "pres": "35 kg", "price": 715, "cur": "UYU", "img": "s04"}, {"id": "f14", "cat": "granja", "name": "Suplemento Proteico", "pres": "1 kg", "price": 515, "cur": "UYU", "img": "f14"}, {"id": "f15", "cat": "granja", "name": "Suplemento Vitamínico", "pres": "", "price": 620, "cur": "UYU", "img": "f15"}, {"id": "c01", "cat": "cuidado", "name": "Antiparasitario Pipeta", "pres": "pipeta", "price": 449, "cur": "UYU", "img": "c01"}, {"id": "c02", "cat": "cuidado", "name": "Simparica Trio (5–10 kg)", "pres": "comp. masticable", "price": 10.76, "cur": "USD", "img": "c02"}, {"id": "c03", "cat": "cuidado", "name": "Simparica Trio (20–40 kg)", "pres": "comp. masticable", "price": 16.92, "cur": "USD", "img": "c03"}, {"id": "c04", "cat": "cuidado", "name": "Simparica Trio (10–20 kg)", "pres": "comp. masticable", "price": 14.04, "cur": "USD", "img": "c04"}, {"id": "c05", "cat": "cuidado", "name": "Simparica Trio (40–60 kg)", "pres": "comp. masticable", "price": 17.42, "cur": "USD", "img": "c05"}, {"id": "c06", "cat": "cuidado", "name": "Finn Gel — Veneno para cucarachas", "pres": "30 g", "price": 725, "cur": "UYU", "img": "c06"}, {"id": "c07", "cat": "cuidado", "name": "Antiparasitario Interno y Externo", "pres": "frasco", "price": 9.75, "cur": "USD", "img": "c07"}, {"id": "c08", "cat": "cuidado", "name": "Veneno Hormigas Granulado", "pres": "", "price": 6.62, "cur": "USD", "img": "c08"}, {"id": "c09", "cat": "cuidado", "name": "Veneno Hormigas en Polvo", "pres": "", "price": 5.1, "cur": "USD", "img": "c09"}, {"id": "c10", "cat": "cuidado", "name": "Auxiliar Educativo", "pres": "", "price": 715, "cur": "UYU", "img": "c10"}, {"id": "c11", "cat": "cuidado", "name": "Mata Pulgas y Garrapatas", "pres": "", "price": 538, "cur": "UYU", "img": "c11"}, {"id": "h01", "cat": "harina", "name": "Harina de Trigo", "pres": "25 kg", "price": 10.68, "cur": "USD", "img": "h01"}, {"id": "h02", "cat": "harina", "name": "Harina de Trigo 0000", "pres": "25 kg", "price": 16.14, "cur": "USD", "img": "h02"}, {"id": "h03", "cat": "harina", "name": "Harina de Trigo 000", "pres": "25 kg", "price": 13.51, "cur": "USD", "img": "h03"}, {"id": "h04", "cat": "harina", "name": "Harina de Trigo 00", "pres": "25 kg", "price": 11.23, "cur": "USD", "img": "h04"}, {"id": "h05", "cat": "harina", "name": "Harina de Trigo Integral", "pres": "25 kg", "price": 15.98, "cur": "USD", "img": "h05"}, {"id": "h06", "cat": "harina", "name": "Harina Uruguay 0000 (pack)", "pres": "12 uds.", "price": 10.8, "cur": "USD", "img": "h06"}, {"id": "h07", "cat": "harina", "name": "Harina Primor 0000 (pack)", "pres": "12 uds.", "price": 13.2, "cur": "USD", "img": "h07"}];

  var catLabel = {};
  CATS.forEach(function(c){ catLabel[c.id] = c.label; });

  function fmt(n){
    return "$ " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  function fmtUSD(n){
    return "US$ " + n.toFixed(2).replace(".", ",");
  }
  function fmtP(price, cur){
    if(price === null || price === undefined) return "Consultar";
    return cur === "USD" ? fmtUSD(price) : fmt(price);
  }
  function waLink(p){
    var msg = "Hola La Barraquita! Quiero pedir: " + p.name + " (" + p.pres + "). ¿Está disponible?";
    return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
  }
  /* Link de WhatsApp de una oferta del carrusel (las piezas sin producto puntual llevan mensaje genérico) */
  function waOferta(o){
    var msg = o.msg
      ? "Hola La Barraquita! Quiero pedir la oferta: " + o.msg + ". ¿Está disponible?"
      : "Hola La Barraquita! Vengo desde la web y quiero hacer un pedido. ¿Me ayudan?";
    return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
  }

  var DESC = {
    perro:"Alimento balanceado para perros. Coordiná tu pedido y te lo preparamos.",
    gato:"Alimento balanceado para gatos. Coordiná tu pedido y te lo preparamos.",
    granja:"Ración para animales de granja. Presentación de 25 kg salvo indicación. Precio en dólares.",
    granos:"Grano e insumo a granel para la alimentación de tus animales.",
    cuidado:"Producto de sanidad animal y control de plagas. Consultá al veterinario por la dosis.",
    harina:"Harina de trigo. Precio en dólares."
  };

  /* Descripción según el tipo de producto (contempla subcategorías dentro de una categoría) */
  function descFor(p){
    if(/sanitaria/i.test(p.name)) return "Piedra sanitaria absorbente para gatos. Coordiná tu pedido y te lo preparamos.";
    return DESC[p.cat] || "";
  }

  var byId = {};
  PRODUCTS.forEach(function(p){ byId[p.img] = p; });

  /* URLs de las fichas estáticas (js/rutas.js, generado por tools/build-seo.mjs) */
  var RUTAS = window.LB_RUTAS || {};

  function esc(s){
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  var PLUS = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';

  var cart = {};
  function cartCount(){ var n=0; for(var k in cart){ n += cart[k]; } return n; }
  function cartTotals(){ var t={UYU:0,USD:0}; for(var k in cart){ var p=byId[k]; if(p.price!==null&&p.price!==undefined){ t[p.cur]+=cart[k]*p.price; } } return t; }
  function totalsText(){ var t=cartTotals(), a=[]; if(t.UYU>0) a.push(fmt(t.UYU)); if(t.USD>0) a.push(fmtUSD(t.USD)); return a.length?a.join(" + "):"Consultar"; }

  var state = { cat:"todos", q:"", sub:null, subLabel:"", sort:"default", page:0 };

  function sortVal(p){
    if(p.price === null || p.price === undefined) return Infinity;
    return p.cur === "USD" ? p.price * 42 : p.price;
  }
  function sortItems(arr){
    var s = state.sort;
    if(!s || s === "default") return arr;
    var copy = arr.slice();
    if(s === "price-asc" || s === "price-desc"){
      var dir = s === "price-desc" ? -1 : 1;
      copy.sort(function(a, b){
        var av = sortVal(a), bv = sortVal(b);
        if(av === Infinity && bv === Infinity) return 0;
        if(av === Infinity) return 1;   // "Consultar" siempre al final
        if(bv === Infinity) return -1;
        return dir * (av - bv);
      });
    } else {
      var d = s === "name-desc" ? -1 : 1;
      copy.sort(function(a, b){ return d * a.name.localeCompare(b.name, "es", { sensitivity:"base" }); });
    }
    return copy;
  }
  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var count = document.getElementById("count");
  var title = document.getElementById("cat-title");
  var pager = document.getElementById("pager");

  /* Productos por página y cuántos números se ven en la paginación */
  var PAGE_SIZE = 12;
  /* En el celular entran menos números en una línea */
  function pageWindow(){ return window.matchMedia("(max-width:600px)").matches ? 3 : 5; }

  function norm(s){
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  }

  /* Paginaci\u00f3n numerada: \u2039 1 2 3 \u2026 \u203a con ventana m\u00f3vil de PAGE_WINDOW n\u00fameros */
  function renderPager(page, pageCount){
    if(pageCount <= 1){ pager.hidden = true; pager.innerHTML = ""; return; }
    pager.hidden = false;
    var win = pageWindow();
    var start = Math.max(0, Math.min(page - Math.floor(win / 2), pageCount - win));
    var end = Math.min(pageCount, start + win);
    var html = '<button class="pg-arrow" type="button" data-page="' + (page - 1) + '"' +
      (page === 0 ? ' disabled' : '') + ' aria-label="P\u00e1gina anterior">\u2039</button>';
    if(start > 0){
      html += '<button class="pg-num" type="button" data-page="0" aria-label="P\u00e1gina 1">1</button>';
      if(start > 1) html += '<span class="pg-gap">\u2026</span>';
    }
    for(var n = start; n < end; n++){
      html += '<button class="pg-num' + (n === page ? ' active' : '') + '" type="button" data-page="' + n + '"' +
        (n === page ? ' aria-current="page"' : '') + ' aria-label="P\u00e1gina ' + (n + 1) + '">' + (n + 1) + '</button>';
    }
    if(end < pageCount){
      if(end < pageCount - 1) html += '<span class="pg-gap">\u2026</span>';
      html += '<button class="pg-num" type="button" data-page="' + (pageCount - 1) + '" aria-label="P\u00e1gina ' + pageCount + '">' + pageCount + '</button>';
    }
    html += '<button class="pg-arrow" type="button" data-page="' + (page + 1) + '"' +
      (page === pageCount - 1 ? ' disabled' : '') + ' aria-label="P\u00e1gina siguiente">\u203a</button>';
    pager.innerHTML = html;
  }

  function render(keepPage){
    if(!keepPage) state.page = 0;
    var q = norm(state.q.trim());
    var items = PRODUCTS.filter(function(p){
      if(state.cat !== "todos" && p.cat !== state.cat) return false;
      if(state.sub){
        var nm = norm(p.name + " " + p.pres);
        if(state.sub.inc.length && !state.sub.inc.some(function(k){ return nm.indexOf(k) !== -1; })) return false;
        if(state.sub.exc.length && state.sub.exc.some(function(k){ return nm.indexOf(k) !== -1; })) return false;
      }
      if(!q) return true;
      return norm(p.name + " " + p.pres + " " + catLabel[p.cat]).indexOf(q) !== -1;
    });
    items = sortItems(items);
    var baseTitle = state.cat === "todos" ? "Productos" : catLabel[state.cat];
    title.textContent = state.subLabel ? baseTitle + " · " + state.subLabel : baseTitle;
    count.textContent = items.length + (items.length === 1 ? " producto" : " productos");
    empty.classList.toggle("show", items.length === 0);

    var pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    if(state.page > pageCount - 1) state.page = pageCount - 1;
    if(state.page < 0) state.page = 0;
    var page = state.page;
    var visible = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
    renderPager(page, pageCount);

    grid.innerHTML = visible.map(function(p){
      var name = esc(p.name);
      // El título enlaza a la ficha estática (SEO); el clic normal sigue abriendo el modal.
      var url = RUTAS[p.id];
      return '<article class="card" data-id="' + p.img + '" tabindex="0" role="button" aria-label="Ver ' + name + '">' +
        '<div class="card-art">' + (p.flag ? '<span class="flag">' + p.flag + '</span>' : '') +
          (IMGS[p.img] ? '<img src="' + IMGS[p.img] + '" alt="' + name + '"' + (/sanitaria/i.test(p.name) ? ' class="litter"' : '') + ' loading="lazy">' : ICONS[p.cat]) +
        '</div>' +
        '<div class="card-body">' +
          '<span class="card-cat">' + catLabel[p.cat] + '</span>' +
          '<h3>' + (url ? '<a href="' + url + '" data-ficha>' + name + '</a>' : name) + '</h3>' +
          '<span class="pres">' + esc(p.pres) + '</span>' +
          (p.gift ? '<span class="gift">' + esc(p.gift) + '</span>' : '') +
          '<div class="card-foot">' +
            '<span class="price">' + fmtP(p.price, p.cur) + '</span>' +
            '<button class="btn-add" data-add="' + p.img + '" aria-label="Agregar ' + name + ' al pedido">' +
              PLUS + 'Agregar</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  /* ── Pestañas de categoría ── */
  var tabsWrap = document.getElementById("cattabs");
  var catCount = {};
  PRODUCTS.forEach(function(p){ catCount[p.cat] = (catCount[p.cat] || 0) + 1; });
  catCount.todos = PRODUCTS.length;

  function syncTabs(cat){
    var bs = tabsWrap.querySelectorAll(".ctab");
    for(var i = 0; i < bs.length; i++){
      var on = bs[i].getAttribute("data-cat") === cat;
      bs[i].classList.toggle("active", on);
      bs[i].setAttribute("aria-selected", on ? "true" : "false");
    }
  }
  CATS.forEach(function(c){
    var b = document.createElement("button");
    b.type = "button"; b.className = "ctab"; b.setAttribute("data-cat", c.id);
    b.setAttribute("role", "tab");
    b.innerHTML = (TAB_ICONS[c.id] || "") + c.label + '<span class="n">' + (catCount[c.id] || 0) + '</span>';
    b.addEventListener("click", function(){
      state.cat = c.id;
      state.sub = null; state.subLabel = "";
      syncTabs(c.id);
      render();
    });
    tabsWrap.appendChild(b);
  });
  syncTabs(state.cat);

  document.getElementById("sort").addEventListener("change", function(e){
    state.sort = e.target.value;
    render();
  });

  document.getElementById("q").addEventListener("input", function(e){
    state.q = e.target.value;
    render();
  });
  /* Búsqueda por URL (?q=astro): la usa el SearchAction de Google y sirve para compartir búsquedas */
  try{
    var q0 = new URLSearchParams(location.search).get("q");
    if(q0){ document.getElementById("q").value = q0; state.q = q0; }
  }catch(e){}

  /* Ir a una página del catálogo y volver al principio de la grilla */
  function goPage(n){
    state.page = n;
    render(true);          // true = no reiniciar la página
    var c = document.getElementById("catalogo");
    if(c) c.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  pager.addEventListener("click", function(e){
    var b = e.target.closest("[data-page]");
    if(!b || b.disabled) return;
    goPage(parseInt(b.getAttribute("data-page"), 10));
  });

  /* ── Barra de categorías con submenús ── */
  (function(){
    var navRow = document.getElementById("navRow");
    if(!navRow) return;
    var homeEl = document.getElementById("view-home");
    var aboutEl = document.getElementById("nosotros");
    function showHome(){ if(aboutEl) aboutEl.hidden = true; if(homeEl) homeEl.hidden = false; }
    function showAbout(){ if(homeEl) homeEl.hidden = true; if(aboutEl) aboutEl.hidden = false; window.scrollTo(0, 0); }
    function clearHash(){ try{ history.replaceState(null, "", location.pathname + location.search); }catch(e){} }
    var NAV = [
      {label:"Inicio", cat:"todos"},
      {label:"Perros", cat:"perro", sub:[
        {label:"Cachorros", inc:["cachorro","baby"]},
        {label:"Adultos", exc:["cachorro","baby","senior"]},
        {label:"Mayores de 7 años", inc:["senior","mayor"]},
        {label:"Razas pequeñas", inc:["pequen"]},
        {label:"Razas grandes y medianas", inc:["grande","median"]},
        {label:"Ver todos los perros", cat:"perro"}
      ]},
      {label:"Gatos", cat:"gato", sub:[
        {label:"Adultos", exc:["castrado","sanitaria"]},
        {label:"Castrados", inc:["castrado"]},
        {label:"Piedras Sanitarias", inc:["sanitaria"]},
        {label:"Ver todos los gatos", cat:"gato"}
      ]},
      {label:"Granja", cat:"granja", sub:[
        {label:"Aves y ponedoras", inc:["ponedora","pollit","pollo","aves"]},
        {label:"Vacunos", inc:["ternero","vacuno"]},
        {label:"Cerdos", inc:["cerdo","lechon","cerda"]},
        {label:"Ovinos", inc:["ovino"]},
        {label:"Conejos", inc:["conejo"]},
        {label:"Suplementos", inc:["suplemento"]},
        {label:"Ver todo granja", cat:"granja"}
      ]},
      {label:"Granos", cat:"granos"},
      {label:"Sanidad", cat:"cuidado"},
      {label:"Harinas", cat:"harina"},
      {label:"Nosotros", view:"about"},
      {label:"Venta por Mayor", cta:true}
    ];
    var CARET = '<svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

    function closeMenus(){
      var open = navRow.querySelectorAll(".nav-group.open");
      for(var i = 0; i < open.length; i++) open[i].classList.remove("open");
    }
    function applyNav(cat, sub, subLabel){
      if(aboutEl && !aboutEl.hidden){ showHome(); clearHash(); }
      state.cat = cat; state.sub = sub || null; state.subLabel = subLabel || "";
      syncTabs(cat);
      closeMenus();
      closeNavMenu();
      render();
      var c = document.getElementById("catalogo");
      if(c) c.scrollIntoView({ behavior:"smooth", block:"start" });
    }

    NAV.forEach(function(n){
      if(n.cta){
        var a = document.createElement("a");
        a.className = "nav-cta";
        a.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent("¡Hola La Barraquita! Me interesa comprar POR MAYOR. ¿Me pueden pasar la lista de precios mayoristas?");
        a.target = "_blank"; a.rel = "noopener";
        a.addEventListener("click", closeNavMenu);
        a.textContent = n.label;
        navRow.appendChild(a);
        return;
      }
      if(!n.sub){
        var b = document.createElement("button");
        b.className = "nav-item"; b.type = "button"; b.textContent = n.label;
        b.addEventListener("click", function(){
          if(n.view === "about"){
            showAbout();
            try{ location.hash = "nosotros"; }catch(e){}
            closeMenus();
            closeNavMenu();
          } else {
            applyNav(n.cat, null, "");
          }
        });
        navRow.appendChild(b);
        return;
      }
      var g = document.createElement("div"); g.className = "nav-group";
      var top = document.createElement("button");
      top.className = "nav-item"; top.type = "button";
      top.innerHTML = n.label + " " + CARET;
      top.addEventListener("click", function(e){
        e.stopPropagation();
        if(window.matchMedia("(max-width:860px)").matches){
          var wasOpen = g.classList.contains("open");
          closeMenus();
          if(!wasOpen) g.classList.add("open");
        } else {
          applyNav(n.cat, null, "");
        }
      });
      g.appendChild(top);
      var menu = document.createElement("div"); menu.className = "submenu";
      n.sub.forEach(function(s){
        var sb = document.createElement("button"); sb.type = "button"; sb.textContent = s.label;
        var hasFilter = !!(s.inc || s.exc);
        if(!hasFilter) sb.className = "sub-all";
        sb.addEventListener("click", function(e){
          e.stopPropagation();
          var sub = hasFilter ? { inc:s.inc || [], exc:s.exc || [] } : null;
          applyNav(n.cat, sub, hasFilter ? s.label : "");
        });
        menu.appendChild(sb);
      });
      g.appendChild(menu);
      navRow.appendChild(g);
    });

    /* Enlaces de categoría del pie: filtran el catálogo igual que la barra de arriba */
    var footCats = document.querySelectorAll("[data-foot-cat]");
    for(var fi = 0; fi < footCats.length; fi++){
      (function(btn){
        btn.addEventListener("click", function(e){
          // Son <a href> para que Google los rastree; un clic normal filtra sin recargar.
          if(e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
          e.preventDefault();
          applyNav(btn.getAttribute("data-foot-cat"), null, "");
        });
      })(footCats[fi]);
    }

    function closeNavMenu(){
      var t = document.getElementById("navToggle"), m = document.getElementById("mainnav");
      if(m) m.classList.remove("open");
      if(t){ t.classList.remove("open"); t.setAttribute("aria-expanded", "false"); }
    }
    var navToggle = document.getElementById("navToggle"), mainnavEl = document.getElementById("mainnav");
    if(navToggle && mainnavEl){
      navToggle.addEventListener("click", function(){
        var willOpen = !mainnavEl.classList.contains("open");
        mainnavEl.classList.toggle("open", willOpen);
        navToggle.classList.toggle("open", willOpen);
        navToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
        if(!willOpen) closeMenus();
      });
    }

    document.addEventListener("click", closeMenus);

    function route(){ if(location.hash === "#nosotros") showAbout(); else showHome(); }
    window.addEventListener("hashchange", route);

    var brand = document.querySelector(".brandmark");
    if(brand) brand.addEventListener("click", function(e){ e.preventDefault(); showHome(); clearHash(); window.scrollTo(0, 0); });
    var back = document.getElementById("backHome");
    if(back) back.addEventListener("click", function(e){ e.preventDefault(); showHome(); clearHash(); window.scrollTo(0, 0); });

    route();
  })();

  document.getElementById("foot-wa").href =
    "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hola La Barraquita! Quiero hacer una consulta sobre el catálogo.");

  var footYear = document.getElementById("footYear");
  if(footYear) footYear.textContent = new Date().getFullYear();

  document.getElementById("btnMayor").href =
    "https://wa.me/" + WA + "?text=" + encodeURIComponent("¡Hola La Barraquita! Me interesa comprar POR MAYOR. ¿Me pueden pasar la lista de precios mayoristas?");

  /* ── Elementos del carrito y la ficha ── */
  var fab = document.getElementById("cartBtn");
  var fabCount = document.getElementById("cartCount");
  var modalOverlay = document.getElementById("modalOverlay");
  var modalBody = document.getElementById("modalBody");
  var cartOverlay = document.getElementById("cartOverlay");
  var drawerItems = document.getElementById("drawerItems");
  var drawerFoot = document.getElementById("drawerFoot");
  var drawerTotal = document.getElementById("drawerTotal");
  var checkout = document.getElementById("checkout");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  function toast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove("show"); }, 1600);
  }

  function anyOpen(){ return modalOverlay.classList.contains("open") || cartOverlay.classList.contains("open"); }
  function openOverlay(ov){ ov.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeOverlay(ov){ ov.classList.remove("open"); if(!anyOpen()){ document.body.style.overflow = ""; } }

  function bump(){ fab.classList.remove("bump"); void fab.offsetWidth; fab.classList.add("bump"); }

  function updateCart(){
    var n = cartCount();
    fabCount.textContent = n;
    fab.classList.toggle("has", n > 0);
    renderDrawer();
  }
  function addToCart(id, qty){ cart[id] = (cart[id] || 0) + (qty || 1); updateCart(); }

  function renderDrawer(){
    var ids = Object.keys(cart);
    if(!ids.length){
      drawerItems.innerHTML = '<div class="cart-empty">Tu pedido está vacío.<br>Agregá productos del catálogo y aparecerán acá.</div>';
      drawerFoot.hidden = true;
      return;
    }
    drawerFoot.hidden = false;
    drawerItems.innerHTML = ids.map(function(id){
      var p = byId[id], q = cart[id];
      return '<div class="d-item">' +
        (IMGS[p.img] ? '<img src="' + IMGS[p.img] + '" alt="">' : '') +
        '<div class="d-item-info">' +
          '<h4>' + esc(p.name) + '</h4>' +
          '<div class="d-pres">' + esc(p.pres) + '</div>' +
          '<div class="d-item-controls">' +
            '<div class="qty qty-sm">' +
              '<button data-dec="' + id + '" aria-label="Restar uno">−</button>' +
              '<span>' + q + '</span>' +
              '<button data-inc="' + id + '" aria-label="Sumar uno">+</button>' +
            '</div>' +
            '<span class="d-line">' + fmtP(p.price===null?null:p.price*q, p.cur) + '</span>' +
          '</div>' +
          '<button class="d-remove" data-rm="' + id + '">Quitar</button>' +
        '</div>' +
      '</div>';
    }).join("");
    drawerTotal.textContent = totalsText();
    checkout.href = checkoutLink();
  }

  function checkoutLink(){
    var lines = Object.keys(cart).map(function(id){
      var p = byId[id], q = cart[id];
      return "• " + q + "× " + p.name + " (" + p.pres + ") — " + fmtP(p.price===null?null:p.price*q, p.cur);
    });
    var msg = "Hola La Barraquita! Quiero hacer este pedido:\n\n" + lines.join("\n") +
      "\n\nTotal: " + totalsText() + "\n\n¿Me confirman disponibilidad y cómo coordinamos la entrega?";
    return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
  }

  drawerItems.addEventListener("click", function(e){
    var inc = e.target.closest("[data-inc]");
    var dec = e.target.closest("[data-dec]");
    var rm = e.target.closest("[data-rm]");
    if(inc){ cart[inc.getAttribute("data-inc")]++; updateCart(); }
    else if(dec){ var id = dec.getAttribute("data-dec"); cart[id]--; if(cart[id] <= 0){ delete cart[id]; } updateCart(); }
    else if(rm){ delete cart[rm.getAttribute("data-rm")]; updateCart(); }
  });

  fab.addEventListener("click", function(){ openOverlay(cartOverlay); });

  /* Ficha de producto */
  var modalQty = 1, modalId = null;
  function openModal(id){
    var p = byId[id];
    modalId = id; modalQty = 1;
    modalBody.innerHTML =
      (IMGS[p.img]
        ? '<figure class="modal-art"><img src="' + IMGS[p.img] + '" alt="' + esc(p.name) + ' — La Barraquita" decoding="async"></figure>'
        : '<figure class="modal-art">' + (ICONS[p.cat] || '') + '</figure>') +
      '<div class="modal-head">' +
        '<span class="modal-cat">' + catLabel[p.cat] + '</span>' +
        (p.flag ? '<span class="m-flag">' + p.flag + '</span>' : '') +
      '</div>' +
      '<h3>' + esc(p.name) + '</h3>' +
      '<div class="m-pres">' + esc(p.pres) + '</div>' +
      (p.gift ? '<div class="m-gift">' + esc(p.gift) + '</div>' : '') +
      '<p class="m-desc">' + esc(descFor(p)) + '</p>' +
      '<div class="m-price">' + fmtP(p.price, p.cur) + '</div>' +
      '<div class="modal-actions">' +
        '<div class="qty">' +
          '<button data-mq="dec" aria-label="Restar uno">−</button>' +
          '<span id="mqty">1</span>' +
          '<button data-mq="inc" aria-label="Sumar uno">+</button>' +
        '</div>' +
        '<button class="btn-checkout" data-madd aria-label="Agregar al pedido">Agregar al pedido</button>' +
      '</div>' +
      '<a class="m-single" target="_blank" rel="noopener" href="' + waLink(p) + '">o pedir solo este por WhatsApp →</a>' +
      (RUTAS[p.id] ? '<a class="m-ficha" href="' + RUTAS[p.id] + '">Ver ficha completa para compartir →</a>' : '');
    openOverlay(modalOverlay);
  }

  modalOverlay.addEventListener("click", function(e){
    if(e.target === modalOverlay || e.target.closest("[data-close]")){ closeOverlay(modalOverlay); return; }
    var mq = e.target.closest("[data-mq]");
    if(mq){
      modalQty = mq.getAttribute("data-mq") === "inc" ? modalQty + 1 : Math.max(1, modalQty - 1);
      document.getElementById("mqty").textContent = modalQty;
      return;
    }
    if(e.target.closest("[data-madd]")){
      addToCart(modalId, modalQty);
      bump();
      openOverlay(cartOverlay);
      closeOverlay(modalOverlay);
    }
  });

  cartOverlay.addEventListener("click", function(e){
    if(e.target === cartOverlay || e.target.closest("[data-close]")){ closeOverlay(cartOverlay); }
  });

  document.addEventListener("keydown", function(e){
    if(e.key === "Escape"){
      if(modalOverlay.classList.contains("open")){ closeOverlay(modalOverlay); }
      else if(cartOverlay.classList.contains("open")){ closeOverlay(cartOverlay); }
    }
  });

  /* Tocar una tarjeta lleva directo a la ficha del producto (página estática).
     Si no existe ruta (js/rutas.js sin generar), se abre la vista previa como antes. */
  function abrirProducto(id){
    var p = byId[id];
    var url = p && RUTAS[p.id];
    if(url){ location.href = url; } else { openModal(id); }
  }
  grid.addEventListener("click", function(e){
    var add = e.target.closest("[data-add]");
    if(add){ addToCart(add.getAttribute("data-add"), 1); bump(); toast("Agregado a tu pedido ✓"); return; }
    // El título ya es un <a href> a la ficha: dejamos que el navegador lo siga.
    if(e.target.closest("[data-ficha]")) return;
    var card = e.target.closest(".card[data-id]");
    if(card){ abrirProducto(card.getAttribute("data-id")); }
  });
  grid.addEventListener("keydown", function(e){
    if(e.key === "Enter" && e.target.classList.contains("card")){ abrirProducto(e.target.getAttribute("data-id")); }
  });

  var pagerRt;
  window.addEventListener("resize", function(){
    clearTimeout(pagerRt);
    pagerRt = setTimeout(function(){ render(true); }, 200);
  });

  updateCart();
  render();

  /* ── Carrusel del hero (riel: 3/2/1 por vista) ── */
  (function(){
    var track = document.getElementById("slides");
    var dotsWrap = document.getElementById("dots");
    if(!track) return;
    var slidesList = OFERTAS;
    if(!slidesList.length) return;
    slidesList.forEach(function(o, i){
      // Cada oferta es un link: al tocar la foto se abre WhatsApp con el mensaje de esa compra.
      var s = document.createElement("a"); s.className = "slide";
      s.href = waOferta(o);
      s.target = "_blank"; s.rel = "noopener";
      s.setAttribute("aria-label", "Pedir por WhatsApp: " + o.alt);
      var inner = document.createElement("div"); inner.className = "slide-in";
      // Fondo difuminado con la misma foto para rellenar las bandas (imágenes que no son 3:4).
      // URL absoluta: el var() se consume en el CSS (carpeta css/), una ruta relativa se resolvería mal.
      var bgUrl = new URL(o.img, document.baseURI).href;
      inner.style.setProperty("--bg", 'url("' + bgUrl.replace(/"/g, "%22") + '")');
      var im = document.createElement("img");
      im.src = o.img; im.alt = o.alt; im.loading = i < 3 ? "eager" : "lazy";
      inner.appendChild(im); s.appendChild(inner); track.appendChild(s);
    });
    var N = slidesList.length, page = 0, timer = null;
    function perView(){
      if(window.matchMedia("(max-width:600px)").matches) return 1;
      if(window.matchMedia("(max-width:860px)").matches) return 2;
      return 3;
    }
    function pages(){ return Math.ceil(N / perView()); }
    /* indice del primer slide de la pagina, clampeado para no dejar huecos al final */
    function startIdx(p){ return Math.min(p * perView(), Math.max(0, N - perView())); }
    function apply(){ track.style.transform = "translateX(-" + (startIdx(page) * 100 / perView()) + "%)"; updateDots(); }
    function go(p){ var last = pages() - 1; page = p < 0 ? last : (p > last ? 0 : p); apply(); }
    function next(){ go(page + 1); }
    function prev(){ go(page - 1); }
    function buildDots(){
      dotsWrap.innerHTML = "";
      for(var k = 0; k < pages(); k++){
        (function(k){
          var d = document.createElement("button");
          d.type = "button"; d.className = "dot"; d.setAttribute("aria-label", "Ir al grupo " + (k + 1));
          d.addEventListener("click", function(){ go(k); reset(); });
          dotsWrap.appendChild(d);
        })(k);
      }
    }
    function updateDots(){
      var ds = dotsWrap.querySelectorAll(".dot");
      for(var k = 0; k < ds.length; k++) ds[k].classList.toggle("active", k === page);
    }
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function reset(){ if(reduce) return; clearInterval(timer); timer = setInterval(next, 4800); }
    document.getElementById("carNext").addEventListener("click", function(){ next(); reset(); });
    document.getElementById("carPrev").addEventListener("click", function(){ prev(); reset(); });
    var car = document.getElementById("carousel");
    car.addEventListener("mouseenter", function(){ clearInterval(timer); });
    car.addEventListener("mouseleave", reset);
    var x0 = null, dragged = false;
    car.addEventListener("pointerdown", function(e){ x0 = e.clientX; dragged = false; });
    car.addEventListener("pointerup", function(e){
      if(x0 === null) return;
      var dx = e.clientX - x0;
      dragged = Math.abs(dx) > 8;               // arrastró: no es un clic para abrir WhatsApp
      if(Math.abs(dx) > 40){ dx < 0 ? next() : prev(); reset(); }
      x0 = null;
    });
    /* Si el gesto fue un swipe, no abrimos el link de la oferta */
    car.addEventListener("click", function(e){
      if(dragged){ e.preventDefault(); e.stopPropagation(); dragged = false; }
    }, true);
    var rt;
    window.addEventListener("resize", function(){
      clearTimeout(rt);
      rt = setTimeout(function(){ if(page > pages() - 1) page = pages() - 1; buildDots(); apply(); }, 150);
    });
    buildDots(); apply(); reset();
  })();
})();
