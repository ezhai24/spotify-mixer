import { NextApiRequest, NextApiResponse } from 'next';
import { SPOTIFY_END_POINTS } from '~/shared/endpoints';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === 'GET') {
    const topTracksEndpoints = SPOTIFY_END_POINTS.getTopTracks();
    const response = await fetch(topTracksEndpoints, {
      headers: {
        'Authorization': 'Bearer ' + req.cookies.accessToken,
      },
    });
    const topTracks = await response.json();
    res.send(topTracks);
  }
};

export default handler;
