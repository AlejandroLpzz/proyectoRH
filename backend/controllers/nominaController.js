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

// Eliminar un registro de nómina (LA FUNCIÓN VA ANTES DE EXPORTARLA)
const eliminarNomina = async (req, res) => {
    try {
        // 👇 AGREGA ESTE LOG 👇
        console.log("Backend recibió la orden de borrar el ID:", req.params.id); 
        
        await Nomina.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Registro de nómina eliminado" });
    } catch (error) {
        // 👇 AGREGA ESTE LOG DE ERROR 👇
        console.error("🔥 ERROR REAL EN EL BACKEND:", error); 
        res.status(500).json({ mensaje: "Error al eliminar la nómina" });
    }
};

// 👇 EL EXPORT SIEMPRE VA HASTA EL FINAL 👇
module.exports = {
    obtenerNomina,
    crearNomina,
    eliminarNomina 
};