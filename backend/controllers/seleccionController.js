const Evaluacion = require('../models/Evaluacion');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 1. Evaluar Candidato mediante Inteligencia Artificial y guardar en BD
const evaluarCandidato = async (req, res) => {
  try {
    const { nombre, puesto, experiencia, habilidades } = req.body;

    if (!nombre || !puesto) {
      return res.status(400).json({ error: 'El nombre y el puesto son obligatorios.' });
    }

    const listaHabilidades = Array.isArray(habilidades) 
      ? habilidades.join(', ') 
      : habilidades;

    const prompt = `Actúa como un experto en Selección de Recursos Humanos. 
    Evalúa al siguiente candidato:
    - Nombre: ${nombre}
    - Puesto Objetivo: ${puesto}
    - Años de Experiencia: ${experiencia}
    - Habilidades: ${listaHabilidades}

    Responde ÚNICAMENTE en formato JSON estricto con esta estructura:
    {
      "match": (número entre 0 y 100),
      "estado": ("Altamente Apto", "Apto para Capacitación" o "No Apto"),
      "dictamen": "Explicación breve de 2 oraciones sobre el perfil y las brechas identificadas.",
      "rutasSugeridas": ["Nombre de Curso 1", "Nombre de Curso 2"]
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const resultadoIA = JSON.parse(completion.choices[0].message.content);

    // Guardado en la base de datos
    try {
      const nuevaEvaluacion = new Evaluacion({
        nombreCandidato: nombre,
        puestoObjetivo: puesto,
        experiencia: Number(experiencia),
        habilidades: Array.isArray(habilidades) ? habilidades : habilidades.split(',').map(h => h.trim()),
        match: resultadoIA.match,
        estado: resultadoIA.estado,
        dictamen: resultadoIA.dictamen,
        rutasSugeridas: resultadoIA.rutasSugeridas
      });
      await nuevaEvaluacion.save();
    } catch (dbErr) {
      console.warn('Evaluación generada correctamente (sin guardar en BD):', dbErr.message);
    }

    return res.json(resultadoIA);

  } catch (error) {
    console.error('Error al evaluar candidato con IA:', error);
    return res.status(500).json({ error: 'Error interno al procesar la evaluación.' });
  }
};

// 2. Chatbot de Consultas de RH con IA
const asistenteChatbot = async (req, res) => {
  try {
    const { mensaje } = req.body;

    if (!mensaje) {
      return res.status(400).json({ error: 'El mensaje es obligatorio.' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Eres un asistente virtual formal de Recursos Humanos. Responde dudas sobre perfiles de trabajo, criterios de selección, evaluación de desempeño y planes de capacitación corporativos en máximo 3 oraciones." 
        },
        { role: "user", content: mensaje }
      ]
    });

    const respuesta = completion.choices[0].message.content;
    return res.json({ respuesta });

  } catch (error) {
    console.error('Error en Chatbot IA:', error);
    return res.status(500).json({ error: 'No se pudo procesar la consulta en el asistente.' });
  }
};

// 3. Obtener Historial de Evaluaciones
const obtenerEvaluaciones = async (req, res) => {
  try {
    const evaluaciones = await Evaluacion.find().sort({ fecha: -1 });
    res.json(evaluaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial de evaluaciones.' });
  }
};

module.exports = {
  evaluarCandidato,
  asistenteChatbot,
  obtenerEvaluaciones
};