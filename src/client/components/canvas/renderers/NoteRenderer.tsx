import React, { useEffect, useRef, useState } from "react";
import { useCanvasStore } from "../../../stores/canvasStore";
import {
  BaseElementRenderer,
  ElementRendererComponent,
} from "./BaseElementRenderer";

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

  // Couleurs prédéfinies pour les notes
  const noteColors = [
    { name: "Blanc", bg: "#ffffff", border: "#e5e7eb" },
    { name: "Jaune", bg: "#fef3c7", border: "#fbbf24" },
    { name: "Vert", bg: "#d1fae5", border: "#34d399" },
    { name: "Bleu", bg: "#dbeafe", border: "#60a5fa" },
    { name: "Rose", bg: "#fce7f3", border: "#f472b6" },
    { name: "Violet", bg: "#e9d5ff", border: "#a78bfa" },
    { name: "Orange", bg: "#fed7aa", border: "#fb923c" },
    { name: "Gris", bg: "#f3f4f6", border: "#9ca3af" },
  ];

  // Tailles de police prédéfinies
  const fontSizes = [
    { label: "Petit", value: 12 },
    { label: "Normal", value: 14 },
    { label: "Moyen", value: 16 },
    { label: "Grand", value: 18 },
    { label: "Très grand", value: 20 },
  ];

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
        width: element.size?.width || 200,
        height: element.size?.height || 150,
        backgroundColor: element.style?.backgroundColor || "#fef3c7",
        border: `2px solid ${element.style?.borderColor || "#fbbf24"}`,
        fontSize: element.style?.fontSize || 14,
        boxShadow: isSelected
          ? "0 0 0 2px #3b82f6"
          : "0 1px 4px rgba(0,0,0,0.08)",
        borderRadius: "0.5rem",
        cursor: isSelected ? "grabbing" : "move",
        userSelect: "none",
        opacity: isSelected ? 0.85 : 1,
      }}
    >
      {/* Header avec icône et contrôles */}
      <div className="flex items-center space-x-2 p-2 border-b border-gray-200 bg-opacity-50 bg-gray-50">
        <svg
          className="w-4 h-4 text-gray-600 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <div className="text-xs font-medium text-gray-700 truncate">Note</div>

        {/* Contrôles de formatage */}
        {isSelected && !isEditing && (
          <div className="ml-auto flex items-center space-x-1">
            {/* Sélecteur de couleur */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker(!showColorPicker);
                  setShowFontSizePicker(false);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Changer la couleur"
              >
                <svg
                  className="w-3 h-3 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </button>

              {showColorPicker && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg p-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-4 gap-1">
                    {noteColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() =>
                          handleColorChange(color.bg, color.border)
                        }
                        className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: color.bg,
                          borderColor: color.border,
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sélecteur de taille de police */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFontSizePicker(!showFontSizePicker);
                  setShowColorPicker(false);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Changer la taille"
              >
                <svg
                  className="w-3 h-3 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </button>

              {showFontSizePicker && (
                <div
                  className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 min-w-32"
                  onClick={(e) => e.stopPropagation()}
                >
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => handleFontSizeChange(size.value)}
                      className={`w-full px-3 py-1 text-left hover:bg-gray-100 transition-colors ${
                        (element.style.fontSize || 14) === size.value
                          ? "bg-blue-50 text-blue-600"
                          : ""
                      }`}
                      style={{ fontSize: size.value }}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {isEditing && (
          <div className="text-xs text-blue-600 ml-auto">
            Ctrl+Enter pour sauver
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-3 flex-1 overflow-hidden">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full min-h-full resize-none border-none outline-none bg-transparent text-sm text-gray-900 overflow-hidden"
            placeholder="Tapez votre note ici..."
            style={{
              fontSize: element.style.fontSize || 14,
              lineHeight: "1.5",
            }}
          />
        ) : (
          <div
            className="text-sm text-gray-900 whitespace-pre-wrap break-words cursor-text hover:bg-gray-50 hover:bg-opacity-50 rounded p-1 -m-1 transition-colors"
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

      {/* Footer avec métadonnées */}
      <div className="px-3 py-1 border-t border-gray-200 bg-gray-50 bg-opacity-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {new Date(element.metadata.updatedAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="text-xs">{content.length} car.</span>
        </div>
      </div>
    </BaseElementRenderer>
  );
};
