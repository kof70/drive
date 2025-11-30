import { useState, useCallback, useRef, useEffect } from "react";
import { CanvasElement, FileReference } from "../../shared/types";
import { fileUploadService } from "../services/file-upload";
import { useCanvasStore } from "../stores/canvasStore";
import { useGlobalDragListener } from "./useGlobalDragListener";

// Type utilitaire pour accepter tous les types d'événements souris/tactile natifs et React
export type AnyMouseOrTouchEvent =
  | MouseEvent
  | TouchEvent
  | React.MouseEvent<Element, MouseEvent>
  | React.TouchEvent<Element>;

export interface DragState {
  isDragging: boolean;
  draggedElement: CanvasElement | null;
  dragOffset: { x: number; y: number };
  startPosition: { x: number; y: number };
}

export interface UseDragAndDropReturn {
  dragState: DragState;
  handleDragStart: (
    element: CanvasElement,
    event: React.MouseEvent | React.TouchEvent,
  ) => void;
  handleDragMove: (event: React.MouseEvent | React.TouchEvent) => void;
  handleDragEnd: () => void;
  handleFileDrop: (event: React.DragEvent) => void;
  handleDragOver: (event: React.DragEvent) => void;
}

export const useDragAndDrop = (
  onElementMove?: (
    element: CanvasElement,
    newPosition: { x: number; y: number },
  ) => void,
  onFileUpload?: (files: FileList, position: { x: number; y: number }) => void,
  scale: number = 1,
): UseDragAndDropReturn => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedElement: null,
    dragOffset: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
  });

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const { addElement } = useCanvasStore();

  // Ref pour onElementMove pour éviter les problèmes de closure
  const onElementMoveRef = useRef(onElementMove);
  useEffect(() => {
    onElementMoveRef.current = onElementMove;
  }, [onElementMove]);

  // Fonction utilitaire pour obtenir les coordonnées d'un événement
  const getEventCoordinates = (event: AnyMouseOrTouchEvent) => {
    if ("touches" in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    return {
      x: (event as MouseEvent | React.MouseEvent).clientX,
      y: (event as MouseEvent | React.MouseEvent).clientY,
    };
  };

  // Démarrer le drag d'un élément
  const handleDragStart = useCallback(
    (element: CanvasElement, event: React.MouseEvent | React.TouchEvent) => {
      console.log("Drag START", element.id, event.type); // <-- log diagnostic
      event.preventDefault();
      event.stopPropagation();

      const coords = getEventCoordinates(event);
      const elementRect = (
        event.currentTarget as HTMLElement
      ).getBoundingClientRect();

      // Calculer l'offset entre la position de la souris et le coin de l'élément
      const offset = {
        x: coords.x - elementRect.left,
        y: coords.y - elementRect.top,
      };

      dragStartRef.current = coords;

      setDragState({
        isDragging: true,
        draggedElement: element,
        dragOffset: offset,
        startPosition: { x: element.position.x, y: element.position.y },
      });
      // Les listeners globaux sont gérés par useGlobalDragListener
    },
    [],
  );

  // Gérer le mouvement pendant le drag
  const handleDragMove = useCallback(
    (event: AnyMouseOrTouchEvent) => {
      if (
        !dragState.isDragging ||
        !dragState.draggedElement ||
        !dragStartRef.current
      ) {
        return;
      }

      // Pour React events, preventDefault, pour natif, c'est optionnel
      if (
        "preventDefault" in event &&
        typeof event.preventDefault === "function"
      ) {
        event.preventDefault();
      }

      // Obtenir les coordonnées
      const coords = getEventCoordinates(event);

      const deltaX = (coords.x - dragStartRef.current.x) / scale;
      const deltaY = (coords.y - dragStartRef.current.y) / scale;

      const newPosition = {
        x: dragState.startPosition.x + deltaX,
        y: dragState.startPosition.y + deltaY,
      };

      const updatedElement = {
        ...dragState.draggedElement,
        position: newPosition,
        metadata: {
          ...dragState.draggedElement.metadata,
          updatedAt: new Date(),
        },
      };

      setDragState((prev) => ({
        ...prev,
        draggedElement: updatedElement,
      }));

      if (onElementMove) {
        onElementMove(updatedElement, newPosition);
      }
    },
    [dragState, onElementMove],
  );

  // Terminer le drag
  const handleDragEnd = useCallback(() => {
    dragStartRef.current = null;

    setDragState({
      isDragging: false,
      draggedElement: null,
      dragOffset: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 },
    });
  }, []);

  // Branche les listeners globaux pour le drag live
  useGlobalDragListener(handleDragMove, handleDragEnd);

  // Gérer le drop de fichiers
  const handleFileDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const rect = (
          event.currentTarget as HTMLElement
        ).getBoundingClientRect();
        const position = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };

        // Appeler le callback si fourni (pour compatibilité)
        if (onFileUpload) {
          onFileUpload(files, position);
          return;
        }

        // Sinon, gérer l'upload directement
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            console.log(`📤 Upload du fichier: ${file.name}`);

            // Upload le fichier vers le serveur
            const fileReference: FileReference =
              await fileUploadService.uploadFile(
                file,
                "user", // TODO: Utiliser le vrai nom d'utilisateur
                (progress) => {
                  console.log(`📊 Progression: ${Math.round(progress)}%`);
                },
              );

            // Créer un élément canvas pour le fichier
            const fileElement: CanvasElement = {
              id: crypto.randomUUID(),
              type: file.type.startsWith("image/") ? "image" : "file",
              position: {
                x: position.x + i * 20, // Décaler légèrement chaque fichier
                y: position.y + i * 20,
              },
              size: { width: 200, height: 150 },
              content: fileReference,
              metadata: {
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: "user", // TODO: Utiliser le vrai nom d'utilisateur
              },
              style: {
                backgroundColor: "#ffffff",
                borderColor: "#e5e7eb",
              },
            };

            // Ajouter au store (qui va automatiquement synchroniser via WebSocket)
            addElement(fileElement);

            console.log(`✅ Fichier uploadé et ajouté au canvas: ${file.name}`);
          } catch (error) {
            console.error(`❌ Erreur lors de l'upload de ${file.name}:`, error);
            alert(`Erreur lors de l'upload de ${file.name}`);
          }
        }
      }
    },
    [onFileUpload, addElement],
  );

  // Gérer le drag over pour permettre le drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleFileDrop,
    handleDragOver,
  };
};
