import React, { useState } from "react";
import { ViewportState } from "./CanvasContainer";
import { CanvasElement } from "../../../shared/types";
import { useCanvasStore } from "../../stores/canvasStore";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { useWebSocketContext } from "../../providers/WebSocketProvider";
import { ElementRendererFactory } from "./renderers/ElementRendererFactory";
import { RepereRenderer } from "./RepereRenderer";

export interface CanvasElementsProps {
  viewport: ViewportState;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const CanvasElements: React.FC<CanvasElementsProps> = ({ viewport }) => {
  const {
    elements,
    selectedElementIds,
    selectElement,
    moveElement,
    updateElement,
  } = useCanvasStore();
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

  const { dragState, handleDragStart } = useDragAndDrop(
    handleElementMove,
    undefined,
    viewport.scale,
  );

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

  // State global pour l'édition du nom du repère
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Séparer les repères et les autres éléments
  const reperes = elements.filter((el) => el.type === "rectangleGroup");
  const otherElements = elements.filter((el) => el.type !== "rectangleGroup");

  return (
    <div className="absolute inset-0">
      {/* Affichage des repères */}
      {reperes.map((repere) => {
        const isGroupContent =
          typeof repere.content === "object" &&
          repere.content !== null &&
          "name" in repere.content;
        const name = isGroupContent ? (repere.content as any).name : "Repère";
        const createdAt =
          isGroupContent && (repere.content as any).createdAt
            ? new Date((repere.content as any).createdAt)
            : new Date(repere.metadata.createdAt);

        // Handler pour le drag
        const handleRepereDrag = (
          id: string,
          start: { x: number; y: number; clientX: number; clientY: number },
          event: React.MouseEvent,
          scale: number,
        ) => {
          const onMouseMove = (moveEvent: MouseEvent) => {
            const dx = (moveEvent.clientX - start.clientX) / scale;
            const dy = (moveEvent.clientY - start.clientY) / scale;
            moveElement(id, {
              x: start.x + dx,
              y: start.y + dy,
            });
          };
          const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
          };
          window.addEventListener("mousemove", onMouseMove);
          window.addEventListener("mouseup", onMouseUp);
        };

        // Handler pour le resize
        const handleRepereResize = (
          id: string,
          start: {
            width: number;
            height: number;
            clientX: number;
            clientY: number;
          },
          event: React.MouseEvent,
          scale: number,
        ) => {
          const onMouseMove = (moveEvent: MouseEvent) => {
            const dw = (moveEvent.clientX - start.clientX) / scale;
            const dh = (moveEvent.clientY - start.clientY) / scale;
            updateElement(id, {
              size: {
                width: Math.max(50, start.width + dw),
                height: Math.max(50, start.height + dh),
              },
            });
          };
          const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
          };
          window.addEventListener("mousemove", onMouseMove);
          window.addEventListener("mouseup", onMouseUp);
        };

        // Handler pour valider l'édition du nom
        const handleEditName = () => {
          updateElement(repere.id, {
            content: {
              ...(typeof repere.content === "object" && repere.content !== null
                ? repere.content
                : {}),
              name: editValue,
            },
            metadata: {
              ...repere.metadata,
              updatedAt: new Date(),
            },
          });
          setEditingId(null);
        };

        return (
          <div key={repere.id} style={{ position: "relative" }}>
            <RepereRenderer
              element={repere}
              isSelected={selectedElementIds.includes(repere.id)}
              isDragging={false}
              scale={viewport.scale}
              onClick={() => selectElement(repere.id)}
              onDoubleClick={() => {
                setEditingId(repere.id);
                setEditValue(name);
              }}
              onMouseDown={(event) => {
                event.stopPropagation();
                handleRepereDrag(
                  repere.id,
                  {
                    x: repere.position.x,
                    y: repere.position.y,
                    clientX: event.clientX,
                    clientY: event.clientY,
                  },
                  event,
                  viewport.scale,
                );
              }}
              onTouchStart={() => {}}
              onResizeHandleMouseDown={(event) => {
                event.stopPropagation();
                handleRepereResize(
                  repere.id,
                  {
                    width: repere.size.width,
                    height: repere.size.height,
                    clientX: event.clientX,
                    clientY: event.clientY,
                  },
                  event,
                  viewport.scale,
                );
              }}
              onChangeColor={(bg, border) => {
                updateElement(repere.id, {
                  style: {
                    ...repere.style,
                    backgroundColor: bg,
                    borderColor: border,
                  },
                  metadata: {
                    ...repere.metadata,
                    updatedAt: new Date(),
                  },
                });
              }}
            />
            {editingId === repere.id && (
              <div
                style={{
                  position: "absolute",
                  left: repere.position.x + 12,
                  top: repere.position.y + 8,
                  background: "#fff",
                  border: "1px solid #0078ff",
                  borderRadius: 4,
                  padding: "2px 8px",
                  zIndex: 999,
                }}
              >
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleEditName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditName();
                  }}
                  autoFocus
                  style={{
                    fontWeight: "bold",
                    color: "#0078ff",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
      {/* Affichage des autres éléments */}
      {otherElements.map((element) => (
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
