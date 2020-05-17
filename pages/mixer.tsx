import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import querystring from 'querystring';

import { MixerControls, JoinConfirmation, ErrorPage } from '~/components';

import { END_POINTS, FIREBASE_END_POINTS } from '~/shared/endpoints';
import { SessionUser } from '~/shared/types';

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
    window.addEventListener('beforeunload', (e) => {
      e.preventDefault();
      e.returnValue = '';
    });

    // Clean up session in Firestore on unload
    window.addEventListener('unload', () => {
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
    });
  }

  useEffect(() => {
    const makeRequest = async () => {
      let user: SessionUser = parseUser();
      if (user) {
        try {
          user = await createOrJoinSession(user);
          getUserTop(user);
          addCleanupListeners(user);
          setCurrentUser(currentUser => ({ ...currentUser, ...user }));
        } catch (error) {
          setAuthError(error.message);
        }
      } else {
        setAuthError('Something went wrong. Please try again');
      }
    }
    makeRequest();
  }, []);

  if (authError) {
    return <ErrorPage error={ authError } />;
  }

  if (!currentUser.sessionId) {
    return 'Loading...';
  }

  return (
    <>
      { currentUser.isPrimaryUser ?
        <MixerControls currentUser={ currentUser } />
        :
        <JoinConfirmation currentUser={ currentUser } />
      }
    </>
  );
};

export default Mixer;
