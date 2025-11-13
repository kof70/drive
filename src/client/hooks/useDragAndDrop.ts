import { useState, useCallback, useRef } from 'react';
import { CanvasElement, FileReference } from '../../shared/types';
import { fileUploadService } from '../services/file-upload';
import { useCanvasStore } from '../stores/canvasStore';

export interface DragState {
  isDragging: boolean;
  draggedElement: CanvasElement | null;
  dragOffset: { x: number; y: number };
  startPosition: { x: number; y: number };
}

export interface UseDragAndDropReturn {
  dragState: DragState;
  handleDragStart: (element: CanvasElement, event: React.MouseEvent | React.TouchEvent) => void;
  handleDragMove: (event: React.MouseEvent | React.TouchEvent) => void;
  handleDragEnd: () => void;
  handleFileDrop: (event: React.DragEvent) => void;
  handleDragOver: (event: React.DragEvent) => void;
}

export const useDragAndDrop = (
  onElementMove?: (element: CanvasElement, newPosition: { x: number; y: number }) => void,
  onFileUpload?: (files: FileList, position: { x: number; y: number }) => void
): UseDragAndDropReturn => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedElement: null,
    dragOffset: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 }
  });

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const { addElement } = useCanvasStore();

  // Fonction utilitaire pour obtenir les coordonnées d'un événement
  const getEventCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    return { x: event.clientX, y: event.clientY };
  };

  // Démarrer le drag d'un élément
  const handleDragStart = useCallback((element: CanvasElement, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const coords = getEventCoordinates(event);
    const elementRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    
    // Calculer l'offset entre la position de la souris et le coin de l'élément
    const offset = {
      x: coords.x - elementRect.left,
      y: coords.y - elementRect.top
    };

    dragStartRef.current = coords;

    setDragState({
      isDragging: true,
      draggedElement: element,
      dragOffset: offset,
      startPosition: { x: element.position.x, y: element.position.y }
    });

    // Ajouter les event listeners globaux
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, []);

  // Gérer le mouvement pendant le drag
  const handleDragMove = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.isDragging || !dragState.draggedElement || !dragStartRef.current) {
      return;
    }

    event.preventDefault();
    const coords = getEventCoordinates(event);
    
    // Calculer la nouvelle position
    const deltaX = coords.x - dragStartRef.current.x;
    const deltaY = coords.y - dragStartRef.current.y;
    
    const newPosition = {
      x: dragState.startPosition.x + deltaX,
      y: dragState.startPosition.y + deltaY
    };

    // Mettre à jour l'élément avec la nouvelle position
    const updatedElement = {
      ...dragState.draggedElement,
      position: newPosition,
      metadata: {
        ...dragState.draggedElement.metadata,
        updatedAt: new Date()
      }
    };

    setDragState(prev => ({
      ...prev,
      draggedElement: updatedElement
    }));

    // Notifier le parent du changement
    if (onElementMove) {
      onElementMove(updatedElement, newPosition);
    }
  }, [dragState, onElementMove]);

  // Event handlers pour mouse
  const handleMouseMove = useCallback((event: MouseEvent) => {
    handleDragMove(event as any);
  }, [handleDragMove]);

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, []);

  // Event handlers pour touch
  const handleTouchMove = useCallback((event: TouchEvent) => {
    handleDragMove(event as any);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, []);

  // Terminer le drag
  const handleDragEnd = useCallback(() => {
    // Nettoyer les event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);

    dragStartRef.current = null;

    setDragState({
      isDragging: false,
      draggedElement: null,
      dragOffset: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 }
    });
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Gérer le drop de fichiers
  const handleFileDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
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
          const fileReference: FileReference = await fileUploadService.uploadFile(
            file,
            'user', // TODO: Utiliser le vrai nom d'utilisateur
            (progress) => {
              console.log(`📊 Progression: ${Math.round(progress)}%`);
            }
          );

          // Créer un élément canvas pour le fichier
          const fileElement: CanvasElement = {
            id: crypto.randomUUID(),
            type: file.type.startsWith('image/') ? 'image' : 'file',
            position: {
              x: position.x + (i * 20), // Décaler légèrement chaque fichier
              y: position.y + (i * 20)
            },
            size: { width: 200, height: 150 },
            content: fileReference,
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'user' // TODO: Utiliser le vrai nom d'utilisateur
            },
            style: {
              backgroundColor: '#ffffff',
              borderColor: '#e5e7eb'
            }
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
  }, [onFileUpload, addElement]);

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
    handleDragOver
  };
};