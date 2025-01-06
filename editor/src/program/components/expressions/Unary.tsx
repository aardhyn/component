import { ReactElement } from 'react';
import { Drag } from 'util/Drag';
import { ExpressionParent } from './types';
import {
  IsLiteral,
  IsVariable,
  IsSubscript,
  IsBinaryOperation,
  UnaryOperation,
  Increment,
  Decrement,
  Component,
} from 'types';
import { ExpressionDropzone } from 'program/components/dropzone';
import { GenericExpression } from './Expression';
import { BlockRoot } from '../generic';

export function UnaryOperationBlock({
  block,
  preview = false,
}: {
  block: Extract<UnaryOperation, Increment | Decrement>;
  preview?: boolean;
}): ReactElement | null {
  const dropPredicate = (c: Component) => IsVariable(c);

  const props = {
    id: block.id,
    locale: 'expression',
    dropPredicate,
  };

  return (
    <BlockRoot
      block={block}
      preview={preview}
      css={styles}
      color="$cyan"
      colorTonal="$cyanTonal"
      onColor="$onCyan"
    >
      <span>{block.type}</span>
      <GenericExpression
        expression={block.expression}
        parent={props}
        preview={preview}
        options={{ literals: false, subscript: false, operation: false }}
      />
    </BlockRoot>
  );
}

export function UnaryOperationExpression({
  expression,
  parent,
  preview = false,
}: {
  expression: Exclude<UnaryOperation, Increment | Decrement>;
  parent?: ExpressionParent;
  preview?: boolean;
}) {
  const { DragHandle } = Drag.useComponentDragHandle(expression, preview);

  const dropPredicate = (c: Component) =>
    IsVariable(c) || IsSubscript(c) || IsLiteral(c) || IsBinaryOperation(c);

  return (
    <ExpressionDropzone
      parentId={parent?.id}
      locale={parent?.locale}
      dropPredicate={parent?.dropPredicate}
      enabled={!preview}
      color="$cyan"
      colorTonal="$cyanTonal"
      onColor="$onCyan"
    >
      <DragHandle css={styles}>
        <span>{expression.type}</span>
        <GenericExpression
          parent={{
            id: expression.id,
            dropPredicate,
            locale: 'expression',
          }}
          expression={expression.expression}
          preview={preview}
        />
      </DragHandle>
    </ExpressionDropzone>
  );
}

const styles = {
  d: 'flex',
  flexDirection: 'row',
  items: 'center',
  gap: 8,
};
