import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

import { MixerControls, JoinConfirmation } from '~/components';

import { functions } from '~/services/firebase';
import { END_POINTS, SPOTIFY_STATE_KEY } from '~/shared/endpoints';
import { SessionUser } from '~/shared/types';

const Mixer = () => {
  const [currentUser, setCurrentUser] = useState<SessionUser>({});
  const [authError, setAuthError] = useState<string>();
  
  const getToken = async (code) => {
    const tokenEndpoint = END_POINTS.getToken();
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    const auth = await response.json();
    setCurrentUser(user => ({ ...user, auth }));
    
    window.history.replaceState({}, document.title, '/mixer');
  };

  const createOrJoinSession = async (user: SessionUser) => {
    const { isPrimaryUser, displayName } = user;

    if (isPrimaryUser) {
      const createSession = functions.httpsCallable('createSession');
      const { data: { sessionId } } = await createSession({ displayName });
      setCurrentUser(user => ({ ...user, sessionId }));

      // We only set this so that it can be accessed to clean up
      // the current session on page unload
      Cookies.set('session', sessionId);
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
  };

  useEffect(() => {
    const storedState = Cookies.get(SPOTIFY_STATE_KEY);

    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');
    const code = urlParams.get('code');

    if (state === storedState && code) {
      getToken(code);

      const sessionUser = JSON.parse(state.slice(16));
      setCurrentUser(user => ({ ...user, ...sessionUser }));
      createOrJoinSession(sessionUser);

      // Alert user that changes will not be saved before unload
      window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = '';
      });

      // Clean up session in Firestore on unload
      window.addEventListener('unload', () => {
        const { isPrimaryUser, displayName, sessionId } = sessionUser;
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
    } else {
      setAuthError('Something went wrong. Please try again later.');
    }
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
