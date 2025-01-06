import { s, styled } from 'theme/stitches.config';
import { IconButton } from 'components/ui/Button';
import Field from 'components/ui/Field';
import { useState, CSSProperties } from 'react';
import { useScreen } from 'program';
import useCoreModule from 'hooks/useCoreModule';
import Checkbox from 'components/ui/Checkbox';
import { ResetIcon } from '@radix-ui/react-icons';

export const SCREEN_RATIO = 16 / 9;
const canvasStyles: CSSProperties = {
  width: '100%',
  aspectRatio: SCREEN_RATIO,
  backgroundColor: 'var(--colors-dark)', // stitches $text
  borderRadius: 8,
  position: 'relative',
};

export default function GameScreen() {
  return (
    <Root>
      <canvas id="canvas" style={canvasStyles} tabIndex={-1} />
      <Options>
        <Resolution />
        <Functions />
      </Options>
    </Root>
  );
}
const Root = styled(s.div, {
  d: 'flex',
  fd: 'column',
  gap: 16,
  p: 4,
});
const Options = styled(s.div, {
  d: 'flex',
  gap: 16,
  items: 'center',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
});

function Resolution() {
  const [screenSize, setScreenSize] = useScreen();
  const [width, setWidth] = useState(screenSize?.width);
  const [height, setHeight] = useState(screenSize?.height);
  const [aspectRatio, setAspectRatio] = useState(SCREEN_RATIO); // todo: checkbox|chain for aspect ratio
  const [preserveAspectRatio, setPreserveAspectRatio] = useState(true); // todo: checkbox|chain for aspect ratio
  const handleResize = () => setScreenSize(width, height);

  const handleWidthChange = (value: string) => {
    const width = parseInt(value);
    setWidth(width);
    if (preserveAspectRatio) setHeight(Math.round(width / aspectRatio));
  };

  const handleHeightChange = (value: string) => {
    const height = parseInt(value);
    setHeight(height);
    if (preserveAspectRatio) setWidth(Math.round(height * aspectRatio));
  };

  return (
    <ResolutionRoot onSubmit={handleResize}>
      <Group>
        <Field
          dynamicSize
          type="number"
          value={width.toString()}
          css={{ h: 24 }}
          onValueChange={handleWidthChange}
          onBlur={handleResize}
        />
        <X />
        <Field
          dynamicSize
          css={{ h: 24 }}
          type="number"
          value={height.toString()}
          onValueChange={handleHeightChange}
          onBlur={handleResize}
        />
      </Group>
      <Group>
        <Label>Aspect Ratio</Label>
        <Checkbox
          checked={preserveAspectRatio}
          onCheckedChange={(checked) => setPreserveAspectRatio(!!checked)}
        />
      </Group>
    </ResolutionRoot>
  );
}

const X = () => <s.span css={{ color: '$text' }}>×</s.span>;

const ResolutionRoot = styled(s.form, {
  d: 'flex',
  items: 'center',
  userSelect: 'none',
  gap: 16,
});
const Group = styled(s.div, {
  d: 'flex',
  gap: 8,
  items: 'center',
  '&>input': { fontFamily: '$mono', bg: '$background' },
});
const Label = styled(s.span, {
  fontSize: 12,
  color: '$text',
});

function Functions() {
  const { module } = useCoreModule();
  const clearCanvas = () => module?.ClearCanvas();

  return (
    <s.div css={{ d: 'flex', gap: 4 }}>
      <IconButton size="medium" color="neutral" onClick={clearCanvas}>
        <ResetIcon />
      </IconButton>
    </s.div>
  );
}
