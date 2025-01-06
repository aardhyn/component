import { styled } from 'theme/stitches.config';
import GenericBlockSet from './BlockSet';
import { BlockRoot } from '../generic';
import { GenericExpression } from '../expressions/Expression';
import {
  type While,
  Component,
  IsCondition,
  IsLiteral,
  IsSubscript,
  IsVariable,
} from 'types';

export function WhileBlock({
  block,
  preview = false,
}: {
  block: While;
  preview?: boolean;
}) {
  const dropPredicate = (c: Component) =>
    IsCondition(c) || IsLiteral(c) || IsSubscript(c) || IsVariable(c);

  const parent = {
    id: block.id,
    locale: 'condition',
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
      <ConditionSection>
        <While />
        <GenericExpression
          parent={parent}
          placeholder="condition"
          expression={block.condition}
          preview={preview}
          options={{ literals: ['boolean'] }}
        />
      </ConditionSection>
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

const While = () => <span>while </span>;

const ConditionSection = styled('div', {
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
