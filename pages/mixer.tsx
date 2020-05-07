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

  const createSession = async (user: SessionUser) => {
    const { displayName } = user;
    const createSession = functions.httpsCallable('createSession');
    const { data: { sessionId } } = await createSession({ displayName });
    setCurrentUser(user => ({ ...user, sessionId }));
  };

  useEffect(() => {
    const storedState = Cookies.get(SPOTIFY_STATE_KEY);

    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');
    const code = urlParams.get('code');

    if (state === storedState && code) {
      const sessionUser = JSON.parse(state.slice(16));
      setCurrentUser(user => ({ ...user, ...sessionUser }));

      sessionUser.isPrimaryUser && createSession(sessionUser);

      getToken(code);
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
        <MixerControls />
        :
        <JoinConfirmation />
      }
    </>
  );
};

export default Mixer;
