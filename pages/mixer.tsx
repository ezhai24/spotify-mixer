import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

import { END_POINTS, SPOTIFY_STATE_KEY } from '~/shared/endpoints';

const Mixer = () => {
  const [spotifyAuth, setSpotifyAuth] = useState();
  const [authError, setAuthError] = useState('');
  
  const getToken = async (code) => {
    const tokenEndpoint = END_POINTS.getToken();
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    const auth = await response.json();
    setSpotifyAuth(auth);

    window.history.replaceState({}, document.title, '/mixer');
  };

  useEffect(() => {
    const storedState = Cookies.get(SPOTIFY_STATE_KEY);

    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');
    const code = urlParams.get('code');

    if (state === storedState && code) {
      getToken(code);
    } else {
      setAuthError('Something went wrong. Please try again later.');
    }
  }, []);

  return (
    <>
      Mixer page!
    </>
  );
};

export default Mixer;
