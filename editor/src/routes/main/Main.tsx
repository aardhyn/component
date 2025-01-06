import { styled, CSS, s } from 'theme/stitches.config';
import useComponentStore from 'program/store';
import GenericBlockSet from 'program/components/blocks/BlockSet';
import { useEffect } from 'react';
import { LOCAL_STORAGE_KEY } from 'constants/program';
import { WritePersistent } from 'hooks/usePersistent';
import useCoreModule from 'hooks/useCoreModule';
import Field from 'components/ui/Field';
import Scroll from 'components/ui/Scroll';
import BottomPane from 'routes/bottom/Bottom';
import ErrorBoundary from 'exception/ErrorBoundary';
import {
  DEFAULT_CANVAS_RESOLUTION,
  DEFAULT_CANVAS_RATIO,
} from '../../constants/program';
import { Button, IconButton } from 'components/ui/Button';
import { PlayIcon, StopIcon } from '@radix-ui/react-icons';

export default function Main({ css }: { css?: CSS }) {
  const program = useComponentStore((state) => state.program);

  const { module: core } = useCoreModule();
  const handleRun = () => {
    const ast = JSON.stringify(program?.ast);
    core?.SetCanvasSize(
      program?.canvas?.width ?? DEFAULT_CANVAS_RESOLUTION,
      program?.canvas?.height ??
        DEFAULT_CANVAS_RESOLUTION /
          (DEFAULT_CANVAS_RESOLUTION / DEFAULT_CANVAS_RATIO),
    );
    core?.Run(ast);
  };
  const handleTerminate = () => core?.Terminate();

  return (
    <Root css={css}>
      <Ribbon>
        <ProgramName />
        {core && (
          <>
            <IconButton size="medium" color="neutral" onClick={handleTerminate}>
              <StopIcon />
            </IconButton>
            <Button leadingIcon={<PlayIcon />} onClick={handleRun}>
              Run
            </Button>
          </>
        )}
      </Ribbon>
      <Scroll>
        <Canvas />
      </Scroll>
      <BottomPane />
    </Root>
  );
}

const Root = styled(s.section, {
  d: 'flex',
  overflowX: 'hidden',
  fd: 'column',
});

const Ribbon = styled(s.div, {
  d: 'flex',
  gap: 8,
  h: 48,
  p: 8,
  justify: 'center',
  items: 'center',
  bb: '1px solid $outline',
});

function Canvas() {
  const [program] = useComponentStore((state) => [state.program]);
  if (!program) return null;
  useEffect(() => {
    WritePersistent(LOCAL_STORAGE_KEY, program);
  }, [program]);

  return (
    <ErrorBoundary>
      <CanvasRoot>
        <GenericBlockSet
          parentId={null}
          locale={undefined}
          blocks={program.ast ?? []}
          greedy
          noIndent
        />
      </CanvasRoot>
    </ErrorBoundary>
  );
}
const CanvasRoot = styled(s.div, {
  d: 'flex',
  fd: 'column',
  h: '100%',
  p: 16,
});

function ProgramName() {
  const [name, setName] = useComponentStore((state) => [
    state.program?.name,
    state.rename,
  ]);

  return (
    <s.div css={{ flex: 1, d: 'flex', items: 'center', overflow: 'hidden' }}>
      <Field
        variant="stealth"
        value={name ?? 'untitled program'}
        dynamicSize
        css={{
          fontWeight: 700,
          fontSize: 18,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineClamp: 1,
          whiteSpace: 'nowrap',
        }}
        onValueChange={(value) => {
          if (value !== name) {
            setName(value);
          }
        }}
      />
    </s.div>
  );
}
