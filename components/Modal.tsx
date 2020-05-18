import React, { ReactNode, MouseEventHandler } from 'react';
import styled from '@emotion/styled';
import { colors } from '~/shared/styles';

const ModalOverlay = styled.div({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  backgroundColor: 'white',
  opacity: 0.3,
  ':hover': {
    cursor: 'pointer',
  },
});

const ModalContainer = styled.div({
  position: 'absolute',
  top: 150,
  left: '50%',
  width: 500,
  marginLeft: -280,
  padding: '25px 30px 40px',
  backgroundColor: colors.background,
});

const CloseButton = styled.img({
  ':hover': {
    cursor: 'pointer',
  },
});

interface Props {
  children: string | ReactNode;
  onClose: MouseEventHandler;
}

const Modal = (props: Props) => {
  const { children, onClose } = props;
  return (
    <>
      <ModalOverlay onClick={ onClose } />
      <ModalContainer>
        <div style={{ marginBottom: 5, textAlign: 'right' }}>
          <CloseButton src="close.svg" onClick={ onClose } />
        </div>
        { children }
      </ModalContainer>
    </>
  );
};

export default Modal;
