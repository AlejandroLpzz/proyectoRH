const express = require('express');
const router = express.Router();

const { 
  evaluarCandidato, 
  asistenteChatbot 
} = require('../controllers/seleccionController');

// Definición de rutas
router.post('/evaluar', evaluarCandidato);
router.post('/chatbot', asistenteChatbot);

module.exports = router;