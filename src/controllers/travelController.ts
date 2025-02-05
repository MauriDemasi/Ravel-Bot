import { Request, Response, NextFunction } from "express";
import { DestinationAgent } from "../services/agents/DestinationAgent";
import { LuggageWeatherAgent } from "../services/agents/LuggageWeatherAgent";
import RedisService from "../services/redis/redisService"; // Importar el servicio de Redis
import { ConversationContext } from "../types/typeConversationContext";

interface Message {
  role: "system" | "user";
  type: "destination_recommendation" | "weather_packing_recommendation";
  content: any;
}

// Instancia de los agentes
const destinationAgent = new DestinationAgent();
const luggageWeatherAgent = new LuggageWeatherAgent();

export const chat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("Datos recibidos:", req.body);
    const { topic, location, preferences, activities, dateRange, userId } = req.body;

    // Validación básica del topic
    if (!topic) {
      res.status(400).json({ error: "El topic es requerido." });
      return;
    }

    // Validaciones específicas según el topic
    if (topic === "destinos") {
      if (!preferences || !dateRange) {
        res.status(400).json({ error: "Para consultas de destinos se requieren preferencias y rango de fechas." });
        return;
      }
    } else if (topic === "clima") {
      if (!location || !activities || !dateRange) {
        res.status(400).json({ error: "Para consultas de clima se requieren ubicación, actividades y rango de fechas." });
        return;
      }
    } else {
      res.status(400).json({ error: "Tema no reconocido." });
      return;
    }

    // Obtener o crear el contexto desde Redis
    const userIdKey = userId || 'default'; // Usar 'default' si no hay userId
    let conversationContext = await RedisService.getConversationContext(userIdKey);

    if (!conversationContext) {
      conversationContext = {
        actualTheme: topic,
        messages: [],
      };
    }

    // Procesar la solicitud según el topic
    if (topic === "destinos") {
      const recommendation = await destinationAgent.getDestinationRecommendations(
        { preferences, budget: 1000, dateRange },
        conversationContext
      );

      const message: Message = {
        role: "system",
        type: "destination_recommendation",
        content: recommendation,
      };

      conversationContext.messages.push(message);
      await RedisService.saveConversationContext(userIdKey, conversationContext); // Guardar en Redis
      res.json(recommendation);
      return;
    } else if (topic === "clima") {
      const { weather, packing } = await luggageWeatherAgent.getWeatherAndPackingRecommendations(
        { location, dateRange, activities },
        conversationContext
      );

      const message: Message = {
        role: "system",
        type: "weather_packing_recommendation",
        content: { weather, packing },
      };

      conversationContext.messages.push(message);
      await RedisService.saveConversationContext(userIdKey, conversationContext); // Guardar en Redis
      res.json({ weather, packing });
      return;
    }
  } catch (error) {
    console.error("Error procesando la solicitud:", error);
    res.status(500).json({ error: "Hubo un error al procesar la solicitud." });
    return;
  }
};