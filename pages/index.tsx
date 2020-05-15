import React, { useState } from 'react';
import randomstring from 'randomstring';
import Cookies from 'js-cookie';
import styled from '@emotion/styled';

import { InputLabel, Input, PrimaryButton } from '~/components/Form';
import { SPOTIFY_END_POINTS, SPOTIFY_STATE_KEY } from '~/shared/endpoints';
import { SessionUser } from '~/shared/types';

enum FormType {
  NONE,
  CREATE,
  JOIN,
}

const Wave = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  backgroundImage: 'url("wave.png")',
  backgroundSize: '55% 100%',
  backgroundRepeat: 'no-repeat',
  transition: 'background-size 1s',
});

const FormsContainer = styled.div({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  margin: '0 20%',
});

const Form = styled.form({
  display: 'flex',
  flexDirection: 'column',
  width: 250,
  margin: 10,
});

const Home = () => {
  const [createFormValues, setCreateFormValues] = useState<SessionUser>({});
  const [joinFormValues, setJoinFormValues] = useState<SessionUser>({});
  const [submittedForm, setSubmittedForm] = useState(FormType.NONE);

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

  const submitCreateForm = (e) => {
    e.preventDefault();
    setSubmittedForm(FormType.CREATE);
  };

  const submitJoinForm = (e) => {
    e.preventDefault();
    setSubmittedForm(FormType.JOIN);
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
  
  const authorizePrimaryUser = () => authorizeUser({
    ...createFormValues,
    isPrimaryUser: true,
  });

  const authorizeSecondaryUser = (e) => authorizeUser({
    ...joinFormValues,
    isPrimaryUser: false,
  });

  return (
    <div style={{ marginTop: 100 }}>
      <Wave
        style={{
          backgroundSize: submittedForm !== FormType.NONE && (
            submittedForm === FormType.CREATE ? '115% 100%' : '0% 100%'
          ),
        }}
        onTransitionEnd={
          submittedForm === FormType.CREATE
            ? authorizePrimaryUser
            : authorizeSecondaryUser
        }
      />
      
      <FormsContainer>
        <Form autoComplete="off" style={{ textAlign: 'right' }}>
          <h1 style={{ fontSize: 72 }}>Spotify</h1>
          <InputLabel>YOUR NAME</InputLabel>
          <Input
            type="text"
            name="displayName"
            value={ createFormValues.displayName || '' }
            onChange={ handleCreateChange }
          />
          <PrimaryButton onClick={ submitCreateForm }>CREATE</PrimaryButton>
        </Form>

        <Form autoComplete="off">
          <h1 style={{ fontSize: 72 }}>Mixer</h1>
          <InputLabel>YOUR NAME</InputLabel>
          <Input
            type="text"
            name="displayName"
            value={ joinFormValues.displayName || '' }
            onChange={ handleJoinChange }
          />
          <InputLabel>SESSION CODE</InputLabel>
          <Input
            type="text"
            name="sessionId"
            value={ joinFormValues.sessionId || '' }
            onChange={ handleJoinChange }
          />
          <PrimaryButton onClick={ submitJoinForm }>JOIN</PrimaryButton>
        </Form>
      </FormsContainer>
    </div>
  );
};

export default Home;
