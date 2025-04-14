import { ReactElement, useEffect, useState } from 'react';
import { useMutateComponent, useVariableStore, VariableStore } from 'program';
import {
  Component,
  Definition,
  DefinitionRValue,
  Literal,
  PrimitiveType,
  IsBinaryOperation,
  IsLiteral,
  IsVariable,
  IsCondition,
  IsPrimitive,
  IsSubscript,
  IsList,
  IsUnaryOperation,
} from 'types';
import { BlockRoot } from '../generic';
import Field from 'components/ui/Field';
import Badge from 'components/ui/Badge';
import { GenericExpression } from '../expressions/Expression';

export function DefinitionBlock({
  block,
  preview,
}: {
  block: Definition;
  preview?: boolean;
}): ReactElement | null {
  useVariableDefinition(block, !preview);

  const mutate = useMutateComponent();

  const [name, setName] = useState<string>(block.name);

  const handleNameChange = () => mutate(block.id, { name });

  const primitive = useComputedPrimitive(block.expression, !preview);
  const handlePrimitiveChange = () => mutate(block.id, { primitive });
  useEffect(() => {
    if (preview || primitive === block.primitive) return;
    handlePrimitiveChange();
  }, [primitive, block.primitive]);

  const parent = {
    id: block.id,
    locale: 'expression',
    dropPredicate: (e: Component) =>
      IsLiteral(e) ||
      IsBinaryOperation(e) ||
      IsVariable(e) ||
      IsSubscript(e) ||
      IsCondition(e) ||
      IsList(e),
  };

  return (
    <BlockRoot
      block={block}
      preview={preview}
      color="$violet"
      colorTonal="$violetTonal"
      onColor="$onViolet"
      css={{ fd: 'row', items: 'center' }}
    >
      <Let />
      <Field
        value={name}
        onValueChange={(value) => setName(value.replace(/\s/g, '-'))}
        onBlur={handleNameChange}
        dynamicSize
      />
      <Colon />
      <PrimitiveBadge primitive={primitive} />
      <Equals />
      <GenericExpression
        expression={block.expression}
        parent={parent}
        preview={preview}
      />
    </BlockRoot>
  );
}

const Let = () => <span>{'let'}</span>;
const Equals = () => <span>{'='}</span>;
const Colon = () => <span>{':'}</span>;

export type DefinitionPrimitive = PrimitiveType | 'list' | null;

const UNKNOWN_PRIMITIVE = 'unknown';
function PrimitiveBadge({ primitive }: { primitive: DefinitionPrimitive }) {
  return (
    <Badge color="component" size="small">
      {primitive ?? UNKNOWN_PRIMITIVE}
    </Badge>
  );
}

function computePrimitive(
  value: DefinitionRValue | null,
  variables: VariableStore,
) {
  if (value === null) return null;
  if (value.type === 'list') return 'list';
  if (IsLiteral(value)) return computeLiteralPrimitive(value);
  if (IsBinaryOperation(value) || IsUnaryOperation(value)) return 'number';
  if (IsCondition(value)) return 'boolean';
  if (IsVariable(value)) return variables[value.id].primitive;

  throw new Error(
    `Invalid expression type: \`${value}\`! Failed to compute primitive for variable definition`,
  );
}
function useComputedPrimitive(
  rvalue: DefinitionRValue | null,
  enabled: boolean = true,
) {
  const [primitive, setPrimitive] = useState<DefinitionPrimitive>(null);
  const { variables } = useVariableStore();

  useEffect(() => {
    if (!enabled) return;
    const newPrimitive = computePrimitive(rvalue, variables);
    setPrimitive(newPrimitive);
  }, [rvalue]);

  return primitive;
}

function computeLiteralPrimitive(literal: Literal) {
  const type = literal.expression
    ? typeof literal.expression
    : UNKNOWN_PRIMITIVE;
  if (IsPrimitive(type)) return type as PrimitiveType;
  throw new Error(
    `Unknown primitive type: ${type}! Failed to compute primitive for literal expression`,
  );
}

function useVariableDefinition(block: Definition, enabled: boolean = true) {
  const { declare } = useVariableStore();

  useEffect(() => {
    if (enabled) declare(block.id, block); // declare the variable
    return () => declare(block.id, undefined); // un-declare the variable on unmount
  }, [block.id, block.name, block.primitive, enabled]);
}
