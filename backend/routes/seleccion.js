const express = require('express');
const router = express.Router();

// 1. Importamos la nueva función obtenerMetricas
const { 
  evaluarCandidato, 
  asistenteChatbot,
  obtenerMetricas 
} = require('../controllers/seleccionController');

// 2. Rutas del módulo
router.post('/evaluar', evaluarCandidato);
router.post('/chatbot', asistenteChatbot);

// Nueva ruta GET para obtener los contadores/tarjetas
router.get('/metricas', obtenerMetricas);

module.exports = router;