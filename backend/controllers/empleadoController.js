// controllers/empleadoController.js
const Empleado = require('../models/Empleado');

// Obtener todos los empleados
const obtenerEmpleados = async (req, res) => {
    try {
        const empleados = await Empleado.find();
        res.json(empleados);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener empleados", error });
    }
};

// Crear un nuevo empleado
const crearEmpleado = async (req, res) => {
    try {
        const nuevoEmpleado = new Empleado(req.body);
        await nuevoEmpleado.save();
        res.status(201).json(nuevoEmpleado);
    } catch (error) {
        res.status(400).json({ mensaje: "Error al registrar empleado", detalle: error.message });
    }
};

// Actualizar un empleado
const actualizarEmpleado = async (req, res) => {
    try {
        const actualizado = await Empleado.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar" });
    }
};

// Eliminar un empleado
const eliminarEmpleado = async (req, res) => {
    try {
        await Empleado.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Empleado eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar" });
    }
};

// Exportamos todas las funciones para que las rutas las puedan usar
module.exports = {
    obtenerEmpleados,
    crearEmpleado,
    actualizarEmpleado,
    eliminarEmpleado
};