import { tavily } from "@tavily/core";
import { ChatOpenAI } from "@langchain/openai";
import { TypeTravelRecomendation } from "../../types/typeTravelRecomendation";
import { ConversationContext } from "../../types/typeConversationContext";

import dotenv from "dotenv";
dotenv.config();


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
  }, context: ConversationContext): Promise<TypeTravelRecomendation> {
    try {
      if (!input.preferences || input.preferences.length === 0) {
        throw new Error("Se requiere al menos una preferencia.");
      }
  
      const query = `Destinos turísticos para ${input.preferences.join(", ")} con un presupuesto de ${input.budget} USD`;
      const searchResults = await this.tavilyClient.search(query);
  
      // Actualizar el contexto con el formato correcto
      context.actualTheme = 'destinos';
      context.messages.push({
        role: "system",
        type: "destination_recommendation",
        content: `Buscando destinos para: ${input.preferences.join(", ")}`
      });
  
      return await this.generateJsonResponse(searchResults, context);
    } catch (error) {
      console.error("Error en DestinationAgent:", error);
      throw error;
    }
  }
  
  private async generateJsonResponse(searchResults: any, context: ConversationContext): Promise<TypeTravelRecomendation> {
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
    const recommendation = this.parseResponse(response.content.toString());
  
    // Agregar mensaje de respuesta con el formato correcto
    context.messages.push({
      role: "system",
      type: "destination_recommendation",
      content: `Destinos recomendados: ${recommendation.locations?.map(loc => loc.city).join(', ') || 'No se encontraron destinos.'}`
    });
  
    return recommendation;
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
