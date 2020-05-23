import { NextApiRequest, NextApiResponse } from 'next';
import { spotifyFetch } from '~/services/spotify';

import { SPOTIFY_END_POINTS } from '~/shared/endpoints';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === 'PUT') {
    const { body } = req;
    const { deviceId, tracks } = JSON.parse(body);
    
    const playEndpoint = SPOTIFY_END_POINTS.play(deviceId);
    await spotifyFetch(req, res, playEndpoint, {
      method: 'PUT',
      body: JSON.stringify({
        uris: tracks,
      }),
    });

    res.end();
  }
};

export default handler;
