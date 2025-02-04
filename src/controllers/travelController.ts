// src/controllers/travelController.ts
import { Request, Response } from "express";
import { DestinationAgent } from "../services/agents/DestinationAgent";
import { LuggageWeatherAgent } from "../services/agents/LuggageWeatherAgent";

// src/controllers/travelController.ts
export const planTrip = async (req: Request, res: Response): Promise<void> => {
  const { preferences, budget, dateRange, location, activities, topic } = req.body;

  try {
      // Validar que el topic sea válido
      if (!["destinos", "clima", "equipaje"].includes(topic)) {
          res.status(400).json({ error: "Tema no válido. Los valores permitidos son: 'destinos', 'clima', 'equipaje'." });
          return;
      }

      // Convertir las cadenas de fecha a objetos Date
      const parsedDateRange = dateRange
          ? {
                start: new Date(dateRange.start),
                end: new Date(dateRange.end),
            }
          : undefined;

      if (topic === "destinos") {
          // Validar que se envíen preferencias
          if (!preferences || preferences.length === 0) {
              res.status(400).json({ error: "Se requiere al menos una preferencia" });
              return;
          }

          const agent = new DestinationAgent();
          const result = await agent.getDestinationRecommendations({
              preferences,
              budget,
              dateRange: parsedDateRange,
          });
          res.status(200).json(result);
      } else if (topic === "clima" || topic === "equipaje") {
          // Validar que se envíe un destino y actividades
          if (!location || !activities || activities.length === 0) {
              res.status(400).json({ error: "Se requiere un destino y al menos una actividad" });
              return;
          }

          const agent = new LuggageWeatherAgent();
          const result = await agent.getWeatherAndPackingRecommendations({
              location,
              dateRange: parsedDateRange || { start: new Date(), end: new Date() },
              activities,
          });
          res.status(200).json(result);
      }
  } catch (error) {
      console.error("Error en planTrip:", error);
      res.status(500).json({ error: "Error al planificar el viaje" });
  }
};