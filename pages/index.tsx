import React from 'react';
import randomstring from 'randomstring';
import Cookies from 'js-cookie';

import { SPOTIFY_END_POINTS, SPOTIFY_STATE_KEY } from '~/shared/endpoints';

const Home = () => {
  const authorizeUser = (isPrimaryUser: boolean) => {
    const scope = isPrimaryUser
      ? 'user-top-read playlist-modify-public'
      : 'user-top-read';
    
    const stateSuffix = isPrimaryUser ? 'P' : 'S';
    const state = randomstring.generate(16) + stateSuffix;
    Cookies.set(SPOTIFY_STATE_KEY, state);

    const redirectUrl = SPOTIFY_END_POINTS.authorizeSpotifyScope(scope, state);
    window.location.href = redirectUrl;
  };
  
  const authorizePrimaryUser = () => authorizeUser(true);
  const authorizeSecondaryUser = () => authorizeUser(false);

  return (
    <>
      <button onClick={ authorizePrimaryUser }>Create Session</button>
      <button onClick={ authorizeSecondaryUser }>Join Session</button>
    </>
  );
};

export default Home;
