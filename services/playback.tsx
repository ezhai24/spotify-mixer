import React, { createContext, useContext, useState } from 'react';
import { END_POINTS } from '~/shared/endpoints';

interface PlaybackMap {
  instance?: Spotify.SpotifyPlayer;
  currentTrack?: {
    uri: string;
    paused: boolean;
  };
}

type PlaybackContextType = [
  PlaybackMap,
  React.Dispatch<React.SetStateAction<PlaybackMap>>,
];
const PlaybackContext = createContext<PlaybackContextType>([undefined, () => {}]);

export const usePlaybackService = (): {
  player: PlaybackMap;
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
    spotifyPlayer.addListener('player_state_changed', state => {
      setPlayer(currentPlayer => ({
        ...currentPlayer,
        currentTrack: {
          uri: state.track_window.current_track.uri,
          paused: state.paused,
        },
      }));
    });

    setPlayer({ instance: spotifyPlayer });
  };

  return { player, setupPlayer };
};

interface Props {
  children: React.ReactChild;
}

const PlaybackProvider = ({ children }: Props) => {
  const contextStateHooks = useState<PlaybackMap>({});

  return (
    <PlaybackContext.Provider value={ contextStateHooks }>
      { children }
    </PlaybackContext.Provider>
  );
};

export default PlaybackProvider;
