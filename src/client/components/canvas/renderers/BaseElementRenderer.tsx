import React, { ReactNode } from "react";
import { CanvasElement } from "../../../../shared/types";

export interface ElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  isDragging: boolean;
  scale: number;
  onClick: (event: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onDragStart?: (
    event: React.DragEvent | React.MouseEvent | React.TouchEvent,
  ) => void;
  onDragEnd?: (event: React.DragEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  children?: ReactNode;
  style?: React.CSSProperties;
  draggable?: boolean;
  onMouseDown?: (event: React.MouseEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
}

export type ElementRendererComponent = React.FC<ElementRendererProps>;

export const BaseElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  isDragging,
  onClick,
  onDoubleClick,
  onDragStart,
  onDragEnd,
  onContextMenu,
  children,
  style = {},
  draggable = false,
  onMouseDown,
  onTouchStart,
  ...rest
}) => {
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    onContextMenu?.(event);
  };

  return (
    <div
      className={`canvas-element animate-fade-in ${isSelected ? "selected" : ""} ${isDragging ? "dragging" : ""}`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        backgroundColor: element.style?.backgroundColor || "#ffffff",
        borderColor: element.style?.borderColor || "#e2e8f0",
        fontSize: element.style?.fontSize || 14,
        transform: isDragging ? "rotate(2deg)" : "none",
        boxShadow: isDragging ? "0 8px 25px rgba(0,0,0,0.15)" : undefined,
        zIndex: isDragging ? 1000 : isSelected ? 100 : 1,
        ...style,
      }}
      draggable={draggable}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onContextMenu={handleContextMenu}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      {...rest}
    >
      {children}

      {/* Indicateur de sélection */}
      {isSelected && (
        <div className="absolute -inset-1 border-2 border-blue-500 rounded pointer-events-none">
          {/* Poignées de redimensionnement */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
};
