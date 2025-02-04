import express from "express";
import { planTrip } from "../controllers/travelController";
import { validateTravelRequest } from "../middlewares/validationMiddleware";

const router = express.Router();

// Aplicar el middleware de validación antes de manejar la solicitud
router.post("/chat", validateTravelRequest, planTrip);

export { router as travelRouter };