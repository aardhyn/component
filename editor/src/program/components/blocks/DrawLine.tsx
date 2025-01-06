import { ReactElement } from 'react';
import {
  type DrawLine,
  Component,
  IsLiteral,
  IsBinaryOperation,
  IsNumericVariable,
} from 'types';
import { BlockRoot } from '../generic';
import { s } from 'theme/stitches.config';
import { GenericExpression } from '../expressions/Expression';

export default function DrawLineBlock({
  block,
  preview = false,
}: {
  block: DrawLine;
  preview?: boolean;
}): ReactElement | null {
  const dropPredicate = (c: Component) =>
    IsNumericVariable(c) || IsBinaryOperation(c) || IsLiteral(c);

  const parent = { id: block.id, dropPredicate };

  return (
    <BlockRoot
      preview={preview}
      block={block}
      css={{ items: 'center', direction: 'row', gap: 8 }}
      color="$orange"
      colorTonal="$orangeTonal"
      onColor="$onOrange"
    >
      <DrawLine />
      <GenericExpression
        parent={{ ...parent, locale: 'x1' }}
        expression={block.x1}
        preview={preview}
        placeholder="x"
        options={{ literals: ['number'] }}
      />
      <GenericExpression
        parent={{ ...parent, locale: 'y1' }}
        expression={block.y1}
        placeholder="y"
        preview={preview}
        options={{ literals: ['number'] }}
      />
      <To />
      <GenericExpression
        parent={{ ...parent, locale: 'x2' }}
        expression={block.x2}
        placeholder="x"
        preview={preview}
        options={{ literals: ['number'] }}
      />
      <GenericExpression
        parent={{ ...parent, locale: 'y2' }}
        expression={block.y2}
        placeholder="y"
        preview={preview}
        options={{ literals: ['number'] }}
      />
    </BlockRoot>
  );
}

const DrawLine = () => <s.span>draw line</s.span>;
const To = () => <s.span>to</s.span>;
