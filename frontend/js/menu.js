// menu.js

// Cargar el contenido del sidebar desde un archivo HTML externo
fetch("components/sidebar.html")
  .then(response => response.text()) // Obtener el HTML como texto
  .then(data => {
    // Insertar el contenido en el contenedor del sidebar
    document.getElementById("sidebar-container").innerHTML = data;

    // Obtener el nombre de la página actual sin la extensión
    const currentPage = window.location.pathname
      .split("/")
      .pop()
      .replace(".html", "");

    // Seleccionar todos los enlaces que tengan el atributo data-page
    const links = document.querySelectorAll("[data-page]");

    // Recorrer los enlaces y marcar como activo el que coincide con la página actual
    links.forEach(link => {
      if (link.dataset.page === currentPage) {
        // Agregar clases de Tailwind para resaltar el enlace activo
        link.classList.add("bg-gray-200", "font-semibold");
      }
    });
  })
  .catch(error => {
    // Manejo de errores en caso de que el fetch falle
    console.error("Error al cargar el sidebar:", error);
  });