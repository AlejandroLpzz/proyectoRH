const API_URL = "http://localhost:3000/api/empleados";

document.addEventListener("DOMContentLoaded", () => {
    // Si estamos en la página de empleados, cargamos la tabla
    if (document.getElementById("tablaEmpleados")) {
        cargarEmpleados();
    }
});

async function cargarEmpleados() {
    const tabla = document.getElementById("tablaEmpleados");
    
    try {
        const respuesta = await fetch(API_URL);
        const empleados = await respuesta.json();

        // Limpiar la tabla antes de insertar
        tabla.innerHTML = "";

        empleados.forEach(emp => {
            const fila = document.createElement("tr");
            fila.className = "border-t";
            fila.innerHTML = `
                <td class="p-3">${emp.nombre}</td>
                <td class="p-3">${emp.departamento}</td>
                <td class="p-3">${emp.rol}</td>
                <td class="p-3">
                    <span class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                        ${emp.estado || 'Activo'}
                    </span>
                </td>
                <td class="p-3">
                    <button class="text-blue-600 hover:underline">Editar</button>
                </td>
            `;
            tabla.appendChild(fila);
        });

        // Actualizar el contador de la tarjeta "Total empleados"
        if(document.getElementById("totalEmpleados")) {
            document.getElementById("totalEmpleados").innerText = empleados.length;
        }

    } catch (error) {
        console.error("Error al conectar con la API:", error);
        tabla.innerHTML = "<tr><td colspan='5' class='p-3 text-center text-red-500'>Error al cargar datos</td></tr>";
    }
}