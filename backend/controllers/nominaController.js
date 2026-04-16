const Nomina = require('../models/Nomina');

// Obtener todos los pagos ordenados del más reciente al más antiguo
const obtenerNomina = async (req, res) => {
    try {
        const pagos = await Nomina.find().sort({ fecha: -1 });
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener nómina" });
    }
};

// Registrar un nuevo pago de nómina
const crearNomina = async (req, res) => {
    try {
        const nuevoPago = new Nomina(req.body);
        await nuevoPago.save();
        res.status(201).json(nuevoPago);
    } catch (error) {
        res.status(400).json({ mensaje: "Error al registrar pago", detalle: error.message });
    }
};

module.exports = {
    obtenerNomina,
    crearNomina
};