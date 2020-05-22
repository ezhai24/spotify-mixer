import React, { useEffect } from 'react';
import Head from 'next/head';
import PlaybackProvider from '~/services/playback';

const App = ({ Component, pageProps }) => {
  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      window.Spotify = Spotify;
    };
  });

  return (
    <>
      <Head>
        <title>Spotify Mixer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PlaybackProvider>
        <Component { ...pageProps } />
      </PlaybackProvider>
    </>
  );
};

export default App;