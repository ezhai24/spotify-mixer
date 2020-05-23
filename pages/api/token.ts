import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';
import cookie from 'cookie';
import moment from 'moment';
import querystring from 'querystring';

import {
  SPOTIFY_END_POINTS,
  REDIRECT_URI,
  SPOTIFY_STATE_KEY,
} from '~/shared/endpoints';
import routes from '~/shared/routes';

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === 'GET') {
    const { query, cookies } = req;
    
    const { code, state } = query;
    const storedState = cookies[SPOTIFY_STATE_KEY];
    if (!code || state !== storedState) {
      const redirectUrl = process.env.HOST + routes.home;
      res.writeHead(302, { Location: redirectUrl });
      res.end();
    }

    const tokenEndpoint = SPOTIFY_END_POINTS.getToken();
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64')),
        'Content-type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify({
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
        code,
      }),
    });

    const { access_token, refresh_token, expires_in } = await response.json();
    const expires_at = moment((new Date()).toISOString()).add(expires_in, 's');

    res.setHeader('Set-Cookie', [
      cookie.serialize('accessToken', access_token, { httpOnly: true }),
      cookie.serialize('refreshToken', refresh_token, { httpOnly: true }),
      cookie.serialize('expiresAt', expires_at, { httpOnly: true }),
    ]);

    const userParams = JSON.parse((state as string).slice(16));
    const redirectUrl = process.env.HOST + routes.mixer + '?' + querystring.stringify(userParams);
    res.writeHead(302, { Location: redirectUrl });
    res.end();
  }
};

export default handler;
