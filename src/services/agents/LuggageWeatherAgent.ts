import { HfInference } from "@huggingface/inference";
import axios from "axios";
import { typeLocation } from "../../types/typeLocation";
import { typeWheatherInfo } from "../../types/typeWheatherInfo";
import { TypePackingRecommendation } from "../../types/typePackingRecommendation";

export class LuggageWeatherAgent {
  private hf: HfInference;

  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACEHUB_API_KEY);
  }

  async getWeatherAndPackingRecommendations(input: {
    location: typeLocation;
    dateRange: { start: Date; end: Date };
    activities: string[];
  }): Promise<{ weather: typeWheatherInfo; packing: TypePackingRecommendation }> {
    try {
      if (!input.location || !input.activities || input.activities.length === 0) {
        throw new Error("Se requiere un destino y al menos una actividad.");
      }

      // 1️⃣ Obtener datos del clima desde WeatherAPI
      const weatherInfo = await this.getWeatherInfo(input.location);

      // 2️⃣ Generar recomendaciones de equipaje con Hugging Face
      const packingInfo = await this.getPackingRecommendations(
        input.location,
        input.activities,
        weatherInfo
      );

      return {
        weather: weatherInfo,
        packing: packingInfo,
      };
    } catch (error) {
      console.error("Error en LuggageWeatherAgent:", error);
      throw error;
    }
  }

  private async getWeatherInfo(location: typeLocation): Promise<typeWheatherInfo> {
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

  private async getPackingRecommendations(
    location: typeLocation,
    activities: string[],
    weatherInfo: typeWheatherInfo
  ): Promise<TypePackingRecommendation> {
    const packingPrompt = `
      Eres un experto en viajes. Crea una lista de equipaje para ${location.city} con las siguientes actividades: ${activities.join(",")}.
      Considera el siguiente clima:
      - Temperatura: ${weatherInfo.temperature}°C
      - Condiciones: ${weatherInfo.conditions}
      - Estación: ${weatherInfo.season}
      - Ropa recomendada: ${weatherInfo.recommendedClothing}
      
      Responde SOLO con un objeto JSON que contenga esta estructura y completa los campos con los datos que obtuviste:
      {
        "essentials": ["pasaporte", "dinero", "tarjetas"],
        "clothing": ["chaqueta", "botas", "pantalones"],
        "documents": ["pasaporte", "seguro de viaje"],
        "equipment": ["mochila", "cámara"],
        "weightEstimation": 15
      }

      No incluyas texto adicional, solo el JSON.
    `;

    const packingResponse = await this.hf.textGeneration({
      model: process.env.MODEL_HF || "gpt-3.5-turbo",
      inputs: packingPrompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        do_sample: true,
      },
    });

    return this.parsePackingResponse(packingResponse.generated_text);
  }

  private parsePackingResponse(responseText: string): TypePackingRecommendation {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No se encontró un JSON válido en la respuesta.");
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Error parseando packing response:", error);
      return {
        essentialsItems: [],
        clothing: [],
        documentsNeeded: [],
        specialEquipment: [],
        weightEstimation: 0,
      };
    }
  }
}