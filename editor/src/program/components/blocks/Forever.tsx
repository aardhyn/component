import { s } from 'theme/stitches.config';
import { Forever } from 'types';
import GenericBlockSet from './BlockSet';
import { BlockRoot } from '../generic';

export function ForeverBlock({
  block,
  preview = false,
}: {
  block: Forever;
  preview?: boolean;
}) {
  return (
    <BlockRoot
      block={block}
      preview={preview}
      color="$purple"
      colorTonal="$purpleTonal"
      onColor="$onPurple"
      overrideStyles
    >
      <ForeverSection />
      {!preview && (
        <GenericBlockSet
          blocks={block.components ?? []}
          locale="components"
          parentId={block.id}
        />
      )}
    </BlockRoot>
  );
}

function ForeverSection() {
  return (
    <s.div
      css={{
        d: 'inline-flex',
        items: 'center',
        gap: 8,
        p: '4px 8px',
        r: 4,
        fontFamily: '$mono',
        fontSize: '$1',

        c: '$componentOnColor',
        bg: '$componentBackground',
        outline: '2px solid $componentTonal',
      }}
    >
      forever
    </s.div>
  );
}
