import React, { useState } from 'react';
import randomstring from 'randomstring';
import Cookies from 'js-cookie';

import { SPOTIFY_END_POINTS, SPOTIFY_STATE_KEY } from '~/shared/endpoints';
import { SessionUser } from '~/shared/types';

const Home = () => {
  const [createFormValues, setCreateFormValues] = useState<SessionUser>({});

  const handleCreateChange = (e) => {
    const key = e.target.name;
    const value = e.target.value;
    setCreateFormValues(formValues => ({
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
    const { displayName } = createFormValues;
    const user = { isPrimaryUser: true, displayName };
    authorizeUser(user);
  };

  const authorizeSecondaryUser = () => {
    const user = { isPrimaryUser: false, displayName: '' };
    authorizeUser(user);
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
      
      <button onClick={ authorizeSecondaryUser }>Join Session</button>
    </>
  );
};

export default Home;
