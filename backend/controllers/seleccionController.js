const Seleccion = require('../models/Seleccion');

// ==========================================
// REGLAS DEL SISTEMA EXPERTO
// ==========================================
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

// Quita acentos y pasa a minúsculas para comparar textos sin errores
const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// ==========================================
// EVALUADOR DEL SISTEMA EXPERTO
// ==========================================
const evaluarCandidato = async (req, res) => {
  try {
    const { nombre, puesto, experiencia, habilidades } = req.body;

    if (!nombre || !puesto) {
      return res.status(400).json({ error: 'El nombre y puesto son obligatorios.' });
    }

    const regla = REGLAS_PUESTOS[puesto];
    const expInt = parseInt(experiencia) || 0;

    // Habilidades en minúsculas y sin acentos, para que "Gestión" coincida con "gestion"
    const listaHabilidades = (Array.isArray(habilidades)
      ? habilidades
      : String(habilidades || '').split(','))
      .map(h => normalizar(String(h).trim()))
      .filter(Boolean);

    if (!regla) {
      const matchSinRegla = 70;
      const estadoSinRegla = 'Apto con Observaciones';
      const rutasSinRegla = ['Inducción General a la Empresa', 'Cultura Organizacional y Seguridad'];

      const nuevaEval = new Seleccion({
        candidato: nombre,
        puesto,
        experiencia: expInt,
        habilidades: listaHabilidades,
        match: matchSinRegla,
        estado: estadoSinRegla,
        brechas: [],
        rutasSugeridas: rutasSinRegla
      });
      await nuevaEval.save();

      return res.json({
        match: matchSinRegla,
        estado: estadoSinRegla,
        dictamen: `Evaluación completada para ${nombre}. El puesto seleccionado no cuenta con reglas estrictas predefinidas.`,
        rutasSugeridas: rutasSinRegla
      });
    }

    // Puntuación por experiencia (50%)
    const puntosExp = expInt >= regla.expMinima
      ? 50
      : Math.round((expInt / regla.expMinima) * 50);

    // Puntuación por habilidades (50%) y detección de brechas
    const coincidentes = regla.habilidadesRequeridas.filter(h => listaHabilidades.includes(h));
    const brechas = regla.habilidadesRequeridas.filter(h => !listaHabilidades.includes(h));
    const puntosHab = Math.round((coincidentes.length / regla.habilidadesRequeridas.length) * 50);

    const matchTotal = puntosExp + puntosHab;
    let estado = 'No Apto';
    if (matchTotal >= 80) estado = 'Altamente Apto';
    else if (matchTotal >= 60) estado = 'Apto para Capacitación';

    const rutasSugeridas = brechas.length > 0
      ? [`Ruta de Nivelación: ${brechas.join(', ')}`, regla.cursoRecomendado]
      : ['Plan de Desarrollo en Liderazgo Técnico'];

    const nuevaEvaluacion = new Seleccion({
      candidato: nombre,
      puesto,
      experiencia: expInt,
      habilidades: listaHabilidades,
      match: matchTotal,
      estado,
      brechas,
      rutasSugeridas
    });
    await nuevaEvaluacion.save();

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

// ==========================================
// CATÁLOGO DE CAPACITACIONES
// ==========================================
const CATALOGO_CAPACITACION = [
  {
    nombre: 'Liderazgo y Gestión de Equipos',
    tipo: 'Habilidades Directivas',
    horas: 15,
    descripcion: 'Desarrolla comunicación, delegación, toma de decisiones y retroalimentación para dirigir equipos.',
    dirigido: 'Gerentes, coordinadores y personal con responsabilidad de equipo.',
    temas: ['liderazgo', 'gestion de equipos', 'equipos', 'directivas', 'liderar', 'delegar']
  },
  {
    nombre: 'Análisis de Datos y Estadísticas',
    tipo: 'Formación Técnica',
    horas: 25,
    descripcion: 'Cubre estadística descriptiva, limpieza de datos, visualización y lectura de indicadores.',
    dirigido: 'Analistas de datos y personal que trabaja con reportes.',
    temas: ['analisis de datos', 'estadistica', 'estadisticas', 'datos', 'analisis', 'indicadores']
  },
  {
    nombre: 'Desarrollo Web Avanzado',
    tipo: 'Formación Técnica',
    horas: 20,
    descripcion: 'Profundiza en desarrollo de interfaces web modernas, componentes y buenas prácticas.',
    dirigido: 'Desarrolladores frontend y personal técnico de desarrollo web.',
    temas: ['desarrollo web', 'web avanzado', 'web', 'html', 'css', 'javascript']
  }
];

// Cursos que el sistema recomienda al detectar brechas
const CURSOS_RECOMENDADOS_EXTRA = [
  {
    nombre: 'Optimización Avanzada de Frontend & Performance',
    descripcion: 'Mejora del rendimiento de aplicaciones web: carga, renderizado y buenas prácticas de optimización.',
    temas: ['optimizacion', 'performance', 'rendimiento']
  },
  {
    nombre: 'Modelado Estadístico y Python para Análisis de Datos',
    descripcion: 'Modelos estadísticos y uso de Python para análisis de datos.',
    temas: ['modelado', 'python', 'estadistico', 'modelado estadistico']
  },
  {
    nombre: 'Liderazgo Estratégico y Metodologías Ágiles',
    descripcion: 'Liderazgo a nivel estratégico y metodologías ágiles como Scrum.',
    temas: ['estrategico', 'metodologias agiles', 'agiles', 'estrategia']
  },
  {
    nombre: 'Inducción General a la Empresa',
    descripcion: 'Curso de bienvenida para nuevo ingreso: historia, valores, estructura y procesos generales.',
    temas: ['induccion', 'bienvenida', 'onboarding', 'nuevo ingreso']
  },
  {
    nombre: 'Cultura Organizacional y Seguridad',
    descripcion: 'Valores de la empresa, normas de convivencia laboral y seguridad en el trabajo.',
    temas: ['cultura', 'cultura organizacional', 'seguridad']
  },
  {
    nombre: 'Plan de Desarrollo en Liderazgo Técnico',
    descripcion: 'Ruta para que personal técnico crezca hacia roles de liderazgo.',
    temas: ['plan de desarrollo', 'liderazgo tecnico', 'desarrollo profesional']
  }
];

// ==========================================
// DATOS DESCRIPTIVOS DE LOS PUESTOS
// ==========================================
const DATOS_PUESTOS = {
  desarrollador_frontend: {
    nombre: 'Desarrollador Frontend',
    funcion: 'Construye la parte visual e interactiva de las aplicaciones web que usan clientes y empleados.',
    temas: ['frontend', 'front end', 'front-end', 'desarrollador', 'programador web', 'react', 'tailwind']
  },
  analista_datos: {
    nombre: 'Analista de Datos',
    funcion: 'Recolecta, limpia y analiza información para generar reportes y apoyar la toma de decisiones.',
    temas: ['analista', 'analista de datos', 'datos', 'power bi', 'sql', 'reportes']
  },
  gerente_proyectos: {
    nombre: 'Gerente de Proyectos',
    funcion: 'Planea, coordina y da seguimiento a proyectos, equipos, presupuestos y riesgos.',
    temas: ['gerente', 'gerente de proyectos', 'proyectos', 'project manager', 'scrum', 'jira']
  }
};

// Genera la respuesta de cada puesto a partir de las reglas reales
const respuestaPuesto = (clave) => {
  const datos = DATOS_PUESTOS[clave];
  const regla = REGLAS_PUESTOS[clave];
  return `${datos.nombre}: ${datos.funcion} ` +
    `Requisitos: mínimo ${regla.expMinima} año(s) de experiencia y las habilidades ${regla.habilidadesRequeridas.join(', ')}. ` +
    `Si el candidato tiene brechas, se le asigna el curso "${regla.cursoRecomendado}".`;
};

// ==========================================
// BASE DE CONOCIMIENTO DEL CHATBOT
// Cada entrada tiene "temas" (palabras clave) y "respuesta".
// Para agregar información nueva, copia una entrada y cambia los textos.
// ==========================================
const BASE_CONOCIMIENTO = [
  {
    temas: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos', 'hey'],
    respuesta: '¡Hola! Soy el asistente de Selección y Capacitación de RH. Puedo explicarte los puestos y sus requisitos, cómo se calcula la compatibilidad de un candidato, las rutas de nivelación y el catálogo de capacitaciones. Escribe "ayuda" para ver todos los temas.'
  },
  {
    temas: ['ayuda', 'que puedes hacer', 'que sabes', 'temas', 'opciones', 'menu', 'help', 'que preguntas'],
    respuesta: 'Puedo responder sobre: puestos disponibles y sus requisitos, criterios de evaluación y compatibilidad, estados de dictamen, brechas y rutas de nivelación, cómo llenar el formulario de evaluación, catálogo de capacitaciones, proceso general de selección, métricas del panel, los módulos de Empleados, Departamentos y Nómina, y el significado de términos como Scrum, React o SQL. Ejemplo: "¿qué requisitos tiene un analista de datos?".'
  },
  {
    temas: ['despedida', 'gracias', 'adios', 'hasta luego', 'bye', 'nos vemos', 'chao'],
    respuesta: '¡Con gusto! Si necesitas algo más sobre selección o capacitación, aquí estaré.'
  },
  {
    temas: ['puestos', 'vacantes', 'cargos', 'posiciones', 'plazas', 'puestos disponibles', 'que puestos hay', 'a que puestos'],
    respuesta: 'Los puestos con reglas de evaluación configuradas son: Desarrollador Frontend (mínimo 2 años), Analista de Datos (mínimo 3 años) y Gerente de Proyectos (mínimo 4 años). Puedes preguntarme por cualquiera para conocer sus funciones y requisitos.'
  },
  {
    temas: ['requisito', 'requisitos', 'perfil', 'que necesito', 'que piden', 'requerimientos', 'minimo', 'que se necesita'],
    respuesta: 'Cada puesto tiene dos requisitos: un mínimo de años de experiencia y un conjunto de habilidades técnicas o de gestión. Frontend pide 2 años (JavaScript, CSS, Git, React, Tailwind). Analista de Datos pide 3 años (SQL, Python, Power BI, Excel). Gerente de Proyectos pide 4 años (Scrum, Liderazgo, Jira, Gestión de riesgos). Pregúntame por un puesto para ver el detalle.'
  },
  {
    temas: ['criterio', 'criterios', 'compatibilidad', 'match', 'porcentaje', 'calculo', 'como se calcula', 'puntaje', 'puntuacion', 'evaluacion'],
    respuesta: 'La compatibilidad se calcula en dos mitades de 50 puntos. La experiencia suma 50 si el candidato cumple el mínimo; si no, suma proporcionalmente (años / mínimo × 50). Las habilidades suman proporcionalmente según cuántas de las requeridas tiene (habilidades coincidentes / requeridas × 50). Ejemplo: un Analista de Datos con 2 años (de 3 requeridos) y 2 de 4 habilidades obtiene 33 + 25 = 58%.'
  },
  {
    temas: ['estado', 'estados', 'resultado', 'dictamen', 'altamente apto', 'apto', 'apto para capacitacion', 'no apto', 'apto con observaciones'],
    respuesta: 'Los estados se definen por el porcentaje de compatibilidad: 80% o más es Altamente Apto; entre 60% y 79% es Apto para Capacitación (puede integrarse con un plan de nivelación); menos de 60% es No Apto. Para puestos sin reglas configuradas, el sistema asigna Apto con Observaciones (70%).'
  },
  {
    temas: ['brecha', 'brechas', 'nivelacion', 'faltante', 'faltantes', 'que falta', 'ruta', 'rutas', 'ruta de nivelacion'],
    respuesta: 'Una brecha es una habilidad requerida para el puesto que el candidato no declaró. Si hay brechas, el sistema genera una "Ruta de Nivelación" con esas habilidades y el curso recomendado del puesto. Si no hay brechas, se sugiere el "Plan de Desarrollo en Liderazgo Técnico".'
  },
  {
    temas: ['habilidad', 'habilidades', 'como escribo', 'como escribir', 'formato', 'separar', 'coma', 'como llenar habilidades'],
    respuesta: 'Escribe las habilidades separadas por coma, por ejemplo: JavaScript, CSS, Git. No importa si usas mayúsculas o acentos. Usa los nombres tal como aparecen en las reglas: javascript, css, git, react, tailwind, sql, python, power bi, excel, scrum, liderazgo, jira, gestión de riesgos. Si escribes "JS" o "Power BI" con otro nombre, el sistema no lo reconocerá como coincidencia.'
  },
  {
    temas: ['experiencia', 'anos', 'años', 'antiguedad', 'tiempo de experiencia', 'cuantos años'],
    respuesta: 'Los años de experiencia se capturan como número entero en el formulario. Cada puesto tiene un mínimo: 2 años para Frontend, 3 para Analista de Datos y 4 para Gerente de Proyectos. Si el candidato no llega al mínimo, la parte de experiencia se calcula proporcionalmente.'
  },
  {
    temas: ['como uso', 'como evaluo', 'como funciona', 'pasos', 'formulario', 'procesar', 'evaluar candidato', 'como lo lleno', 'como se usa'],
    respuesta: 'Para evaluar a un candidato: 1) escribe su nombre completo; 2) elige el puesto objetivo; 3) captura sus años de experiencia; 4) escribe sus habilidades separadas por coma; 5) presiona "Procesar Evaluación". Verás el estado, el porcentaje, las brechas y las rutas sugeridas. La evaluación queda guardada y se refleja en las tarjetas del panel.'
  },
  {
    temas: ['metricas', 'tarjetas', 'indicadores', 'contadores', 'evaluaciones realizadas', 'compatibilidad promedio', 'rutas asignadas', 'reglas de negocio'],
    respuesta: 'Las tarjetas superiores muestran: Evaluaciones Realizadas (total de candidatos evaluados), Compatibilidad Promedio (promedio del porcentaje de todas las evaluaciones), Rutas Asignadas (total de rutas de nivelación y recomendaciones generadas) y Reglas de Negocio (criterios configurados en el sistema).'
  },
  {
    temas: ['sistema', 'modulo', 'seleccion y capacitacion', 'para que sirve', 'que es esto', 'que hace esto'],
    respuesta: 'Este módulo evalúa el perfil de candidatos y empleados frente a las reglas de cada puesto, detecta brechas de habilidades, sugiere rutas de nivelación y muestra un catálogo de capacitaciones. Su objetivo es apoyar al área de RH con criterios claros; las decisiones finales las toma una persona del área.'
  },
  {
    temas: ['otro puesto', 'puesto no listado', 'otros puestos', 'puesto nuevo', 'cargo distinto', 'puesto sin reglas', 'no aparece el puesto'],
    respuesta: 'Si el puesto no tiene reglas configuradas, el sistema no calcula requisitos: asigna Apto con Observaciones (70%) y sugiere la Inducción General a la Empresa y el curso de Cultura Organizacional y Seguridad. Para que tenga evaluación completa, un administrador debe agregar sus reglas.'
  },
  {
    temas: ['catalogo', 'capacitacion', 'capacitaciones', 'curso', 'cursos', 'programa', 'programas', 'formacion', 'entrenamiento', 'horas'],
    respuesta: 'Catálogo de capacitaciones: Liderazgo y Gestión de Equipos (Habilidades Directivas, 15 horas); Análisis de Datos y Estadísticas (Formación Técnica, 25 horas); Desarrollo Web Avanzado (Formación Técnica, 20 horas). Pregúntame por cualquiera para conocer su contenido y a quién va dirigido.'
  },
  {
    temas: ['proceso de seleccion', 'proceso', 'reclutamiento', 'entrevista', 'contratacion', 'como contratar', 'fases', 'etapas'],
    respuesta: 'Un proceso de selección típico tiene estas etapas: reclutamiento (captación de candidatos), preselección (revisión de perfiles contra requisitos), evaluación de habilidades, entrevista con el área, decisión y, por último, la integración del nuevo colaborador. En este sistema, la evaluación de perfil corresponde a la etapa de preselección y de evaluación de habilidades.'
  },
  {
    temas: ['no apto', 'rechazado', 'no pasa', 'no califico', 'que pasa si no', 'reprobado', 'no cumple'],
    respuesta: 'Un resultado No Apto no significa descartar al candidato automáticamente. Puedes revisar las brechas detectadas, asignarle una ruta de nivelación y volver a evaluarlo cuando complete la capacitación. La decisión final la toma el área de RH.'
  },
  {
    temas: ['decidir', 'decision', 'contratar', 'aprobar', 'debo contratar', 'es definitivo', 'final', 'confiar'],
    respuesta: 'El sistema es una herramienta de apoyo. Los resultados son orientativos y se basan en las reglas configuradas. Las decisiones de contratación, promoción o capacitación deben ser tomadas por una persona del área de RH, considerando también entrevistas y otros factores.'
  },
  {
    temas: ['desarrollo profesional', 'crecer', 'carrera', 'plan de carrera', 'ascenso', 'promocion', 'crecimiento'],
    respuesta: 'El desarrollo profesional se apoya en la ruta de capacitación: al detectar brechas, el sistema recomienda cursos que cierran esas habilidades. Después de completarlos, se puede volver a evaluar el perfil para medir el avance hacia el siguiente puesto.'
  },
  {
    temas: ['vacaciones', 'salario', 'sueldo', 'prestaciones', 'aguinaldo', 'horario', 'permiso', 'incapacidad', 'contrato', 'reglamento'],
    respuesta: 'No tengo cargadas las políticas específicas de la empresa, como vacaciones, sueldos, prestaciones, horarios o permisos. Para esos temas, consulta directamente con el área de Recursos Humanos.'
  }
];

// ==========================================
// CONOCIMIENTO AMPLIADO: módulos, glosario y entrevistas
// ==========================================
const BASE_AMPLIADA = [
  {
    temas: ['empleado', 'empleados', 'registrar empleado', 'alta de empleado', 'nuevo empleado', 'editar empleado', 'eliminar empleado', 'modulo empleados'],
    respuesta: 'El módulo de Empleados permite registrar nombre, departamento, rol y estado (Activo o Inactivo) de cada persona. Desde la tabla puedes editar un registro o buscar por nombre. El departamento se toma de los departamentos activos.'
  },
  {
    temas: ['departamento', 'departamentos', 'area', 'areas', 'modulo departamentos', 'responsable del area'],
    respuesta: 'El módulo de Departamentos sirve para crear áreas con un nombre y un responsable. Cada departamento puede estar Activo o Inactivo. No se pueden repetir nombres. Al eliminar un departamento, sus empleados no se borran.'
  },
  {
    temas: ['nomina', 'pago', 'pagos', 'modulo nomina', 'registrar pago', 'pagado', 'pendiente', 'rechazado', 'recibo'],
    respuesta: 'El módulo de Nómina registra pagos con empleado, departamento, monto y fecha. Cada pago puede estar Pendiente, Pagado o Rechazado. El panel muestra el total pagado y avisa cuando hay pagos pendientes. El monto debe ser mayor a cero.'
  },
  {
    temas: ['preguntas entrevista', 'entrevista tecnica', 'que preguntar', 'preguntas para candidato', 'como entrevistar', 'preguntas de entrevista'],
    respuesta: 'Para una entrevista, combina preguntas sobre experiencia real (por ejemplo, un proyecto difícil que haya resuelto), preguntas técnicas del puesto (como explicar cómo usaría SQL para un reporte) y preguntas de comportamiento (cómo trabaja en equipo o cómo maneja un error). Evalúa siempre con la misma guía para todos los candidatos.'
  },
  {
    temas: ['scrum', 'que es scrum', 'metodologia scrum'],
    respuesta: 'Scrum es un marco de trabajo ágil. Organiza el trabajo en iteraciones cortas llamadas sprints, con roles como Product Owner, Scrum Master y equipo de desarrollo, y eventos como la planeación, la revisión y la retrospectiva.'
  },
  {
    temas: ['react', 'que es react', 'libreria react'],
    respuesta: 'React es una biblioteca de JavaScript para construir interfaces de usuario a partir de componentes reutilizables. Es común en desarrollo frontend.'
  },
  {
    temas: ['tailwind', 'que es tailwind', 'tailwind css'],
    respuesta: 'Tailwind CSS es un framework de estilos que usa clases utilitarias directamente en el HTML para diseñar interfaces de forma rápida y consistente.'
  },
  {
    temas: ['sql', 'que es sql', 'base de datos sql', 'consultas sql'],
    respuesta: 'SQL es el lenguaje estándar para consultar y manipular datos en bases de datos relacionales. Un analista de datos lo usa para extraer y cruzar información.'
  },
  {
    temas: ['power bi', 'powerbi', 'que es power bi', 'dashboards', 'tableros'],
    respuesta: 'Power BI es una herramienta de Microsoft para crear tableros interactivos y reportes visuales a partir de datos de distintas fuentes.'
  },
  {
    temas: ['python', 'que es python', 'lenguaje python'],
    respuesta: 'Python es un lenguaje de programación muy usado en análisis de datos, automatización y estadística, gracias a librerías como pandas y numpy.'
  },
  {
    temas: ['jira', 'que es jira', 'tablero jira'],
    respuesta: 'Jira es una herramienta para planear y dar seguimiento a tareas y proyectos, muy usada con metodologías ágiles como Scrum.'
  },
  {
    temas: ['git', 'que es git', 'control de versiones', 'github'],
    respuesta: 'Git es un sistema de control de versiones que permite llevar el historial de cambios de un proyecto y trabajar en equipo sin pisarse el código. GitHub es un servicio en la nube que aloja repositorios de Git.'
  },
  {
    temas: ['gestion de riesgos', 'que es gestion de riesgos', 'riesgos del proyecto'],
    respuesta: 'La gestión de riesgos consiste en identificar los posibles problemas de un proyecto, evaluar qué tan probables son y su impacto, y definir acciones para prevenirlos o reducir su efecto.'
  },
  {
    temas: ['liderazgo', 'que es liderazgo', 'ser lider', 'lider'],
    respuesta: 'El liderazgo es la capacidad de guiar a un equipo hacia metas comunes, con comunicación clara, toma de decisiones, delegación y retroalimentación constante.'
  }
];

// Entradas generadas automáticamente a partir de las reglas de cada puesto
const ENTRADAS_PUESTOS = Object.keys(REGLAS_PUESTOS).map(clave => ({
  temas: [...DATOS_PUESTOS[clave].temas, 'requisitos', 'requisito', 'perfil', 'que hace', 'funciones', 'funcion'],
  respuesta: respuestaPuesto(clave)
}));

// Entradas generadas a partir del catálogo y los cursos recomendados
const ENTRADAS_CURSOS = [
  ...CATALOGO_CAPACITACION.map(c => ({
    temas: c.temas,
    respuesta: `${c.nombre} (${c.tipo}, ${c.horas} horas). ${c.descripcion} Dirigido a: ${c.dirigido}`
  })),
  ...CURSOS_RECOMENDADOS_EXTRA.map(c => ({
    temas: c.temas,
    respuesta: `${c.nombre}. ${c.descripcion}`
  }))
];

const TODAS_LAS_ENTRADAS = [
  ...BASE_CONOCIMIENTO,
  ...BASE_AMPLIADA,
  ...ENTRADAS_PUESTOS,
  ...ENTRADAS_CURSOS
];

const RESPUESTA_NO_ENCONTRADA =
  'No encontré información sobre eso. Puedo ayudarte con: puestos y requisitos, criterios de evaluación, estados de dictamen, brechas y rutas de nivelación, el formulario de evaluación, el catálogo de capacitaciones, los módulos de Empleados, Departamentos y Nómina, y términos como Scrum, React o SQL. Escribe "ayuda" para ver todos los temas.';

// ==========================================
// BÚSQUEDA CON TOLERANCIA A ERRORES DE ESCRITURA
// ==========================================

// Distancia de Levenshtein: cuántos cambios de letra separan dos palabras
const distancia = (a, b) => {
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return d[m][n];
};

// Deja solo letras y números separados por un espacio
const limpiarTexto = (texto) =>
  normalizar(texto).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

// Calcula qué tan bien coincide una entrada con el mensaje
const puntajeEntrada = (entrada, mensajeLimpio, palabrasMensaje) => {
  let puntaje = 0;

  for (const tema of entrada.temas) {
    const t = limpiarTexto(tema);
    if (!t) continue;

    // Coincidencia exacta de frase: vale por cantidad de palabras
    if (` ${mensajeLimpio} `.includes(` ${t} `)) {
      puntaje += t.split(' ').length;
      continue;
    }

    // Tolerancia a errores: solo para una palabra suelta de 5 o más letras
    if (!t.includes(' ') && t.length >= 5) {
      const hayTypo = palabrasMensaje.some(p => p.length >= 4 && distancia(p, t) <= 1);
      if (hayTypo) puntaje += 0.8;
    }
  }

  return puntaje;
};

const buscarRespuesta = (mensaje) => {
  const mensajeLimpio = limpiarTexto(mensaje);
  const palabrasMensaje = mensajeLimpio.split(' ').filter(p => p.length > 1);

  let mejor = null;
  let mejorPuntaje = 0;

  for (const entrada of TODAS_LAS_ENTRADAS) {
    const puntaje = puntajeEntrada(entrada, mensajeLimpio, palabrasMensaje);
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejor = entrada;
    }
  }

  return mejor && mejorPuntaje >= 0.8 ? mejor.respuesta : RESPUESTA_NO_ENCONTRADA;
};

const asistenteChatbot = (req, res) => {
  try {
    const mensaje = String(req.body?.mensaje || '').trim();
    if (!mensaje) {
      return res.status(400).json({ error: 'El mensaje es obligatorio.' });
    }

    return res.json({ respuesta: buscarRespuesta(mensaje), fuente: 'reglas' });
  } catch (error) {
    console.error('Error en chatbot:', error);
    return res.status(500).json({ error: 'Error en respuesta de chatbot.' });
  }
};

// ==========================================
// MÉTRICAS PARA LAS TARJETAS SUPERIORES
// ==========================================
const obtenerMetricas = async (req, res) => {
  try {
    const totalEvaluaciones = await Seleccion.countDocuments();

    const resPromedio = await Seleccion.aggregate([
      { $group: { _id: null, promedio: { $avg: '$match' } } }
    ]);
    const compatibilidadPromedio = resPromedio.length > 0
      ? Math.round(resPromedio[0].promedio)
      : 0;

    const resRutas = await Seleccion.aggregate([
      { $unwind: '$rutasSugeridas' },
      { $count: 'totalRutas' }
    ]);
    const rutasAsignadas = resRutas.length > 0 ? resRutas[0].totalRutas : 0;

    return res.json({
      totalEvaluaciones,
      compatibilidadPromedio,
      rutasAsignadas
    });
  } catch (error) {
    console.error('Error al calcular métricas:', error);
    return res.status(500).json({ error: 'Error al obtener métricas.' });
  }
};

module.exports = {
  evaluarCandidato,
  asistenteChatbot,
  obtenerMetricas
};