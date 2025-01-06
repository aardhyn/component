import { ReactElement, useState } from 'react';
import { useMutateComponent } from 'program';
import { Literal, Primitive, PrimitiveType } from 'types';
import { ExpressionParent } from './types';
import { GetBoolFromString } from 'util/string';
import Field from 'components/ui/Field';
import { ExpressionDropzone } from 'program/components/dropzone';

export function LiteralExpression({
  expression,
  parent,
  preview = false,
  placeholder,
  types = ['number', 'string', 'boolean'],
}: {
  expression: Literal;
  parent: ExpressionParent;
  preview?: boolean;
  placeholder?: string;
  types?: PrimitiveType[];
}): ReactElement | null {
  const [error, setError] = useState(false);

  // local state for editing
  const [value, setValue] = useState(expression.expression);
  const handleChange = (value: Primitive) => setValue(value);

  // apply mutation to the ast
  const mutate = useMutateComponent();
  const handleApplyMutation = () => {
    if (!error && value !== expression.expression)
      mutate(expression.id, { expression: value });
  };

  return (
    <ExpressionDropzone
      parentId={parent.id}
      locale={parent.locale}
      dropPredicate={parent.dropPredicate}
      enabled={!preview}
      css={{ p: 0, b: 'none', pos: 'relative' }}
    >
      <PrimitiveInput
        error={error}
        placeholder={placeholder}
        setError={setError}
        primitives={types}
        value={value}
        onChange={handleChange}
        onBlur={handleApplyMutation}
        disabled={preview}
      />
    </ExpressionDropzone>
  );
}

const DEFAULT_INCREMENT = 1;
const SHIFT_INCREMENT = 10;

function formatNumberPrimitive(value: string) {
  const rawString = value.replace(/[^0-9.-]/g, '');
  const number = Number(rawString);
  if (isNaN(number)) return 0;
  return number;
}

function reinterpretPrimitive(value: string): [PrimitiveType, Primitive] {
  if (value.trim() === '') return ['string', value]; // empty string is a string
  const number = Number(value);
  if (!isNaN(number)) return ['number', number];
  const bool = GetBoolFromString(value, { noExcept: true });
  if (bool !== null && bool !== undefined) return ['boolean', bool];
  return ['string', value];
}

export function PrimitiveInput({
  value,
  onChange,
  placeholder,
  onPrimitiveChange,
  onBlur,
  error,
  setError,
  primitives,
  disabled,
}: {
  value: Primitive | null;
  onChange: (value: Primitive) => void;
  placeholder?: string;
  onBlur: () => void;
  onPrimitiveChange?: (type: PrimitiveType) => void;
  error?: boolean;
  setError?: (error: boolean) => void;
  primitives: PrimitiveType[];
  disabled?: boolean;
}) {
  const [primitive, setPrimitive] = useState<PrimitiveType | null>(null);

  return (
    <Field
      value={typeof value === 'string' ? value : value?.toString() ?? ''}
      disabled={disabled}
      placeholder={placeholder}
      onValueChange={(value) => {
        const [primitive, typedValue] = reinterpretPrimitive(value);
        setPrimitive(primitive);
        onPrimitiveChange?.(primitive);
        onChange(typedValue);

        if (!primitives.includes(primitive)) setError?.(true);
        else setError?.(false);
      }}
      onKeyDown={(key, { blur, shift, value }) => {
        if (key === 'Enter') blur();

        if (primitive === 'number') {
          // raise or lower number by some increment
          const number = formatNumberPrimitive(value);
          const increment = shift ? SHIFT_INCREMENT : DEFAULT_INCREMENT;
          if (key === 'ArrowUp') onChange(number + increment);
          if (key === 'ArrowDown') onChange(number - increment);
        }
      }}
      dynamicSize
      onBlur={onBlur}
      css={{
        c: error ? '$onError' : '$componentOnColor',
        '&::placeholder': {
          c: '$componentOnColor',
          opacity: 0.8,
        },
      }}
    />
  );
}
