import { useRef, useCallback, useEffect, useMemo } from 'react';
import { Stage, Layer } from 'react-konva';
import type Konva from 'konva';
import { useStore } from '../store/index.ts';
import { BackgroundLayer } from './BackgroundLayer.tsx';
import { TokenGroup } from './TokenGroup.tsx';
import { TransformerWrapper } from './TransformerWrapper.tsx';
import { pxToMm } from '../utils/units.ts';
import { clamp } from '../utils/math.ts';
import { usePrintLayout } from '../hooks/usePrintLayout.ts';
import type { Token } from '../types/index.ts';

interface KonvaCanvasProps {
  width: number;
  height: number;
}

export function KonvaCanvas({ width, height }: KonvaCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const shiftHeld = useRef(false);

  const tokens = useStore((s) => s.tokens);
  const mode = useStore((s) => s.mode);
  const selectedTokenIds = useStore((s) => s.selectedTokenIds);
  const zoom = useStore((s) => s.zoom);
  const panOffset = useStore((s) => s.panOffset);
  const snapToGrid = useStore((s) => s.snapToGrid);
  const gridSizeMm = useStore((s) => s.gridSizeMm);

  const selectToken = useStore((s) => s.selectToken);
  const addToSelection = useStore((s) => s.addToSelection);
  const clearSelection = useStore((s) => s.clearSelection);
  const updateTokenPosition = useStore((s) => s.updateTokenPosition);
  const updateToken = useStore((s) => s.updateToken);
  const setZoom = useStore((s) => s.setZoom);
  const setPanOffset = useStore((s) => s.setPanOffset);
  const openCropModal = useStore((s) => s.openCropModal);
  const pushHistory = useStore((s) => s.pushHistory);

  const printLayout = usePrintLayout();

  // Track shift key state for multi-select
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') shiftHeld.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') shiftHeld.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      // Click on empty area → deselect
      if (e.target === e.target.getStage()) {
        clearSelection();
      }
    },
    [clearSelection]
  );

  const handleSelect = useCallback(
    (id: string) => {
      if (shiftHeld.current) {
        addToSelection(id);
      } else {
        selectToken(id);
      }
    },
    [selectToken, addToSelection]
  );

  const handleDblClick = useCallback(
    (id: string) => {
      openCropModal(id);
    },
    [openCropModal]
  );

  const handleDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      let mmX = pxToMm(x);
      let mmY = pxToMm(y);

      if (snapToGrid) {
        mmX = Math.round(mmX / gridSizeMm) * gridSizeMm;
        mmY = Math.round(mmY / gridSizeMm) * gridSizeMm;
      }

      pushHistory();
      updateTokenPosition(id, mmX, mmY);
    },
    [snapToGrid, gridSizeMm, updateTokenPosition, pushHistory]
  );

  const handleTransformEnd = useCallback(
    (id: string, node: Konva.Node) => {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const rotation = node.rotation();

      node.scaleX(1);
      node.scaleY(1);

      const token = tokens.find((t) => t.id === id);
      if (!token) return;

      const newSizeMm = token.sizeMm * Math.max(scaleX, scaleY);

      pushHistory();
      updateToken(id, {
        sizeMm: Math.round(newSizeMm * 10) / 10,
        rotation,
        sizePreset: null,
      });
    },
    [tokens, updateToken, pushHistory]
  );

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const scaleBy = 1.08;
      const oldZoom = zoom;
      const newZoom = e.evt.deltaY < 0
        ? clamp(oldZoom * scaleBy, 0.2, 5)
        : clamp(oldZoom / scaleBy, 0.2, 5);

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - panOffset.x) / oldZoom,
        y: (pointer.y - panOffset.y) / oldZoom,
      };

      const newPanOffset = {
        x: pointer.x - mousePointTo.x * newZoom,
        y: pointer.y - mousePointTo.y * newZoom,
      };

      setZoom(newZoom);
      setPanOffset(newPanOffset.x, newPanOffset.y);
    },
    [zoom, panOffset, setZoom, setPanOffset]
  );

  const isEditMode = mode === 'edit';
  const sortedTokens = [...tokens].sort((a, b) => a.zIndex - b.zIndex);

  // In print-layout mode: create virtual token objects positioned by the layout engine
  const printLayoutTokens = useMemo(() => {
    if (isEditMode) return null;

    return printLayout.items.map((item, idx) => {
      // Create a virtual token with the layout-computed position
      const virtualToken: Token = {
        ...item.token,
        // Override position with layout engine result
        position: { x: item.x, y: item.y + item.page * (printLayout.paperHeight + 10) },
        rotation: 0, // Reset rotation for print layout
      };
      return { token: virtualToken, key: `${item.token.id}-${item.page}-${item.copyIndex}-${idx}` };
    });
  }, [isEditMode, printLayout]);

  // No-op handlers for print layout mode (read-only)
  const noOpDragEnd = useCallback(() => {}, []);
  const noOpTransformEnd = useCallback(() => {}, []);

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onClick={handleStageClick}
      onTap={handleStageClick}
      onWheel={handleWheel}
    >
      <BackgroundLayer
        zoom={zoom}
        panOffset={panOffset}
        pageCount={isEditMode ? 1 : printLayout.pageCount}
      />

      <Layer scaleX={zoom} scaleY={zoom} x={panOffset.x} y={panOffset.y}>
        {isEditMode
          ? sortedTokens.map((token) => (
              <TokenGroup
                key={token.id}
                token={token}
                isSelected={selectedTokenIds.includes(token.id)}
                draggable={true}
                onSelect={handleSelect}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
                onDblClick={handleDblClick}
              />
            ))
          : printLayoutTokens?.map(({ token, key }) => (
              <TokenGroup
                key={key}
                token={token}
                isSelected={false}
                draggable={false}
                onSelect={handleSelect}
                onDragEnd={noOpDragEnd}
                onTransformEnd={noOpTransformEnd}
              />
            ))}
      </Layer>

      <Layer scaleX={zoom} scaleY={zoom} x={panOffset.x} y={panOffset.y}>
        <TransformerWrapper
          selectedIds={isEditMode ? selectedTokenIds : []}
          stageRef={stageRef}
        />
      </Layer>
    </Stage>
  );
}
