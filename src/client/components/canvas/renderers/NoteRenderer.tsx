import React, { useEffect, useRef, useState } from "react";
import { useCanvasStore } from "../../../stores/canvasStore";
import {
  BaseElementRenderer,
  ElementRendererComponent,
} from "./BaseElementRenderer";
import { Card, CardContent, CardFooter, CardHeader } from "../../ui/card";
import { cn, formatDate } from "@/client/utils";
import { Button } from "../../ui/button";
import { ALargeSmallIcon, PaletteIcon } from "lucide-react";
import { fontSizes, noteColors } from "@/client/utils/constants";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

export const NoteRenderer: ElementRendererComponent = (props) => {
  const { element, isSelected } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(
    typeof element.content === "string" ? element.content : "",
  );
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateElement } = useCanvasStore();

  // Synchroniser le contenu local avec l'élément (pour les mises à jour externes)
  useEffect(() => {
    if (!isEditing && typeof element.content === "string") {
      setContent(element.content);
    }
  }, [element.content, isEditing]);

  // Focus et sélection lors de l'entrée en mode édition
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();

      // Auto-resize du textarea
      adjustTextareaHeight();
    }
  }, [isEditing]);

  // Fermer les pickers quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      setShowColorPicker(false);
      setShowFontSizePicker(false);
    };

    if (showColorPicker || showFontSizePicker) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showColorPicker, showFontSizePicker]);

  // Auto-resize du textarea en fonction du contenu
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Ajuster la hauteur lors du changement de contenu
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    adjustTextareaHeight();
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);

    // Sauvegarder le contenu via le store (qui synchronise automatiquement)
    updateElement(element.id, {
      content,
      metadata: {
        ...element.metadata,
        updatedAt: new Date(),
      },
    });
    console.log("Note saved:", content);
  };

  const handleColorChange = (bg: string, border: string) => {
    updateElement(element.id, {
      style: {
        ...element.style,
        backgroundColor: bg,
        borderColor: border,
      },
      metadata: {
        ...element.metadata,
        updatedAt: new Date(),
      },
    });
    setShowColorPicker(false);
  };

  const handleFontSizeChange = (size: number) => {
    updateElement(element.id, {
      style: {
        ...element.style,
        fontSize: size,
      },
      metadata: {
        ...element.metadata,
        updatedAt: new Date(),
      },
    });
    setShowFontSizePicker(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      handleSave();
    } else if (event.key === "Escape") {
      setIsEditing(false);
      setContent(typeof element.content === "string" ? element.content : "");
    }
  };

  return (
    <BaseElementRenderer
      {...props}
      onDoubleClick={handleDoubleClick}
      onMouseDown={props.onMouseDown}
      onTouchStart={props.onTouchStart}
      style={{
        position: "absolute",
        left: element.position.x,
        top: element.position.y,
        zIndex: isSelected ? 10 : 1,
        width: "auto",
        height: "auto",
        backgroundColor: "transparent",
        fontSize: element.style?.fontSize || 14,
        borderRadius: "2rem",
        cursor: isSelected ? "grabbing" : "move",
        userSelect: "none",
        opacity: isSelected ? 0.85 : 1,
      }}
    >
      <Card className={cn("w-sm gap-2 py-4", element.style.backgroundColor)}>
        <CardContent className="px-4">
          {/* Contenu */}
          <div className="flex-1 overflow-hidden">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="w-full min-h-full resize-none border-none outline-none bg-transparent text-sm overflow-hidden"
                placeholder="Tapez votre note ici..."
                onFocus={(e) => {
                  // Désactive la sélection automatique pour éviter la surbrillance permanente
                  e.target.selectionStart = e.target.selectionEnd;
                }}
              />
            ) : (
              <div
                className="text-sm  whitespace-pre-wrap wrap-break-word cursor-text rounded p-1 -m-1"
                style={{
                  fontSize: element.style.fontSize || 14,
                  lineHeight: "1.5",
                  minHeight: "3em",
                }}
              >
                {content || (
                  <span className="text-gray-400 italic">
                    Double-cliquez pour éditer...
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-4 flex justify-end gap-2">
          {/* Contrôles de formatage */}
          {(isSelected || isEditing) && (
            <div className="flex items-center gap-2">
              {/* Sélecteur de couleur */}
              <Popover
                open={showColorPicker}
                onOpenChange={(open) => setShowColorPicker(open)}
              >
                <PopoverTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowColorPicker(!showColorPicker);
                      setShowFontSizePicker(false);
                    }}
                    variant={"ghost"}
                    size={"icon"}
                    className="rounded-full"
                    title="Changer la couleur"
                  >
                    <PaletteIcon className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="grid grid-cols-4 gap-1">
                    {noteColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() =>
                          handleColorChange(color.bg, color.border)
                        }
                        className={cn(
                          "w-6 h-6 rounded border-2 hover:scale-110 transition-transform",
                          color.bg,
                        )}
                        title={color.name}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Sélecteur de taille de police */}
              <Popover
                open={showFontSizePicker}
                onOpenChange={(open) => setShowFontSizePicker(open)}
              >
                <PopoverTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFontSizePicker(!showFontSizePicker);
                      setShowColorPicker(false);
                    }}
                    variant={"ghost"}
                    size={"icon"}
                    className="rounded-full"
                    title="Changer la taille"
                  >
                    <ALargeSmallIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1">
                  {fontSizes.map((size) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      key={size.value}
                      onClick={() => handleFontSizeChange(size.value)}
                      style={{ fontSize: size.value }}
                    >
                      {size.label}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          )}

          <span className="text-xs">
            {formatDate(element.metadata.updatedAt)}
          </span>
        </CardFooter>
      </Card>
    </BaseElementRenderer>
  );
};
