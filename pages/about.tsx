import React from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';

import { Button } from '~/components/Form';
import routes from '~/shared/routes';
import { mq, colors } from '~/shared/styles';

const Container = styled.div({
  width: '60%',
  margin: '150px auto',
  h1: {
    fontSize: 72,
  },
  h2: {
    marginTop: 60,
  },
  h3: {
    marginBottom: 0,
  },
  p: {
    marginTop: 10,
    lineHeight: 1.5,
    color: colors.secondaryText,
  },
  [mq[1]]: {
    width: '85%',
    margin: '75px auto',
  },
});

const ButtonContainer = styled.div({
  display: 'flex',
  marginTop: 60,
  justifyContent: 'center',
  button: {
    width: 200,
  },
});

const About = () => {
  return (
    <Container>
      <h1>Spotify Mixer</h1>
      <h2>What is Spotify Mixer?</h2>
      <p>
        You love music. Your friends love music. But sometimes your music tastes don't
        align and it becomes battle for the aux. Or maybe your tastes do align and you 
        just want to discover more of what you love together. Whatever the case may be,
        Spotify Mixer can help. It takes you and your friends' music preferences and creates 
        unique playlists based on where your tastes overlap.
      </p>

      <h2>How do you use it?</h2>
      <h3>Step 1 &ndash; Create a session</h3>
      <p>
        Enter your name in the create session form and click "Create"
      </p>
      <h3>Step 2 &ndash; Invite your friends</h3>
      <p>
        After logging into Spotify, you will be redirected to a page where you will see a 
        session code displayed underneath the session name. Click on it to copy it to your 
        clipboard and send it to your friends! Have them navigate to
        <u style={{ whiteSpace: 'nowrap' }}>spotify&ndash;mixer.now.sh</u>, 
        enter their name and the code in the join session form, and click "Join".
      </p>
      <h3>Step 3 &ndash; Generate a playlist</h3>
      <p>
        Once everyone has joined, click the "Generate" button to create a playlist
      </p>
      <h3>Step 4 &ndash; Play it, save it, tweak it</h3>
      <p>
        From here, you can listen to the playlist directly from Spotify Mixer if you have 
        a Spotify Premium account. For a more fully-featured experience, save the playlist 
        to Spotify and continue to add, remove, reorder, and remix until it's perfect.
      </p>
      <p>
        If you don't have a Premium account, fear not. You can still save the playlist 
        to your Spotify library and listen to and modify it there.
      </p>

      <h2>How does it work?</h2>
      <p>
        For each person in the session, Spotify Mixer will pull the top 50 artists of that 
        member based on their listening habits from the last 6 months or so. It then creates 
        an aggregated list of artists keyed to the number of member who share that artist in 
        their top 50. When a playlist is generated, Spotify Mixer pulls 5 seed artist from the 
        aggregated list - preferring artists that have more overlap between the session members 
        - and uses them to build a playlist.
      </p>
      <p>
        For more information on how Spotify Mixer works, how it was built, or how to contribute 
        view the docs on&nbsp;
        <a
          href={ routes.github }
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: colors.primaryText }}
        >
          Github
        </a>.
      </p>

      <ButtonContainer>
        <Link href={ routes.home }>
          <Button primary>Get Started</Button>
        </Link>
      </ButtonContainer>
    </Container>
  );
};

export default About;
