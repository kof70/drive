import React, { useState } from "react";
import { FileReference } from "../../../../shared/types";
import { fileUploadService } from "../../../services/file-upload";
import { useCanvasStore } from "../../../stores/canvasStore";
import {
  BaseElementRenderer,
  ElementRendererComponent,
} from "./BaseElementRenderer";

export const FileRenderer: ElementRendererComponent = (props) => {
  const { element, isSelected } = props;
  const fileRef = element.content as FileReference;
  const [isDownloading, setIsDownloading] = useState(false);
  const { updateElement } = useCanvasStore();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return (
        <svg
          className="w-6 h-6 text-green-600"
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
      );
    } else if (mimeType.includes("pdf")) {
      return (
        <svg
          className="w-6 h-6 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 18h12V6l-4-4H4v16zm8-14l2 2h-2V4z" />
        </svg>
      );
    } else if (mimeType.startsWith("text/")) {
      return (
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    } else if (mimeType.startsWith("video/")) {
      return (
        <svg
          className="w-6 h-6 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    } else if (mimeType.startsWith("audio/")) {
      return (
        <svg
          className="w-6 h-6 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    }
  };

  const getFileTypeLabel = (mimeType: string): string => {
    if (mimeType.startsWith("image/")) return "Image";
    if (mimeType.includes("pdf")) return "PDF";
    if (mimeType.startsWith("text/")) return "Texte";
    if (mimeType.startsWith("video/")) return "Vidéo";
    if (mimeType.startsWith("audio/")) return "Audio";
    if (mimeType.includes("zip") || mimeType.includes("rar")) return "Archive";
    if (mimeType.includes("word")) return "Word";
    if (mimeType.includes("excel")) return "Excel";
    if (mimeType.includes("powerpoint")) return "PowerPoint";
    return "Fichier";
  };

  const handleDownload = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (isDownloading) return;

    setIsDownloading(true);
    try {
      await fileUploadService.downloadFile(
        fileRef.storedPath,
        fileRef.filename,
      );
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      alert("Erreur lors du téléchargement du fichier");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = (event: React.MouseEvent) => {
    event.stopPropagation();

    // Pour les images, ouvrir dans un nouvel onglet
    if (fileRef.mimeType.startsWith("image/")) {
      const apiUrl = "http://localhost:8080";
      window.open(
        `${apiUrl}/api/files/download/${fileRef.storedPath}`,
        "_blank",
      );
    } else {
      // Pour les autres types, télécharger
      handleDownload(event);
    }
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
        height: element.size?.height || 120,
        backgroundColor: element.style?.backgroundColor || "#f3f4f6",
        border: `2px solid ${element.style?.borderColor || "#9ca3af"}`,
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
      {/* Header avec type de fichier */}
      <div className="flex items-center space-x-2 p-2 border-b border-gray-200 bg-opacity-50 bg-gray-50">
        <div className="text-xs font-medium text-gray-700">
          {getFileTypeLabel(fileRef.mimeType)}
        </div>
        <div className="flex-1"></div>
        <button
          onClick={handlePreview}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Prévisualiser"
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`p-1 hover:bg-gray-200 rounded transition-colors ${isDownloading ? "opacity-50 cursor-not-allowed" : ""}`}
          title={isDownloading ? "Téléchargement..." : "Télécharger"}
        >
          {isDownloading ? (
            <svg
              className="w-3 h-3 text-gray-600 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Contenu principal avec icône et nom */}
      <div className="flex-1 p-3 flex flex-col items-center justify-center text-center">
        <div className="mb-2">{getFileIcon(fileRef.mimeType)}</div>
        <div className="text-sm font-medium text-gray-900 truncate w-full mb-1">
          {fileRef.filename}
        </div>
        <div className="text-xs text-gray-500">
          {formatFileSize(fileRef.size)}
        </div>
      </div>

      {/* Footer avec métadonnées */}
      <div className="px-3 py-1 border-t border-gray-200 bg-gray-50 bg-opacity-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {new Date(element.metadata.updatedAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
          <span className="truncate max-w-20" title={fileRef.mimeType}>
            {fileRef.mimeType.split("/")[1]?.toUpperCase() || "FILE"}
          </span>
        </div>
      </div>
    </BaseElementRenderer>
  );
};
