import { createClient, RedisClientType } from 'redis';
import { ConversationContext } from '../../types/typeConversationContext';  // Asegúrate de importar correctamente el tipo

class RedisService {
  private static instance: RedisClientType;

  private constructor() {}

  // Obtener la instancia de Redis
  public static async getInstance(): Promise<RedisClientType> {
    if (!this.instance) {
      this.instance = createClient({
        url: 'redis://localhost:6379',  // Asegúrate de que Redis esté corriendo en esta URL
      });

      this.instance.on('error', (err) => console.error('Redis Client Error', err));

      await this.instance.connect();
    }
    return this.instance;
  }

  // Guardar el contexto de la conversación en Redis
  public static async saveConversationContext(userId: string, context: ConversationContext): Promise<void> {
    const client = await this.getInstance();
    const contextString = JSON.stringify(context);
    await client.set(`context:${userId}`, contextString, { EX: 3600 }); // Guardar con expiración de 1 hora
  }

  // Obtener el contexto de la conversación desde Redis
  public static async getConversationContext(userId: string): Promise<ConversationContext | null> {
    const client = await this.getInstance();
    const contextString = await client.get(`context:${userId}`);
    return contextString ? JSON.parse(contextString) : null;
  }

  // Eliminar el contexto de la conversación de Redis
  public static async deleteConversationContext(userId: string): Promise<number> {
    const client = await this.getInstance();
    return client.del(`context:${userId}`);
  }
}

export default RedisService;
