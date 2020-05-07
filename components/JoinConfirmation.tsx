import React, { useState, useEffect } from 'react';
import { SessionUser } from '~/shared/types';

import { firestore } from '~/services/firebase';

interface Props {
  currentUser: SessionUser;
}

const JoinConfirmation = (props: Props) => {
  const { currentUser } = props;
  const { sessionId } = currentUser;

  const [sessionIsRunning, setSessionIsRunning] = useState(true);

  useEffect(() => {
    firestore.collection('sessions').doc(sessionId).onSnapshot(snapshot => {
      if (!snapshot.data()) {
        setSessionIsRunning(false);
      }
    });
  });

  return (
    <>
      { sessionIsRunning ?
        <p>You've joined a session!</p>
        :
        <p>Session has been ended by creator :(</p>
      }
    </>
  );
};

export default JoinConfirmation;
