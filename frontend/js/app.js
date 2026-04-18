// 1. Configuración Inicial y Variable Global
const API_BASE = "http://localhost:3000/api";
let idEditando = null;
let idDeptoEditando = null;

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("tablaEmpleados")) cargarEmpleados();
    if (document.getElementById("tablaDepartamentos")) cargarDepartamentos();
    if (document.getElementById("tablaNomina")) cargarNomina();
    if (document.getElementById("totalEmpleados")) cargarMetricasDashboard();

    // Inicializar el botón de Nuevo Empleado
    const btnNuevo = document.getElementById("btnNuevoEmpleado");
    if (btnNuevo) {
        btnNuevo.onclick = () => {
            idEditando = null;
            const modal = document.getElementById("modalEmpleado");
            if (modal) {
                // Limpiar campos antes de abrir
                document.getElementById("nombre").value = "";
                document.getElementById("departamento").value = "";
                document.getElementById("rol").value = "";
                document.getElementById("guardarEmpleado").innerText = "Guardar";
                modal.style.display = "block";
            }
        };
    }
});

// --- FUNCIÓN: CARGAR EMPLEADOS ---
async function cargarEmpleados() {
    const tabla = document.getElementById("tablaEmpleados");
    if (!tabla) return;

    try {
        const res = await fetch(`${API_BASE}/empleados`);
        const datos = await res.json();

        tabla.innerHTML = "";
        datos.forEach(emp => {
            tabla.innerHTML += `
                <tr class="border-t">
                    <td class="p-3">${emp.nombre}</td>
                    <td class="p-3">${emp.departamento}</td>
                    <td class="p-3">${emp.rol}</td>
                    <td class="p-3">
                        <span class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">${emp.estado || 'Activo'}</span>
                    </td>
                    <td class="p-3 flex gap-2">
                        <button onclick="prepararEdicion('${emp._id}', '${emp.nombre}', '${emp.departamento}', '${emp.rol}')" class="text-blue-600 hover:underline">Editar</button>
                        <button onclick="eliminarEmpleado('${emp._id}')" class="text-red-600 hover:underline">Eliminar</button>
                    </td>
                </tr>`;
        });

        // Actualizar métricas en las tarjetas
        if (document.getElementById("totalEmpleados")) document.getElementById("totalEmpleados").innerText = datos.length;
        if (document.getElementById("empleadosActivos")) {
            const activos = datos.filter(e => e.estado === 'Activo' || !e.estado).length;
            document.getElementById("empleadosActivos").innerText = activos;
        }
        if (document.getElementById("empleadosInactivos")) {
            const inactivos = datos.filter(e => e.estado === 'Inactivo').length;
            document.getElementById("empleadosInactivos").innerText = inactivos;
        }

    } catch (e) { console.error("Error al cargar empleados:", e); }
}

// --- FUNCIÓN: ELIMINAR EMPLEADO ---
async function eliminarEmpleado(id) {
    if (confirm("¿Estás seguro de que deseas eliminar a este empleado?")) {
        try {
            const res = await fetch(`${API_BASE}/empleados/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert("Empleado eliminado con éxito");
                cargarEmpleados();
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
}

// --- FUNCIÓN: PREPARAR EDICIÓN ---
function prepararEdicion(id, nombre, depto, rol) {
    idEditando = id;
    document.getElementById("nombre").value = nombre;
    document.getElementById("departamento").value = depto;
    document.getElementById("rol").value = rol;

    const btnGuardar = document.getElementById("guardarEmpleado");
    if (btnGuardar) btnGuardar.innerText = "Actualizar Cambios";

    const modal = document.getElementById("modalEmpleado");
    if (modal) modal.style.display = "block";
}

// --- LÓGICA DEL BOTÓN GUARDAR (POST y PUT) ---
const btnGuardar = document.getElementById("guardarEmpleado");
if (btnGuardar) {
    btnGuardar.onclick = async () => {
        const nombre = document.getElementById("nombre").value;
        const departamento = document.getElementById("departamento").value;
        const rol = document.getElementById("rol").value;

        if (!nombre || !departamento || !rol) return alert("Por favor llena todos los campos");

        const datosEmp = { nombre, departamento, rol };

        try {
            let url = `${API_BASE}/empleados`;
            let metodo = 'POST';

            if (idEditando) {
                url += `/${idEditando}`;
                metodo = 'PUT';
            }

            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosEmp)
            });

            if (res.ok) {
                alert(idEditando ? "✅ Empleado actualizado" : "✅ Empleado guardado");
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

// --- CARGAR DEPARTAMENTOS ---
async function cargarDepartamentos() {
    const tabla = document.getElementById("tablaDepartamentos");
    const contenedorTarjetas = document.getElementById("contenedorTarjetas"); // Seleccionamos el div vacío
    if (!tabla) return;

    try {
        const res = await fetch(`${API_BASE}/departamentos`);
        const datos = await res.json();

        tabla.innerHTML = "";
        if (contenedorTarjetas) contenedorTarjetas.innerHTML = ""; // Limpiamos tarjetas antes de cargar

        datos.forEach(dep => {
            // 1. Llenar la tabla (Lo que ya tenías, pero con estilos extra)
            tabla.innerHTML += `
                <tr class="border-t hover:bg-gray-50 transition">
                    <td class="p-3 font-semibold text-gray-800">${dep.nombre}</td>
                    <td class="p-3 text-gray-600">${dep.responsable || 'Sin asignar'}</td>
                    <td class="p-3 text-center font-medium">${dep.numEmpleados || 0}</td>
                    <td class="p-3">
                        <span class="${dep.estado === 'Inactivo' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} px-2 py-1 rounded-full text-xs font-semibold">
                            ${dep.estado || 'Activo'}
                        </span>
                    </td>
                    <td class="p-3 text-right">
                        <button onclick="prepararEdicionDepto('${dep._id}', '${dep.nombre}', '${dep.responsable}')" class="text-blue-600 mr-3 hover:underline font-medium">Editar</button>
                        <button onclick="eliminarDepartamento('${dep._id}')" class="text-red-600 hover:underline font-medium">Eliminar</button>
                    </td>
                </tr>`;

            // 2. Llenar las Tarjetas Superiores (NUEVO)
            if (contenedorTarjetas) {
                const colorBorde = dep.estado === 'Inactivo' ? 'border-red-400' : 'border-blue-500';
                contenedorTarjetas.innerHTML += `
                    <div class="bg-white p-5 rounded-lg shadow-sm border-t-4 ${colorBorde} hover:shadow-md transition">
                        <h3 class="font-bold text-lg text-gray-800">${dep.nombre}</h3>
                        <p class="text-sm text-gray-500 mt-2 flex items-center gap-2">
                            👤 ${dep.responsable || 'Sin asignar'}
                        </p>
                        <div class="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                            <span class="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                👥 ${dep.numEmpleados || 0} Empleados
                            </span>
                        </div>
                    </div>
                `;
            }
        });

        // 3. Actualizar métricas inferiores (Corregido el ID de deptosActivos)
        if (document.getElementById("totalDeptos")) {
            document.getElementById("totalDeptos").innerText = datos.length;
        }
        if (document.getElementById("deptosActivos")) {
            const activos = datos.filter(d => d.estado !== 'Inactivo').length;
            document.getElementById("deptosActivos").innerText = activos;
        }

    } catch (e) { console.error("Error al cargar departamentos:", e); }
}

// --- CARGAR NÓMINA ---
async function cargarNomina() {
    const tabla = document.getElementById("tablaNomina");
    if (!tabla) return;

    try {
        const res = await fetch(`${API_BASE}/nomina`);
        const datos = await res.json();

        tabla.innerHTML = "";
        let sumaTotal = 0;

        datos.forEach(pago => {
            sumaTotal += pago.monto;
            const fechaFormateada = new Date(pago.fecha).toLocaleDateString();

            tabla.innerHTML += `
                <tr class="border-t">
                    <td class="p-3">${pago.empleado}</td>
                    <td class="p-3">${pago.departamento}</td>
                    <td class="p-3 font-bold text-green-600">$${pago.monto.toLocaleString()}</td>
                    <td class="p-3">${fechaFormateada}</td>
                    <td class="p-3">
                        <span class="px-2 py-1 rounded-full text-xs ${pago.estado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                            ${pago.estado}
                        </span>
                    </td>
                    <td class="p-3 text-blue-600 cursor-pointer">Ver recibo</td>
                </tr>`;
        });

        if (document.getElementById("totalNominaMes")) {
            document.getElementById("totalNominaMes").innerText = `$${sumaTotal.toLocaleString()}`;
        }
    } catch (e) { console.error("Error al cargar nómina:", e); }
}

// ==========================================
// CARGAR MÉTRICAS DEL DASHBOARD (index.html)
// ==========================================
async function cargarMetricasDashboard() {
    // Solo ejecutamos esto si estamos en la vista del dashboard (index.html)
    if (!document.getElementById("nominaMensual")) return;

    try {
        // Hacemos las tres peticiones a la API al mismo tiempo para que cargue súper rápido
        const [resEmpleados, resDeptos, resNomina] = await Promise.all([
            fetch(`${API_BASE}/empleados`),
            fetch(`${API_BASE}/departamentos`),
            fetch(`${API_BASE}/nomina`)
        ]);

        const empleados = await resEmpleados.json();
        const deptos = await resDeptos.json();
        const nomina = await resNomina.json();

        // 1. Llenar tarjetas superiores (Totales)
        document.getElementById("totalEmpleados").innerText = empleados.length;
        document.getElementById("totalDepartamentos").innerText = deptos.length;

        // Sumar todos los pagos de nómina
        const totalNomina = nomina.reduce((suma, pago) => suma + (pago.monto || 0), 0);
        document.getElementById("nominaMensual").innerText = `$${totalNomina.toLocaleString('es-MX')}`;

        // Empleados activos como demostración de "contrataciones"
        const activos = empleados.filter(emp => emp.estado !== 'Inactivo').length;
        document.getElementById("contratacionesMes").innerText = activos;

        // 2. Actividad Reciente (Muestra los últimos 3 empleados agregados)
        const listaActividad = document.getElementById("actividadReciente");
        listaActividad.innerHTML = "";
        const ultimosEmpleados = empleados.slice(-3).reverse();

        if (ultimosEmpleados.length === 0) {
            listaActividad.innerHTML = "<li class='text-gray-400 italic'>No hay actividad reciente</li>";
        } else {
            ultimosEmpleados.forEach(emp => {
                listaActividad.innerHTML += `
                    <li class="flex items-center gap-2 border-b pb-2">
                        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span class="text-sm">Nuevo empleado: <strong>${emp.nombre}</strong> (${emp.rol || 'Sin rol'})</span>
                    </li>
                `;
            });
        }

        // 3. Alertas del sistema (Pagos pendientes o departamentos inactivos)
        const listaAlertas = document.getElementById("alertasSistema");
        listaAlertas.innerHTML = "";
        let hayAlertas = false;

        const pagosPendientes = nomina.filter(p => p.estado === 'Pendiente').length;
        if (pagosPendientes > 0) {
            listaAlertas.innerHTML += `
                <li class="flex items-center gap-2 border-b pb-2 text-orange-600">
                    <span>Tienes <strong>${pagosPendientes}</strong> pagos de nómina pendientes.</span>
                </li>`;
            hayAlertas = true;
        }

        const deptosInactivos = deptos.filter(d => d.estado === 'Inactivo').length;
        if (deptosInactivos > 0) {
            listaAlertas.innerHTML += `
                <li class="flex items-center gap-2 border-b pb-2 text-red-600">
                    <span>🚨 Hay <strong>${deptosInactivos}</strong> departamentos inactivos.</span>
                </li>`;
            hayAlertas = true;
        }

        if (!hayAlertas) {
            listaAlertas.innerHTML = "<li class='text-green-600 font-medium'>Todo está en orden. Sin alertas.</li>";
        }

    } catch (e) {
        console.error("Error al cargar el dashboard:", e);
    }
}

// --- BUSCADOR ---
const inputBuscar = document.getElementById("buscarEmpleado");
if (inputBuscar) {
    inputBuscar.addEventListener("input", (e) => {
        const texto = e.target.value.toLowerCase();
        const filas = document.querySelectorAll("#tablaEmpleados tr");
        filas.forEach(fila => {
            const nombre = fila.cells[0].innerText.toLowerCase();
            fila.style.display = nombre.includes(texto) ? "" : "none";
        });
    });
}
// ---  EDICIÓN DEPARTAMENTO ---
// 1. Lógica para abrir modal de departamento
const btnNuevoDepto = document.getElementById("btnNuevoDepto");
if (btnNuevoDepto) {
    btnNuevoDepto.onclick = () => {
        idDeptoEditando = null;
        document.getElementById("nombreDepto").value = "";
        document.getElementById("responsableDepto").value = "";
        document.getElementById("modalDepto").style.display = "block";
    };
}

// 2. Función para GUARDAR / EDITAR Departamento
const btnGuardarDepto = document.getElementById("guardarDepto");
if (btnGuardarDepto) {
    btnGuardarDepto.onclick = async () => {
        const nombre = document.getElementById("nombreDepto").value;
        const responsable = document.getElementById("responsableDepto").value;
        const estado = document.getElementById("estadoDepto").value;

        const datos = { nombre, responsable, estado };
        let url = `${API_BASE}/departamentos`;
        let metodo = idDeptoEditando ? 'PUT' : 'POST';
        if (idDeptoEditando) url += `/${idDeptoEditando}`;

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            if (res.ok) {
                document.getElementById("modalDepto").style.display = "none";
                cargarDepartamentos(); // Recargar la tabla
                alert("Operación exitosa");
            }
        } catch (e) { alert("Error al guardar"); }
    };
}

// 3. Función para ELIMINAR Departamento
async function eliminarDepartamento(id) {
    if (confirm("¿Eliminar este departamento?")) {
        await fetch(`${API_BASE}/departamentos/${id}`, { method: 'DELETE' });
        cargarDepartamentos();
    }
}

// --- EXPOSICIÓN GLOBAL Y CERRAR MODAL ---
window.eliminarEmpleado = eliminarEmpleado;
window.prepararEdicion = prepararEdicion;
window.eliminarDepartamento = eliminarDepartamento;

window.onclick = function (event) {
    const modal = document.getElementById("modalEmpleado");
    if (event.target == modal) {
        modal.style.display = "none";
        idEditando = null;
    }
}

// ==========================================
// LÓGICA DE NÓMINA (CREACIÓN)
// ==========================================

// 1. Abrir el modal y limpiar los campos
function prepararNuevaNomina() {
    document.getElementById("nomEmpleado").value = "";
    document.getElementById("nomDepartamento").value = "";
    document.getElementById("nomMonto").value = "";
    document.getElementById("nomEstado").value = "Pendiente";

    // Usamos 'flex' para que las clases de Tailwind centren el modal correctamente
    document.getElementById("modalNomina").style.display = "flex";
}

// 2. Guardar el registro en la base de datos
const btnGuardarNomina = document.getElementById("guardarNomina");
if (btnGuardarNomina) {
    btnGuardarNomina.onclick = async () => {
        const empleado = document.getElementById("nomEmpleado").value;
        const departamento = document.getElementById("nomDepartamento").value;
        const monto = parseFloat(document.getElementById("nomMonto").value);
        const estado = document.getElementById("nomEstado").value;

        // Validación básica
        if (!empleado || !departamento || isNaN(monto)) {
            return alert("Por favor llena todos los campos numéricos y de texto correctamente.");
        }

        const datosPago = { empleado, departamento, monto, estado };

        try {
            const res = await fetch(`${API_BASE}/nomina`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosPago)
            });

            if (res.ok) {
                document.getElementById("modalNomina").style.display = "none";
                cargarNomina(); // Recargamos la tabla para que aparezca el nuevo registro
                alert("Pago registrado exitosamente");
            } else {
                alert("Error al registrar el pago");
            }
        } catch (e) {
            console.error("Error al guardar nómina:", e);
            alert("Error de conexión con el servidor");
        }
    };
}

// 3. Exponer la función globalmente para que el botón de HTML pueda usarla
window.prepararNuevaNomina = prepararNuevaNomina;

