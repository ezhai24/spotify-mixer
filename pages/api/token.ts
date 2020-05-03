import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';
import querystring from 'querystring';

import { SPOTIFY_END_POINTS, REDIRECT_URI } from '~/shared/endpoints';

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === 'POST') {
    const { body } = req;
    const { code } = JSON.parse(body);
      
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
    const spotifyAuth = await response.json();
    res.send(spotifyAuth);
  }
};

export default handler;
