/**
 * AI Curation using Anthropic Claude API
 * Takes candidate posts from Reddit + HN and selects the 4 best ones
 */

import { CandidatePost } from "./sources";
import { DailyPick, Category } from "@/types";

interface CuratedResult {
  post_id: string;
  title: string;
  summary: string;
  category: Category;
  score: number;
  reason: string;
}

/**
 * Uses Claude to analyze candidate posts and select the 4 best ones
 */
export async function curatePosts(
  candidates: CandidatePost[]
): Promise<Omit<DailyPick, "id" | "created_at">[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  // Prepare the candidate data for the prompt
  const candidateList = candidates
    .slice(0, 50)
    .map(
      (c, i) =>
        `[${i + 1}] ${c.author_name} (${c.source})
URL: ${c.url}
Discussion: ${c.source_url}
Text: ${c.text}
Upvotes: ${c.score} | Comments: ${c.comments}
Posted: ${c.created_at}`
    )
    .join("\n\n---\n\n");

  const today = new Date().toISOString().split("T")[0];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Eres el curador de Reborn, una web que muestra los 4 mejores posts diarios sobre Inteligencia Artificial, extraídos de Reddit y Hacker News.

Analiza los siguientes posts candidatos y selecciona los 4 MEJORES según estos criterios:
- Relevancia para la comunidad de IA (noticias, lanzamientos, investigación, herramientas)
- Originalidad (no es contenido genérico ni repost)
- Engagement real (alto número de upvotes y comentarios sugiere contenido valioso)
- Valor educativo o informativo
- Diversidad de temas (intenta que los 4 cubran diferentes aspectos de IA)
- Diversidad de fuentes (intenta mezclar Reddit y Hacker News cuando sea posible)

Para cada post seleccionado, genera:
- title: Un título claro y atractivo en español (max 100 caracteres)
- summary: Un resumen informativo en español (2-3 frases, max 250 caracteres)
- category: Una de estas categorías exactas: "LLMs", "Agentes", "Modelos", "Herramientas", "Investigación", "Industria"
- score: Puntuación de 0 a 100 basada en relevancia e impacto
- reason: Por qué fue seleccionado (1 frase en español, max 120 caracteres)

POSTS CANDIDATOS:

${candidateList}

Responde SOLO con un JSON array de exactamente 4 objetos, ordenados de mayor a menor score. Formato:
[
  {
    "post_id": "número del candidato, ej: 1",
    "title": "...",
    "summary": "...",
    "category": "...",
    "score": 95,
    "reason": "..."
  }
]

Solo el JSON, sin texto adicional.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Parse the JSON response
  let curatedResults: CuratedResult[];
  try {
    curatedResults = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse Claude response as JSON");
    }
    curatedResults = JSON.parse(jsonMatch[0]);
  }

  // Map curated results back to DailyPick format
  const picks = curatedResults.map((result) => {
    const candidateIndex = parseInt(result.post_id) - 1;
    const candidate = candidates[candidateIndex];

    if (!candidate) {
      throw new Error(`Invalid post_id reference: ${result.post_id}`);
    }

    return {
      date: today,
      title: result.title,
      summary: result.summary,
      author_name: candidate.author_name,
      source: candidate.source,
      avatar_url: "",
      link_post: candidate.url,
      category: result.category as Category,
      score: result.score,
      reason: result.reason,
    };
  });

  return picks;
}
