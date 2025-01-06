import { ReactElement } from 'react';
import {
  type DrawRect,
  Component,
  IsLiteral,
  IsBinaryOperation,
  IsNumericVariable,
} from 'types';
import { BlockRoot } from '../generic';
import { s } from 'theme/stitches.config';
import { GenericExpression } from '../expressions/Expression';

export default function DrawRectBlock({
  block,
  preview = false,
}: {
  block: DrawRect;
  preview?: boolean;
}): ReactElement | null {
  const predicate = (c: Component) =>
    IsNumericVariable(c) || IsBinaryOperation(c) || IsLiteral(c);

  const parent = { id: block.id, dropPredicate: predicate };

  return (
    <BlockRoot
      preview={preview}
      block={block}
      css={{ items: 'center', direction: 'row', gap: 8 }}
      color="$orange"
      colorTonal="$orangeTonal"
      onColor="$onOrange"
    >
      <DrawRect />
      <GenericExpression
        parent={{ ...parent, locale: 'x' }}
        expression={block.x}
        placeholder="x"
        preview={preview}
        options={{ literals: ['number'] }}
      />
      <GenericExpression
        parent={{ ...parent, locale: 'y' }}
        expression={block.y}
        placeholder="y"
        preview={preview}
        options={{ literals: ['number'] }}
      />
      <Of />
      <GenericExpression
        parent={{ ...parent, locale: 'w' }}
        expression={block.w}
        placeholder="width"
        preview={preview}
        options={{ literals: ['number'] }}
      />
      <GenericExpression
        parent={{ ...parent, locale: 'h' }}
        expression={block.h}
        placeholder="hight"
        preview={preview}
        options={{ literals: ['number'] }}
      />
    </BlockRoot>
  );
}

const DrawRect = () => <s.span>draw rect</s.span>;
const Of = () => <s.span>of</s.span>;
