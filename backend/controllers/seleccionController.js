// Reglas predefinidas del Sistema Experto para Selección de Recursos Humanos
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

// Evaluador del Sistema Experto
const evaluarCandidato = (req, res) => {
  try {
    const { nombre, puesto, experiencia, habilidades } = req.body;

    if (!nombre || !puesto) {
      return res.status(400).json({ error: 'El nombre y puesto son obligatorios.' });
    }

    const regla = REGLAS_PUESTOS[puesto];
    const expInt = parseInt(experiencia) || 0;
    
    // Convertir habilidades enviadas a un arreglo en minúsculas
    const listaHabilidades = Array.isArray(habilidades) 
      ? habilidades.map(h => h.trim().toLowerCase()) 
      : (habilidades || '').toLowerCase().split(',').map(h => h.trim());

    if (!regla) {
      return res.json({
        match: 70,
        estado: 'Apto con Observaciones',
        dictamen: `Evaluación completada para ${nombre}. El puesto seleccionado no cuenta con reglas estrictas predefinidas.`,
        rutasSugeridas: ['Inducción General a la Empresa', 'Cultura Organizacional y Seguridad']
      });
    }

    // Puntuación por experiencia (50%)
    let puntosExp = expInt >= regla.expMinima ? 50 : Math.round((expInt / regla.expMinima) * 50);

    // Puntuación por habilidades (50%) y detección de brechas
    const coincidentes = regla.habilidadesRequeridas.filter(h => listaHabilidades.includes(h));
    const brechas = regla.habilidadesRequeridas.filter(h => !listaHabilidades.includes(h));
    let puntosHab = Math.round((coincidentes.length / regla.habilidadesRequeridas.length) * 50);

    const matchTotal = puntosExp + puntosHab;
    let estado = 'No Apto';
    if (matchTotal >= 80) estado = 'Altamente Apto';
    else if (matchTotal >= 60) estado = 'Apto para Capacitación';

    const rutasSugeridas = brechas.length > 0 
      ? [`Ruta de Nivelación: ${brechas.join(', ')}`, regla.cursoRecomendado]
      : ['Plan de Desarrollo en Liderazgo Técnico'];

    return res.json({
      match: matchTotal,
      estado,
      dictamen: `El candidato ${nombre} posee ${expInt} año(s) de experiencia y un porcentaje de ajuste del ${matchTotal}%. Se detectaron ${brechas.length} brechas de conocimiento.`,
      brechas,
      rutasSugeridas
    });

  } catch (error) {
    console.error('Error en el controlador de selección:', error);
    return res.status(500).json({ error: 'Error interno al evaluar candidato.' });
  }
};

// Asistente Chatbot
const asistenteChatbot = (req, res) => {
  try {
    const { mensaje } = req.body;
    const msg = (mensaje || '').toLowerCase();

    let respuesta = "Entendido. Puedo resolver consultas sobre los criterios de selección de personal, reglas de evaluación y catálogo de capacitaciones.";

    if (msg.includes('requisito') || msg.includes('experiencia') || msg.includes('puesto')) {
      respuesta = "Nuestras reglas de RH requieren entre 2 y 4 años de experiencia según el puesto (Frontend, Analista de Datos, Gerente) y habilidades técnicas validadas por el sistema experto.";
    } else if (msg.includes('capacitacion') || msg.includes('curso') || msg.includes('ruta')) {
      respuesta = "Las rutas de aprendizaje se asignan automáticamente según las brechas detectadas en la evaluación del perfil.";
    } else if (msg.includes('hola') || msg.includes('buenas')) {
      respuesta = "¡Hola! Soy el asistente virtual de RH. ¿En qué puedo ayudarte hoy respecto a selección o capacitación?";
    }

    return res.json({ respuesta });
  } catch (error) {
    return res.status(500).json({ error: 'Error en respuesta de chatbot.' });
  }
};

module.exports = {
  evaluarCandidato,
  asistenteChatbot
};