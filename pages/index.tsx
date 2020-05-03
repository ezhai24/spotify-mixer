import React from 'react';
import { END_POINTS } from '~/shared/endpoints';

const Home = () => {
  const authorizePrimaryUser = () => {
    const scope = 'user-top-read playlist-modify-public';
    const redirectUrl = END_POINTS.authorizeSpotifyScope(scope);
    window.location.href = redirectUrl;
  };

  const authorizeSecondaryUser = () => {
    const scope = 'user-top-read';
    const redirectUrl = END_POINTS.authorizeSpotifyScope(scope);
    window.location.href = redirectUrl;
  };

  return (
    <>
      <button onClick={ authorizePrimaryUser }>Create Session</button>
      <button onClick={ authorizeSecondaryUser }>Join Session</button>
    </>
  );
};

export default Home;
