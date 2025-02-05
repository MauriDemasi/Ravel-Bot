# Ravel Bot: Asistente Inteligente de Planificación de Viajes 🌍

## 📋 Descripción General

Ravel Bot es un asistente conversacional inteligente diseñado para ayudar a los usuarios a planificar sus viajes de manera eficiente. Utilizando una arquitectura multi-agente y tecnologías modernas, el bot ofrece recomendaciones de viaje personalizadas, sugerencias de equipaje e información meteorológica. 

Objetivo:  Crear una herramienta que simplifique la planificación de viajes al proporcionar información básica y funcionalidades mínimas, con el potencial de escalar a una solución más completa en el futuro. 

## 🚀 Características Principales

1. **Flujo Multi-Agente:**
   - Implementa al menos **2 agentes** que trabajen en conjunto:
     - **Agente 1 (Experto en Destinos):** Sugiere destinos populares y lugares interesantes basados en preferencias del usuario.
     - **Agente 2 (Especialista en Equipaje y Clima):** Proporciona recomendaciones de equipaje y consulta el clima para el destino seleccionado.

2. **Funcionalidades del Bot:**
   - **Búsqueda de Destinos:** Explora destinos con detalles básicos (nombre, ubicación y descripción).
   - **Sugerencias para Empacar:** Genera una lista básica de cosas para llevar según el destino, actividades y duración del viaje.
   - **Consulta de Clima:** Utiliza una API pública gratuita (por ejemplo, OpenWeatherMap) para obtener información meteorológica.

3. **Manejo de Conversaciones:**
   - El bot gestiona hilos de conversación, permitiendo al usuario:
     - Cambiar de tema (por ejemplo, de destinos a clima) sin perder el contexto.
     - Retomar un hilo anterior utilizando un `conversationId`.

4. **Tecnologías y Librerías:**
   - **TypeScript:** Para todo el desarrollo.
   - **LangGraph:** Para la lógica de agentes y flujos conversacionales.
   - **Redis:** Para almacenar el contexto de las conversaciones.
   - **Express.js:** Para exponer el bot como un servicio HTTP local.

---

## 🛠 Tecnologías

- **Node.js + TypeScript:** Lenguaje principal del proyecto.
- **Express.js:** Framework para crear el servidor HTTP.
- **Redis:** Base de datos en memoria para almacenar el contexto de las conversaciones.
- **OpenWeatherMap API:** Fuente de datos para consultar el clima.
- **UUID:** Para generar identificadores únicos (`conversationId`).
- **Modelos de Lenguaje (LLMs):** Para generar respuestas naturales y procesar consultas complejas.
- **Tavily:** Para realizar búsquedas contextuales y obtener información relevante sobre destinos.

---

## 📋 Requisitos Previos

- Node.js (v18+)
- npm o yarn
- Servidor Redis

## 🔧 Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/MauriDemasi/Ravel-Bot.git
   cd Ravel
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Crear un archivo `.env`:
   ```
   PORT=3000
   REDIS_URL=redis://localhost:6379 
   OPENWEATHER_API_KEY=tu_clave_api
   HUGGINGFACEHUB_API_KEY=tu_clave_api
   TAVILY_API_KEY=tu_clave_api
   OPENAI_API_KEY=tu_clave_api
   WEATHERAPI_API_KEY=tu_clave_api
   ```

4. Iniciar el servidor:
   ```bash
   npm start
   ```

## 📡 Endpoint de API

**POST `/api/chat`**

### Ejemplos de Solicitudes

#### Búsqueda de Destinos
```json
{
  "topic": "destinos",
  "preferences": ["playa", "montaña"],
  "dateRange": {
    "start": "2025-03-01",
    "end": "2025-03-15"
  }
}
```

#### Consulta de Clima
```json
{
  "topic": "clima",
  "conversationId": "cadbe5c9-a9e7-4925-9e05-ae361e9f8ffa"
}
```

## 🗂 Estructura del Proyecto

```
.
├── package.json
├── package-lock.json
├── README.md
├── src
│   ├── app.ts
│   ├── controllers
│   │   └── travelController.ts
│   ├── infra
│   ├── interfaces
│   │   ├── DestinationAgentState.ts
│   │   └── LuggageWeatherAgent.ts
│   ├── middlewares
│   │   └── validationMiddleware.ts
│   ├── routes
│   │   └── travelRoutes.ts
│   ├── services
│   │   ├── agents
│   │   │   ├── BaseAgent.ts
│   │   │   ├── DestinationAgent.ts
│   │   │   └── LuggageWeatherAgent.ts
│   │   ├── conversations
│   │   │   ├── chatService.ts
│   │   │   └── conversationsService.ts
│   │   ├── graph
│   │   │   └── travelGraphService.ts
│   │   ├── redis
│   │   │   └── redisService.ts
│   │   └── validationServices.ts
│   └── types
│       ├── typeConversationContext.ts
│       ├── typeLocation.ts
│       ├── typePackingRecommendation.ts
│       ├── typesState.ts
│       ├── typeTravelRecomendation.ts
│       └── typeWheatherInfo.ts
└── tsconfig.json
```

## 🚧 Roadmap Futuro

- Integración de APIs adicionales Vuelos o Alojamientos
- Desarrollo de interfaz web/móvil
- Expansión de especializaciones de agentes
- Mejora de persistencia de conversaciones
- Personalización del Presupuesto
- Planificación Avanzada de itinerario (por destino, presupuesto,etc)

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Abre issues o envía pull requests.

## 📄 Licencia

[MIT License](https://opensource.org/licenses/MIT)
```
