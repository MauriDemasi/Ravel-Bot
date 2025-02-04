// src/app.ts
import express from "express";
import { travelRouter } from "../src/routes/travelRoutes";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use("/api", travelRouter);

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Algo salió mal en el servidor" });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

