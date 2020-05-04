import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

import { MixerControls, JoinConfirmation } from '~/components';

import { END_POINTS, SPOTIFY_STATE_KEY } from '~/shared/endpoints';
import { User } from '~/shared/types';

const Mixer = () => {
  const [user, setUser] = useState<User>();
  const [authError, setAuthError] = useState<string>();
  
  const getToken = async (code, isPrimaryUser) => {
    const tokenEndpoint = END_POINTS.getToken();
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    const auth = await response.json();
    setUser({ ...auth, isPrimaryUser });

    window.history.replaceState({}, document.title, '/mixer');
  };

  useEffect(() => {
    const storedState = Cookies.get(SPOTIFY_STATE_KEY);

    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');
    const code = urlParams.get('code');

    if (state === storedState && code) {
      const stateSuffix = state.slice(-1);
      const isPrimaryUser = stateSuffix === 'P';
      getToken(code, isPrimaryUser);
    } else {
      setAuthError('Something went wrong. Please try again later.');
    }
  }, []);

  if (authError) {
    return authError;
  }

  if (!user) {
    return 'Loading...';
  }

  return (
    <>
      { user.isPrimaryUser ?
        <MixerControls />
        :
        <JoinConfirmation />
      }
    </>
  );
};

export default Mixer;
