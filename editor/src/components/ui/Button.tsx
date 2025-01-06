import { VariantProps } from '@stitches/react';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { s, styled, CSS } from 'theme/stitches.config';

export function Button({
  children,
  leadingIcon,
  ...buttonProps
}: {
  css?: CSS;
  leadingIcon?: ReactNode;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof ButtonRoot>) {
  return (
    <ButtonRoot {...buttonProps}>
      {leadingIcon && leadingIcon}
      <s.span css={{ d: 'inline-flex', items: 'center' }}>{children}</s.span>
    </ButtonRoot>
  );
}

export function IconButton({
  children,
  ...buttonProps
}: {
  css?: CSS;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof IconButtonRoot>) {
  return <IconButtonRoot {...buttonProps}>{children}</IconButtonRoot>;
}

const colorVariants = {
  color: {
    primary: {
      bg: '$primary',
      c: '$onPrimary',
      '&:hover': { background: '$primary2' },
    },
    transparent: {
      bg: 'transparent',
      c: '$primary',
      '&:hover': { background: '$primary2' },
    },
    neutral: {
      bg: '$background3',
      c: '$text',
      '&:hover': { background: '$background4' },
    },
    component: {
      bg: '$componentTonal',
      c: '$componentOnColor',
      '&:hover': { bg: '$componentOnColor', c: '$componentBackground' },
    },
  },
} as const;

const ButtonRoot = styled(s.button, {
  all: 'unset',
  fontFamily: 'inherit',
  d: 'inline-flex',
  gap: 8,
  h: 24,
  color: 'inherit',
  items: 'center',
  justify: 'center',
  cursor: 'pointer',
  userSelect: 'none',
  r: 8,

  '&:disabled': { opacity: 0.5 },
  '&:readonly': { opacity: 0.5 },

  variants: {
    size: {
      small: { p: '2px 8px', fontSize: 12 },
      medium: { p: '4px 16px', fontSize: 14 },
      large: { p: '8px 32px', fontSize: 24 },
      expand: { flex: 1 },
    },
    ...colorVariants,
  },
  defaultVariants: {
    color: 'primary',
    size: 'medium',
  },
});

const IconButtonRoot = styled(s.button, {
  all: 'unset',
  d: 'inline-flex',
  items: 'center',
  justify: 'center',
  cursor: 'pointer',
  aspectRatio: 1,

  '&:hover': { background: '$background4' },
  '&:disabled': { opacity: 0.5 },
  '&:readonly': { opacity: 0.5 },

  variants: {
    size: {
      small: { h: 24, w: 24, r: 4 },
      medium: { h: 32, w: 32, r: 8 },
      expand: { flex: 1, aspectRatio: 'unset' },
    },
    ...colorVariants,
  },

  defaultVariants: {
    size: 'small',
    color: 'neutral',
  },
});
