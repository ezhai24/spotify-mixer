import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';
import cookie from 'cookie';
import moment from 'moment';
import querystring from 'querystring';

import { SPOTIFY_END_POINTS } from '~/shared/endpoints';

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

export const spotifyFetch = async (
  req: NextApiRequest,
  res: NextApiResponse,
  url: string,
  options: RequestInit = {},
) => {
  const { cookies } = req;
  const { accessToken, refreshToken, expiresAt } = cookies;

  if (moment().isAfter(moment(expiresAt))) {
    const tokenEndpoint = SPOTIFY_END_POINTS.getToken();
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64')),
        'Content-type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const { access_token, expires_in } = await response.json();
    const expires_at = moment().add(expires_in, 's').toISOString();

    res.setHeader('Set-Cookie', [
      cookie.serialize('accessToken', access_token, { httpOnly: true }),
      cookie.serialize('expiresAt', expires_at, { httpOnly: true }),
    ]);

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': 'Bearer ' + access_token,
      },
    });
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': 'Bearer ' + accessToken,
    },
  });
};
