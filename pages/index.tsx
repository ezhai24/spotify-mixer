import React, { useState } from 'react';
import randomstring from 'randomstring';
import Cookies from 'js-cookie';
import styled from '@emotion/styled';
import Link from 'next/link';

import { InputLabel, Input, PrimaryButton } from '~/components/Form';
import { SPOTIFY_END_POINTS, SPOTIFY_STATE_KEY } from '~/shared/endpoints';
import { SessionUser } from '~/shared/types';
import { mq, colors } from '~/shared/styles';
import routes from '~/shared/routes';

enum FormType {
  NONE,
  CREATE,
  JOIN,
}

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
    backgroundSize: submittedForm === FormType.NONE ? '100% 350px' : (
      submittedForm === FormType.CREATE
        ? '100% 115%'
        : '100% 0%'
    ),
  },
}));

const IconContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  img: {
    position: 'relative',
    height: 30,
    width: 30,
    margin: 10,
  },
  ':hover': {
    cursor: 'pointer',
  },
});

const Heading = styled.div({
  position: 'relative',
  display: 'flex',
  justifyContent: 'space-evenly',
  margin: '75px 20% 20px',
  h1: {
    width: 250,
    margin: 0,
    fontSize: 72,
    ':first-child': {
      textAlign: 'right',
    }
  },
  [mq[0]]: {
    margin: '75px 10% 20px',
  },
  [mq[1]]: {
    flexDirection: 'column',
    margin: '20px auto 50px',
    h1: {      
      width: 'auto',
      fontSize: 64,
      ':first-child, :last-child': {
        textAlign: 'center',
      }
    }
  },
});

const FormsContainer = styled.div({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  margin: '0 20% 100px',
  [mq[0]]: {
    margin: '0 10% 100px',
  },
  [mq[1]]: {
    flexDirection: 'column',
    width: 270,
    margin: '0 auto 100px',
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
    <>
      <Wave
        submittedForm={ submittedForm }
        onTransitionEnd={ submittedForm !== FormType.NONE ? (
          submittedForm === FormType.CREATE
            ? authorizePrimaryUser
            : authorizeSecondaryUser
        ) : null }
      />

      <IconContainer>
        <Link href={ routes.about }>
          <img src="infoCircle.svg" />
        </Link>
        <a
          href="https://github.com/ezhai24/spotify-mixer"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="githubIcon.svg" />
        </a>
      </IconContainer>
      
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
    </>
  );
};

export default Home;
