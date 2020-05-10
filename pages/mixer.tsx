import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import querystring from 'querystring';

import { MixerControls, JoinConfirmation } from '~/components';

import { functions } from '~/services/firebase';
import { END_POINTS } from '~/shared/endpoints';
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
      const createSession = functions.httpsCallable('createSession');
      const { data: { sessionId } } = await createSession({ displayName });

      // We only set this so that it can be accessed to clean up
      // the current session on page unload
      Cookies.set('session', sessionId);

      return { ...user, sessionId };
    } else {
      const joinSession = functions.httpsCallable('joinSession');
      try {
        await joinSession({
          displayName,
          sessionId: user.sessionId,
        });
      } catch {
        setAuthError('A user with this name already exists. Please try again.');
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
          END_POINTS.endSession(),
          JSON.stringify({
            sessionId: Cookies.get('session'),
          }),
        );
      } else {
        navigator.sendBeacon(
          END_POINTS.leaveSession(),
          JSON.stringify({ sessionId, displayName }),
        );
      }
    });
  }

  useEffect(() => {
    const makeRequest = async () => {
      let user: SessionUser = parseUser();
      if (user) {
        user = await createOrJoinSession(user);
        getUserTop(user);
        addCleanupListeners(user);

        setCurrentUser(currentUser => ({ ...currentUser, ...user }));
      } else {
        setAuthError('Something went wrong. Please try again')
      }
    }
    makeRequest();
  }, []);

  if (authError) {
    return authError;
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
