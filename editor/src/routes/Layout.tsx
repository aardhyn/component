import { styled } from 'theme/stitches.config';
import Ribbon from './header/Ribbon';
import Title from './header/Title';
import LeftSidebar from './left';
import Main from './main/Main';
import RightSidebar from './right';
import { Drag } from 'util/Drag';

export default function Layout() {
  Drag.useUnhandledDropzone(); // unhandled drops are rejected

  return (
    <Root>
      <Title css={{ gridArea: 'header' }} />
      <Ribbon css={{ gridArea: 'ribbon' }} />
      <LeftSidebar css={{ gridArea: 'left' }} />
      <Main css={{ gridArea: 'main' }} />
      <RightSidebar css={{ gridArea: 'right' }} />
    </Root>
  );
}

const Root = styled('div', {
  maxH: '100vh',
  maxW: '100vw',
  minH: '100vh',
  minW: '100vw',

  background: '$background',
  c: '$text',

  d: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  gridTemplateRows: 'auto 1fr auto',
  gridTemplateAreas: `
    "header ribbon ribbon"
    "left main right"
    "left main right"
    `,
});
