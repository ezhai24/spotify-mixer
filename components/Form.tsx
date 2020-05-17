import styled from '@emotion/styled';
import { colors } from 'shared/styles';

export const InputLabel = styled.label({
  marginTop: 15,
  color: colors.secondaryText,
  fontWeight: 'bold',
});

export const Input = styled.input({
  marginTop: 5,
  border: 'none',
  borderRadius: 3,
  padding: 6,
  fontSize: 16,
});

export const InputError = styled.p({
  margin: '5px 0 0',
  color: 'red',
  fontSize: 14,
});

export const PrimaryButton = styled.button({
  marginTop: 20,
  border: 'none',
  borderRadius: 20,
  backgroundColor: colors.primary,
  padding: 8,
  color: colors.primaryText,
  fontSize: 16,
  fontWeight: 'bold',
  ':hover': {
    cursor: 'pointer',
    transform: 'scale(1.02)',
  }
});
