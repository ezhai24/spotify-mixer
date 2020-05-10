import querystring from 'querystring';

const baseUrl = process.env.HOST;
const clientId = process.env.SPOTIFY_CLIENT_ID;

export const END_POINTS = {
  getToken: () => '/api/token',
  leaveSession: () => 'https://us-central1-spotify-mixer-26da4.cloudfunctions.net/leaveSession',
  endSession: () => 'https://us-central1-spotify-mixer-26da4.cloudfunctions.net/endSession',
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
};
