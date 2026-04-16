const express = require('express');
const router = express.Router();

const { 
    obtenerDepartamentos, 
    crearDepartamento 
} = require('../controllers/departamentoController');

// Definimos las rutas
router.get('/', obtenerDepartamentos);
router.post('/', crearDepartamento);

module.exports = router;