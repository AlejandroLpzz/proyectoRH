const express = require('express');
const router = express.Router();

// Importamos TODAS las funciones del controlador
const { 
    obtenerDepartamentos, 
    crearDepartamento,
    actualizarDepartamento, 
    eliminarDepartamento   
} = require('../controllers/departamentoController');

// Definimos las rutas
router.get('/', obtenerDepartamentos);
router.post('/', crearDepartamento);
router.put('/:id', actualizarDepartamento);    // <-- RUTA PARA EDITAR
router.delete('/:id', eliminarDepartamento); // <-- RUTA PARA BORRAR

module.exports = router;