const express = require('express');
const router = express.Router();
const Departamento = require('../models/Departamento');
const Empleado = require('../models/Empleado');

// @route   GET /api/departamentos
// @desc    Obtener todos los departamentos con el conteo de empleados
router.get('/', async (req, res) => {
    try {
        // 1. Buscamos todos los departamentos en la base de datos
        const departamentos = await Departamento.find();

        // 2. Por cada departamento, contamos cuántos empleados tienen ese nombre de departamento
        const respuesta = await Promise.all(
            departamentos.map(async (dep) => {
                const conteo = await Empleado.countDocuments({ departamento: dep.nombre });
                
                return {
                    _id: dep._id,
                    nombre: dep.nombre,
                    responsable: dep.responsable,
                    estado: dep.estado,
                    numEmpleados: conteo // Esto es lo que usará tu tabla
                };
            })
        );

        res.json(respuesta);
    } catch (error) {
        console.error("Error al obtener departamentos:", error);
        res.status(500).json({ mensaje: "Error en el servidor al obtener departamentos" });
    }
});

// @route   POST /api/departamentos
// @desc    Crear un nuevo departamento
router.post('/', async (req, res) => {
    try {
        const nuevoDepto = new Departamento(req.body);
        await nuevoDepto.save();
        res.status(201).json(nuevoDepto);
    } catch (error) {
        res.status(400).json({ mensaje: "Error al crear departamento", detalle: error.message });
    }
});

module.exports = router;