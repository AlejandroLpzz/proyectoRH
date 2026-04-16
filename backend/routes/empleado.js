// routes/empleados.js
const express = require('express');
const router = express.Router();

// Importamos las funciones del controlador
const { 
    obtenerEmpleados, 
    crearEmpleado, 
    actualizarEmpleado, 
    eliminarEmpleado 
} = require('../controllers/empleadoController');

// Definimos las rutas y les asignamos su "chef" (controlador)
router.get('/', obtenerEmpleados);
router.post('/', crearEmpleado);
router.put('/:id', actualizarEmpleado);
router.delete('/:id', eliminarEmpleado);

module.exports = router;