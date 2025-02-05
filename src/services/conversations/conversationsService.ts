import RedisService from '../redis/redisService';  // Importamos el servicio de Redis
import { ConversationContext } from '../../types/typeConversationContext';  // Importamos el tipo de contexto

class ConversationService {
  // Método para iniciar una nueva conversación
  public static async startConversation(userId: string, actualTheme: string): Promise<void> {
    const initialContext: ConversationContext = {
      actualTheme,
      messages: []
    };

    await RedisService.saveConversationContext(userId, initialContext);  // Guardamos el contexto en Redis
  }

  // Método para actualizar el contexto con un nuevo mensaje
  public static async updateConversation(userId: string, newMessage: string): Promise<void> {
    const currentContext = await RedisService.getConversationContext(userId);

    if (currentContext) {
      currentContext.messages.push(newMessage);  // Añadimos el nuevo mensaje
      await RedisService.saveConversationContext(userId, currentContext);  // Actualizamos el contexto en Redis
    } else {
      throw new Error('Contexto de conversación no encontrado');
    }
  }

  // Método para cambiar el tema de la conversación
  public static async changeConversationTheme(userId: string, newTheme: string): Promise<void> {
    const currentContext = await RedisService.getConversationContext(userId);

    if (currentContext) {
      currentContext.actualTheme = newTheme;  // Cambiamos el tema
      await RedisService.saveConversationContext(userId, currentContext);  // Actualizamos el contexto en Redis
    } else {
      throw new Error('Contexto de conversación no encontrado');
    }
  }

  // Método para recuperar el contexto de la conversación
  public static async getConversationContext(userId: string): Promise<ConversationContext | null> {
    return await RedisService.getConversationContext(userId);  // Recuperamos el contexto desde Redis
  }

  // Método para eliminar el contexto de la conversación
  public static async deleteConversationContext(userId: string): Promise<void> {
    await RedisService.deleteConversationContext(userId);  // Eliminamos el contexto de Redis
  }
}

export default ConversationService;
