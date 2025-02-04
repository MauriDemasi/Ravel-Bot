import { TravelGraph } from "../../services/graph/travelGraphService";

// Historial de conversaciones (puede ser reemplazado por una base de datos)
const conversationHistory: any[] = [];

export const chatService = {
  async processChat(input: {
    preferences: string[];
    budget?: number;
    dateRange?: { start: Date; end: Date };
    conversationId?: string;
  }) {
    // Buscar el historial de la conversación si existe
    let conversation = conversationHistory.find((c) => c.id === input.conversationId);
    if (!conversation) {
      conversation = { id: Date.now().toString(), messages: [] };
      conversationHistory.push(conversation);
    }

    // Ejecutar el grafo con el input del usuario
    const travelGraph = new TravelGraph();
    const result = await travelGraph.run({
      preferences: input.preferences,
      budget: input.budget,
      dateRange: input.dateRange,
    });

    // Guardar el mensaje en el historial
    conversation.messages.push({ input, output: result });

    // Devolver la respuesta del bot y el ID de la conversación
    return { ...result, conversationId: conversation.id };
  },
};