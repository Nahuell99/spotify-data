import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCachedDuration, setCachedDuration } from './lib/cache';
import { getTrackDuration } from './lib/spotify';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { trackId } = req.query;

  // Validar que trackId esté presente
  if (!trackId || typeof trackId !== 'string') {
    return res.status(400).json({ error: 'trackId es requerido' });
  }

  // Extraer el ID del URI si viene como "spotify:track:ID"
  const cleanTrackId = trackId.includes(':') 
    ? trackId.split(':').pop() 
    : trackId;

  if (!cleanTrackId) {
    return res.status(400).json({ error: 'trackId inválido' });
  }

  try {
    // 1. Buscar primero en el cache
    const cached = await getCachedDuration(cleanTrackId);

    if (cached) {
      return res.status(200).json({
        duration_ms: cached.duration_ms,
        name: cached.name,
        cached: true,
      });
    }

    // 2. Si no está en cache, consultar Spotify
    const trackInfo = await getTrackDuration(cleanTrackId);

    // 3. Guardar en cache para próximas consultas
    await setCachedDuration(cleanTrackId, trackInfo);

    // 4. Devolver la información
    return res.status(200).json({
      duration_ms: trackInfo.duration_ms,
      name: trackInfo.name,
      cached: false,
    });
  } catch (error) {
    console.error('Error en track-duration:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return res.status(500).json({
      error: 'Error al obtener duración del track',
      message: errorMessage,
    });
  }
}

