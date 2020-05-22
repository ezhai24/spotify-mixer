import React, { createContext, useContext, useState } from 'react';
import { END_POINTS } from '~/shared/endpoints';

type PlaybackContextType = [
  Spotify.SpotifyPlayer | undefined,
  React.Dispatch<React.SetStateAction<Spotify.SpotifyPlayer>>,
];
const PlaybackContext = createContext<PlaybackContextType>([undefined, () => {}]);

export const usePlaybackService = (): {
  player: Spotify.SpotifyPlayer;
  setupPlayer: () => void;
} => {
  const [player, setPlayer] = useContext(PlaybackContext);

  const setupPlayer = () => {
    const spotifyPlayer = new Spotify.Player({
      name: 'Spotify Mixer',
      getOAuthToken: async (callback) => {
        const dangerousTokenEndpoint = END_POINTS.dangerouslyGetToken();
        const response = await fetch(dangerousTokenEndpoint);
        const { accessToken } = await response.json();
        callback(accessToken);
      },
    });
    spotifyPlayer.connect();
    setPlayer(spotifyPlayer);
  };

  return { player, setupPlayer };
};

interface Props {
  children: React.ReactChild;
}

const PlaybackProvider = ({ children }: Props) => {
  const contextStateHooks = useState<Spotify.SpotifyPlayer>();

  return (
    <PlaybackContext.Provider value={ contextStateHooks }>
      { children }
    </PlaybackContext.Provider>
  );
};

export default PlaybackProvider;
