import { useRef, useEffect } from 'react';
import { Transformer } from 'react-konva';
import type Konva from 'konva';

interface TransformerWrapperProps {
  selectedIds: string[];
  stageRef: React.RefObject<Konva.Stage | null>;
}

export function TransformerWrapper({ selectedIds, stageRef }: TransformerWrapperProps) {
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    if (selectedIds.length === 0) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }

    // Find the selected nodes on the stage
    const nodes: Konva.Node[] = [];
    for (const id of selectedIds) {
      const node = stage.findOne(`#${id}`);
      if (node) nodes.push(node);
    }

    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedIds, stageRef]);

  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled={true}
      enabledAnchors={[
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
      ]}
      boundBoxFunc={(oldBox, newBox) => {
        // Minimum size constraint
        if (newBox.width < 10 || newBox.height < 10) {
          return oldBox;
        }
        return newBox;
      }}
      borderStroke="#818cf8"
      borderStrokeWidth={1.5}
      anchorStroke="#818cf8"
      anchorFill="#1e1b4b"
      anchorSize={8}
      anchorCornerRadius={2}
      rotateAnchorOffset={20}
    />
  );
}
