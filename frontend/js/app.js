// 1. Configuración Inicial y Variable Global
const API_BASE = "http://localhost:3000/api";
let idEditando = null; // Mantenemos el rastro de si estamos editando o creando

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("tablaEmpleados")) cargarEmpleados();
    if (document.getElementById("tablaDepartamentos")) cargarDepartamentos();
    if (document.getElementById("tablaNomina")) cargarNomina();
    if (document.getElementById("totalEmpleados")) cargarMetricasDashboard();
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
        if(document.getElementById("totalEmpleados")) document.getElementById("totalEmpleados").innerText = datos.length;
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
            alert("Hubo un error al intentar eliminar");
        }
    }
}

// --- FUNCIÓN: PREPARAR EDICIÓN ---
function prepararEdicion(id, nombre, depto, rol) {
    idEditando = id;
    document.getElementById("nombre").value = nombre;
    document.getElementById("departamento").value = depto;
    document.getElementById("rol").value = rol;
    
    document.getElementById("guardarEmpleado").innerText = "Actualizar Cambios";
    document.getElementById("modalEmpleado").style.display = "block";
}

// --- LÓGICA DEL BOTÓN GUARDAR (POST y PUT) ---
const btnGuardar = document.getElementById("guardarEmpleado");
const modal = document.getElementById("modalEmpleado");

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
                btnGuardar.innerText = "Guardar";
                modal.style.display = "none";
                
                // Limpiar campos
                document.getElementById("nombre").value = "";
                document.getElementById("departamento").value = "";
                document.getElementById("rol").value = "";
                
                cargarEmpleados();
            }
        } catch (error) {
            alert("Error en la operación");
        }
    };
}

// --- EXPONER FUNCIONES AL NAVEGADOR ---
// Esto permite que el onclick="eliminarEmpleado(...)" del HTML funcione
window.eliminarEmpleado = eliminarEmpleado;
window.prepararEdicion = prepararEdicion;

// --- OTRAS FUNCIONES (Dashboard, Nómina, Buscador) ---
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

// Las funciones de Departamento y Nómina se quedan igual...
async function cargarDepartamentos() { /* Tu código actual */ }
async function cargarNomina() { /* Tu código actual */ }

// --- BOTÓN CERRAR MODAL (Opcional pero recomendado) ---
// Si haces clic fuera del modal o añades un botón cancelar, limpia el idEditando
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        idEditando = null;
        if(btnGuardar) btnGuardar.innerText = "Guardar";
    }
}