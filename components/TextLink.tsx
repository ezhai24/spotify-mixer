import React, { CSSProperties } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';

import { colors } from '~/shared/styles';

const InternalLink = styled.span({
  color: colors.primaryText,
  textDecoration: 'underline',
  ':hover': {
    cursor: 'pointer',
  },
});

interface Props {
  external?: boolean;
  href: string;
  children: string;
  style?: CSSProperties;
}

const TextLink = (props: Props) => {
  const { external, href, children, style } = props;

  return external ?
    <a
      href={ href }
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: colors.primaryText, ...style }}
    >
      { children }
    </a>
  :
    <Link href={ href }>
      <InternalLink style={ style }>{ children }</InternalLink>
    </Link>
  ;
};

export default TextLink;
