import NextDocument, { Html, Head, Main, NextScript } from 'next/document';
import { Global } from '@emotion/core';
import { colors } from 'shared/styles';

class Document extends NextDocument {
  render() {
    return (
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap"
            rel="stylesheet"
          />
          <Global
            styles={{
              'html, body, #__next': {
                height: '100%',
                margin: 0,
                overflowX: 'hidden',
                backgroundColor: colors.backgroundLight,
                color: colors.primaryText,
                fontFamily: 'IBM Plex Sans',
              },
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          <script src="https://sdk.scdn.co/spotify-player.js"></script>
        </body>
      </Html>
    )
  }
}

export default Document;