import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid"; // Para generar UUIDs
import { DestinationAgent } from "../services/agents/DestinationAgent";
import { LuggageWeatherAgent } from "../services/agents/LuggageWeatherAgent";
import RedisService from "../services/redis/redisService";
import { ConversationContext } from "../types/typeConversationContext";
import { typeLocation } from "../types/typeLocation";

interface Message {
  role: "system" | "user";
  type: "destination_recommendation" | "weather_packing_recommendation";
  content: any;
}

// Instancia de los agentes
const destinationAgent = new DestinationAgent();
const luggageWeatherAgent = new LuggageWeatherAgent();

// Función para convertir location a typeLocation
const getLocationAsObject = (location: string | undefined): typeLocation | undefined => {
  if (!location) return undefined;
  try {
    return JSON.parse(location); // Parsea la cadena JSON a un objeto typeLocation
  } catch (error) {
    console.error("Error al parsear location:", error);
    return undefined;
  }
};

// Función para convertir typeLocation a string
const getLocationAsString = (location: typeLocation | undefined): string | undefined => {
  if (!location) return undefined;
  return JSON.stringify(location); // Convierte el objeto typeLocation a una cadena JSON
};

export const chat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { topic, location, preferences, activities, dateRange, conversationId } = req.body;

    // Si no se pasa un conversationId, generamos uno nuevo
    const convId = conversationId || uuidv4();

    // Validación básica del topic
    if (!topic) {
      res.status(400).json({ error: "El topic es requerido." });
      return;
    }

    // Obtener o crear el contexto desde Redis usando el conversationId
    let conversationContext: ConversationContext | null = await RedisService.getConversationContext(convId);
    if (!conversationContext) {
      console.log("No se encontró contexto en Redis. Creando uno nuevo...");
      conversationContext = {
        actualTheme: topic,
        messages: [],
        preferences: [], // Inicializamos campos opcionales como vacíos
        location: undefined,
        activities: [],
        dateRange: undefined,
      };
    } else {
      console.log("Contexto recuperado de Redis:", conversationContext);
    }

    // Función auxiliar para verificar si un campo está presente en la solicitud o el contexto
    const getValueOrDefault = <T>(value: T | undefined, contextValue: T | undefined, fieldName: string): T => {
      if (value !== undefined) {
        console.log(`Usando ${fieldName} de la solicitud.`);
        return value;
      }
      if (contextValue !== undefined) {
        console.log(`Usando ${fieldName} del contexto.`);
        return contextValue;
      }
      throw new Error(`Falta el campo requerido: ${fieldName}`);
    };

    try {
      // Procesar la solicitud según el topic
      if (topic === "destinos") {
        // Validar campos específicos para "destinos"
        const preferencesToUse = getValueOrDefault(preferences, conversationContext.preferences, "preferences");
        const dateRangeToUse = getValueOrDefault(dateRange, conversationContext.dateRange, "dateRange");

        console.log("Preferences utilizadas:", preferencesToUse);
        console.log("DateRange utilizado:", dateRangeToUse);

        // Obtener las recomendaciones de destinos
        const recommendation = await destinationAgent.getDestinationRecommendations(
          { preferences: preferencesToUse, budget: 1000, dateRange: dateRangeToUse },
          conversationContext
        );

        const message: Message = {
          role: "system",
          type: "destination_recommendation",
          content: recommendation,
        };

        // Actualizar el contexto con los valores utilizados
        conversationContext.messages.push(message);
        conversationContext.preferences = preferencesToUse;
        conversationContext.dateRange = dateRangeToUse;

        // Usar el primer destino recomendado como location
        if (recommendation.locations && recommendation.locations.length > 0) {
          const firstLocation = recommendation.locations[0];
          // Almacenar location como string (cadena JSON)
          conversationContext.location = getLocationAsString({
            city: firstLocation.city,
            country: firstLocation.country,
            description: firstLocation.description,
          });
          console.log("Actualizando location en el contexto:", conversationContext.location);
        }

        // Si se proporciona activities en la solicitud, actualizar el contexto
        if (activities) {
          conversationContext.activities = activities;
        }

        await RedisService.saveConversationContext(convId, conversationContext); // Guardar en Redis
        res.json({ conversationId: convId, recommendation });
        return;
      } else if (topic === "clima" || topic === "equipaje") {
        // Validar campos específicos para "clima" y "equipaje"
        const locationToUse = getValueOrDefault(
          location,
          getLocationAsObject(conversationContext.location),
          "location"
        );
        const activitiesToUse = getValueOrDefault(activities, conversationContext.activities, "activities");
        const dateRangeToUse = getValueOrDefault(dateRange, conversationContext.dateRange, "dateRange");

        console.log("Location utilizada:", locationToUse);
        console.log("Activities utilizadas:", activitiesToUse);
        console.log("DateRange utilizado:", dateRangeToUse);

        // Obtener el clima y las recomendaciones de equipaje
        const weatherInfo = await luggageWeatherAgent.getWeatherInfo(locationToUse);
        const packingRecommendations = await luggageWeatherAgent.getPackingRecommendations(
          locationToUse, activitiesToUse, weatherInfo
        );

        const message: Message = {
          role: "system",
          type: "weather_packing_recommendation",
          content: packingRecommendations,
        };

        // Actualizar el contexto con los valores utilizados
        conversationContext.messages.push(message);
        conversationContext.location = getLocationAsString(locationToUse);
        conversationContext.activities = activitiesToUse;
        conversationContext.dateRange = dateRangeToUse;

        await RedisService.saveConversationContext(convId, conversationContext);
        res.json({ conversationId: convId, packingRecommendations });
        return;
      } else {
        res.status(400).json({ error: "Tema no reconocido." });
        return;
      }
    } catch (validationError:any) {
      console.error("Error de validación:", validationError.message);
      res.status(400).json({ error: validationError.message });
      return;
    }
  } catch (error) {
    console.error("Error procesando la solicitud:", error);
    res.status(500).json({ error: "Hubo un error al procesar la solicitud." });
    return;
  }
};