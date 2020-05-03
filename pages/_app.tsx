import React from 'react';
import Head from 'next/head';

const App = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Spotify Mixer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component { ...pageProps } />
    </>
  );
};

export default App;