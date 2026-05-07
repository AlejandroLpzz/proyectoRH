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

/** * FUNCIÓN DE VALIDACIÓN (Añadida para robustez)
 * Verifica si un valor ya existe para evitar duplicados antes de enviar al backend
 */
async function validarDuplicado(endpoint, campo, valor, idActual = null) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`);
    const datos = await res.json();
    return datos.some(item => 
      item[campo].trim().toLowerCase() === valor.trim().toLowerCase() && 
      item._id !== idActual
    );
  } catch (e) {
    return false;
  }
}

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

        // --- CÁLCULO DE MÉTRICAS PARA LAS TARJETAS ---
        const total = datos.length;
        const activos = datos.filter(e => (e.estado || "Activo") === "Activo").length;
        const inactivos = datos.filter(e => e.estado === "Inactivo").length;

        // Actualizar los IDs que tienes en tu HTML
        if (document.getElementById("totalEmpleados")) 
            document.getElementById("totalEmpleados").innerText = total;
        
        if (document.getElementById("empleadosActivos")) 
            document.getElementById("empleadosActivos").innerText = activos;
            
        if (document.getElementById("empleadosInactivos")) 
            document.getElementById("empleadosInactivos").innerText = inactivos;

        // Métricas inferiores (opcionales)
        if (document.getElementById("contratacionesMes"))
            document.getElementById("contratacionesMes").innerText = total;

        // --- RENDERIZADO DE LA TABLA ---
        tabla.innerHTML = "";
        datos.forEach((emp) => {
            const estado = emp.estado || "Activo";
            // Estilos para el badge de la tabla
            const claseBadge = estado === "Inactivo" 
                ? "bg-red-100 text-red-700 border-red-200" 
                : "bg-green-100 text-green-700 border-green-200";
            
            tabla.innerHTML += `
                <tr class="border-t hover:bg-gray-50 transition">
                    <td class="p-4">
                        <div class="font-bold text-gray-800">${emp.nombre}</div>
                    </td>
                    <td class="p-4 text-gray-600">${emp.departamento}</td>
                    <td class="p-4 text-gray-600">${emp.rol}</td>
                    <td class="p-4">
                        <span class="${claseBadge} px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider">
                            ${estado}
                        </span>
                    </td>
                    <td class="p-4 text-right">
                        <button onclick="prepararEdicion('${emp._id}', '${emp.nombre}', '${emp.departamento}', '${emp.rol}', '${estado}')" 
                                class="text-blue-600 hover:text-blue-800 mr-4 font-bold text-sm">
                            EDITAR
                        </button>
                        <button onclick="eliminarEmpleado('${emp._id}')" 
                                class="text-red-500 hover:text-red-700 font-bold text-sm">
                            ELIMINAR
                        </button>
                    </td>
                </tr>`;
        });
    } catch (e) {
        console.error("Error al cargar datos:", e);
    }
}

async function prepararEdicion(id, nombre, depto, rol, estado) {
  idEditando = id;

  // Llenar los campos del formulario
  if (document.getElementById("nombre")) document.getElementById("nombre").value = nombre;
  if (document.getElementById("rol")) document.getElementById("rol").value = rol;
  
  // Seleccionar el estado en el dropdown del modal
  const selectEstado = document.getElementById("estadoEmpleado");
  if (selectEstado) selectEstado.value = estado;

  // Actualizar select de departamentos (asegurando que el actual esté disponible)
  await actualizarSelectDepartamentos();
  const selectDep = document.getElementById("departamento");
  if (selectDep) selectDep.value = depto;

  // Mostrar modal y cambiar texto del botón
  const modal = document.getElementById("modalEmpleado");
  if (modal) {
      document.getElementById("guardarEmpleado").innerText = "Actualizar Empleado";
      modal.style.display = "flex";
  }
}


const btnGuardarEmp = document.getElementById("guardarEmpleado");
if (btnGuardarEmp) {
  btnGuardarEmp.onclick = async () => {
    const nombre = document.getElementById("nombre").value.trim();
    const departamento = document.getElementById("departamento").value;
    const rol = document.getElementById("rol").value.trim();
    const estado = document.getElementById("estadoEmpleado") ? document.getElementById("estadoEmpleado").value : "Activo";

    if (!nombre || !departamento || !rol) return alert("Faltan campos obligatorios");

    const datosEmp = { nombre, departamento, rol, estado };
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
        idEditando = null;
        document.getElementById("modalEmpleado").style.display = "none";
        cargarEmpleados();
        alert("Datos guardados correctamente");
      }
    } catch (error) {
      alert("Error al conectar con el servidor");
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
    const nombre = document.getElementById("nombreDepto").value.trim();
    const responsable = document.getElementById("responsableDepto").value.trim();
    const estado = document.getElementById("estadoDepto")
      ? document.getElementById("estadoDepto").value
      : "Activo";

    if (!nombre) return alert("El nombre del departamento es obligatorio");

    // VALIDACIÓN: Evitar nombres de departamentos repetidos
    const esDuplicado = await validarDuplicado("departamentos", "nombre", nombre, idDeptoEditando);
    if (esDuplicado) return alert("Este departamento ya existe.");

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
const btnGuardarNomina = document.getElementById("guardarNomina");
if (btnGuardarNomina) {
  btnGuardarNomina.onclick = async () => {
    // 1. Capturamos los valores del modal
    const empleado = document.getElementById("nomEmpleado").value;
    const departamento = document.getElementById("nomDepartamento").value;
    const monto = parseFloat(document.getElementById("nomMonto").value);
    const estado = document.getElementById("nomEstado").value;

    // 2. Validación
    if (!empleado || !departamento || isNaN(monto)) {
      return alert("Por favor llena todos los campos numéricos y de texto correctamente.");
    }
    
    // VALIDACIÓN DE ROBUSTEZ: Monto positivo
    if (monto <= 0) return alert("El monto debe ser mayor a cero.");

    // 3. Preparamos el paquete de datos
    const datosPago = { 
        empleado: empleado, 
        departamento: departamento, 
        monto: monto, 
        estado: estado,
        fecha: new Date().toISOString() 
    };

    try {
      const res = await fetch(`${API_BASE}/nomina`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosPago),
      });

      if (res.ok) {
        document.getElementById("modalNomina").style.display = "none";
        alert("✅ Pago registrado exitosamente");
        cargarNomina();
      } else {
        alert("Error al registrar el pago en el servidor.");
      }
    } catch (e) {
      console.error("Error al guardar nómina:", e);
      alert("Error de conexión con la base de datos.");
    }
  };
}
// ==========================================
// FUNCIONES AUXILIARES
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

    // alertas del Sistema
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

//buscar empleado
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

//crear nomina
async function prepararNuevaNomina() {
    const modal = document.getElementById("modalNomina");
    if (!modal) return;

    // abrimos el modal
    modal.style.display = "flex";

    try {
        const selectEmp = document.getElementById("nomEmpleado");
        const selectDep = document.getElementById("nomDepartamento");

        // traemos la información del backend
        const [resEmp, resDep] = await Promise.all([
            fetch(`${API_BASE}/empleados`),
            fetch(`${API_BASE}/departamentos`)
        ]);

        const empleados = await resEmp.json();
        const departamentos = await resDep.json();

        // llenamos lista de empleados
        if (selectEmp) {
            selectEmp.innerHTML = '<option value="">-- Seleccione Empleado --</option>';
            
            empleados.forEach(emp => {
                const option = document.createElement("option");
                option.value = emp.nombre;
                option.textContent = emp.nombre;
                option.dataset.depto = emp.departamento; 
                selectEmp.appendChild(option);
            });
            //asignar departamento a empleado nuevo 
            selectEmp.onchange = function() {
                const deptoAsignado = this.options[this.selectedIndex].dataset.depto;
                if (selectDep && deptoAsignado) {
                    selectDep.value = deptoAsignado;
                }
            };
        }

        // llenamos la lista de departamentos
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

// borarr nomina (mantenemos las dos versiones que tenías por si acaso)
async function eliminarNomina(id) {
    console.log("El botón mandó a borrar el ID:", id);
    if (!confirm("¿Estás seguro de que deseas eliminar este registro de pago?")) return;

    try {
        const res = await fetch(`${API_BASE}/nomina/${id}`, {
            method: "DELETE"
        });

        if (res.ok) {
            cargarNomina(); 
        } else {
            alert("Error al intentar eliminar el registro.");
        }
    } catch (error) {
        console.error("Error en la petición de borrado:", error);
    }
}

window.eliminarNomina = eliminarNomina;
window.prepararNuevaNomina = prepararNuevaNomina;

//cerrar sesion
function cerrarSesion() {
    // borrar datos de inicio de sesion
    localStorage.clear();
    sessionStorage.clear();

    // volver al login
    window.location.href = "login.html"; 
}

// cerrar sesion
window.cerrarSesion = cerrarSesion;