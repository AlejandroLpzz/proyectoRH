const mongoose = require('mongoose');

const EvaluacionSchema = new mongoose.Schema({
  nombreCandidato: { type: String, required: true },
  puestoObjetivo: { type: String, required: true },
  experiencia: { type: Number, required: true },
  habilidades: [{ type: String }],
  match: { type: Number, required: true },
  estado: { type: String, required: true },
  dictamen: { type: String, required: true },
  rutasSugeridas: [{ type: String }],
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evaluacion', EvaluacionSchema);