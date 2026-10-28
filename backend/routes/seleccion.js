const express = require('express');
const router = express.Router();

const { 
  evaluarCandidato, 
  asistenteChatbot,
  obtenerEvaluaciones 
} = require('../controllers/seleccionController');

// Rutas del módulo de Selección y Capacitación IA
router.get('/', obtenerEvaluaciones);
router.post('/evaluar', evaluarCandidato);
router.post('/chatbot', asistenteChatbot);

module.exports = router;