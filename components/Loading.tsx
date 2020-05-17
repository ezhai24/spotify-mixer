import React, { CSSProperties } from 'react';
import { ImpulseSpinner } from 'react-spinners-kit';
import styled from '@emotion/styled';

import { colors } from '~/shared/styles';

interface Props {
  size?: string;
  style?: CSSProperties;
}

const LoadingContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  margin: '6px 0',
});

const Loading = (props: Props) => {
  const { size, style } = props;
  return (
    <LoadingContainer style={ style }>
      <ImpulseSpinner
        size={ size === 'lg' ? 40 : 25 }
        frontColor={ colors.primaryText }
        backColor="transparent"
      />
    </LoadingContainer>
  );
};

export default Loading;
