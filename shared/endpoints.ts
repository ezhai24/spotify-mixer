import querystring from 'querystring';
import { RecommendationOptions } from '~/shared/types';

const baseUrl = process.env.HOST;
const clientId = process.env.SPOTIFY_CLIENT_ID;

export const END_POINTS = {
  getToken: () => '/api/token',
  saveTop: () => '/api/top',
  generatePlaylist: (sessionId: string) => `/api/playlist?sessionId=${sessionId}`,
};

export const FIREBASE_END_POINTS = {
  addArtistCounts: () => 'https://us-central1-spotify-mixer-26da4.cloudfunctions.net/addArtistCounts',
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
  getTopArtists: () => 'https://api.spotify.com/v1/me/top/artists?limit=50',
  getRecommendations: ({ seedArtists }: RecommendationOptions) => 'https://api.spotify.com/v1/recommendations?' +
    querystring.stringify({
      seed_artists: seedArtists,
      limit: 100,
    }),
};
