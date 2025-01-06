import { ReactElement } from 'react';
import { GenericExpression } from './Expression';
import { BlockRoot } from '../generic';
import {
  Append,
  Component,
  IsList,
  IsLiteral,
  IsSubscript,
  IsVariable,
} from 'types';

export function AppendBlock({
  block,
  preview = false,
}: {
  block: Append;
  preview?: boolean;
}): ReactElement | null {
  const listPredicate = (c: Component) => IsVariable(c);
  const itemPredicate = (c: Component) =>
    IsVariable(c) || IsList(c) || IsSubscript(c) || IsLiteral(c);

  return (
    <BlockRoot
      block={block}
      preview={preview}
      color="$violet"
      colorTonal="$violetTonal"
      onColor="$onViolet"
      css={{ items: 'center', direction: 'row', gap: 8 }}
    >
      <GenericExpression
        parent={{
          id: block.id,
          dropPredicate: listPredicate,
          locale: 'list',
        }}
        expression={block.list}
        preview={preview}
      />
      <span>append </span>
      <GenericExpression
        expression={block.item}
        parent={{
          id: block.id,
          locale: 'item',
          dropPredicate: itemPredicate,
        }}
      />
    </BlockRoot>
  );
}

const styles = {
  d: 'flex',
  items: 'center',
  gap: 8,
};
