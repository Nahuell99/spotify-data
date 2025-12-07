import { kv } from '@vercel/kv';

interface CachedTrackData {
  duration_ms: number;
  name: string;
  cached_at: number;
}

/**
 * Obtiene la duración de un track desde la base de datos persistente
 */
export async function getCachedDuration(
  trackId: string
): Promise<CachedTrackData | null> {
  try {
    const key = `track:${trackId}`;
    const cached = await kv.get<CachedTrackData>(key);
    return cached;
  } catch (error) {
    console.error('Error leyendo base de datos:', error);
    return null;
  }
}

/**
 * Guarda la duración de un track en la base de datos persistente
 * Los datos se guardan permanentemente hasta que se borren manualmente
 */
export async function setCachedDuration(
  trackId: string,
  data: { duration_ms: number; name: string }
): Promise<void> {
  try {
    const key = `track:${trackId}`;
    const cacheData: CachedTrackData = {
      ...data,
      cached_at: Date.now(),
    };
    // Sin TTL: los datos se guardan permanentemente
    await kv.set(key, cacheData);
  } catch (error) {
    console.error('Error guardando en base de datos:', error);
    // No lanzamos error para no interrumpir el flujo si la base de datos falla
  }
}

