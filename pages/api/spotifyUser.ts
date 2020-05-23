import { NextApiRequest, NextApiResponse } from 'next';

import { spotifyFetch } from '~/services/spotify';
import { SPOTIFY_END_POINTS } from '~/shared/endpoints';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === 'GET') {
    const getTopArtistsEndpoint = SPOTIFY_END_POINTS.getUserData();
    const response = await spotifyFetch(req, res, getTopArtistsEndpoint);
    const { id, product } = await response.json();
    res.send({
      spotifyUserId: id,
      spotifySubscriptionLevel: product,
    });
  }
};

export default handler;
