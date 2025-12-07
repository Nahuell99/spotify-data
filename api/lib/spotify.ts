interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrackResponse {
  id: string;
  name: string;
  duration_ms: number;
  artists: Array<{ name: string }>;
  album: {
    name: string;
  };
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Obtiene un token de acceso de Spotify usando Client Credentials Flow
 */
export async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET deben estar configurados');
  }

  // Reutilizar token si aún es válido (con margen de 60 segundos)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error obteniendo token de Spotify: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as SpotifyTokenResponse;

  // Cachear el token con su tiempo de expiración
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // -60 segundos de margen
  };

  return data.access_token;
}

/**
 * Obtiene la duración de un track desde la API de Spotify
 * Llama a GET /v1/tracks/{id}
 */
export async function getTrackDuration(trackId: string): Promise<{
  duration_ms: number;
  name: string;
}> {
  const token = await getAccessToken();

  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Track no encontrado: ${trackId}`);
    }
    const errorText = await response.text();
    throw new Error(`Error consultando track en Spotify: ${response.status} - ${errorText}`);
  }

  const track = (await response.json()) as SpotifyTrackResponse;

  return {
    duration_ms: track.duration_ms,
    name: track.name,
  };
}

