import { ReactElement } from 'react';
import { IsExpression, type Print } from 'types';
import { BlockRoot } from '../generic';
import { s } from 'theme/stitches.config';
import { GenericExpression } from '../expressions/Expression';

export function PrintBlock({
  block,
  preview = false,
}: {
  block: Print;
  preview?: boolean;
}): ReactElement | null {
  const parent = {
    id: block.id,
    locale: 'expression',
    dropPredicate: IsExpression,
  };

  return (
    <BlockRoot
      preview={preview}
      block={block}
      css={{ items: 'center', direction: 'row', gap: 8 }}
      color="$blue"
      onColor="$onBlue"
      colorTonal="$blueTonal"
    >
      <Print />
      <GenericExpression
        parent={parent}
        placeholder="message"
        expression={block.expression}
        preview={preview}
      />
    </BlockRoot>
  );
}

const Print = () => <s.span>print</s.span>;
