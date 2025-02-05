import express, { RequestHandler } from "express";
import { chat } from "../controllers/travelController"; // Asegúrate de que la ruta sea correcta

const router = express.Router();

router.post("/chat", chat as RequestHandler);

export { router as travelRouter };
