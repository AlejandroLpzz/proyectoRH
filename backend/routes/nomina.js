const express = require('express');
const router = express.Router();

const { 
    obtenerNomina, 
    crearNomina 
} = require('../controllers/nominaController');

// Definimos las rutas
router.get('/', obtenerNomina);
router.post('/', crearNomina);

module.exports = router;