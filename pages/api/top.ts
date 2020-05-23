import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

import { spotifyFetch } from '~/services/spotify';
import { SPOTIFY_END_POINTS, FIREBASE_END_POINTS } from '~/shared/endpoints';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === 'POST') {
    const { body } = req;
    const { sessionId, displayName } = JSON.parse(body);

    // Get current user's top tracks from Spotify
    const getTopArtistsEndpoint = SPOTIFY_END_POINTS.getTopArtists();
    const response = await spotifyFetch(req, res, getTopArtistsEndpoint);
    const topArtists = await response.json();
    
    // Save top tracks to Firebase
    const artists = topArtists.items.map(artist => artist.id);
    console.log(artists)
    const addTopCountsEndpoint = FIREBASE_END_POINTS.addTopCounts();
    const addTopResponse = await fetch(addTopCountsEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        user: displayName,
        artists,
      }),
    });
    console.log(response)

    res.end();
  }
};

export default handler;
