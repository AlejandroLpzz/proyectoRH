const express = require('express');
const router = express.Router();

// 👇 TIENE QUE ESTAR IMPORTADA AQUÍ 👇
const { 
    obtenerNomina, 
    crearNomina,
    eliminarNomina 
} = require('../controllers/nominaController');

// Definimos las rutas
router.get('/', obtenerNomina);
router.post('/', crearNomina);
router.delete('/:id', eliminarNomina);

module.exports = router;