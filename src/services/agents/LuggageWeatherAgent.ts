import { HfInference } from "@huggingface/inference";
import axios from "axios";
import { typeLocation } from "../../types/typeLocation";
import { typeWheatherInfo } from "../../types/typeWheatherInfo";
import { TypePackingRecommendation } from "../../types/typePackingRecommendation";
import { ConversationContext } from "../../types/typeConversationContext";

import dotenv from "dotenv";
dotenv.config();


export class LuggageWeatherAgent {
  private hf: HfInference;

  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACEHUB_API_KEY);
  }

 // En la clase LuggageWeatherAgent
async getWeatherAndPackingRecommendations(input: {
  location: typeLocation;
  dateRange: { start: Date; end: Date };
  activities: string[];
}, context: ConversationContext): Promise<{ weather: typeWheatherInfo; packing: TypePackingRecommendation }> {
  try {
    if (!input.location || !input.activities || input.activities.length === 0) {
      throw new Error("Se requiere un destino y al menos una actividad.");
    }

    const weatherInfo = await this.getWeatherInfo(input.location);
    const packingInfo = await this.getPackingRecommendations(input.location, input.activities, weatherInfo);

    // Actualizar contexto con el formato correcto
    context.actualTheme = 'clima-equipaje';
    context.messages.push({
      role: "system",
      type: "weather_packing_recommendation",
      content: `Consultando clima y recomendaciones de equipaje para ${input.location.city}`
    });

    return {
      weather: weatherInfo,
      packing: packingInfo,
    };
  } catch (error) {
    console.error("Error en LuggageWeatherAgent:", error);
    throw error;
  }
}

  async getWeatherInfo(location: typeLocation): Promise<typeWheatherInfo> {
    try {
      const response = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHERAPI_API_KEY}&q=${location.city},${location.country}&lang=es`
      );
      const data = response.data;

      return {
        temperature: data.current.temp_c,
        conditions: data.current.condition.text,
        season: this.getSeason(location),
        recommendedClothing: this.getClothingRecommendation(data.current.temp_c),
      };
    } catch (error) {
      console.error("Error obteniendo datos del clima:", error);
      throw new Error("No se pudo obtener el clima.");
    }
  }

  private getSeason(location: typeLocation): string {
    const month = new Date().getMonth() + 1;
    if (location.country === "Argentina" || location.country === "Brasil") {
      return month >= 9 && month <= 11 ? "primavera" : month >= 6 && month <= 8 ? "invierno" : "verano";
    }
    return month >= 3 && month <= 5 ? "primavera" : month >= 6 && month <= 8 ? "verano" : "invierno";
  }

  private getClothingRecommendation(temp: number): string {
    if (temp < 10) return "ropa de abrigo, guantes, bufanda";
    if (temp < 20) return "chaqueta ligera, pantalones largos";
    return "ropa ligera, gafas de sol";
  }

  async getPackingRecommendations(
    location: typeLocation,
    activities: string[],
    weatherInfo: typeWheatherInfo
  ): Promise<TypePackingRecommendation> {
    const packingPrompt = `
    Eres un experto en equipaje. Crea **únicamente** un objeto JSON con recomendaciones de equipaje para un viaje a ${location.city} con actividades como ${activities.join(",")}.
    El clima es el siguiente:
    - Temperatura: ${weatherInfo.temperature}°C
    - Condiciones: ${weatherInfo.conditions}
    - Estación: ${weatherInfo.season}
    - Ropa recomendada: ${weatherInfo.recommendedClothing}
    
    El JSON **debe ser** estrictamente el siguiente:
    {
      "essentials": ["Artículo esencial 1", "Artículo esencial 2"],
      "clothing": ["Ropa recomendada 1", "Ropa recomendada 2"],
      "documents": ["Documento 1", "Documento 2"],
      "equipment": ["Equipamiento 1", "Equipamiento 2"],
      "weightEstimation": 10.5
    }
    
    Responde **solo** con este formato JSON, **sin explicación ni ningún otro texto adicional**.
    `;
    
    try {
      const packingResponse = await this.hf.textGeneration({
        model: "eliasws/openApiT5-to-json-v3", 
        inputs: packingPrompt,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.2,
          do_sample: true,
        },
      });
      
      return this.parsePackingResponse(packingResponse.generated_text);
    } catch (error) {
      console.error("Error generando recomendaciones de equipaje:", error);
      throw new Error("No se pudieron obtener las recomendaciones de equipaje.");
    }
  }

  private parsePackingResponse(responseText: string): TypePackingRecommendation {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No se encontró un JSON válido en la respuesta.");
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.warn("Error parseando JSON de equipaje:", error);
        return {
          essentialsItems: ["Pasaporte", "Cargador", "Dinero en efectivo"],
          clothing: ["Camiseta", "Pantalones", "Zapatos cómodos"],
          documentsNeeded: ["Pasaporte", "Visado (si aplica)", "Tarjetas de seguro de viaje"],
          specialEquipment: ["Adaptador de corriente", "Botellas de agua reutilizables"],
          weightEstimation: 8.5,
        };
      };
    }
  }

