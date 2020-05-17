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

export const Button = styled.button(({
  primary,
}: { primary?: boolean }) => ({
  marginTop: 20,
  border: primary ? 'none' : `2px solid ${colors.primary}`,
  borderRadius: 20,
  backgroundColor: primary ? colors.primary : 'transparent',
  padding: 8,
  color: colors.primaryText,
  fontSize: 16,
  fontWeight: primary ? 600 : 'normal',
  ':hover': {
    cursor: 'pointer',
    transform: 'scale(1.02)',
  }
}));
