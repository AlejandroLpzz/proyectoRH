const express = require('express');
const router = express.Router();
const Nomina = require('../models/Nomina');

// Obtener todos los registros de nómina
router.get('/', async (req, res) => {
    try {
        const pagos = await Nomina.find().sort({ fecha: -1 }); // Ordenar por los más recientes
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener nómina" });
    }
});

module.exports = router;