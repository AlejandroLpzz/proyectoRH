const mongoose = require('mongoose');

const EmpleadoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    departamento: { type: String, required: true },
    rol: { type: String, required: true },
    estado: { type: String, default: 'Activo' },
    fechaIngreso: { type: Date, default: Date.now },
    salario: Number
});

module.exports = mongoose.model('Empleado', EmpleadoSchema);