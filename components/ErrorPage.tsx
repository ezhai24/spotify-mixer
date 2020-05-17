import React from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';

import { Button } from '~/components/Form';
import routes from '~/shared/routes';
import { mq } from '~/shared/styles';

interface Props {
  error: string;
}

const PageContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: '150px 20px',
  textAlign: 'center',
});

const ErrorPage = (props: Props) => {
  const { error } = props;

  return (
    <PageContainer>
      <h1 style={{ margin: 0 }}>Uh oh!</h1>
      <p>{ error }</p>
      <Link href={ routes.home }>
        <Button primary style={{ width: 200, fontWeight: 'normal' }}>
          Go back
        </Button>
      </Link>
    </PageContainer>
  );
};

export default ErrorPage;
