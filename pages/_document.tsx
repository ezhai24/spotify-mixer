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
              'html, body': {
                overflowX: 'hidden',
                fontFamily: 'IBM Plex Sans',
                backgroundColor: colors.backgroundLight,
                color: colors.primaryText,
              },
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default Document;