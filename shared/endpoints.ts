import querystring from 'querystring';
import routes from '~/shared/routes';

const baseUrl = process.env.HOST;
const clientId = process.env.SPOTIFY_CLIENT_ID;

export const REDIRECT_URI = baseUrl + routes.mixer;

export const END_POINTS = {
  authorizeSpotifyScope: (scope: string) => 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      scope,
    }),
};
