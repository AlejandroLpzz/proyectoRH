const mongoose = require('mongoose');

const NominaSchema = new mongoose.Schema({
    empleado: { type: String, required: true },
    departamento: { type: String, required: true },
    monto: { type: Number, required: true },
    fecha: { type: Date, default: Date.now },
    estado: { 
        type: String, 
        enum: ['Pagado', 'Pendiente', 'Procesando', 'Rechazado'], 
        default: 'Pendiente' 
    }
});

module.exports = mongoose.model('Nomina', NominaSchema);