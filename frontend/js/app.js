// Configuración de las URLs de tu API (Backend)
const API_BASE = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
    // Detectar en qué página estamos para disparar la función correcta
    if (document.getElementById("tablaEmpleados")) {
        cargarEmpleados();
    }
    
    if (document.getElementById("tablaDepartamentos")) {
        cargarDepartamentos();
    }

    if (document.getElementById("tablaNomina")) {
        cargarNomina();
    }
});

// --- FUNCIÓN: CARGAR EMPLEADOS ---
async function cargarEmpleados() {
    const tabla = document.getElementById("tablaEmpleados");
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
                    <td class="p-3"><span class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">${emp.estado || 'Activo'}</span></td>
                    <td class="p-3"><button class="text-blue-600 hover:underline">Editar</button></td>
                </tr>`;
        });
        if(document.getElementById("totalEmpleados")) document.getElementById("totalEmpleados").innerText = datos.length;
    } catch (e) { console.error("Error:", e); }
}

// --- FUNCIÓN: CARGAR DEPARTAMENTOS ---
async function cargarDepartamentos() {
    const tabla = document.getElementById("tablaDepartamentos");
    try {
        const res = await fetch(`${API_BASE}/departamentos`);
        const datos = await res.json();
        
        tabla.innerHTML = "";
        datos.forEach(dep => {
            tabla.innerHTML += `
                <tr class="border-t hover:bg-gray-50">
                    <td class="p-3 font-medium">${dep.nombre}</td>
                    <td class="p-3">${dep.responsable}</td>
                    <td class="p-3 text-center">${dep.numEmpleados || 0}</td>
                    <td class="p-3"><span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">${dep.estado}</span></td>
                    <td class="p-3">
                        <button class="text-blue-600 hover:underline mr-2">Ver</button>
                        <button class="text-gray-400 hover:underline">Editar</button>
                    </td>
                </tr>`;
        });
        if(document.getElementById("totalDeptos")) document.getElementById("totalDeptos").innerText = datos.length;
    } catch (e) { console.error("Error:", e); }
}

// --- FUNCIÓN: CARGAR NÓMINA ---
async function cargarNomina() {
    const tabla = document.getElementById("tablaNomina");
    try {
        const res = await fetch(`${API_BASE}/nomina`);
        const datos = await res.json();
        
        tabla.innerHTML = "";
        datos.forEach(pago => {
            const colorEstado = pago.estado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
            
            tabla.innerHTML += `
                <tr class="border-t">
                    <td class="p-3 font-medium">${pago.empleado}</td>
                    <td class="p-3 text-gray-600">${pago.departamento}</td>
                    <td class="p-3 font-bold">$${pago.monto.toLocaleString()}</td>
                    <td class="p-3">${new Date(pago.fecha).toLocaleDateString()}</td>
                    <td class="p-3"><span class="${colorEstado} px-2 py-1 rounded-full text-xs">${pago.estado}</span></td>
                    <td class="p-3">
                        <button class="border px-2 py-1 rounded hover:bg-gray-100">Ver</button>
                        <button class="border px-2 py-1 rounded ml-1 hover:bg-gray-100">Editar</button>
                    </td>
                </tr>`;
        });
        
        // Actualizar métricas de nómina
        if(document.getElementById("totalNominaMes")) {
            const total = datos.reduce((sum, p) => sum + p.monto, 0);
            document.getElementById("totalNominaMes").innerText = `$${total.toLocaleString()}`;
        }
    } catch (e) { console.error("Error:", e); }
}