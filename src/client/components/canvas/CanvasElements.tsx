import React from "react";
import { ViewportState } from "./CanvasContainer";
import { CanvasElement } from "../../../shared/types";
import { useCanvasStore } from "../../stores/canvasStore";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { useWebSocketContext } from "../../providers/WebSocketProvider";
import { ElementRendererFactory } from "./renderers/ElementRendererFactory";

export interface CanvasElementsProps {
  viewport: ViewportState;
}

export const CanvasElements: React.FC<CanvasElementsProps> = ({ viewport }) => {
  const { elements, selectedElementIds, selectElement, moveElement } =
    useCanvasStore();
  const { emit } = useWebSocketContext();

  // Gérer le déplacement d'éléments
  const handleElementMove = (
    element: CanvasElement,
    newPosition: { x: number; y: number },
  ) => {
    moveElement(element.id, newPosition);

    // Émettre la mise à jour via WebSocket
    emit("canvas-update", {
      ...element,
      position: newPosition,
      metadata: {
        ...element.metadata,
        updatedAt: new Date(),
      },
    });
  };

  const { dragState, handleDragStart } = useDragAndDrop(handleElementMove);

  const handleElementClick = (
    element: CanvasElement,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    const multiSelect = event.ctrlKey || event.metaKey;
    selectElement(element.id, multiSelect);
  };

  const handleElementDoubleClick = (element: CanvasElement) => {
    console.log("Element double-clicked:", element.id);
    // Le double-clic est maintenant géré par chaque renderer
  };

  const handleContextMenu = (
    element: CanvasElement,
    event: React.MouseEvent,
  ) => {
    event.preventDefault();
    console.log("Context menu for element:", element.id);
    // TODO: Afficher le menu contextuel
  };

  return (
    <div className="absolute inset-0">
      {elements.map((element) => (
        <ElementRendererFactory
          key={element.id}
          element={element}
          isSelected={selectedElementIds.includes(element.id)}
          isDragging={
            dragState.isDragging && dragState.draggedElement?.id === element.id
          }
          scale={viewport.scale}
          onClick={(event) => handleElementClick(element, event)}
          onDoubleClick={() => handleElementDoubleClick(element)}
          onDragStart={(event) => handleDragStart(element, event)}
          onContextMenu={(event) => handleContextMenu(element, event)}
          onMouseDown={(event) => handleDragStart(element, event)}
          onTouchStart={(event) => handleDragStart(element, event)}
        />
      ))}
    </div>
  );
};
