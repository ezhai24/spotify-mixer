import { NextApiRequest, NextApiResponse } from 'next';
import { SPOTIFY_END_POINTS, END_POINTS } from '~/shared/endpoints';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === 'POST') {
    const { body } = req;
    const { sessionId, displayName } = JSON.parse(body);

    // Get current user's top tracks from Spotify
    const getTopTracksEndpoint = SPOTIFY_END_POINTS.getTopTracks();
    const response = await fetch(getTopTracksEndpoint, {
      headers: {
        'Authorization': 'Bearer ' + req.cookies.accessToken,
      },
    });
    const topTracks = await response.json();

    // Save top tracks to Firebase
    const tracks = topTracks.items.map(track => track.id);
    const addTrackCountsEndpoint = END_POINTS.addTrackCounts();
    fetch(addTrackCountsEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        user: displayName,
        tracks,
      }),
    });

    res.end();
  }
};

export default handler;
