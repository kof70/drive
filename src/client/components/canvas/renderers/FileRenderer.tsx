import { formatDate } from "@/client/utils";
import { DownloadIcon, EyeIcon, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { FileReference } from "../../../../shared/types";
import { fileUploadService } from "../../../services/file-upload";
import {
  BaseElementRenderer,
  ElementRendererComponent,
} from "./BaseElementRenderer";
import { Dialog, DialogContent, DialogTrigger } from "../../ui/dialog";

export const FileRenderer: ElementRendererComponent = (props) => {
  const { element, isSelected } = props;
  const [isDownloading, setIsDownloading] = useState(false);

  // Parse fileRef safely
  let fileRef: FileReference;
  try {
    fileRef =
      typeof element.content === "string"
        ? (JSON.parse(element.content) as FileReference)
        : (element.content as FileReference);
  } catch {
    // Fallback for invalid content
    fileRef = {
      filename: "Fichier inconnu",
      originalPath: "",
      storedPath: "",
      mimeType: "application/octet-stream",
      size: 0,
      checksum: "",
    };
  }

  // Ensure mimeType is defined
  const mimeType = fileRef?.mimeType || "application/octet-stream";
  // const { updateElement } = useCanvasStore();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const renderFilePreview = () => {
    if (mimeType.startsWith("image/")) {
      const apiUrl = "http://localhost:8080";
      const imageUrl = `${apiUrl}/api/files/download/${fileRef.storedPath}`;
      return (
        <img
          src={imageUrl}
          alt={fileRef.filename}
          className="max-w-full w-full  max-h-96 object-contain"
        />
      );
    }
    if (mimeType.includes("pdf")) {
      return (
        <div className="w-full h-36 flex items-center justify-center bg-red-100">
          <span className="text-red-600 text-2xl font-bold">PDF</span>
        </div>
      );
    }
    if (mimeType.startsWith("text/")) {
      return (
        <div className="w-full h-36 flex items-center justify-center bg-blue-100">
          <span className="text-blue-600 text-2xl font-bold">TXT</span>
        </div>
      );
    }
    if (mimeType.startsWith("video/")) {
      return (
        <div className="w-full h-36 flex items-center justify-center bg-purple-100">
          <span className="text-purple-600 text-2xl font-bold">VID</span>
        </div>
      );
    }
    if (mimeType.startsWith("audio/")) {
      return (
        <div className="w-full h-36 flex items-center justify-center bg-yellow-100">
          <span className="text-yellow-600 font-bold">AUD</span>
        </div>
      );
    }
    if (mimeType === "application/zip") {
      return (
        <div className="w-full h-36 flex items-center justify-center bg-amber-100">
          <span className="text-amber-600 text-2xl font-bold">ZIP</span>
        </div>
      );
    }
    if (
      mimeType === "application/msword" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <div className="w-full h-36 flex items-center justify-center bg-blue-50">
          <span className="text-blue-600 text-xl font-bold">DOC</span>
        </div>
      );
    }
    return null;
  };

  // const getFileIcon = (mimeType: string) => {
  //   if (mimeType.startsWith("image/")) {
  //     return (
  //       <svg
  //         className="w-6 h-6 text-green-600"
  //         fill="none"
  //         stroke="currentColor"
  //         viewBox="0 0 24 24"
  //       >
  //         <path
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //           strokeWidth={2}
  //           d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
  //         />
  //       </svg>
  //     );
  //   } else if (mimeType.includes("pdf")) {
  //     return (
  //       <svg
  //         className="w-6 h-6 text-red-600"
  //         fill="currentColor"
  //         viewBox="0 0 20 20"
  //       >
  //         <path d="M4 18h12V6l-4-4H4v16zm8-14l2 2h-2V4z" />
  //       </svg>
  //     );
  //   } else if (mimeType.startsWith("text/")) {
  //     return (
  //       <svg
  //         className="w-6 h-6 text-blue-600"
  //         fill="none"
  //         stroke="currentColor"
  //         viewBox="0 0 24 24"
  //       >
  //         <path
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //           strokeWidth={2}
  //           d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
  //         />
  //       </svg>
  //     );
  //   } else if (mimeType.startsWith("video/")) {
  //     return (
  //       <svg
  //         className="w-6 h-6 text-purple-600"
  //         fill="none"
  //         stroke="currentColor"
  //         viewBox="0 0 24 24"
  //       >
  //         <path
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //           strokeWidth={2}
  //           d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
  //         />
  //       </svg>
  //     );
  //   } else if (mimeType.startsWith("audio/")) {
  //     return (
  //       <svg
  //         className="w-6 h-6 text-yellow-600"
  //         fill="none"
  //         stroke="currentColor"
  //         viewBox="0 0 24 24"
  //       >
  //         <path
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //           strokeWidth={2}
  //           d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
  //         />
  //       </svg>
  //     );
  //   } else {
  //     return (
  //       <svg
  //         className="w-6 h-6 text-gray-600"
  //         fill="none"
  //         stroke="currentColor"
  //         viewBox="0 0 24 24"
  //       >
  //         <path
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //           strokeWidth={2}
  //           d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
  //         />
  //       </svg>
  //     );
  //   }
  // };

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
    if (mimeType.startsWith("image/")) {
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
        // width: element.size?.width || 200,
        // height: element.size?.height || 120,
        // backgroundColor: element.style?.backgroundColor || "#f3f4f6",
        // border: `2px solid ${element.style?.borderColor || "#9ca3af"}`,
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
      <div className="flex flex-col h-full max-w-72 bg-background border rounded-lg overflow-hidden shadow">
        {/* Header avec type de fichier */}
        <div className="flex items-center space-x-2 p-2 border-b">
          <div
            title={fileRef.filename}
            className="text-xs font-medium text-muted-foreground line-clamp-1"
          >
            {fileRef.filename}
          </div>
          <div className="flex-1"></div>

          <Dialog>
            <DialogTrigger asChild>
              <button
                hidden={!mimeType.startsWith("image/")}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Prévisualiser"
              >
                <EyeIcon className="w-3 h-3 text-gray-600" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-6xl flex flex-col justify-center max-w-full p-1">
              <img
                src={`http://localhost:8080/api/files/download/${fileRef.storedPath}`}
                alt={fileRef.filename}
                className="max-w-full max-h-[90vh] rounded-md object-contain"
              />
            </DialogContent>
          </Dialog>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`p-1 hover:bg-gray-200 rounded transition-colors ${isDownloading ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isDownloading ? "Téléchargement..." : "Télécharger"}
          >
            {isDownloading ? (
              <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
            ) : (
              <DownloadIcon className="size-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Contenu principal avec icône et nom */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {renderFilePreview()}
        </div>

        {/* Footer avec métadonnées */}
        <div className="px-3 py-1 border-t border-gray-200 bg-gray-50 bg-opacity-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatDate(element.metadata.updatedAt)}</span>
            <div className="text-xs text-gray-500">
              {formatFileSize(fileRef.size)}
            </div>
          </div>
        </div>
      </div>
    </BaseElementRenderer>
  );
};
