let piezasColocadas = 0;
let puntos = 0;
let tiempo = 120;

const municipios = ["cuernavaca", "jiutepec", "cuautla"];

const preguntas = {
  cuernavaca: {
    texto: "¿Cómo se le conoce a Cuernavaca?",
    opciones: [
      "Ciudad del sol",
      "La eterna primavera",
      "Ciudad colonial"
    ],
    correcta: 1
  },
  jiutepec: {
    texto: "¿Actividad económica principal de Jiutepec?",
    opciones: [
      "Pesca",
      "Industria",
      "Minería"
    ],
    correcta: 1
  },
  cuautla: {
    texto: "¿Qué héroe histórico se relaciona con Cuautla?",
    opciones: [
      "Benito Juárez",
      "José María Morelos",
      "Miguel Hidalgo"
    ],
    correcta: 1
  }
};

/* TEMPORIZADOR */
let reloj = setInterval(() => {
  document.getElementById("tiempo").innerText = tiempo;
  tiempo--;
  if (tiempo < 0) {
    clearInterval(reloj);
    alert("⏰ Tiempo terminado");
  }
}, 1000);

/* MOSTRAR PREGUNTA */
function mostrarPregunta(municipio) {

  if (localStorage.getItem(municipio) === "completo") {
    alert("Este municipio ya fue contestado");
    return;
  }

  const p = preguntas[municipio];
  let html = `<h3>${p.texto}</h3>`;

  p.opciones.forEach((op, i) => {
    html += `
      <button onclick="verificar('${municipio}', ${i})">
        ${String.fromCharCode(65+i)}. ${op}
      </button><br><br>
    `;
  });

  document.getElementById("pregunta").innerHTML = html;
}

/* VERIFICAR */
function verificar(municipio, opcion) {
  const p = preguntas[municipio];

  if (opcion === p.correcta) {
    document.getElementById(municipio).style.fill = "#4CAF50";
    localStorage.setItem(municipio, "completo");
    piezasColocadas++;
    puntos += 10;
    alert("✅ Correcto");
  } else {
    puntos -= 2;
    alert("❌ Incorrecto");
  }

  document.getElementById("puntos").innerText = puntos;
  document.getElementById("pregunta").innerHTML = "";

  if (piezasColocadas === municipios.length) {
    clearInterval(reloj);
    alert("🎉 ¡Completaste el mapa de Morelos!");
  }
}

/* CARGAR PROGRESO */
window.onload = () => {
  municipios.forEach(m => {
    if (localStorage.getItem(m) === "completo") {
      document.getElementById(m).style.fill = "#4CAF50";
      piezasColocadas++;
      puntos += 10;
    }
  });
  document.getElementById("puntos").innerText = puntos;
};

/* REINICIAR */
function reiniciar() {
  localStorage.clear();
  location.reload();
}
