// ==========================================
// 1. CONFIGURACIÓN INICIAL Y GLOBALES
// ==========================================
const API_BASE = "http://localhost:3000/api";
let idEditando = null;
let idDeptoEditando = null;

document.addEventListener("DOMContentLoaded", () => {
  // Carga de tablas
  if (document.getElementById("tablaEmpleados")) cargarEmpleados();
  if (document.getElementById("tablaDepartamentos")) cargarDepartamentos();
  if (document.getElementById("tablaNomina")) cargarNomina();

  // Carga del Dashboard (Verifica por el ID que tienes en tu index.html)
  if (document.getElementById("totalEmpleados") || document.querySelector(".Dashboard")) {
    cargarMetricasDashboard();
  }
});

// FUNCIÓN PARA RELLENAR EL SELECTOR DE DEPARTAMENTOS
async function actualizarSelectDepartamentos() {
  const select = document.getElementById("departamento");
  if (!select) return;

  try {
    const res = await fetch(`${API_BASE}/departamentos`);
    const deptos = await res.json();
    // Solo mostramos los departamentos activos para nuevos empleados
    select.innerHTML = deptos
      .filter((d) => d.estado !== "Inactivo")
      .map((d) => `<option value="${d.nombre}">${d.nombre}</option>`)
      .join("");
  } catch (e) {
    console.error("Error al llenar departamentos", e);
  }
}

// Inicializar el botón de Nuevo Empleado (CORREGIDO)
const btnNuevo = document.getElementById("btnNuevoEmpleado");
if (btnNuevo) {
  btnNuevo.onclick = async () => {
    idEditando = null;
    const modal = document.getElementById("modalEmpleado");
    if (modal) {
      document.getElementById("nombre").value = "";
      document.getElementById("rol").value = "";
      document.getElementById("guardarEmpleado").innerText = "Guardar Empleado";

      // IMPORTANTE: Llenamos el select antes de mostrar el modal
      await actualizarSelectDepartamentos();

      modal.style.display = "flex";
    }
  };
}

// ==========================================
// 2. MÓDULO: EMPLEADOS
// ==========================================

async function cargarEmpleados() {
  const tabla = document.getElementById("tablaEmpleados");
  if (!tabla) return;

  try {
    const res = await fetch(`${API_BASE}/empleados`);
    const datos = await res.json();

    tabla.innerHTML = "";
    datos.forEach((emp) => {
      tabla.innerHTML += `
                <tr class="border-t hover:bg-gray-50 transition">
                    <td class="p-3">${emp.nombre}</td>
                    <td class="p-3">${emp.departamento}</td>
                    <td class="p-3">${emp.rol}</td>
                    <td class="p-3">
                        <span class="${emp.estado === "Inactivo" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"} px-2 py-1 rounded-full text-xs font-semibold">
                            ${emp.estado || "Activo"}
                        </span>
                    </td>
                    <td class="p-3 text-right">
                        <button onclick="prepararEdicion('${emp._id}', '${emp.nombre}', '${emp.departamento}', '${emp.rol}')" class="text-blue-600 hover:underline mr-3 font-medium">Editar</button>
                        <button onclick="eliminarEmpleado('${emp._id}')" class="text-red-600 hover:underline font-medium">Eliminar</button>
                    </td>
                </tr>`;
    });

    // Actualizar métricas superiores si existen
    if (document.getElementById("totalEmpleados"))
      document.getElementById("totalEmpleados").innerText = datos.length;
    if (document.getElementById("empleadosActivos")) {
      const activos = datos.filter((e) => e.estado !== "Inactivo").length;
      document.getElementById("empleadosActivos").innerText = activos;
    }
    if (document.getElementById("empleadosInactivos")) {
      const inactivos = datos.filter((e) => e.estado === "Inactivo").length;
      document.getElementById("empleadosInactivos").innerText = inactivos;
    }
  } catch (e) {
    console.error("Error al cargar empleados:", e);
  }
}

async function eliminarEmpleado(id) {
  if (confirm("¿Estás seguro de que deseas eliminar a este empleado?")) {
    try {
      const res = await fetch(`${API_BASE}/empleados/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Empleado eliminado con éxito");
        cargarEmpleados();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  }
}

async function prepararEdicion(id, nombre, depto, rol) {
  idEditando = id;

  // Solo intenta llenar si el select existe en el HTML actual
  const selectDep = document.getElementById("departamento");
  if (selectDep) {
    await actualizarSelectDepartamentos();
    selectDep.value = depto;
  }

  if (document.getElementById("nombre"))
    document.getElementById("nombre").value = nombre;
  if (document.getElementById("rol"))
    document.getElementById("rol").value = rol;

  const modal = document.getElementById("modalEmpleado");
  if (modal) modal.style.display = "flex";
}

const btnGuardar = document.getElementById("guardarEmpleado");
if (btnGuardar) {
  btnGuardar.onclick = async () => {
    const nombre = document.getElementById("nombre").value;
    const departamento = document.getElementById("departamento").value;
    const rol = document.getElementById("rol").value;

    if (!nombre || !departamento || !rol)
      return alert("Por favor llena todos los campos");

    const datosEmp = { nombre, departamento, rol };
    let url = `${API_BASE}/empleados`;
    let metodo = idEditando ? "PUT" : "POST";
    if (idEditando) url += `/${idEditando}`;

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosEmp),
      });

      if (res.ok) {
        alert(idEditando ? "Empleado actualizado" : "Empleado guardado");
        idEditando = null;
        const modal = document.getElementById("modalEmpleado");
        if (modal) modal.style.display = "none";
        cargarEmpleados();
      }
    } catch (error) {
      alert("Error en la operación");
    }
  };
}

// ==========================================
// 3. MÓDULO: DEPARTAMENTOS
// ==========================================

async function cargarDepartamentos() {
  const tabla = document.getElementById("tablaDepartamentos");
  const contenedorTarjetas = document.getElementById("contenedorTarjetas");
  if (!tabla) return;

  try {
    // Traemos Departamentos y Empleados para cruzar los datos
    const [resDep, resEmp] = await Promise.all([
      fetch(`${API_BASE}/departamentos`),
      fetch(`${API_BASE}/empleados`),
    ]);

    const departamentos = await resDep.json();
    const empleados = await resEmp.json();

    tabla.innerHTML = "";
    if (contenedorTarjetas) contenedorTarjetas.innerHTML = "";

    departamentos.forEach((dep) => {
      // Conteo real cruzando la tabla de empleados
      const conteoReal = empleados.filter(
        (e) => e.departamento === dep.nombre,
      ).length;

      // Llenar la tabla
      tabla.innerHTML += `
                <tr class="border-t hover:bg-gray-50 transition">
                    <td class="p-3 font-semibold text-gray-800">${dep.nombre}</td>
                    <td class="p-3 text-gray-600">${dep.responsable || "Sin asignar"}</td>
                    <td class="p-3 text-center font-medium">
                        <span class="bg-gray-100 px-2 py-1 rounded text-sm">${conteoReal}</span>
                    </td>
                    <td class="p-3">
                        <span class="${dep.estado === "Inactivo" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"} px-2 py-1 rounded-full text-xs font-semibold">
                            ${dep.estado || "Activo"}
                        </span>
                    </td>
                    <td class="p-3 text-right">
                        <button onclick="prepararEdicionDepto('${dep._id}', '${dep.nombre}', '${dep.responsable}')" class="text-blue-600 mr-3 hover:underline font-medium">Editar</button>
                        <button onclick="eliminarDepartamento('${dep._id}')" class="text-red-600 hover:underline font-medium">Eliminar</button>
                    </td>
                </tr>`;

      // Llenar Tarjetas Superiores
      if (contenedorTarjetas) {
        const colorBorde =
          dep.estado === "Inactivo" ? "border-red-400" : "border-blue-500";
        contenedorTarjetas.innerHTML += `
                    <div class="bg-white p-5 rounded-lg shadow-sm border-t-4 ${colorBorde} hover:shadow-md transition">
                        <h3 class="font-bold text-lg text-gray-800">${dep.nombre}</h3>
                        <p class="text-sm text-gray-500 mt-2"> ${dep.responsable || "Sin asignar"}</p>
                        <div class="mt-4 pt-3 border-t border-gray-100">
                            <span class="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                 ${conteoReal} Empleados
                            </span>
                        </div>
                    </div>`;
      }
    });

    // Métricas inferiores
    if (document.getElementById("totalDeptos"))
      document.getElementById("totalDeptos").innerText = departamentos.length;
    if (document.getElementById("deptosActivos")) {
      const activos = departamentos.filter(
        (d) => d.estado !== "Inactivo",
      ).length;
      document.getElementById("deptosActivos").innerText = activos;
    }
  } catch (e) {
    console.error("Error al cargar departamentos:", e);
  }
}

const btnNuevoDepto = document.getElementById("btnNuevoDepto");
if (btnNuevoDepto) {
  btnNuevoDepto.onclick = () => {
    idDeptoEditando = null;
    document.getElementById("nombreDepto").value = "";
    document.getElementById("responsableDepto").value = "";

    const btnGuardar = document.getElementById("guardarDepto");
    if (btnGuardar) btnGuardar.innerText = "Guardar";

    const titulo = document.getElementById("tituloModalDepto");
    if (titulo) titulo.innerText = "Nuevo Departamento";

    document.getElementById("modalDepto").style.display = "flex";
  };
}

function prepararEdicionDepto(id, nombre, responsable) {
  idDeptoEditando = id;
  document.getElementById("nombreDepto").value = nombre;
  document.getElementById("responsableDepto").value = responsable;

  const btnGuardar = document.getElementById("guardarDepto");
  if (btnGuardar) btnGuardar.innerText = "Actualizar Cambios";

  const titulo = document.getElementById("tituloModalDepto");
  if (titulo) titulo.innerText = "Editar Departamento";

  const modal = document.getElementById("modalDepto");
  if (modal) modal.style.display = "flex";
}

const btnGuardarDepto = document.getElementById("guardarDepto");
if (btnGuardarDepto) {
  btnGuardarDepto.onclick = async () => {
    const nombre = document.getElementById("nombreDepto").value;
    const responsable = document.getElementById("responsableDepto").value;
    const estado = document.getElementById("estadoDepto")
      ? document.getElementById("estadoDepto").value
      : "Activo";

    if (!nombre) return alert("El nombre del departamento es obligatorio");

    const datos = { nombre, responsable, estado };
    let url = `${API_BASE}/departamentos`;
    let metodo = idDeptoEditando ? "PUT" : "POST";
    if (idDeptoEditando) url += `/${idDeptoEditando}`;

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (res.ok) {
        document.getElementById("modalDepto").style.display = "none";
        alert(
          idDeptoEditando
            ? "Departamento actualizado"
            : "Departamento creado",
        );
        cargarDepartamentos();
      } else {
        // NUEVO: Esto nos avisará si el backend rechaza la actualización
        alert(
          "El servidor no pudo actualizar. Revisa la consola para más detalles.",
        );
        console.error("Error del servidor:", await res.text());
      }
    } catch (e) {
      alert("Error de conexión al intentar guardar");
      console.error(e);
    }
  };
}

async function eliminarDepartamento(id) {
  if (confirm("¿Eliminar este departamento? Los empleados no se borrarán.")) {
    await fetch(`${API_BASE}/departamentos/${id}`, { method: "DELETE" });
    cargarDepartamentos();
  }
}

async function llenarSelectDepartamentos(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const res = await fetch(`${API_BASE}/departamentos`);
    const departamentos = await res.json();

    // Limpiamos y añadimos opción por defecto
    select.innerHTML = '<option value="">Seleccione un área...</option>';

    departamentos.forEach((dep) => {
      if (dep.estado !== "Inactivo") {
        // Solo mostrar los activos
        const option = document.createElement("option");
        option.value = dep.nombre;
        option.textContent = dep.nombre;
        select.appendChild(option);
      }
    });
  } catch (e) {
    console.error("Error al llenar lista de departamentos:", e);
  }
}
// ==========================================
// 4. MÓDULO: NÓMINA
// ==========================================


async function cargarNomina() {
  const tabla = document.getElementById("tablaNomina");
  if (!tabla) return;

  try {
    const res = await fetch(`${API_BASE}/nomina`);
    const datos = await res.json();

    tabla.innerHTML = "";

    let sumaTotal = 0;
    let enEspera = 0;
    let procesados = 0;
    let rechazos = 0;

    datos.forEach((pago) => {
      const montoNum = Number(pago.monto) || 0;
      const estadoLimpio = pago.estado ? pago.estado.trim() : "Pendiente";

      if (estadoLimpio === "Pendiente") {
        enEspera++;
      } else if (estadoLimpio === "Pagado") {
        procesados++;
        sumaTotal += montoNum;
      } else if (estadoLimpio === "Rechazado") {
        rechazos++;
      }

      const fechaFormateada = new Date(pago.fecha).toLocaleDateString();

      // Dibujamos la tabla
      tabla.innerHTML += `
                <tr class="border-t hover:bg-gray-50 transition">
                    <td class="p-4 font-semibold text-gray-800">${pago.empleado || "N/A"}</td>
                    <td class="p-4 text-gray-600">${pago.departamento || "N/A"}</td>
                    <td class="p-4 font-bold text-gray-900">$${montoNum.toLocaleString()}</td>
                    <td class="p-4 text-gray-500 text-sm">${fechaFormateada}</td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded-full text-xs font-semibold ${obtenerClaseEstado(estadoLimpio)}">
                            ${estadoLimpio}
                        </span>
                    </td>
                    <td class="p-4 text-right">
                        <button class="text-blue-600 hover:underline text-sm font-medium mr-3">Recibo</button>
                        
                        <button onclick="eliminarNomina('${pago._id}')" class="text-red-600 hover:underline text-sm font-medium">
                            Borrar
                        </button>
                    </td>
                </tr>`;
    });

    // --- MANTENEMOS TODA TU LÓGICA DE TARJETAS ---
    if (document.getElementById("pagosPendientes")) document.getElementById("pagosPendientes").innerText = enEspera;
    if (document.getElementById("pagosRechazados")) document.getElementById("pagosRechazados").innerText = rechazos;
    if (document.getElementById("empleadosPagados")) document.getElementById("empleadosPagados").innerText = procesados;
    if (document.getElementById("pagosProcesados")) document.getElementById("pagosProcesados").innerText = procesados;
    if (document.getElementById("totalNominaMes")) document.getElementById("totalNominaMes").innerText = `$${sumaTotal.toLocaleString()}`;

    if (document.getElementById("promedioPago") && procesados > 0) {
      const promedio = sumaTotal / procesados;
      document.getElementById("promedioPago").innerText = `$${promedio.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }

    verificarCierreNomina(enEspera, procesados);

  } catch (e) {
    console.error("Error al cargar nómina:", e);
  }
}

// ==========================================
// FUNCIONES AUXILIARES (AGREGAR O REEMPLAZAR)
// ==========================================

function obtenerClaseEstado(estado) {
  switch (estado) {
    case 'Pendiente': return 'bg-yellow-100 text-yellow-700';
    case 'Pagado': return 'bg-green-100 text-green-700';
    case 'Rechazado': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function verificarCierreNomina(pendientes, procesados) {
  // Usamos el ID "alertaCierre" que tienes al final de tu HTML
  const contenedor = document.getElementById("alertaCierre");
  if (!contenedor) return;

  if (pendientes === 0 && procesados > 0) {
    contenedor.className = "bg-green-50 border-l-4 border-green-500 p-6 rounded-xl shadow-sm mt-8 flex justify-between items-center";
    contenedor.innerHTML = `
            <div>
                <h3 class="font-bold text-green-800 flex items-center gap-2">Nómina de Periodo Finalizada</h3>
                <p class="text-sm text-green-700 mt-1">Todos los pagos han sido procesados. No quedan registros pendientes.</p>
            </div>
            <span class="text-green-500 text-2xl">-</span>
        `;
  }
}
// ==========================================
// 5. MÓDULO: DASHBOARD (INDEX)
// ==========================================

async function cargarMetricasDashboard() {
  if (!document.getElementById("nominaMensual")) return;

  try {
    const [resEmpleados, resDeptos, resNomina] = await Promise.all([
      fetch(`${API_BASE}/empleados`),
      fetch(`${API_BASE}/departamentos`),
      fetch(`${API_BASE}/nomina`),
    ]);

    const empleados = await resEmpleados.json();
    const deptos = await resDeptos.json();
    const nomina = await resNomina.json();

    // Totales Superiores
    document.getElementById("totalEmpleados").innerText = empleados.length;
    document.getElementById("totalDepartamentos").innerText = deptos.length;

    const totalNomina = nomina.reduce(
      (suma, pago) => suma + (pago.monto || 0),
      0,
    );
    document.getElementById("nominaMensual").innerText =
      `$${totalNomina.toLocaleString("es-MX")}`;

    const activos = empleados.filter((emp) => emp.estado !== "Inactivo").length;
    document.getElementById("contratacionesMes").innerText = activos;

    // Actividad Reciente
    const listaActividad = document.getElementById("actividadReciente");
    listaActividad.innerHTML = "";
    const ultimosEmpleados = empleados.slice(-3).reverse();

    if (ultimosEmpleados.length === 0) {
      listaActividad.innerHTML =
        "<li class='text-gray-400 italic'>No hay actividad reciente</li>";
    } else {
      ultimosEmpleados.forEach((emp) => {
        listaActividad.innerHTML += `
                    <li class="flex items-center gap-2 border-b pb-2">
                        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span class="text-sm">Nuevo empleado: <strong>${emp.nombre}</strong> (${emp.rol || "Sin rol"})</span>
                    </li>`;
      });
    }

    // Alertas del Sistema
    const listaAlertas = document.getElementById("alertasSistema");
    listaAlertas.innerHTML = "";
    let hayAlertas = false;

    const pagosPendientes = nomina.filter(
      (p) => p.estado === "Pendiente",
    ).length;
    if (pagosPendientes > 0) {
      listaAlertas.innerHTML += `
                <li class="flex items-center gap-2 border-b pb-2 text-orange-600">
                    <span>Tienes <strong>${pagosPendientes}</strong> pagos de nómina pendientes.</span>
                </li>`;
      hayAlertas = true;
    }

    const deptosInactivos = deptos.filter(
      (d) => d.estado === "Inactivo",
    ).length;
    if (deptosInactivos > 0) {
      listaAlertas.innerHTML += `
                <li class="flex items-center gap-2 border-b pb-2 text-red-600">
                    <span> Hay <strong>${deptosInactivos}</strong> departamentos inactivos.</span>
                </li>`;
      hayAlertas = true;
    }

    if (!hayAlertas) {
      listaAlertas.innerHTML =
        "<li class='text-green-600 font-medium'>Todo está en orden. Sin alertas.</li>";
    }
  } catch (e) {
    console.error("Error al cargar el dashboard:", e);
  }
}

// ==========================================
// 6. UTILIDADES: BUSCADOR Y GLOBALES
// ==========================================

const inputBuscar = document.getElementById("buscarEmpleado");
if (inputBuscar) {
  inputBuscar.addEventListener("input", (e) => {
    const texto = e.target.value.toLowerCase();
    const filas = document.querySelectorAll("#tablaEmpleados tr");
    filas.forEach((fila) => {
      const nombre = fila.cells[0].innerText.toLowerCase();
      fila.style.display = nombre.includes(texto) ? "" : "none";
    });
  });
}

// Exponer funciones necesarias al objeto window
window.eliminarEmpleado = eliminarEmpleado;
window.prepararEdicion = prepararEdicion;
window.eliminarDepartamento = eliminarDepartamento;
window.prepararEdicionDepto = prepararEdicionDepto;
window.prepararNuevaNomina = prepararNuevaNomina;

// Cierre de Modales haciendo clic fuera de ellos
window.onclick = function (event) {
  const modalEmp = document.getElementById("modalEmpleado");
  const modalDep = document.getElementById("modalDepto");
  const modalNom = document.getElementById("modalNomina");

  if (event.target == modalEmp) {
    modalEmp.style.display = "none";
    idEditando = null;
  }
  if (event.target == modalDep) {
    modalDep.style.display = "none";
    idDeptoEditando = null;
  }
  if (event.target == modalNom) {
    modalNom.style.display = "none";
  }
};

async function prepararNuevaNomina() {
    const modal = document.getElementById("modalNomina");
    if (!modal) return;

    // Abrimos el modal
    modal.style.display = "flex";

    try {
        // 👇 AQUÍ ESTÁ LA MAGIA: Usamos los IDs exactos de tu HTML 👇
        const selectEmp = document.getElementById("nomEmpleado");
        const selectDep = document.getElementById("nomDepartamento");

        // Traemos la información del backend
        const [resEmp, resDep] = await Promise.all([
            fetch(`${API_BASE}/empleados`),
            fetch(`${API_BASE}/departamentos`)
        ]);

        const empleados = await resEmp.json();
        const departamentos = await resDep.json();

        // Llenamos la lista de empleados
        if (selectEmp) {
            selectEmp.innerHTML = '<option value="">-- Seleccione Empleado --</option>';
            
            empleados.forEach(emp => {
                const option = document.createElement("option");
                option.value = emp.nombre;
                option.textContent = emp.nombre;
                // Guardamos el departamento del empleado escondido aquí
                option.dataset.depto = emp.departamento; 
                selectEmp.appendChild(option);
            });

            // Al cambiar de empleado, asignar su departamento automáticamente
            selectEmp.onchange = function() {
                const deptoAsignado = this.options[this.selectedIndex].dataset.depto;
                if (selectDep && deptoAsignado) {
                    selectDep.value = deptoAsignado;
                }
            };
        }

        // Llenamos la lista de departamentos
        if (selectDep) {
            selectDep.innerHTML = '<option value="">-- Seleccione Departamento --</option>';
            departamentos.forEach(dep => {
                const option = document.createElement("option");
                option.value = dep.nombre;
                option.textContent = dep.nombre;
                selectDep.appendChild(option);
            });
        }

    } catch (error) {
        console.error("Error cargando los datos para la nómina:", error);
    }
}

// 2. FUNCIÓN PARA BORRAR NÓMINA
async function eliminarNomina(id) {
  if (!confirm("¿Estás seguro de eliminar este registro de pago?")) return;

  try {
    const res = await fetch(`${API_BASE}/nomina/${id}`, { method: "DELETE" });
    if (res.ok) {
      cargarNomina(); // Recargamos la tabla
    }
  } catch (e) {
    alert("No se pudo eliminar la nómina");
  }
}

async function eliminarNomina(id) {

    console.log("El botón mandó a borrar el ID:", id);
    if (!confirm("¿Estás seguro de que deseas eliminar este registro de pago?")) return;

    try {
        const res = await fetch(`${API_BASE}/nomina/${id}`, {
            method: "DELETE"
        });

        if (res.ok) {
            // Si el servidor lo borró bien, refrescamos la tabla automáticamente
            cargarNomina(); 
        } else {
            alert("Error al intentar eliminar el registro.");
        }
    } catch (error) {
        console.error("Error en la petición de borrado:", error);
    }
}

// IMPORTANTE: Para que el HTML vea la función, agrégala a esta lista que ya tienes al final de tu app.js
window.eliminarNomina = eliminarNomina;
window.prepararNuevaNomina = prepararNuevaNomina;