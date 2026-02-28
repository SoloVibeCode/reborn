import { DailyPick } from "@/types";

const today = new Date().toISOString().split("T")[0];

export const mockPicks: DailyPick[] = [
  {
    id: "1",
    date: today,
    title: "Claude 4 supera a GPT-5 en razonamiento matemático según nuevo benchmark",
    summary:
      "Nuevo benchmark independiente muestra que Claude 4 supera a GPT-5 en tareas de razonamiento matemático avanzado. La comunidad debate sobre la metodología y las implicaciones.",
    author_name: "u/ml_researcher",
    source: "Reddit",
    avatar_url: "",
    link_post: "https://reddit.com/r/MachineLearning/example1",
    category: "Modelos",
    score: 97,
    reason: "Comparativa objetiva entre modelos frontier con datos verificables",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    date: today,
    title: "Nuevo framework open-source reduce el coste de agentes de IA un 80%",
    summary:
      "Framework que optimiza llamadas a API mediante caching inteligente y planificación jerárquica. En producción reduce costes hasta un 80% manteniendo calidad. Disponible en GitHub.",
    author_name: "researcher_42",
    source: "Hacker News",
    avatar_url: "",
    link_post: "https://news.ycombinator.com/item?id=example2",
    category: "Agentes",
    score: 94,
    reason: "Herramienta práctica de alto impacto para developers trabajando con agentes",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    date: today,
    title: "Anthropic publica investigación sobre interpretabilidad de modelos grandes",
    summary:
      "Nuevo paper demuestra técnicas para visualizar representaciones internas de LLMs. Permite identificar circuitos responsables de diferentes capacidades, abriendo la puerta a modelos más seguros.",
    author_name: "u/ai_safety_fan",
    source: "Reddit",
    avatar_url: "",
    link_post: "https://reddit.com/r/MachineLearning/example3",
    category: "Investigación",
    score: 92,
    reason: "Avance significativo en safety e interpretabilidad con aplicaciones directas",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    date: today,
    title: "Hugging Face lanza fine-tuning en un click para modelos open-source",
    summary:
      "Nueva herramienta que permite personalizar Llama 3 y Mistral sin escribir código. Incluye gestión automática de datasets, evaluación integrada y deploy directo. Plan gratuito disponible.",
    author_name: "hf_dev",
    source: "Hacker News",
    avatar_url: "",
    link_post: "https://news.ycombinator.com/item?id=example4",
    category: "Herramientas",
    score: 89,
    reason: "Democratiza el fine-tuning bajando la barrera de entrada significativamente",
    created_at: new Date().toISOString(),
  },
];
