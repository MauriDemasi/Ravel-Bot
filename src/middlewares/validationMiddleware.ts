// midlewares/validationMiddlewares.ts
import { Request, Response, NextFunction } from "express";
import { ValidationService } from "../services/validationServices";

export const validateTravelRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { topic, preferences, dateRange } = req.body;

  // Validar que los campos requeridos estén presentes
  if (!topic || !preferences || !dateRange) {
    res.status(400).json({ error: "Se requieren 'topic', 'preferences' y 'dateRange' para procesar la solicitud." });
    return;
  }

  // Validar que las preferencias sean un array
  if (!Array.isArray(preferences)) {
    res.status(400).json({ error: "El campo 'preferences' debe ser un array." });
    return;
  }

  // Validar que las fechas estén en el formato correcto
  if (!dateRange.start || !dateRange.end) {
    res.status(400).json({ error: "El campo 'dateRange' debe contener 'start' y 'end'." });
    return;
  }

  try {
    // Validar las fechas usando el servicio de validación
    ValidationService.validateDates(dateRange);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
    return;
  }

  // Si todo está bien, pasar al siguiente middleware o controlador
  next();
};