import {
  ReactElement,
  useEffect,
  CSSProperties,
  ReactNode,
  useMemo,
  useCallback,
  RefObject,
  useRef,
} from 'react';
import { DropTargetMonitor, useDrag, useDragLayer, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Component } from 'types';
import { CSS, keyframes, s, styled } from 'theme/stitches.config';
import { GetJsxComponent } from 'program/components/blocks';
import { EmplacementAction } from 'program/types';
import { HTMLAttributes } from 'react';
import {
  useRemoveComponent,
  useAddComponent,
  useMoveComponent,
} from 'program/store';

type DropAction = 'move' | 'copy';
type DragItem = { component: Component; action: DropAction };

export namespace Drag {
  /**
   * hook component dragging functionality into a component
   * @param copyOnDrop should blocks be copied or moved when dropped
   * @param component the card to be moved|copied
   */
  export function useComponentDragHandle(
    component: Component,
    copyOnDrop?: boolean,
  ) {
    const ref = useRef<HTMLDivElement>(null);
    const [{ isDragging }, dragConnector, preview] = useDrag({
      type: 'component',
      item: (): DragItem => ({
        component: structuredClone(component),
        action: copyOnDrop ? 'copy' : 'move',
      }),
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });
    dragConnector(ref);

    // hide the default drag screenshot preview
    useEffect(() => {
      preview(getEmptyImage());
    }, [preview]);

    const DragHandle = useMemo(
      () =>
        ({
          children,
          css,
          ...divProps
        }: {
          children?: ReactNode | ReactNode[];
          css?: CSS;
        } & HTMLAttributes<HTMLDivElement>) => (
          <s.div
            ref={ref}
            css={{
              ...css,
              touchAction: 'none', // prevent scrolling while dragging on mobile
            }}
            {...divProps}
          >
            {children}
          </s.div>
        ),
      [ref],
    );

    return {
      /** Is the component being dragged */
      isDragging,
      /** Handle component that initiates a drag event */
      DragHandle,
    };
  }

  /**
   * hooks dropping functionality into a component
   * @param destinationId the component being dropped (copied|moved) into
   * @param emplacement how a component is emplaced with respect to the parent
   * @param opts additional options and constraints
   */
  export function useComponentDropzone(
    emplacement: EmplacementAction,
    destinationId: string | null | undefined,
    locale?: string,
    dropPredicate?: (draggingComponent: Component) => boolean,
    onDrop?: () => void,
  ) {
    const moveBlock = useMoveComponent();
    const addBlock = useAddComponent();

    const handleDrop = useCallback(
      (item: DragItem, monitor: DropTargetMonitor<DragItem>) => {
        const { component, action } = item;

        if (destinationId === undefined) return;
        if (monitor.didDrop()) return; // check if the drop was handled by a child dropzone
        if (dropPredicate && !dropPredicate(component)) return; // check if the drop is allowed

        if (action === 'move')
          moveBlock(component.id, destinationId, emplacement, locale);
        else addBlock(component, destinationId, emplacement, locale);

        onDrop?.();
      },
      [dropPredicate, onDrop],
    );

    const ref = useRef<HTMLDivElement>(null);
    const [{ isOverShallow, isOver }, connectDrop] = useDrop({
      accept: 'component',
      drop: handleDrop,
      collect: (monitor) => ({
        isOverShallow: monitor.isOver({ shallow: true }), // hovered by the cursor and *not* behind a child dropzone
        isOver: monitor.isOver(), // hovered by the cursor regardless of child dropzones
      }),
    });
    connectDrop(ref);

    const Dropzone = useMemo(
      () =>
        ({
          children,
          css,
          ...divProps
        }: {
          children?: ReactNode;
          css?: CSS;
        } & HTMLAttributes<HTMLDivElement>) => (
          <DropzoneRoot ref={ref} css={css} {...divProps}>
            {children}
          </DropzoneRoot>
        ),
      [ref],
    );

    return {
      isHovering: isOverShallow,
      isHoveringBounds: isOver,
      Dropzone,
    };
  }

  export const DropzoneRoot = styled('div');

  /**
   * Make the `<body>` an unhandled dropzone to prevent the delay when dropping cards outside a dropzone empty space
   * @param type the type of item to handle ( or rather, not handle )
   */
  export function useUnhandledDropzone(type: string = 'component') {
    const [, drop] = useDrop(() => ({
      accept: type,
    }));

    useEffect(() => {
      drop(document.body);
      return () => {
        drop(null);
      };
    });
  }

  /**
   * Remove a component when dropped within
   */
  export function useRemoveComponentOnDrop() {
    const remove = useRemoveComponent();
    const ref = useRef<HTMLDivElement>(null);
    const [{ isOverShallow, isOver }, connectDrop] = useDrop({
      accept: 'component',
      drop: ({ component }: DragItem, monitor) => {
        if (monitor.didDrop()) return; // check if the drop was handled by a child dropzone

        // simply remove the component
        remove(component.id);
      },
      collect: (monitor) => ({
        isOverShallow: monitor.isOver({ shallow: true }), // hovered by the cursor and *not* behind a child dropzone
        isOver: monitor.isOver(),
      }),
    });
    connectDrop(ref);

    const Dropzone = useMemo(
      () =>
        ({
          children,
          css,
        }: {
          children?: ReactElement | (ReactElement | null)[] | null;
          css?: CSS;
        }) => (
          <DropzoneRoot ref={ref} css={css}>
            {children}
          </DropzoneRoot>
        ),
      [ref],
    );

    return {
      isHovering: isOverShallow,
      isHoveringBounds: isOver,
      Dropzone,
    };
  }

  /**
   * Custom drag layer to full render the component being dragged as a preview; place anywhere to render the preview
   */
  export function DragLayer() {
    const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
      item: monitor.getItem() as DragItem,
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));

    if (!isDragging || !item || !('component' in item)) return null;

    const position: CSSProperties = {
      left: currentOffset?.x,
      top: currentOffset?.y,
    };

    // create preview component
    const component = GetJsxComponent(item.component, undefined, true);

    return (
      <div
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 1024,
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            animation: `${rotate} 100ms ease-in-out forwards`,
            ...position,
          }}
        >
          {component}
        </div>
      </div>
    );
  }

  const rotate = keyframes({
    '0%': { rotate: '0deg' },
    '100%': { rotate: '4deg' },
  });
}
