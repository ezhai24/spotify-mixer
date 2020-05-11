import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '~/services/firebase';
import { SPOTIFY_END_POINTS, FIREBASE_END_POINTS } from '~/shared/endpoints';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method === 'GET') {
    const { query } = req;
    const { sessionId } = query;

    // Get top counts from Firestore and convert to seeds
    const aggregate = await firestore
      .collection('sessions').doc(sessionId as string)
      .collection('topCounts').doc('aggregate')
      .get()
    const { artistCounts, userCount } = aggregate.data() || {};
    const seedArtists = [];
    Object.keys(artistCounts).some((artist: string) => {
      if (artistCounts[artist] === userCount) {
        seedArtists.push(artist)
      }
      return seedArtists.length === 5;
    });

    // Use seeds to get recommendations from Spotify
    const getRecommendationsEndpoint = SPOTIFY_END_POINTS.getRecommendations({ seedArtists });
    const response = await fetch(getRecommendationsEndpoint, {
      headers: {
        'Authorization': 'Bearer ' + req.cookies.accessToken,
      },
    });
    const recommendations = await response.json();
    const playlist = recommendations.tracks.map(track => ({
      id: track.id,
      name: track.name,
      duration: track.duration_ms,
      albumName: track.album.name,
      artists: track.artists.map(artist => artist.name),
    }));

    // Save playlist to Firestore
    const createPlaylistEndpoint = FIREBASE_END_POINTS.createPlaylist();
    fetch(createPlaylistEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        playlist,
      }),
    });

    res.send(playlist);
  }

  if (method === 'POST') {
    const { body } = req;
    const { name: playlistName, trackUris } = JSON.parse(body);

    // Get the current user's Spotify ID
    const userDataEndpoint = SPOTIFY_END_POINTS.getUserData();
    const userDataResponse = await fetch(userDataEndpoint, {
      headers: {
        'Authorization': 'Bearer ' + req.cookies.accessToken,
      },
    });
    const { id: userId } = await userDataResponse.json();

    // Create an empty playlist
    const createPlaylistEndpoint = SPOTIFY_END_POINTS.createPlaylist(userId);
    const playlistResponse = await fetch(createPlaylistEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + req.cookies.accessToken,
      },
      body: JSON.stringify({
        name: playlistName,
      }),
    });
    const { id: playlistId, external_urls } = await playlistResponse.json();

    // Add tracks to playlist
    const addToPlaylistEndpoint = SPOTIFY_END_POINTS.addToPlaylist(playlistId);
    await fetch(addToPlaylistEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + req.cookies.accessToken,
      },
      body: JSON.stringify({
        uris: trackUris,
      }),
    });

    res.send({ playlistUrl: external_urls.spotify });
  }
};

export default handler;
