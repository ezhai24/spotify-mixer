import React, { ReactNode } from 'react';
import styled from '@emotion/styled';
import { colors } from '~/shared/styles';

const ModalContainer = styled.div({
  position: 'absolute',
  top: 150,
  left: '50%',
  width: 500,
  marginLeft: -280,
  padding: '40px 30px',
  backgroundColor: colors.background,
});

const ModalOverlay = styled.div({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  backgroundColor: 'white',
  opacity: 0.3,
});

interface Props {
  children: string | ReactNode;
}

const Modal = (props: Props) => {
  const { children } = props;
  return (
    <>
      <ModalOverlay />
      <ModalContainer>
        { children }
      </ModalContainer>
    </>
  );
};

export default Modal;
