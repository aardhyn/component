import { ReactElement } from 'react';
import { Drag } from 'util/Drag';
import { ExpressionParent } from './types';
import {
  IsLiteral,
  IsList,
  IsNumericVariable,
  IsSubscript,
  IsVariable,
  IsOperation,
  Component,
  Subscript,
} from 'types';
import { ExpressionDropzone } from 'program/components/dropzone';
import { GenericExpression } from './Expression';

export function SubscriptExpression({
  expression,
  parent,
  preview = false,
}: {
  expression: Subscript;
  parent?: ExpressionParent;
  preview?: boolean;
}): ReactElement | null {
  const { DragHandle } = Drag.useComponentDragHandle(expression, preview);

  const listPredicate = (c: Component) =>
    IsVariable(c) || IsList(c) || IsSubscript(c);
  const indexPredicate = (c: Component) =>
    IsNumericVariable(c) ||
    IsLiteral<number>(c) ||
    IsSubscript(c) ||
    IsOperation(c);

  return (
    <ExpressionDropzone
      parentId={parent?.id}
      locale={parent?.locale}
      dropPredicate={parent?.dropPredicate}
      color="$violet"
      colorTonal="$violetTonal"
      onColor="$onViolet"
      enabled={!preview}
    >
      <DragHandle css={styles}>
        <GenericExpression
          parent={{
            id: expression.id,
            dropPredicate: listPredicate,
            locale: 'list',
          }}
          expression={expression.list}
          preview={preview}
        />
        <span>at</span>
        <GenericExpression
          expression={expression.index}
          parent={{
            id: expression.id,
            locale: 'index',
            dropPredicate: indexPredicate,
          }}
          options={{ literals: ['number'] }}
        />
      </DragHandle>
    </ExpressionDropzone>
  );
}

const styles = {
  d: 'flex',
  items: 'center',
  gap: 8,
};
