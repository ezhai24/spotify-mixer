import { NextApiRequest, NextApiResponse } from 'next';
import { SPOTIFY_END_POINTS, END_POINTS } from '~/shared/endpoints';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === 'POST') {
    const { body } = req;
    const { sessionId, displayName } = JSON.parse(body);

    // Get current user's top tracks from Spotify
    const getTopArtistsEndpoint = SPOTIFY_END_POINTS.getTopArtists();
    const response = await fetch(getTopArtistsEndpoint, {
      headers: {
        'Authorization': 'Bearer ' + req.cookies.accessToken,
      },
    });
    const topArtists = await response.json();

    // Save top tracks to Firebase
    const artists = topArtists.items.map(artist => artist.id);
    const addArtistCountsEndpoint = END_POINTS.addArtistCounts();
    fetch(addArtistCountsEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        user: displayName,
        artists,
      }),
    });

    res.end();
  }
};

export default handler;
