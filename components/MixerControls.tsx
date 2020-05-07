import React, { useState, useEffect } from 'react';
import { SessionUser } from '~/shared/types';

import { firestore } from '~/services/firebase';

interface Props {
  currentUser: SessionUser;
}

const MixerControls = (props: Props) => {
  const { currentUser } = props;
  const { sessionId } = currentUser;

  const [sessionUsers, setSessionUsers] = useState([]);

  useEffect(() => {
    firestore.collection('sessions').doc(sessionId).onSnapshot(snapshot => {
      const users = snapshot.get('users');
      if (users.length !== sessionUsers.length) {
        setSessionUsers(users);
      };
    });
  }, []);

  return (
    <>
      <p>You've created a session!</p>
      <p>Session ID: { sessionId }</p>
      <p>Current Members</p>
      <ul>
        { sessionUsers.map(user => <li key={ user }>{ user }</li>) }
      </ul>
    </>
  );
};

export default MixerControls;
