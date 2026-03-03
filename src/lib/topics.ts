export interface DailyTask {
  title: string;
  description: string;
  estimated_minutes: number;
}

export interface AiPlan {
  overview: string;
  milestones: string[];
}

export interface Topic {
  id: string;
  title: string;
  icon: string;
  description: string;
  overview: string;      // → ai_plan.overview
  milestones: string[];  // → ai_plan.milestones (3 items)
  tasks: DailyTask[];    // 6 tasks: índices 0-2 Plan A, 3-5 Plan B
}

export const TOPICS: Topic[] = [
  {
    id: "ai",
    title: "Dominar la IA",
    icon: "🤖",
    description: "ChatGPT, Claude, prompts y automatizaciones",
    overview: "Conviértete en un experto en inteligencia artificial y automatiza tu vida profesional con las herramientas más potentes del mercado.",
    milestones: [
      "Dominar prompts avanzados y flujos de trabajo con IA",
      "Automatizar tareas repetitivas con Make o Zapier",
      "Crear tu propio GPT o asistente personalizado",
    ],
    tasks: [
      {
        title: "Explorar ChatGPT o Claude",
        description: "Prueba 5 prompts distintos y descubre las capacidades básicas de la IA.",
        estimated_minutes: 15,
      },
      {
        title: "Aprende a escribir prompts efectivos",
        description: "Estudia la estructura de un buen prompt: rol, contexto, tarea y formato.",
        estimated_minutes: 20,
      },
      {
        title: "Usa Claude para mejorar tu escritura",
        description: "Reescribe un email o documento profesional con ayuda de IA.",
        estimated_minutes: 15,
      },
      {
        title: "Automatiza una tarea con Make o Zapier",
        description: "Crea tu primer flujo automatizado conectando dos apps que ya usas.",
        estimated_minutes: 25,
      },
      {
        title: "Genera imágenes con IA",
        description: "Usa Midjourney, DALL-E o Ideogram para crear imágenes con prompts descriptivos.",
        estimated_minutes: 20,
      },
      {
        title: "Crea un GPT personalizado",
        description: "Configura un asistente de IA con instrucciones específicas para tu área de trabajo.",
        estimated_minutes: 25,
      },
    ],
  },
  {
    id: "python",
    title: "Aprender Python",
    icon: "🐍",
    description: "Programación práctica desde cero",
    overview: "Aprende Python de manera práctica y empieza a automatizar tareas, analizar datos y construir tus primeras herramientas.",
    milestones: [
      "Configurar tu entorno y escribir tus primeros scripts",
      "Dominar funciones, bucles y manejo de archivos",
      "Conectarte a APIs externas y automatizar flujos de datos",
    ],
    tasks: [
      {
        title: "Configura tu entorno Python",
        description: "Instala Python, VS Code y crea tu primer archivo .py con un 'Hola Mundo'.",
        estimated_minutes: 20,
      },
      {
        title: "Variables, tipos y operaciones básicas",
        description: "Practica con strings, enteros, listas y diccionarios en el intérprete de Python.",
        estimated_minutes: 20,
      },
      {
        title: "Escribe tu primer script útil",
        description: "Crea un script que automatice una tarea simple: renombrar archivos, calcular gastos, etc.",
        estimated_minutes: 25,
      },
      {
        title: "Funciones y reutilización de código",
        description: "Aprende a definir funciones con parámetros y valores de retorno.",
        estimated_minutes: 20,
      },
      {
        title: "Lee y procesa archivos CSV",
        description: "Usa la librería csv o pandas para cargar y analizar datos de una hoja de cálculo.",
        estimated_minutes: 20,
      },
      {
        title: "Llama a una API REST con Python",
        description: "Usa requests para obtener datos de una API pública (clima, noticias, etc.).",
        estimated_minutes: 25,
      },
    ],
  },
  {
    id: "english",
    title: "Inglés técnico",
    icon: "🇬🇧",
    description: "Vocabulario, comprensión y expresión oral",
    overview: "Mejora tu inglés técnico para comunicarte con fluidez en entornos profesionales, leer documentación y participar en reuniones internacionales.",
    milestones: [
      "Construir vocabulario técnico sólido con tarjetas de memoria",
      "Comprender podcasts y artículos técnicos sin subtítulos",
      "Expresarte con confianza en inglés oral y escrito",
    ],
    tasks: [
      {
        title: "Vocabulario técnico con Anki",
        description: "Crea o descarga un mazo de Anki con 20 términos técnicos de tu sector y repásalos.",
        estimated_minutes: 15,
      },
      {
        title: "Escucha un podcast técnico en inglés",
        description: "Escucha 15-20 minutos de Lex Fridman, Syntax.fm o similar y toma notas.",
        estimated_minutes: 20,
      },
      {
        title: "Practica shadowing",
        description: "Repite en voz alta una sección de un vídeo en inglés para mejorar pronunciación.",
        estimated_minutes: 15,
      },
      {
        title: "Escribe un texto técnico en inglés",
        description: "Redacta un email profesional, una descripción de proyecto o un resumen técnico.",
        estimated_minutes: 20,
      },
      {
        title: "Lee un artículo técnico en inglés",
        description: "Lee un post de Dev.to, Smashing Magazine o similar y apunta vocabulario nuevo.",
        estimated_minutes: 20,
      },
      {
        title: "Speaking con IA en inglés",
        description: "Mantén una conversación de 10 minutos en inglés con ChatGPT o Claude sobre tu trabajo.",
        estimated_minutes: 15,
      },
    ],
  },
  {
    id: "fitness",
    title: "Fitness & Salud",
    icon: "💪",
    description: "Ejercicio, movimiento y bienestar físico",
    overview: "Construye una rutina de ejercicio sostenible que mejore tu energía, salud y rendimiento diario.",
    milestones: [
      "Establecer una rutina de ejercicio diaria consistente",
      "Completar sesiones de HIIT y trabajo de fuerza",
      "Notar mejoras reales en energía y resistencia física",
    ],
    tasks: [
      {
        title: "Calentamiento articular completo",
        description: "Realiza movilidad de cuello, hombros, caderas y tobillos durante 10 minutos.",
        estimated_minutes: 10,
      },
      {
        title: "Cardio suave 20 minutos",
        description: "Camina rápido, trota o anda en bici a un ritmo cómodo durante 20 minutos.",
        estimated_minutes: 20,
      },
      {
        title: "Sentadillas y fondos básicos",
        description: "Haz 3 series de 10 sentadillas y 3 series de 8 fondos o push-ups modificados.",
        estimated_minutes: 15,
      },
      {
        title: "HIIT de 20 minutos",
        description: "Alterna 40 segundos de esfuerzo máximo con 20 segundos de descanso durante 20 minutos.",
        estimated_minutes: 20,
      },
      {
        title: "Plancha y trabajo de core",
        description: "Realiza 3 series de plancha (30-60s), crunches y mountain climbers.",
        estimated_minutes: 15,
      },
      {
        title: "Estiramientos y movilidad",
        description: "Realiza una sesión completa de estiramientos musculares manteniendo cada posición 30 segundos.",
        estimated_minutes: 15,
      },
    ],
  },
  {
    id: "finance",
    title: "Finanzas personales",
    icon: "💰",
    description: "Ahorro, inversión y libertad financiera",
    overview: "Toma el control de tu dinero, elimina deudas y empieza a construir riqueza con estrategias de inversión simples y efectivas.",
    milestones: [
      "Tener visibilidad total de tus ingresos y gastos",
      "Establecer un sistema de ahorro automático",
      "Comprender y comenzar a invertir en ETFs indexados",
    ],
    tasks: [
      {
        title: "Registra todos tus gastos del mes",
        description: "Usa una app (Wallet, YNAB, o Excel) para categorizar todos tus gastos del último mes.",
        estimated_minutes: 20,
      },
      {
        title: "Calcula tu tasa de ahorro",
        description: "Divide tu ahorro mensual entre tus ingresos y establece un objetivo del 20%.",
        estimated_minutes: 15,
      },
      {
        title: "Lee sobre ETFs e inversión indexada",
        description: "Lee un artículo introductorio sobre ETFs, diversificación y el índice S&P 500.",
        estimated_minutes: 20,
      },
      {
        title: "Audita tus suscripciones",
        description: "Lista todas tus suscripciones activas y cancela las que no aportan valor real.",
        estimated_minutes: 15,
      },
      {
        title: "Configura el ahorro automático",
        description: "Programa una transferencia automática el día de cobro hacia una cuenta de ahorro.",
        estimated_minutes: 10,
      },
      {
        title: "Calcula el interés compuesto",
        description: "Usa una calculadora de interés compuesto para ver el impacto de invertir 100€/mes durante 20 años.",
        estimated_minutes: 15,
      },
    ],
  },
  {
    id: "productivity",
    title: "Productividad",
    icon: "⚡",
    description: "Foco, gestión del tiempo y sistemas",
    overview: "Diseña sistemas de trabajo que te permitan lograr más en menos tiempo, con menos estrés y mayor claridad mental.",
    milestones: [
      "Dominar la planificación diaria y semanal",
      "Eliminar las principales fuentes de distracción",
      "Implementar una revisión semanal para mantener el foco",
    ],
    tasks: [
      {
        title: "Planifica el día con la técnica MIT",
        description: "Identifica tus 3 tareas más importantes (Most Important Tasks) y bloquéalas primero.",
        estimated_minutes: 10,
      },
      {
        title: "Sesión Pomodoro de 25 minutos",
        description: "Usa un temporizador Pomodoro para trabajar con foco absoluto en una sola tarea.",
        estimated_minutes: 25,
      },
      {
        title: "Vacía tu bandeja de entrada",
        description: "Procesa todos los emails pendientes: responde, archiva o elimina hasta llegar a cero.",
        estimated_minutes: 20,
      },
      {
        title: "Auditoría de tiempo",
        description: "Registra en qué empleas cada hora durante un día completo para identificar pérdidas de tiempo.",
        estimated_minutes: 25,
      },
      {
        title: "Bloquea las distracciones digitales",
        description: "Configura Freedom, Cold Turkey o Do Not Disturb durante tus horas de trabajo profundo.",
        estimated_minutes: 15,
      },
      {
        title: "Weekly review semanal",
        description: "Revisa lo completado esta semana, limpia listas de tareas y planifica la próxima.",
        estimated_minutes: 20,
      },
    ],
  },
  {
    id: "entrepreneurship",
    title: "Emprendimiento",
    icon: "🚀",
    description: "Validar ideas y lanzar tu negocio",
    overview: "Transforma tu idea en un negocio real con metodologías de validación rápida, sin malgastar tiempo ni recursos.",
    milestones: [
      "Definir claramente tu cliente ideal y propuesta de valor",
      "Construir y publicar tu primera landing page",
      "Obtener 10 primeras respuestas de validación de clientes",
    ],
    tasks: [
      {
        title: "Define tu cliente ideal",
        description: "Escribe un perfil detallado: edad, trabajo, problemas, deseos y donde pasa el tiempo.",
        estimated_minutes: 20,
      },
      {
        title: "Analiza a tu competencia",
        description: "Estudia 3 competidores: sus precios, propuestas de valor y puntos débiles.",
        estimated_minutes: 20,
      },
      {
        title: "Diseña tu MVP en papel",
        description: "Dibuja el flujo mínimo de tu producto o servicio en una hoja, sin código ni diseño.",
        estimated_minutes: 25,
      },
      {
        title: "Crea una landing page simple",
        description: "Usa Notion, Carrd o Tally para publicar una página con tu propuesta de valor y formulario.",
        estimated_minutes: 25,
      },
      {
        title: "Haz 5 outreach a potenciales clientes",
        description: "Envía 5 mensajes personalizados por LinkedIn, email o Twitter ofreciendo resolver su problema.",
        estimated_minutes: 20,
      },
      {
        title: "Diseña una encuesta de validación",
        description: "Crea 5 preguntas con Typeform o Google Forms para entender el problema de tu cliente.",
        estimated_minutes: 15,
      },
    ],
  },
  {
    id: "mindfulness",
    title: "Meditación & Mindfulness",
    icon: "🧘",
    description: "Paz mental, presencia y equilibrio",
    overview: "Desarrolla una práctica de meditación diaria que reduzca el estrés, mejore tu concentración y aumente tu bienestar general.",
    milestones: [
      "Establecer una práctica de meditación diaria de 5 minutos",
      "Integrar el mindfulness en actividades cotidianas",
      "Experimentar reducción notable del estrés y mayor claridad mental",
    ],
    tasks: [
      {
        title: "Respiración consciente 5 minutos",
        description: "Siéntate en silencio y respira con la técnica 4-7-8: inhala 4s, retén 7s, exhala 8s.",
        estimated_minutes: 5,
      },
      {
        title: "Body scan de 10 minutos",
        description: "Recorre mentalmente cada parte de tu cuerpo de pies a cabeza, relajando tensiones.",
        estimated_minutes: 10,
      },
      {
        title: "Journaling de gratitud",
        description: "Escribe 3 cosas por las que estás agradecido hoy y por qué son importantes para ti.",
        estimated_minutes: 10,
      },
      {
        title: "Meditación libre de 10 minutos",
        description: "Siéntate sin guía, observa tus pensamientos sin juzgarlos y vuelve al presente cuando te pierdas.",
        estimated_minutes: 10,
      },
      {
        title: "Caminata mindful de 15 minutos",
        description: "Camina despacio sin teléfono, prestando atención plena a cada paso y lo que te rodea.",
        estimated_minutes: 15,
      },
      {
        title: "Revisión nocturna del día",
        description: "Antes de dormir, escribe 3 momentos positivos del día y una lección aprendida.",
        estimated_minutes: 10,
      },
    ],
  },
  {
    id: "reading",
    title: "Lectura & Aprendizaje",
    icon: "📚",
    description: "Leer más y retener lo aprendido",
    overview: "Construye el hábito de la lectura diaria y aprende técnicas de retención que conviertan lo leído en conocimiento real.",
    milestones: [
      "Leer al menos 20 páginas diarias de forma consistente",
      "Dominar técnicas de retención: resúmenes y flashcards",
      "Aplicar y enseñar lo aprendido para consolidar el conocimiento",
    ],
    tasks: [
      {
        title: "Lee 20 páginas de tu libro actual",
        description: "Sin interrupciones ni teléfono, lee 20 páginas marcando los conceptos clave.",
        estimated_minutes: 20,
      },
      {
        title: "Resume el capítulo leído",
        description: "Escribe un resumen de 5-10 líneas con las ideas principales del capítulo.",
        estimated_minutes: 15,
      },
      {
        title: "Lee un artículo técnico de tu sector",
        description: "Lee un artículo de Medium, Substack o similar sobre tu área de interés.",
        estimated_minutes: 20,
      },
      {
        title: "Crea flashcards en Anki",
        description: "Convierte los conceptos más importantes de tu lectura en tarjetas de memoria para Anki.",
        estimated_minutes: 15,
      },
      {
        title: "Enseña lo que aprendiste",
        description: "Explica en voz alta o por escrito el concepto más interesante de tu lectura reciente.",
        estimated_minutes: 15,
      },
      {
        title: "Explora un género o autor nuevo",
        description: "Lee el primer capítulo de un libro fuera de tu zona de confort: ficción, filosofía, biografía.",
        estimated_minutes: 20,
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing Digital",
    icon: "📣",
    description: "Contenido, audiencia y crecimiento online",
    overview: "Aprende a crear contenido que conecte con tu audiencia, aumenta tu visibilidad online y convierte seguidores en clientes.",
    milestones: [
      "Publicar contenido de valor de forma consistente",
      "Analizar métricas y optimizar según los resultados",
      "Construir una comunidad comprometida en tu nicho",
    ],
    tasks: [
      {
        title: "Estudia 3 creadores de tu nicho",
        description: "Analiza qué publican, con qué frecuencia y qué formatos generan más engagement.",
        estimated_minutes: 20,
      },
      {
        title: "Genera 5 ideas de contenido",
        description: "Usa el framework PAS (Problema-Agitación-Solución) para crear 5 ideas de posts.",
        estimated_minutes: 15,
      },
      {
        title: "Publica un post en tu plataforma",
        description: "Escribe y publica un post optimizado con hook potente, valor real y CTA claro.",
        estimated_minutes: 25,
      },
      {
        title: "Analiza las métricas de tu contenido",
        description: "Revisa impresiones, alcance y engagement de tus últimas publicaciones e identifica patrones.",
        estimated_minutes: 20,
      },
      {
        title: "Interactúa en publicaciones de tu nicho",
        description: "Deja 10 comentarios de valor en posts de creadores y comunidades de tu sector.",
        estimated_minutes: 20,
      },
      {
        title: "Reutiliza tu mejor contenido",
        description: "Toma tu post con más engagement y conviértelo en un hilo, carrusel o vídeo corto.",
        estimated_minutes: 20,
      },
    ],
  },
];

export function getTopicById(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}
