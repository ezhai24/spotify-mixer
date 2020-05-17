import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';

import { PrimaryButton } from '~/components/Form';
import { firestore } from '~/services/firebase';
import { SessionUser } from '~/shared/types';

interface Props {
  currentUser: SessionUser;
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
        <PrimaryButton style={{ width: 200, fontWeight: 'normal' }}>
          Leave
        </PrimaryButton>
      }
    </PageContainer>
  );
};

export default JoinConfirmation;
