const mongoose = require('mongoose');

const SeleccionSchema = new mongoose.Schema({
    candidato: { type: String, required: true },
    puesto: { type: String, required: true },
    experiencia: { type: Number, default: 0 },
    habilidades: [String],
    match: { type: Number, required: true },
    estado: { type: String, required: true },
    brechas: [String],
    rutasSugeridas: [String],
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Seleccion', SeleccionSchema);