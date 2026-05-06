const express = require('express');
const router = express.Router();

// Importar todas las funciones del controlador
const { 
    obtenerDepartamentos, 
    crearDepartamento,
    actualizarDepartamento, 
    eliminarDepartamento   
} = require('../controllers/departamentoController');

// definimos las rutas
router.get('/', obtenerDepartamentos);
router.post('/', crearDepartamento);
router.put('/:id', actualizarDepartamento);    
router.delete('/:id', eliminarDepartamento); 

module.exports = router;