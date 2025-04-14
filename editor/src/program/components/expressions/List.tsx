import { ReactElement } from 'react';
import { Drag } from 'util/Drag';
import { ExpressionDropzone } from 'program/components/dropzone';
import { GenericExpression } from './Expression';
import { IconButton } from 'components/ui/Button';
import { MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import { useMutateComponent } from 'program/store';
import { uuid } from 'util/uuid';
import { produce } from 'immer';
import { ExpressionParent } from './types';
import { List, Literal, IsExpression } from 'types';

export function ListExpression({
  expression,
  parent,
  preview = false,
}: {
  expression: List;
  parent?: ExpressionParent;
  preview?: boolean;
}): ReactElement | null {
  const { DragHandle } = Drag.useComponentDragHandle(expression, preview);

  const mutate = useMutateComponent();
  const handleNewItem = () => {
    mutate(
      expression.id,
      produce(expression, (draft) => {
        const item: Literal = { id: uuid(), type: 'literal', expression: '' };
        draft.expression.push(item);

        // list has been provided initial elements, remove reservation
        if (draft.expression.length) {
          draft.fill = null;
          draft.reserve = null;
        }
      }),
    );
  };
  const handleRemoveItem = () => {
    mutate(
      expression.id,
      produce(expression, (draft) => {
        draft.expression.pop();

        // if the list is empty, we'll default reserve zero empty literals for the list
        if (!draft.expression.length) {
          draft.fill = { id: uuid(), type: 'literal', expression: '' };
          draft.reserve = { id: uuid(), type: 'literal', expression: 0 };
        }
      }),
    );
  };

  return (
    <ExpressionDropzone
      parentId={parent?.id}
      locale={parent?.locale}
      dropPredicate={parent?.dropPredicate}
      onDrop={handleNewItem}
      color="$yellow"
      colorTonal="$yellowTonal"
      onColor="$onYellow"
      enabled={!preview}
    >
      <DragHandle css={styles}>
        {!preview && (
          <>
            <IconButton color="component" onClick={handleNewItem}>
              <PlusIcon />
            </IconButton>
            <IconButton
              color="component"
              onClick={handleRemoveItem}
              disabled={!expression.expression.length}
            >
              <MinusIcon />
            </IconButton>
          </>
        )}
        {!expression.expression.length ? (
          // Initialize a list of some size with some value
          <ListSize expression={expression} preview={preview} />
        ) : (
          // provide an initial list of elements
          <ListElements expression={expression} preview={preview} />
        )}
      </DragHandle>
    </ExpressionDropzone>
  );
}

function ListElements({
  expression,
  preview = false,
}: {
  expression: List;
  preview?: boolean;
}) {
  return (
    <>
      <span> list </span>
      {expression.expression.map((item, index) => {
        const parent = {
          id: expression.id,
          dropPredicate: IsExpression,
          locale: index.toString(),
        };

        return (
          <GenericExpression
            key={index}
            parent={parent}
            expression={item}
            preview={preview}
          />
        );
      })}
    </>
  );
}

function ListSize({
  expression,
  preview = false,
}: {
  expression: List;
  preview?: boolean;
}) {
  return (
    <>
      <span>list sized </span>
      <GenericExpression
        expression={expression.reserve}
        preview={preview}
        parent={{
          id: expression.id,
          dropPredicate: IsExpression,
          locale: 'reserve',
        }}
      />
      <span> of </span>
      <GenericExpression
        expression={expression.fill}
        preview={preview}
        parent={{
          id: expression.id,
          dropPredicate: IsExpression,
          locale: 'fill',
        }}
      />
    </>
  );
}

const styles = {
  d: 'flex',
  items: 'center',
  gap: 8,
};
