import React, { useState, useEffect } from 'react';
import { END_POINTS } from '~/shared/endpoints';

const Mixer = () => {
  const [spotifyAuth, setSpotifyAuth] = useState();

  useEffect(() => {
    const getToken = async (code) => {
      const tokenEndpoint = END_POINTS.getToken();
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      const auth = await response.json();
      setSpotifyAuth(auth);

      window.history.replaceState({}, document.title, '/');
    };

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    code && getToken(code);
  }, []);

  return (
    <>
      Mixer page!
    </>
  );
};

export default Mixer;
