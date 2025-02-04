import { tavily } from "@tavily/core";
import { ChatOpenAI } from "@langchain/openai";
import { TypeTravelRecomendation } from "../../types/typeTravelRecomendation";

export class DestinationAgent {
  private tavilyClient: any;
  private llm: ChatOpenAI;

  constructor() {
    this.tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });
    this.llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0.3,
      maxTokens: 1000,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getDestinationRecommendations(input: {
    preferences: string[];
    budget?: number;
    dateRange?: { start: Date; end: Date };
  }): Promise<TypeTravelRecomendation> {
    try {
      if (!input.preferences || input.preferences.length === 0) {
        throw new Error("Se requiere al menos una preferencia.");
      }

      // 1️⃣ Buscar destinos en Tavily
      const query = `Destinos turísticos para ${input.preferences.join(", ")} con un presupuesto de ${input.budget} USD`;
      const searchResults = await this.tavilyClient.search(query);

      // 2️⃣ Generar recomendaciones con OpenAI
      return await this.generateJsonResponse(searchResults);
    } catch (error) {
      console.error("Error en DestinationAgent:", error);
      throw error;
    }
  }

  private async generateJsonResponse(searchResults: any): Promise<TypeTravelRecomendation> {
    const prompt = `
      Eres un asistente experto en turismo. A partir de la siguiente información:

      Resultados de búsqueda: ${JSON.stringify(searchResults)}

      Devuelve **solo** un objeto JSON con el siguiente formato:
      {
        "locations": [
          {
            "city": "Nombre de la ciudad",
            "country": "Nombre del país",
            "description": "Descripción breve del destino."
          }
        ],
        "activities": ["Lista de actividades recomendadas"],
        "bestTimeToVisit": "Época ideal para visitar",
        "estimatedBudget": {
          "min": 1000,
          "max": 2000,
          "currency": "USD"
        },
        "culturalNotes": ["Notas culturales sobre el destino"]
      }

      **Importante**: Responde solo con el JSON, sin texto adicional.
    `;

    const response = await this.llm.invoke(prompt.trim());
    return this.parseResponse(response.content.toString());
  }

  private parseResponse(responseText: string): TypeTravelRecomendation {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No se encontró un JSON válido en la respuesta.");
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.warn("Error parseando JSON:", error);
      return {
        locations: [],
        activities: [],
        bestTimeToVisit: "No especificado",
        estimatedBudget: { min: 0, max: 0, currency: "USD" },
        culturalNotes: [],
      };
    }
  }
}