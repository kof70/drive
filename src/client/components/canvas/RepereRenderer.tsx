import React, { useState } from "react";
import { repereColors } from "@/client/utils/constants";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { PaletteIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ElementRendererProps } from "./renderers/BaseElementRenderer";

interface RepereRendererProps extends ElementRendererProps {
  onResizeHandleMouseDown?: (event: React.MouseEvent) => void;
  onChangeColor?: (bg: string, border: string) => void;
}

export const RepereRenderer: React.FC<RepereRendererProps> = (props) => {
  const {
    element,
    isSelected = false,
    onMouseDown,
    onClick,
    onDoubleClick,
    onTouchStart,
    onResizeHandleMouseDown,
    onChangeColor,
  } = props;

  const isGroupContent =
    typeof element.content === "object" &&
    element.content !== null &&
    "name" in element.content;

  const name = isGroupContent ? (element.content as any).name : "Repère";
  const createdAt =
    isGroupContent && (element.content as any).createdAt
      ? new Date((element.content as any).createdAt)
      : new Date(element.metadata.createdAt);

  const { x, y } = element.position;
  const { width, height } = element.size;

  const backgroundColor = element.style?.backgroundColor ?? "#e0e7ff";
  const borderColor = element.style?.borderColor ?? "#0078ff";

  const [showColorPicker, setShowColorPicker] = useState(false);

  // Drag & resize local state (for visual feedback, not actual movement)
  const [dragging, setDragging] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        border: `2px solid ${borderColor}`,
        borderRadius: 8,
        background: backgroundColor,
        zIndex: 1,
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none",
        boxSizing: "border-box",
        transition: "background 0.2s, border-color 0.2s",
      }}
      onMouseDown={(e) => {
        setDragging(true);
        if (onMouseDown) onMouseDown(e);
      }}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onTouchStart={onTouchStart}
    >
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 8,
          fontWeight: "bold",
          color: borderColor,
        }}
      >
        {name}
      </div>
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 28,
          fontSize: 12,
          color: "#555",
        }}
      >
        {createdAt.toLocaleDateString()}
      </div>
      {/* Sélecteur de couleur */}
      <div style={{ position: "absolute", right: 12, top: 8 }}>
        <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              title="Changer la couleur"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
            >
              <PaletteIcon className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-4 gap-1">
              {repereColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => {
                    setShowColorPicker(false);
                    onChangeColor?.(color.value, color.border);
                  }}
                  style={{
                    background: color.value,
                    borderColor: color.border,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: "2px solid",
                    margin: 2,
                    cursor: "pointer",
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {/* Poignée de redimensionnement */}
      <div
        style={{
          position: "absolute",
          right: -8,
          bottom: -8,
          width: 16,
          height: 16,
          background: borderColor,
          borderRadius: "50%",
          cursor: "nwse-resize",
          border: "2px solid #fff",
          boxShadow: "0 2px 8px rgba(0,120,255,0.15)",
        }}
        onMouseDown={onResizeHandleMouseDown}
      />
    </div>
  );
};
