import { Graph, START, END } from "@langchain/langgraph";
import { DestinationAgent } from "../agents/DestinationAgent";
import { LuggageWeatherAgent } from "../agents/LuggageWeatherAgent";
export class TravelGraph {
  private graph: Graph<any>;

  constructor() {
    this.graph = new Graph();

    // Nodo que enruta según el topic
    this.graph.addNode("topic-router", async (input: any) => {
      if (input.topic === "destinos") return "destination-agent";
      if (input.topic === "clima" || input.topic === "equipaje") return "luggage-weather-agent";
      return "default-handler"; // Si no se reconoce el topic, se maneja en otro nodo
    });

    
    // Nodo que maneja el caso donde no hay un topic definido
    this.graph.addNode("default-handler", async (_input: any) => {
      return "destination-agent"; // Asigna un destino predeterminado
    });

    this.graph.addNode("destination-agent", async (input: any) => {
      const agent = new DestinationAgent();
      const result = await agent.getDestinationRecommendations({
        preferences: input.preferences,
        budget: input.budget,
        dateRange: input.dateRange,
      });
      return { topic: "destinos", data: result };
    });

    this.graph.addNode("luggage-weather-agent", async (input: any) => {
      const agent = new LuggageWeatherAgent();
      const result = await agent.getWeatherAndPackingRecommendations({
        location: input.data?.selectedDestination,
        dateRange: input.dateRange,
        activities: input.preferences,
      });
      return { topic: "clima-equipaje", data: result };
    });

    // Conectar nodos
    this.graph.addEdge(START, "topic-router"); // El flujo empieza en el enrutador
    this.graph.addConditionalEdges("topic-router", (output: string) => output, {
      "destination-agent": "destination-agent",
      "luggage-weather-agent": "luggage-weather-agent",
      "default-handler": "default-handler",
    });
    this.graph.addEdge("default-handler", "destination-agent"); // Si el topic es desconocido, va al destino por defecto
    this.graph.addEdge("destination-agent", "luggage-weather-agent");
    this.graph.addEdge("luggage-weather-agent", END);
  }

  async run(input: any) {
    const workFlow = this.graph.compile();
    return await workFlow.invoke(input);
  }
}
