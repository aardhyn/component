import { Component, IsLiteral, IsNumericVariable, type Repeat } from 'types';
import { BlockRoot } from '../generic';
import GenericBlockSet from './BlockSet';
import { s, styled } from 'theme/stitches.config';
import { GenericExpression } from '../expressions/Expression';

export const MIN_REPEAT_WIDTH = 48;

export const MIN_REPEAT_TIMES = 0;
export const MAX_REPEAT_TIMES = 2048;

export function RepeatBlock({
  block,
  preview = false,
}: {
  block: Repeat;
  preview?: boolean;
}) {
  const dropPredicate = (c: Component) =>
    IsNumericVariable(c) || IsLiteral<number>(c);

  const parent = {
    id: block.id,
    locale: 'repetition',
    dropPredicate,
  };

  return (
    <BlockRoot
      block={block}
      preview={preview}
      color="$purple"
      colorTonal="$purpleTonal"
      onColor="$onPurple"
      overrideStyles
    >
      <RepeatSection>
        <Repeat />
        <GenericExpression
          parent={parent}
          expression={block.repetition}
          preview={preview}
          options={{ literals: ['number'] }}
        />
      </RepeatSection>
      {!preview && (
        <GenericBlockSet
          blocks={block.components ?? []}
          locale="components"
          parentId={block.id}
        />
      )}
    </BlockRoot>
  );
}
const Repeat = () => <s.span>repeat </s.span>;

const RepeatSection = styled('div', {
  d: 'inline-flex',
  items: 'center',
  gap: 8,
  p: '4px 8px',
  r: 4,
  fontFamily: '$mono',
  fontSize: '$1',

  c: '$componentOnColor',
  bg: '$componentBackground',
  outline: '2px solid $componentTonal',
});
