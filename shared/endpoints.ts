import querystring from 'querystring';

const baseUrl = process.env.HOST;
const clientId = process.env.SPOTIFY_CLIENT_ID;

interface RecommendationOptions {
  seedArtists: string[];
}

export const END_POINTS = {
  getToken: () => '/api/token',
  dangerouslyGetToken: () => '/api/dangerousToken',
  createSession: () => '/api/sessions',
  joinSession: (sessionId: string) => `/api/sessions/${sessionId}`,
  leaveSession: (sessionId: string, displayName: string) => `/api/sessions/${sessionId}/users/${displayName}`,
  saveTop: () => '/api/top',
  generatePlaylist: (sessionId: string) => `/api/playlist?sessionId=${sessionId}`,
  savePlaylist: () => '/api/playlist',
  play: () => '/api/playback/play',
};

export const FIREBASE_END_POINTS = {
  addTopCounts: () => 'https://us-central1-spotify-mixer-26da4.cloudfunctions.net/addTopCounts',
  createSession: () => 'https://us-central1-spotify-mixer-26da4.cloudfunctions.net/createSession',
  joinSession: () => 'https://us-central1-spotify-mixer-26da4.cloudfunctions.net/joinSession',
  leaveSession: () => 'https://us-central1-spotify-mixer-26da4.cloudfunctions.net/leaveSession',
  endSession: () => 'https://us-central1-spotify-mixer-26da4.cloudfunctions.net/endSession',
  createPlaylist: () => 'https://us-central1-spotify-mixer-26da4.cloudfunctions.net/createPlaylist',
};

export const REDIRECT_URI = baseUrl + END_POINTS.getToken();
export const SPOTIFY_STATE_KEY = 'spotify_auth_state';

export const SPOTIFY_END_POINTS = {
  authorizeSpotifyScope: (scope: string, state: string) => 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      scope,
      state,
    }),
  getToken: () => 'https://accounts.spotify.com/api/token',
  getUserData: () => 'https://api.spotify.com/v1/me',
  getTopArtists: () => 'https://api.spotify.com/v1/me/top/artists?limit=50',
  getRecommendations: ({ seedArtists }: RecommendationOptions) => 'https://api.spotify.com/v1/recommendations?' +
    querystring.stringify({
      seed_artists: seedArtists,
    }),
  createPlaylist: (userId: string) => `https://api.spotify.com/v1/users/${userId}/playlists`,
  addToPlaylist: (playlistId: string) => `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
  play: (deviceId: string) => `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
};
