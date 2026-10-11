const express = require('express');
const router = express.Router();

// Reglas básicas del Sistema Experto de RH por puesto
const REGLAS_PUESTOS = {
  desarrollador_frontend: {
    expMinima: 2,
    habilidadesRequeridas: ['javascript', 'css', 'git', 'react', 'tailwind'],
    cursoRecomendado: 'Optimización Avanzada de Frontend & Performance'
  },
  analista_datos: {
    expMinima: 3,
    habilidadesRequeridas: ['sql', 'python', 'power bi', 'excel'],
    cursoRecomendado: 'Modelado Estadístico y Python para Análisis de Datos'
  },
  gerente_proyectos: {
    expMinima: 4,
    habilidadesRequeridas: ['scrum', 'liderazgo', 'jira', 'gestion de riesgos'],
    cursoRecomendado: 'Liderazgo Estratégico y Metodologías Ágiles'
  }
};

// POST: Evaluar Candidato con Sistema Experto
router.post('/evaluar', (req, res) => {
  try {
    const { nombre, puesto, experiencia, habilidades } = req.body;

    if (!nombre || !puesto) {
      return res.status(400).json({ error: 'Nombre y puesto son obligatorios.' });
    }

    const regla = REGLAS_PUESTOS[puesto];
    const expInt = parseInt(experiencia) || 0;
    const listaHabilidades = Array.isArray(habilidades) 
      ? habilidades.map(h => h.trim().toLowerCase()) 
      : (habilidades || '').toLowerCase().split(',').map(h => h.trim());

    if (!regla) {
      return res.json({
        match: 70,
        estado: 'Apto con Observaciones',
        dictamen: `Evaluación completada para ${nombre}. El puesto no cuenta con reglas estrictas predefinidas.`,
        rutasSugeridas: ['Inducción General a la Empresa', 'Seguridad y Cultura Organizacional']
      });
    }

    // Evaluación de Experiencia
    let puntosExp = expInt >= regla.expMinima ? 50 : Math.round((expInt / regla.expMinima) * 50);

    // Evaluación de Habilidades (Brechas)
    const habilidadesCoincidentes = regla.habilidadesRequeridas.filter(h => listaHabilidades.includes(h));
    const brechas = regla.habilidadesRequeridas.filter(h => !listaHabilidades.includes(h));
    let puntosHab = Math.round((habilidadesCoincidentes.length / regla.habilidadesRequeridas.length) * 50);

    const porcentajeMatch = puntosExp + puntosHab;
    let estado = 'No Apto';
    if (porcentajeMatch >= 80) estado = 'Altamente Apto';
    else if (porcentajeMatch >= 60) estado = 'Apto para Capacitación';

    const rutasSugeridas = brechas.length > 0 
      ? [`Capacitación en Brechas: ${brechas.join(', ')}`, regla.cursoRecomendado]
      : ['Plan de Excelencia y Liderazgo de Equipos'];

    return res.json({
      match: porcentajeMatch,
      estado,
      dictamen: `El candidato ${nombre} cuenta con ${expInt} año(s) de experiencia y un match del ${porcentajeMatch}%. Se identificaron ${brechas.length} brechas de conocimientos.`,
      brechas,
      rutasSugeridas
    });

  } catch (error) {
    console.error('Error al evaluar candidato:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar reglas.' });
  }
});

// POST: Asistente Chatbot
router.post('/chatbot', (req, res) => {
  const { mensaje } = req.body;
  const msgLower = (mensaje || '').toLowerCase();

  let respuesta = "Entendido. Puedo ayudarte a evaluar candidatos, revisar las reglas de RH o sugerir rutas de capacitación.";

  if (msgLower.includes('requisito') || msgLower.includes('puesto')) {
    respuesta = "Nuestras reglas de RH requieren un mínimo de 2 a 4 años de experiencia según el puesto (Frontend, Analista de Datos, Gerente) y dominios clave validados por el sistema experto.";
  } else if (msgLower.includes('capacitacion') || msgLower.includes('curso') || msgLower.includes('ruta')) {
    respuesta = "Las rutas de capacitación se generan automáticamente comparando el perfil del empleado con las brechas detectadas. Las rutas activas son: Liderazgo, Cloud Architecture e IA Aplicada.";
  } else if (msgLower.includes('hola') || msgLower.includes('buenas')) {
    respuesta = "¡Hola! Soy el asistente virtual de RH. ¿En qué te puedo ayudar hoy sobre la selección o capacitación de personal?";
  }

  res.json({ respuesta });
});

module.exports = router;