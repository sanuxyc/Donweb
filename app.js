const NUMERO = "5493410000000";   // WhatsApp del negocio, con código de país
const PRECIO_UNIDAD = 1800;
const PRECIO_DOCENA = 20000;
const COSTO_ENVIO = 1500;

const empanadas = [
  { id: "e1", nombre: "Carne cortada a cuchillo" },
  { id: "e2", nombre: "Jamón y queso" },
  { id: "e3", nombre: "Pollo" },
  { id: "e4", nombre: "Humita" },
  { id: "e5", nombre: "Caprese" },
  { id: "e6", nombre: "Verdura" },
];
const bebidas = [
  { id: "b1", nombre: "Gaseosa 1.5L", precio: 3000 },
  { id: "b2", nombre: "Cerveza 1L", precio: 4500 },
  { id: "b3", nombre: "Agua 500ml", precio: 1200 },
];
const cant = {};
const $ = id => document.getElementById(id);
const q = id => cant[id] || 0;

function totalEmpanadas() {
  const n = empanadas.reduce((s, p) => s + q(p.id), 0);
  const docenas = Math.floor(n / 12), sueltas = n % 12;
  return { n, docenas, sueltas, monto: docenas * PRECIO_DOCENA + sueltas * PRECIO_UNIDAD };
}
const montoBebidas = () => bebidas.reduce((s, b) => s + b.precio * q(b.id), 0);
const esEnvio = () => document.querySelector('input[name=entrega]:checked').value === "Envío";

function fila(p, detalle) {
  return `<div class="item"><div>${p.nombre}<br><small>${detalle}</small></div>
    <div class="ctrl"><button data-id="${p.id}" data-d="-1">−</button>
    <span class="cant">${q(p.id)}</span>
    <button data-id="${p.id}" data-d="1">+</button></div></div>`;
}

function render() {
  $("empanadas").innerHTML = empanadas.map(p => fila(p, `$${PRECIO_UNIDAD} c/u`)).join("");
  $("bebidas").innerHTML = bebidas.map(b => fila(b, `$${b.precio}`)).join("");

  const e = totalEmpanadas();
  const faltan = e.sueltas === 0 ? 0 : 12 - e.sueltas;
  $("aviso").textContent = e.n === 0
    ? `Docena a $${PRECIO_DOCENA} (mezclá los sabores que quieras)`
    : faltan ? `Te faltan ${faltan} para completar la docena y ahorrar` : "¡Docenas completas! 🎉";

  const lineas = [...empanadas, ...bebidas].filter(p => q(p.id) > 0)
    .map(p => `<li>${q(p.id)} x ${p.nombre}</li>`);
  $("resumen").innerHTML = lineas.join("") || "<li>Todavía no elegiste nada</li>";

  const envio = esEnvio() && (e.n + montoBebidas()) > 0 ? COSTO_ENVIO : 0;
  const total = e.monto + montoBebidas() + envio;
  $("totales").innerHTML =
    `Empanadas (${e.n}): $${e.monto}<br>Bebidas: $${montoBebidas()}<br>Envío: $${envio}<br>
     <span class="total">Total: $${total}</span>`;
  $("direccion").style.display = esEnvio() ? "block" : "none";
  return { total, envio, e };
}

document.addEventListener("click", ev => {
  const b = ev.target.closest(".ctrl button");
  if (!b) return;
  cant[b.dataset.id] = Math.max(0, q(b.dataset.id) + Number(b.dataset.d));
  render();
});
document.querySelectorAll("input[name=entrega]").forEach(r => r.addEventListener("change", render));

$("enviar").addEventListener("click", () => {
  const nombre = $("nombre").value.trim();
  const tel = $("telefono").value.trim();
  const dir = $("direccion").value.trim();
  const { total, envio, e } = render();
  if (!nombre || !tel || (esEnvio() && !dir) || (e.n + montoBebidas()) === 0) {
    alert("Completá tu nombre, teléfono, dirección (si es envío) y al menos un producto.");
    return;
  }
  const nro = "P" + Date.now().toString().slice(-6);
  const detalle = [...empanadas, ...bebidas].filter(p => q(p.id) > 0)
    .map(p => `• ${q(p.id)} x ${p.nombre}`).join("\n");
  const msg =
    `*PEDIDO ${nro}*\n` +
    `Cliente: ${nombre}\nTeléfono: ${tel}\n` +
    `Entrega: ${esEnvio() ? "Envío - " + dir : "Retiro en el local"}\n\n` +
    `${detalle}\n\n` +
    (e.n ? `Total empanadas: ${e.n} (${e.docenas} doc + ${e.sueltas} sueltas)\n` : "") +
    (envio ? `Envío: $${envio}\n` : "") +
    `*TOTAL: $${total}*\nPago: ${$("pago").value}` +
    ($("notas").value.trim() ? `\nNotas: ${$("notas").value.trim()}` : "");
  window.open(`https://wa.me/${NUMERO}?text=${encodeURIComponent(msg)}`, "_blank");
});

render();
