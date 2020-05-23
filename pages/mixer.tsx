import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import Cookies from 'js-cookie';
import querystring from 'querystring';

import { Loading, ErrorPage, MixerControls, JoinConfirmation } from '~/components';

import { END_POINTS, FIREBASE_END_POINTS } from '~/shared/endpoints';
import { SessionUser } from '~/shared/types';
import { colors } from '~/shared/styles';

const LoadingContainer = styled.div(({
  isPrimaryUser,
}: { isPrimaryUser: boolean }) => ({
  height: '100%',
  width: '100%',
  paddingTop: 200,
  backgroundColor: isPrimaryUser ? colors.background : colors.backgroundLight,
}));

const Mixer = () => {
  const [currentUser, setCurrentUser] = useState<SessionUser>({});
  const [authError, setAuthError] = useState<string>();

  const parseUser = () => {
    const user = querystring.parse(window.location.search.slice(1));
    const parsedUser = {
      ...user,
      isPrimaryUser: user.isPrimaryUser === 'true',
    };
    window.history.replaceState({}, document.title, '/mixer');
    return Object.keys(parsedUser).length > 0 ? parsedUser : null;
  };

  const createOrJoinSession = async (user: SessionUser): Promise<SessionUser> => {
    const { isPrimaryUser, displayName } = user;

    if (isPrimaryUser) {
      const createSessionEndpoint = END_POINTS.createSession();
      const response = await fetch(createSessionEndpoint, {
        method: 'POST',
        body: JSON.stringify({
          user: displayName,
        }),
      });
      const { sessionId } = await response.json();

      // We only set this so that it can be accessed to clean up
      // the current session on page unload
      Cookies.set('session', sessionId);

      return { ...user, sessionId };
    } else {
      const { sessionId } = user;
      const joinSessionEndpoint = END_POINTS.joinSession(sessionId);
      const response = await fetch(joinSessionEndpoint, {
        method: 'POST',
        body: JSON.stringify({
          user: displayName,
        }),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
    }

    return user;
  };

  const getUserTop = async (user: SessionUser) => {
    const topEndpoint = END_POINTS.saveTop()
    await fetch(topEndpoint, {
      method: 'POST',
      body: JSON.stringify(user),
    });
  };

  const addCleanupListeners = (user: SessionUser) => {
    // Alert user that changes will not be saved before unload
    const beforeUnloadHandler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnloadHandler);

    // Clean up session in Firestore on unload
    const onUnloadHandler = () => {
      const { isPrimaryUser, displayName, sessionId } = user;
      if (isPrimaryUser) {
        navigator.sendBeacon(
          FIREBASE_END_POINTS.endSession(),
          JSON.stringify({
            sessionId: Cookies.get('session'),
          }),
        );
      } else {
        navigator.sendBeacon(
          FIREBASE_END_POINTS.leaveSession(),
          JSON.stringify({ sessionId, displayName }),
        );
      }
    };
    window.addEventListener('unload', onUnloadHandler);

    return { beforeUnloadHandler, onUnloadHandler }; 
  }

  useEffect(() => {
    let listeners;

    const makeRequest = async () => {
      let user: SessionUser = parseUser();
      setCurrentUser(user);
      if (user) {
        try {
          user = await createOrJoinSession(user);
          getUserTop(user);
          listeners = addCleanupListeners(user);
          setCurrentUser(currentUser => ({ ...currentUser, ...user }));
        } catch (error) {
          setAuthError(error.message);
        }
      } else {
        setAuthError('Something went wrong. Please try again');
      }
    }
    makeRequest();

    return function cleanup() {
      if (listeners) {
        const { beforeUnloadHandler, onUnloadHandler } = listeners;
        window.removeEventListener('beforeunload', beforeUnloadHandler);
        window.removeEventListener('unload', onUnloadHandler);
      }
    }
  }, []);

  if (authError) {
    return <ErrorPage error={ authError } />;
  }

  if (!currentUser.sessionId) {
    return (
      <LoadingContainer isPrimaryUser={ currentUser.isPrimaryUser }>
        <Loading size='lg' />
      </LoadingContainer>
    );
  }

  return (
    <>
      { currentUser.isPrimaryUser ?
        <MixerControls currentUser={ currentUser } />
        :
        <JoinConfirmation  currentUser={ currentUser } />
      }
    </>
  );
};

export default Mixer;
