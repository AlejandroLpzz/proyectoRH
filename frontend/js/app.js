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
            if(modal) {
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
        if(document.getElementById("totalEmpleados")) document.getElementById("totalEmpleados").innerText = datos.length;
        if(document.getElementById("empleadosActivos")) {
            const activos = datos.filter(e => e.estado === 'Activo' || !e.estado).length;
            document.getElementById("empleadosActivos").innerText = activos;
        }
        if(document.getElementById("empleadosInactivos")) {
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
                alert("✅ Empleado eliminado con éxito");
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
    if(btnGuardar) btnGuardar.innerText = "Actualizar Cambios";
    
    const modal = document.getElementById("modalEmpleado");
    if(modal) modal.style.display = "block";
}

// --- LÓGICA DEL BOTÓN GUARDAR (POST y PUT) ---
const btnGuardar = document.getElementById("guardarEmpleado");
if(btnGuardar) {
    btnGuardar.onclick = async () => {
        const nombre = document.getElementById("nombre").value;
        const departamento = document.getElementById("departamento").value;
        const rol = document.getElementById("rol").value;

        if(!nombre || !departamento || !rol) return alert("Por favor llena todos los campos");

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
                if(modal) modal.style.display = "none";
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
    if (!tabla) return;

    try {
        const res = await fetch(`${API_BASE}/departamentos`);
        const datos = await res.json();

        tabla.innerHTML = "";
        datos.forEach(dep => {
            tabla.innerHTML += `
                <tr class="border-t">
                    <td class="p-3 font-semibold">${dep.nombre}</td>
                    <td class="p-3">${dep.responsable || 'Sin asignar'}</td>
                    <td class="p-3 text-center">${dep.numEmpleados || 0}</td>
                    <td class="p-3">
                        <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">${dep.estado || 'Activo'}</span>
                    </td>
                    <td class="p-3 text-right">
                        <button onclick="prepararEdicionDepto('${dep._id}', '${dep.nombre}', '${dep.responsable}')" class="text-blue-600 mr-2">Editar</button>
                        <button onclick="eliminarDepartamento('${dep._id}')" class="text-red-600">Eliminar</button>
                    </td>
                </tr>`;
        });

        if(document.getElementById("totalDeptos")) document.getElementById("totalDeptos").innerText = datos.length;
        if(document.getElementById("departamentosActivos")) document.getElementById("departamentosActivos").innerText = datos.filter(d => d.estado === 'Activo').length;
        
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

        if(document.getElementById("totalNominaMes")) {
            document.getElementById("totalNominaMes").innerText = `$${sumaTotal.toLocaleString()}`;
        }
    } catch (e) { console.error("Error al cargar nómina:", e); }
}

// --- MÉTRICAS DASHBOARD ---
async function cargarMetricasDashboard() {
    try {
        const [resEmp, resDep] = await Promise.all([
            fetch(`${API_BASE}/empleados`),
            fetch(`${API_BASE}/departamentos`)
        ]);
        const empleados = await resEmp.json();
        const departamentos = await resDep.json();

        if(document.getElementById("totalEmpleados")) document.getElementById("totalEmpleados").innerText = empleados.length;
        if(document.getElementById("totalDepartamentos")) document.getElementById("totalDepartamentos").innerText = departamentos.length;
    } catch (e) { console.error("Error en métricas:", e); }
}

// --- BUSCADOR ---
const inputBuscar = document.getElementById("buscarEmpleado");
if(inputBuscar) {
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

window.onclick = function(event) {
    const modal = document.getElementById("modalEmpleado");
    if (event.target == modal) {
        modal.style.display = "none";
        idEditando = null;
    }
}