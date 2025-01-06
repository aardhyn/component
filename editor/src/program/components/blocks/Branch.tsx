import { ReactElement } from 'react';
import { Branch, IsExpression } from 'types';
import { BlockRoot } from '../generic';
import { s, styled } from 'theme/stitches.config';
import GenericBlockSet from './BlockSet';
import { GenericExpression } from '../expressions/Expression';

export function BranchBlock({
  block,
  preview = false,
}: {
  block: Branch;
  preview?: boolean;
}): ReactElement | null {
  const [trueBranch, falseBranch] = block.branches;

  const parent = {
    id: block.id,
    locale: 'condition',
    dropPredicate: IsExpression,
  };

  return (
    <BlockRoot
      block={block}
      preview={preview}
      color="$lime"
      colorTonal="$limeTonal"
      onColor="$onLime"
      overrideStyles
    >
      <ConditionSectionRoot>
        <If />
        <GenericExpression
          parent={parent}
          expression={block.condition}
          placeholder="condition"
          preview={preview}
          options={{
            literals: ['boolean'],
          }}
        />
      </ConditionSectionRoot>
      {!preview && (
        <>
          <GenericBlockSet
            parentId={block.id}
            blocks={trueBranch ?? []}
            locale="true"
          />
          <Else used={!!falseBranch?.length} />
          <GenericBlockSet
            parentId={block.id}
            blocks={falseBranch ?? []}
            locale="false"
          />
        </>
      )}
    </BlockRoot>
  );
}

const ConditionSectionRoot = styled(s.div, {
  d: 'inline-flex',
  gap: 16,
  items: 'center',
  p: '4px 8px',
  r: 4,
  fontFamily: '$mono',
  fontSize: '$1',
  c: '$componentOnColor',
  outline: '2px solid $componentTonal',
  bg: '$componentBackground',
});

const If = () => <s.span>if</s.span>;

function Else({ used }: { used: boolean }) {
  return (
    <s.span
      css={{
        d: 'inline-flex',
        p: '4px 8px',
        r: 4,
        fontFamily: '$mono',
        fontSize: '$1',
        c: used ? '$componentOnColor' : '$componentTonal',
        outline: `2px ${used ? 'solid' : 'dashed'} $componentTonal`,
        bg: used ? '$componentBackground' : 'transparent',
      }}
    >
      else
    </s.span>
  );
}
