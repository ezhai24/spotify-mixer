import React, { useState, useEffect } from 'react';
import { SessionUser, Playlist } from '~/shared/types';

import { firestore } from '~/services/firebase';
import { END_POINTS } from '~/shared/endpoints';

interface Props {
  currentUser: SessionUser;
}

const MixerControls = (props: Props) => {
  const { currentUser } = props;
  const { sessionId } = currentUser;

  const [sessionUsers, setSessionUsers] = useState([]);
  const [playlist, setPlaylist] = useState<Playlist>({ tracks: [] });

  useEffect(() => {
    firestore.collection('sessions').doc(sessionId).onSnapshot(snapshot => {
      const { users, userCount } = snapshot.data();
      if (users && users.length !== sessionUsers.length && users.length === userCount) {
        setSessionUsers(users);
      };
    });
  }, []);

  const generatePlaylist = async () => {
    const generatePlaylistEndpoint = END_POINTS.generatePlaylist(sessionId);
    const response = await fetch(generatePlaylistEndpoint);
    const tracks = await response.json();
    setPlaylist(playlist => ({ ...playlist, tracks }));
  };

  const handlePlaylistChange = (e) => {
    const key = e.target.name;
    const value = e.target.value;
    setPlaylist(playlist => ({
      ...playlist,
      [key]: value,
    }));
  };

  const savePlaylist = async (e) => {
    e.preventDefault();
    const savePlaylistEndpoint = END_POINTS.savePlaylist();
    const response = await fetch(savePlaylistEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        name: playlist.name,
        trackUris: playlist.tracks.map(track => `spotify:track:${track.id}`),
      }),
    });
    const playlistData = await response.json();
    setPlaylist(playlist => ({
      ...playlist,
      url: playlistData.playlistUrl,
    }));
  }
  
  return (
    <>
      <p>You've created a session!</p>
      <p>Session ID: { sessionId }</p>
      
      <p>Current Members</p>
      <ul>
        { sessionUsers.map(user => <li key={ user }>{ user }</li>) }
      </ul>

      <p>Playlist</p>
      <button
        disabled={ sessionUsers.length < 1 }
        onClick={ generatePlaylist }
      >
        Generate playlist
      </button>
      <form>
        <input
          type="text"
          name="name"
          value={ playlist.name || '' }
          onChange={ handlePlaylistChange }
        />
        <button onClick={ savePlaylist }>Save to Spotify</button>
      </form>
      { playlist.url &&
        <a href={ playlist.url } target="_blank" rel="noopener noreferrer">
          View on Spotify
        </a>
      }
      <ul>
        { playlist.tracks.map(track => {
          const { id, name, artists, albumName, duration } = track;
          return (
            <div key={ id }>
              <li>{ name }</li>
              <ul style={ { paddingLeft: 20 } }>
                <li>Artists: { artists.toString() }</li>
                <li>Album: { albumName }</li>
                <li>Duration: { duration }</li>
              </ul>
            </div>
          );
        }) }
      </ul>
    </>
  );
};

export default MixerControls;
