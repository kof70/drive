import React, { useState } from "react";
import {
  BaseElementRenderer,
  ElementRendererProps,
} from "./BaseElementRenderer";
import { FileReference } from "../../../../shared/types";

import { useCanvasStore } from "../../../stores/canvasStore";

import { ElementRendererComponent } from "./BaseElementRenderer";

export const ImageRenderer: ElementRendererComponent = (props) => {
  const { element, isSelected } = props;
  const fileRef = element.content as FileReference;
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { updateElement } = useCanvasStore();

  console.log({ element });
  // Pour la démo, on utilise une image placeholder
  const imageUrl = `https://picsum.photos/200/150?random=${element.id}`;

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleFullscreen = (event: React.MouseEvent) => {
    event.stopPropagation();
    // TODO: Ouvrir en plein écran
    console.log("Ouvrir en plein écran:", fileRef.filename);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <BaseElementRenderer
      {...props}
      style={{
        position: "absolute",
        left: element.position.x,
        top: element.position.y,
        zIndex: isSelected ? 10 : 1,
        width: element.size?.width || 200,
        height: element.size?.height || 150,
        backgroundColor: element.style?.backgroundColor || "#fff",
        border: `2px solid ${element.style?.borderColor || "#e5e7eb"}`,
        boxShadow: isSelected
          ? "0 0 0 2px #3b82f6"
          : "0 1px 4px rgba(0,0,0,0.08)",
        borderRadius: "0.5rem",
        cursor: "move",
        userSelect: "none",
      }}
      onMouseDown={(e) => {
        if (props.onMouseDown) props.onMouseDown(e);
      }}
      onTouchStart={(e) => {
        if (props.onTouchStart) props.onTouchStart(e);
      }}
    >
      {/* Header avec contrôles */}
      <div className="flex items-center space-x-2 p-2 border-b border-gray-200 bg-opacity-50 bg-gray-50">
        <svg
          className="w-4 h-4 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <div className="text-xs font-medium text-gray-700 truncate flex-1">
          Image
        </div>
        <button
          onClick={handleFullscreen}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Plein écran"
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
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      </div>

      {/* Zone d'image */}
      <div className="flex-1 relative overflow-hidden bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}

        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <svg
              className="w-8 h-8 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div className="text-xs text-center">
              Impossible de charger l'image
            </div>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={fileRef.filename}
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={handleFullscreen}
          />
        )}

        {/* Overlay avec informations */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
          <div className="text-white text-xs truncate">{fileRef.filename}</div>
        </div>
      </div>

      {/* Footer avec métadonnées */}
      <div className="px-3 py-1 border-t border-gray-200 bg-gray-50 bg-opacity-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatFileSize(fileRef.size)}</span>
          <span>
            {new Date(element.metadata.updatedAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
        </div>
      </div>
    </BaseElementRenderer>
  );
};
