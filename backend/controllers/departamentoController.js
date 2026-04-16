const Departamento = require('../models/Departamento');
const Empleado = require('../models/Empleado'); // Lo necesitamos para el conteo

// Obtener departamentos con conteo de empleados
const obtenerDepartamentos = async (req, res) => {
    try {
        const departamentos = await Departamento.find();
        
        // Mapeamos para incluir el conteo de empleados
        const respuesta = await Promise.all(
            departamentos.map(async (dep) => {
                const conteo = await Empleado.countDocuments({ departamento: dep.nombre });
                return {
                    ...dep._doc,
                    numEmpleados: conteo
                };
            })
        );
        res.json(respuesta);
    } catch (error) {
        console.error("Error al obtener departamentos:", error);
        res.status(500).json({ mensaje: "Error al obtener departamentos" });
    }
};

// Crear un nuevo departamento
const crearDepartamento = async (req, res) => {
    try {
        const nuevoDepto = new Departamento(req.body);
        await nuevoDepto.save();
        res.status(201).json(nuevoDepto);
    } catch (error) {
        res.status(400).json({ mensaje: "Error al crear departamento", detalle: error.message });
    }
};
// Actualizar Departamento
const actualizarDepartamento = async (req, res) => {
    try {
        const actualizado = await Departamento.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar departamento" });
    }
};

// Eliminar Departamento
const eliminarDepartamento = async (req, res) => {
    try {
        await Departamento.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Departamento eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar" });
    }
};

// No olvides agregarlas al module.exports al final del archivo
module.exports = { obtenerDepartamentos, crearDepartamento, actualizarDepartamento, eliminarDepartamento };