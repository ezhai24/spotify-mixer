import React, { useState, useEffect } from 'react';
import randomstring from 'randomstring';
import Cookies from 'js-cookie';
import styled from '@emotion/styled';

import { InputLabel, Input, PrimaryButton } from '~/components/Form';
import { SPOTIFY_END_POINTS, SPOTIFY_STATE_KEY } from '~/shared/endpoints';
import { SessionUser } from '~/shared/types';
import { mq, colors } from '~/shared/styles';

enum FormType {
  NONE,
  CREATE,
  JOIN,
}

const PageContainer = styled.div({
  margin: '150px 0',
  [mq[1]]: {
    margin: '50px 0',
  },
});

const Wave = styled.div(({ submittedForm }: { submittedForm: FormType }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  backgroundImage: 'url("waveLeft.png")',
  backgroundSize: submittedForm === FormType.NONE ? '55% 100%' : (
    submittedForm === FormType.CREATE
      ? '115% 100%'
      : '0% 100%'
  ),
  backgroundRepeat: 'no-repeat',
  transition: submittedForm !== FormType.NONE && 'background-size 1s',
  [mq[1]]: {
    backgroundImage: 'url("waveTop.png")',
    backgroundSize: submittedForm === FormType.NONE ? '100% 320px' : (
      submittedForm === FormType.CREATE
        ? '100% 115%'
        : '100% 0%'
    ),
  },
}));

const Heading = styled.div({
  position: 'relative',
  display: 'flex',
  justifyContent: 'space-evenly',
  margin: '20px 20%',
  h1: {
    width: 250,
    margin: 0,
    fontSize: 72,
    ':first-child': {
      textAlign: 'right',
    }
  },
  [mq[0]]: {
    margin: '20px 10%',
  },
  [mq[1]]: {
    flexDirection: 'column',
    width: 270,
    margin: '50px auto',
    textAlign: 'center',
  },
});

const FormsContainer = styled.div({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  margin: '0 20%',
  [mq[0]]: {
    margin: '0 10%',
  },
  [mq[1]]: {
    flexDirection: 'column',
    width: 270,
    margin: '0 auto',
  },
});

const Form = styled.form(({ hideForm }: { hideForm: boolean }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: 250,
  margin: 10,
  [mq[1]]: {
    display: hideForm && 'none',
  },
}));

const Footer = styled.div({
  display: 'none',
  marginTop: 20,
  p: {
    margin: 3,
    textAlign: 'center',
    ':last-child': {
      color: colors.primary,
      textDecoration: 'underline',
      ':hover': {
        cursor: 'pointer',
      }
    },
  },
  [mq[1]]: {
    display: 'block',
  },
});

const Home = () => {
  const [createFormValues, setCreateFormValues] = useState<SessionUser>({});
  const [joinFormValues, setJoinFormValues] = useState<SessionUser>({});
  const [hiddenForm, setHiddenForm] = useState(FormType.JOIN);
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

  const toggleHiddenForm = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    setHiddenForm(hidden => (
      hidden === FormType.CREATE
        ? FormType.JOIN
        : FormType.CREATE
    ));
  };

  return (
    <PageContainer>
      <Wave
        submittedForm={ submittedForm }
        onTransitionEnd={ submittedForm !== FormType.NONE ? (
          submittedForm === FormType.CREATE
            ? authorizePrimaryUser
            : authorizeSecondaryUser
        ) : null }
      />
      
      <Heading>
        <h1>Spotify</h1>
        <h1>Mixer</h1>
      </Heading>
      <FormsContainer>
        <Form autoComplete="off" hideForm={ hiddenForm === FormType.CREATE }>
          <InputLabel>YOUR NAME</InputLabel>
          <Input
            type="text"
            name="displayName"
            value={ createFormValues.displayName || '' }
            onChange={ handleCreateChange }
          />
          <PrimaryButton onClick={ submitCreateForm }>CREATE</PrimaryButton>
        </Form>

        <Form autoComplete="off" hideForm={ hiddenForm === FormType.JOIN }>
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
        
        <Footer>
          <p>
            {
              hiddenForm === FormType.CREATE
                ? 'Want to start your own session?'
                : 'Looking for an existing session?'
            }
          </p>
          <p onClick={ toggleHiddenForm }>
            { hiddenForm === FormType.CREATE ? 'Create' : 'Join' } one now
          </p>
        </Footer>
      </FormsContainer>
    </PageContainer>
  );
};

export default Home;
