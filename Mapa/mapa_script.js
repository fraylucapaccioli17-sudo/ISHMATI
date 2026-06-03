let piezasColocadas = 0;
let puntos = 0;
let tiempo = 180;
let reloj;

// Lista de todos los municipios del mapa
const municipios = [
  "cuernavaca", "jiutepec", "temixco", "cuautla", "yautepec",
  "ayala", "jonacatepec", "tlayacapan", "tepoztlan", "xochitepec",
  "zacatepec", "puenteixtla", "amacuzac", "jojutla", "tlaquiltenango",
  "emilianozapata", "axochiapan", "totolapan", "atlatlahucan", "ocoyoacac"
];

// Actualizar total en pantalla
document.getElementById("total").innerText = municipios.length;

// Preguntas para cada municipio
const preguntas = {
  cuernavaca: { texto: "¿Cómo se le conoce a Cuernavaca?", opciones: ["Ciudad del sol", "La eterna primavera", "Ciudad colonial"], correcta: 1 },
  jiutepec: { texto: "¿Actividad económica principal de Jiutepec?", opciones: ["Pesca", "Industria", "Minería"], correcta: 1 },
  temixco: { texto: "¿Qué famoso balneario se encuentra en Temixco?", opciones: ["Las Estacas", "El Rollo", "Agua Hedionda"], correcta: 1 },
  cuautla: { texto: "¿Qué héroe histórico se relaciona con Cuautla?", opciones: ["Benito Juárez", "José María Morelos", "Miguel Hidalgo"], correcta: 1 },
  yautepec: { texto: "¿Qué cultivo es tradicional en Yautepec?", opciones: ["Trigo", "Caña de azúcar", "Café"], correcta: 1 },
  ayala: { texto: "¿Qué plan revolucionario se firmó en Ayala?", opciones: ["Plan de San Luis", "Plan de Ayala", "Plan de Guadalupe"], correcta: 1 },
  jonacatepec: { texto: "¿Qué zona arqueológica importante hay cerca?", opciones: ["Chalcatzingo", "Xochicalco", "Teopanzolco"], correcta: 0 },
  tlayacapan: { texto: "¿Por qué es famoso Tlayacapan?", optsiones: ["Sus exconventos", "Su cerámica", "Sus balnearios"], correcta: 0 },
  tepoztlan: { texto: "¿Qué pirámide es famosa en Tepoztlán?", opciones: ["Pirámide del Sol", "Pirámide de Tepozteco", "Pirámide de la Luna"], correcta: 1 },
  xochitepec: { texto: "¿Qué centro comercial importante está aquí?", opciones: ["Galerías Cuernavaca", "Plaza Atrium", "Forum Cuernavaca"], correcta: 0 },
  zacatepec: { texto: "¿Por qué es conocido Zacatepec?", opciones: ["Equipo de fútbol", "Minas", "Artesanías"], correcta: 0 },
  puenteixtla: { texto: "¿Qué río pasa por Puente de Ixtla?", opciones: ["Río Amacuzac", "Río Cuautla", "Río Yautepec"], correcta: 0 },
  amacuzac: { texto: "¿Qué parque acuático es famoso?", opciones: ["Las Estacas", "El Rollo", "Balneario Ejidal"], correcta: 0 },
  jojutla: { texto: "¿Qué evento cultural es famoso en Jojutla?", opciones: ["Carnaval", "Feria del Libro", "Festival de la Cerveza"], correcta: 0 },
  tlaquiltenango: { texto: "¿Qué producto agrícola destaca?", opciones: ["Mango", "Maíz", "Frijol"], correcta: 0 },
  emilianozapata: { texto: "¿En honor a quién se nombra el municipio?", opciones: ["Emiliano Zapata", "Francisco Villa", "Venustiano Carranza"], correcta: 0 },
  axochiapan: { texto: "¿Qué limita al sur con Axochiapan?", opciones: ["Guerrero", "Puebla", "Estado de México"], correcta: 0 },
  totolapan: { texto: "¿Qué tipo de artesanía es típica?", opciones: ["Barro", "Textiles", "Madera"], correcta: 0 },
  atlatlahucan: { texto: "¿Qué zona arqueológica tiene?", opciones: ["Cerro de la Corona", "Xochicalco", "Teopanzolco"], correcta: 0 },
  ocoyoacac: { texto: "¿Qué tipo de clima predomina?", opciones: ["Templado", "Caluroso", "Frío"], correcta: 0 }
};

// Función para que municipios sin pregunta tengan una genérica
function obtenerPregunta(municipio) {
  if (preguntas[municipio]) {
    return preguntas[municipio];
  }
  return {
    texto: `¿Qué sabes sobre el municipio de ${municipio} en Morelos?`,
    opciones: ["Su cultura", "Su gastronomía", "Su historia"],
    correcta: 0
  };
}

/* TEMPORIZADOR */
function iniciarTemporizador() {
  if (reloj) clearInterval(reloj);
  reloj = setInterval(() => {
    if (tiempo > 0) {
      tiempo--;
      document.getElementById("tiempo").innerText = tiempo;
    }
    if (tiempo <= 0) {
      clearInterval(reloj);
      document.getElementById("pregunta").innerHTML = `<div style="background:#ffcccc; padding:20px; border-radius:15px;">
        <h3>⏰ ¡TIEMPO TERMINADO!</h3>
        <p>Has obtenido ${puntos} puntos.</p>
        <button onclick="reiniciar()">🔄 Jugar de nuevo</button>
      </div>`;
    }
  }, 1000);
}

/* MOSTRAR PREGUNTA */
function mostrarPregunta(municipio) {
  if (tiempo <= 0) {
    alert("⏰ El tiempo ya terminó. Reinicia el juego.");
    return;
  }

  if (localStorage.getItem(municipio) === "completo") {
    alert("✅ Este municipio ya fue completado");
    return;
  }

  const p = obtenerPregunta(municipio);
  let html = `
    <div style="text-align:center">
      <h3>📌 ${p.texto}</h3>
      <div style="margin-top:15px">
  `;

  p.opciones.forEach((op, i) => {
    const letra = String.fromCharCode(65 + i);
    html += `
      <button onclick="verificar('${municipio}', ${i})">
        ${letra}. ${op}
      </button>
    `;
  });

  html += `</div></div>`;
  document.getElementById("pregunta").innerHTML = html;
}

/* VERIFICAR RESPUESTA */
function verificar(municipio, opcion) {
  if (tiempo <= 0) {
    alert("⏰ Tiempo agotado. Reinicia el juego.");
    return;
  }

  if (localStorage.getItem(municipio) === "completo") {
    alert("Este municipio ya fue completado");
    document.getElementById("pregunta").innerHTML = "";
    return;
  }

  const p = obtenerPregunta(municipio);

  if (opcion === p.correcta) {
    const elemento = document.getElementById(municipio);
    if (elemento) {
      elemento.style.fill = "#4CAF50";
      elemento.style.opacity = "1";
    }
    localStorage.setItem(municipio, "completo");
    piezasColocadas++;
    puntos += 10;
    alert("✅ ¡Correcto! +10 puntos");
  } else {
    puntos -= 2;
    alert(`❌ Incorrecto. La respuesta correcta era: ${p.opciones[p.correcta]} -2 puntos`);
  }

  document.getElementById("puntos").innerText = puntos;
  document.getElementById("completados").innerText = piezasColocadas;
  document.getElementById("pregunta").innerHTML = "";

  if (piezasColocadas === municipios.length) {
    clearInterval(reloj);
    alert(`🎉 ¡FELICIDADES! Completaste el mapa de Morelos con ${puntos} puntos.`);
    document.getElementById("pregunta").innerHTML = `
      <div style="background:#d4edda; padding:20px; border-radius:15px; text-align:center">
        <h3 style="color:#155724;">🎉 ¡HAS GANADO! 🎉</h3>
        <p>Puntuación final: ${puntos} puntos</p>
        <p>Tiempo restante: ${tiempo} segundos</p>
        <p>Municipios completados: ${piezasColocadas}/${municipios.length}</p>
        <button onclick="reiniciar()">🔄 Jugar de nuevo</button>
      </div>
    `;
  }
}

/* CARGAR PROGRESO GUARDADO */
function cargarProgreso() {
  piezasColocadas = 0;
  puntos = 0;
  
  municipios.forEach(m => {
    if (localStorage.getItem(m) === "completo") {
      const elemento = document.getElementById(m);
      if (elemento) {
        elemento.style.fill = "#4CAF50";
        elemento.style.opacity = "1";
      }
      piezasColocadas++;
      puntos += 10;
    }
  });
  
  document.getElementById("puntos").innerText = puntos;
  document.getElementById("completados").innerText = piezasColocadas;
}

/* REINICIAR JUEGO */
function reiniciar() {
  localStorage.clear();
  piezasColocadas = 0;
  puntos = 0;
  tiempo = 180;
  
  municipios.forEach(m => {
    const elemento = document.getElementById(m);
    if (elemento) {
      elemento.style.fill = "#d4c9a8";
      elemento.style.opacity = "0.85";
    }
  });
  
  document.getElementById("pregunta").innerHTML = "";
  document.getElementById("puntos").innerText = "0";
  document.getElementById("completados").innerText = "0";
  document.getElementById("tiempo").innerText = "180";
  
  if (reloj) clearInterval(reloj);
  iniciarTemporizador();
}

/* INICIALIZAR */
window.onload = () => {
  cargarProgreso();
  iniciarTemporizador();
};