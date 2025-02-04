// src/services/redisClient.ts
import { createClient, RedisClientType } from 'redis';

class RedisClient {
  private static instance: RedisClientType; // Tipo correcto para el cliente Redis

  private constructor() {}

  public static async getInstance(): Promise<RedisClientType> {
    if (!this.instance) {
      this.instance = createClient({
        url: 'redis://localhost:6379', // Puerto predeterminado de Redis
      });

      this.instance.on('error', (err) => console.error('Redis Client Error', err));

      await this.instance.connect();
    }
    return this.instance;
  }

  // Métodos auxiliares para operaciones comunes
  public static async set(key: string, value: string, options?: { EX?: number }): Promise<void> {
    const client = await this.getInstance();
    await client.set(key, value, options);
  }

  public static async get(key: string): Promise<string | null> {
    const client = await this.getInstance();
    return client.get(key);
  }

  public static async del(key: string): Promise<number> {
    const client = await this.getInstance();
    return client.del(key);
  }
}

export default RedisClient;