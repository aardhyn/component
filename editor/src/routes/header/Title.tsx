import { CSS, styled } from 'theme/stitches.config';
import { H3 } from 'theme/Typography';
import Badge from 'components/ui/Badge';

export default function Header({ css }: { css: CSS }) {
  return (
    <Root css={css}>
      <H3>Component</H3>
      <Badge>beta</Badge>
    </Root>
  );
}

const Root = styled('section', {
  p: 8,
  d: 'flex',
  items: 'center',
  gap: 8,
  bb: '1px solid $outline',
});
