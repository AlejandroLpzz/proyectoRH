const express = require('express');
const router = express.Router();

const { 
    obtenerNomina, 
    crearNomina,
    eliminarNomina 
} = require('../controllers/nominaController');

// Defininnir las rutas
router.get('/', obtenerNomina);
router.post('/', crearNomina);
router.delete('/:id', eliminarNomina);

module.exports = router;