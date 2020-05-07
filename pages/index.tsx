import React, { useState } from 'react';
import randomstring from 'randomstring';
import Cookies from 'js-cookie';

import { SPOTIFY_END_POINTS, SPOTIFY_STATE_KEY } from '~/shared/endpoints';
import { SessionUser } from '~/shared/types';

const Home = () => {
  const [createFormValues, setCreateFormValues] = useState<SessionUser>({});
  const [joinFormValues, setJoinFormValues] = useState<SessionUser>({});

  const handleCreateChange = (e) => {
    const key = e.target.name;
    const value = e.target.value;
    setCreateFormValues(formValues => ({
      ...formValues,
      [key]: value,
    }));
  };

  const handleJoinChange = (e) => {
    const key = e.target.name;
    const value = e.target.value;
    setJoinFormValues(formValues => ({
      ...formValues,
      [key]: value,
    }));
  };

  const authorizeUser = (user: SessionUser) => {
    const scope = user.isPrimaryUser
      ? 'user-top-read playlist-modify-public'
      : 'user-top-read';
    
    const stateSuffix = JSON.stringify(user);
    const state = randomstring.generate(16) + stateSuffix;
    Cookies.set(SPOTIFY_STATE_KEY, state);

    const redirectUrl = SPOTIFY_END_POINTS.authorizeSpotifyScope(scope, state);
    window.location.href = redirectUrl;
  };
  
  const authorizePrimaryUser = (e) => {
    e.preventDefault();
    authorizeUser({ isPrimaryUser: true, ...createFormValues });
  };

  const authorizeSecondaryUser = (e) => {
    e.preventDefault();
    authorizeUser({ isPrimaryUser: false, ...joinFormValues });
  };

  return (
    <>
      <form>
        <input
          type="text"
          name="displayName"
          value={ createFormValues.displayName || '' }
          onChange={ handleCreateChange }
        />
        <button onClick={ authorizePrimaryUser }>Create Session</button>
      </form>

      <form>
        <input
          type="text"
          name="displayName"
          value={ joinFormValues.displayName || '' }
          onChange={ handleJoinChange }
        />
        <input
          type="text"
          name="sessionId"
          value={ joinFormValues.sessionId || '' }
          onChange={ handleJoinChange }
        />
        <button onClick={ authorizeSecondaryUser }>Join Session</button>
      </form>
    </>
  );
};

export default Home;
