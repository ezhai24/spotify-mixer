import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';

import { RemovableListeners } from '~/pages/mixer';
import { PrimaryButton } from '~/components/Form';
import { firestore } from '~/services/firebase';
import { SessionUser } from '~/shared/types';
import { END_POINTS } from '~/shared/endpoints';
import routes from '~/shared/routes';

interface Props {
  currentUser: SessionUser;
  listenersToRemove: RemovableListeners;
}

const PageContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: '150px 20px',
  textAlign: 'center',
});

const Message = styled.div({
  margin: 10,
  p: {
    margin: 0,
  },
});

const JoinConfirmation = (props: Props) => {
  const router = useRouter();

  const { currentUser, listenersToRemove } = props;
  const { sessionId, displayName } = currentUser;

  const [sessionIsRunning, setSessionIsRunning] = useState(true);

  useEffect(() => {
    firestore.collection('sessions').doc(sessionId).onSnapshot(snapshot => {
      if (!snapshot.data()) {
        setSessionIsRunning(false);
      }
    });
  });

  const leaveSession = async () => {
    const leaveSessionEndpoint = END_POINTS.leaveSession(sessionId, displayName);
    await fetch(leaveSessionEndpoint, {
      method: 'DELETE',
    });

    window.removeEventListener('beforeunload', listenersToRemove.beforeunload);
    window.removeEventListener('unload', listenersToRemove.unload);

    router.push(routes.home);
  };
  
  return (
    <PageContainer>
      <h1 style={{ margin: 0 }}>
        { sessionIsRunning ? 'Thanks for joining!' : 'Session ended' }
      </h1>
      <Message>
        { sessionIsRunning ?
          <>
            <p>You are now in the session.</p>
            <p>Please leave this window open to remain.</p>
          </>
          :
          <>
            <p>The original creator of this session has ended it.</p>
            <p>Feel free to close the browser window.</p>
          </>
        }
      </Message>
      { sessionIsRunning &&
        <PrimaryButton
          onClick={ leaveSession }
          style={{ width: 200, fontWeight: 'normal' }}
        >
          Leave
        </PrimaryButton>
      }
    </PageContainer>
  );
};

export default JoinConfirmation;
