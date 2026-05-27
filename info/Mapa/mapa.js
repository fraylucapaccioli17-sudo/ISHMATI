// ================= DATOS =================
const datos = {
  "Tepoztlán": { 
    alcalde: "Perseo Quiroz", 
    poblacion: "44,883", 
    pregunta: "Pirámide en un cerro", 
    conocido: "Tepozteco" 
  },
  "Coatetelco": { 
    alcalde: "Norberto Zamorano", 
    poblacion: "9,672", 
    pregunta: "Municipio con una laguna famosa", 
    conocido: "Laguna de Coatetelco" 
  },
  "Cuernavaca": { 
    alcalde: "José Urióstegui", 
    poblacion: "366,321", 
    pregunta: "La eterna primavera", 
    conocido: "Palacio de Cortés" 
  },
  "Jiutepec": { 
    alcalde: "Éder Rodríguez", 
    poblacion: "196,953", 
    pregunta: "Zona industrial importante", 
    conocido: "CIVAC" 
  },
  "Temixco": { 
    alcalde: "Israel Piña", 
    poblacion: "109,064", 
    pregunta: "Municipio con parque acuático", 
    conocido: "Parque acuático Ex Hacienda de Temixco" 
  },
  "Yautepec": { 
    alcalde: "Agustín Alonso", 
    poblacion: "100,161", 
    pregunta: "Lugar donde nació Emiliano Zapata", 
    conocido: "Anenecuilco" 
  },
  "Xochitepec": { 
    alcalde: "Gonzalo Flores", 
    poblacion: "80,029", 
    pregunta: "Municipio con parque ecológico", 
    conocido: "El Texcal" 
  },
  "Jojutla": { 
    alcalde: "Alan Martínez", 
    poblacion: "53,613", 
    pregunta: "Municipio con isla turística", 
    conocido: "Isla de Jiquilpan" 
  },
  "Tlayacapan": { 
    alcalde: "Pedro Montenegro", 
    poblacion: "18,768", 
    pregunta: "Pueblo mágico con convento", 
    conocido: "Ex convento agustino" 
  },
  "Yecapixtla": { 
    alcalde: "Heladio Sánchez", 
    poblacion: "37,893", 
    pregunta: "Municipio famoso por su convento", 
    conocido: "San Juan Bautista" 
  }
};

// ================= VARIABLES =================
let preguntas = [];
let preguntaActual = 0;
let aciertos = 0;
let totalPreguntas = 10;
let juegoTerminado = false;
let mapaCargado = false;

const svg = d3.select("#mapa-svg");

// ================= MAPA =================
d3.json("17mun.json").then(data => {
  const projection = d3.geoIdentity().reflectY(true).fitSize([800, 600], data);
  const path = d3.geoPath().projection(projection);

  svg.selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("class", "municipio")
    .attr("d", path)
    .on("click", (event, d) => {
      alHacerClic(getNombre(d));
    });

  // NOMBRES
  svg.selectAll("text")
    .data(data.features)
    .enter()
    .append("text")
    .attr("class", "muni-label")
    .attr("x", d => path.centroid(d)[0])
    .attr("y", d => path.centroid(d)[1])
    .text(d => getNombre(d));

  mapaCargado = true;
  reiniciarJuego();
}).catch(error => {
  console.error("Error cargando el mapa:", error);
  document.getElementById("reto").innerHTML = "❌ Error al cargar el mapa. Verifica el archivo 17mun.json";
});

// ================= FUNCIONES =================
function getNombre(d) {
  return d.properties.NOM_MUN || d.properties.NOMGEO;
}

function actualizarContador() {
  document.getElementById("contador-aciertos").textContent = aciertos;
}

function generarPreguntas() {
  preguntas = [];
  const keys = Object.keys(datos);

  while (preguntas.length < totalPreguntas) {
    const r = keys[Math.floor(Math.random() * keys.length)];
    if (!preguntas.includes(r)) preguntas.push(r);
  }
}

function nuevoReto() {
  if (preguntaActual >= totalPreguntas) {
    terminarJuego();
    return;
  }

  const nombre = preguntas[preguntaActual];
  const preguntaDiv = document.querySelector(".reto-pregunta");
  const pistaDiv = document.querySelector(".reto-pista");
  
  if (preguntaDiv) preguntaDiv.innerHTML = `🎯 ${datos[nombre].pregunta}`;
  if (pistaDiv) pistaDiv.innerHTML = `💡 Pista: ${datos[nombre].conocido}`;
}

function alHacerClic(nombre) {
  if (juegoTerminado || !mapaCargado) return;

  const correcto = preguntas[preguntaActual];
  const preguntaDiv = document.querySelector(".reto-pregunta");
  
  if (nombre === correcto) {
    aciertos++;
    actualizarContador();
    preguntaDiv.innerHTML = "✅ ¡Correcto! +1 punto";
    
    d3.selectAll("path")
      .filter(d => getNombre(d) === nombre)
      .classed("correcto", true);
  } else {
    preguntaDiv.innerHTML = `❌ Incorrecto. Era: ${correcto}`;
  }

  preguntaActual++;
  setTimeout(nuevoReto, 1300);
  mostrarInfo(nombre);
}

function terminarJuego() {
  juegoTerminado = true;
  const preguntaDiv = document.querySelector(".reto-pregunta");
  const pistaDiv = document.querySelector(".reto-pista");
  
  if (preguntaDiv) preguntaDiv.innerHTML = `📊 ¡JUEGO TERMINADO!`;
  if (pistaDiv) pistaDiv.innerHTML = `🎯 Aciertos: ${aciertos} de ${totalPreguntas}`;
}

function reiniciarJuego() {
  preguntaActual = 0;
  aciertos = 0;
  juegoTerminado = false;
  actualizarContador();

  d3.selectAll("path").classed("correcto", false);
  generarPreguntas();
  nuevoReto();
  
  document.getElementById("info-panel").innerHTML = `
    <h3>ℹ️ Morelos</h3>
    <p>Haz clic en cualquier municipio del mapa</p>
    <p>🏆 ¡Adivina el que corresponde a la pregunta!</p>
  `;
}

function mostrarInfo(nombre) {
  const d = datos[nombre];
  const panel = document.getElementById("info-panel");

  if (d) {
    panel.innerHTML = `
      <h3>🏛️ ${nombre}</h3>
      <p><strong>👤 Alcalde:</strong> ${d.alcalde}</p>
      <p><strong>👥 Población:</strong> ${d.poblacion}</p>
      <p><strong>⭐ Conocido por:</strong> ${d.conocido}</p>
    `;
  } else {
    panel.innerHTML = `
      <h3>📌 ${nombre}</h3>
      <p>ℹ️ Municipio de Morelos</p>
      <p>Haz clic en otro para ver más información</p>
    `;
  }
}

// ===== BOTONES =====
document.getElementById("btn-reiniciar").addEventListener("click", () => {
  reiniciarJuego();
});

// Instrucciones flotantes
const instruccionesDiv = document.getElementById("instrucciones");
const btnAbrir = document.getElementById("abrir-instrucciones");
const btnCerrar = document.getElementById("cerrar-instrucciones");

if (btnAbrir) {
  btnAbrir.addEventListener("click", () => {
    instruccionesDiv.style.display = "block";
  });
}

if (btnCerrar) {
  btnCerrar.addEventListener("click", () => {
    instruccionesDiv.style.display = "none";
  });
}

// Por defecto, instrucciones visibles en escritorio, pero se pueden cerrar