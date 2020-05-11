import React, { useState, useEffect } from 'react';
import { SessionUser } from '~/shared/types';

import { firestore } from '~/services/firebase';
import { END_POINTS } from '~/shared/endpoints';

interface Props {
  currentUser: SessionUser;
}

const MixerControls = (props: Props) => {
  const { currentUser } = props;
  const { sessionId } = currentUser;

  const [sessionUsers, setSessionUsers] = useState([]);
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    firestore.collection('sessions').doc(sessionId).onSnapshot(snapshot => {
      const users = snapshot.get('users');
      if (users && users.length !== sessionUsers.length) {
        setSessionUsers(users);
      };
    });
  }, []);

  const generatePlaylist = async () => {
    const generatePlaylistEndpoint = END_POINTS.generatePlaylist(sessionId);
    const response = await fetch(generatePlaylistEndpoint);
    const tracks = await response.json();
    setPlaylist(tracks);
  };
  
  return (
    <>
      <p>You've created a session!</p>
      <p>Session ID: { sessionId }</p>
      <p>Current Members</p>
      <ul>
        { sessionUsers.map(user => <li key={ user }>{ user }</li>) }
      </ul>
      <p>Playlist</p>
      <ul>
        { playlist.map(song => {
          const { id, name, artists, albumName, duration } = song;
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
      <button onClick={ generatePlaylist }>Generate playlist</button>
    </>
  );
};

export default MixerControls;
