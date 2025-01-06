import {
  Expression,
  IsCondition,
  IsBinaryOperation,
  PrimitiveType,
  conditions,
  IsUnaryOperation,
} from 'types';
import { ExpressionDropzone } from '../dropzone';
import { ExpressionParent } from './types';
import { VariableExpression } from './Variable';
import { BinaryExpression } from './Operation';
import { SubscriptExpression } from './Subscript';
import { LiteralExpression } from './Literal';
import { ReactElement } from 'react';
import { ConditionExpression } from './Condition';
import { ListExpression } from './List';
import { UnaryOperationExpression } from './Unary';

export type GenericExpressionOptions = {
  variable: boolean;
  operation: boolean;
  conditions: boolean;
  subscript: boolean;
  list: boolean;
  literals: PrimitiveType[] | false;
};

const DEFAULT_OPTIONS: GenericExpressionOptions = {
  variable: true,
  operation: true,
  conditions: true,
  subscript: true,
  list: true,
  literals: ['string', 'number', 'boolean'],
};

export function GenericExpression({
  parent,
  expression,
  placeholder,
  options,
  preview = false,
}: {
  parent: ExpressionParent;
  expression: Expression | null;
  placeholder?: string;
  options?: Partial<GenericExpressionOptions>;
  preview?: boolean;
}): ReactElement | null {
  const { variable, operation, subscript, list, literals } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  if (!expression)
    return (
      <ExpressionDropzone
        parentId={parent.id}
        locale={parent.locale}
        dropPredicate={parent.dropPredicate}
        enabled={!preview}
      />
    );

  if (expression.type === 'variable' && variable)
    return (
      <VariableExpression
        parent={parent}
        variable={expression}
        preview={preview}
      />
    );

  if (expression.type === 'list' && list)
    return (
      <ListExpression
        parent={parent}
        expression={expression}
        preview={preview}
      />
    );

  if (IsBinaryOperation(expression) && operation)
    return (
      <BinaryExpression parent={parent} block={expression} preview={preview} />
    );

  if (IsUnaryOperation(expression) && operation)
    return (
      <UnaryOperationExpression
        parent={parent}
        expression={expression}
        preview={preview}
      />
    );

  if (IsCondition(expression) && conditions)
    return (
      <ConditionExpression
        parent={parent}
        condition={expression}
        preview={preview}
      />
    );

  if (expression.type === 'subscript' && subscript)
    return (
      <SubscriptExpression
        parent={parent}
        expression={expression}
        preview={preview}
      />
    );

  if (expression.type === 'literal' && literals)
    return (
      <LiteralExpression
        parent={parent}
        placeholder={placeholder}
        expression={expression}
        types={literals}
        preview={preview}
      />
    );

  throw new Error(
    `Failed to render generic expression; Unknown type: \`${expression.type}\``,
  );
}
