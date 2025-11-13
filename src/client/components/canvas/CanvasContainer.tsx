import React, { useRef, useState, useCallback, useEffect } from 'react';
import { CanvasViewport } from './CanvasViewport';
import { CanvasToolbar } from './CanvasToolbar';
import { useCanvasStore } from '../../stores/canvasStore';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

export interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasContainerProps {
  className?: string;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<ViewportState>({
    x: 0,
    y: 0,
    scale: 1
  });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  const { clearSelection } = useCanvasStore();

  // Le hook useDragAndDrop gère maintenant l'upload automatiquement
  const { handleFileDrop, handleDragOver } = useDragAndDrop();

  // Gestion du zoom avec la molette
  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculer le nouveau niveau de zoom
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, viewport.scale * zoomFactor));

    // Calculer la nouvelle position pour zoomer vers la souris
    const scaleRatio = newScale / viewport.scale;
    const newX = mouseX - (mouseX - viewport.x) * scaleRatio;
    const newY = mouseY - (mouseY - viewport.y) * scaleRatio;

    setViewport({
      x: newX,
      y: newY,
      scale: newScale
    });
  }, [viewport]);

  // Gestion du pan (déplacement)
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 0) { // Clic gauche
      // Déselectionner tous les éléments si on clique sur le canvas vide
      clearSelection();
      
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  }, [clearSelection]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;

      setViewport(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));

      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  }, [isPanning, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + 0 : Reset zoom
      if ((event.ctrlKey || event.metaKey) && event.key === '0') {
        event.preventDefault();
        setViewport({ x: 0, y: 0, scale: 1 });
      }
      
      // Ctrl/Cmd + Plus : Zoom in
      if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        setViewport(prev => ({
          ...prev,
          scale: Math.min(3, prev.scale * 1.2)
        }));
      }
      
      // Ctrl/Cmd + Minus : Zoom out
      if ((event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault();
        setViewport(prev => ({
          ...prev,
          scale: Math.max(0.1, prev.scale * 0.8)
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fonctions de contrôle du viewport
  const zoomIn = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      scale: Math.min(3, prev.scale * 1.2)
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      scale: Math.max(0.1, prev.scale * 0.8)
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1 });
  }, []);

  const fitToScreen = useCallback(() => {
    // TODO: Calculer les bounds des éléments et ajuster le viewport
    resetZoom();
  }, [resetZoom]);

  return (
    <div className={`flex-1 flex flex-col ${className}`}>
      {/* Toolbar avec contrôles de zoom */}
      <CanvasToolbar
        viewport={viewport}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onFitToScreen={fitToScreen}
      />

      {/* Zone canvas principale */}
      <div
        ref={containerRef}
        className="flex-1 canvas-container relative overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        style={{
          cursor: isPanning ? 'grabbing' : 'grab'
        }}
      >
        <CanvasViewport
          viewport={viewport}
          containerRef={containerRef}
        />
      </div>

      {/* Indicateur de zoom */}
      <div className="zoom-indicator absolute bottom-4 right-4 bg-white border border-gray-200 rounded px-2 py-1 text-sm text-gray-600 shadow">
        {Math.round(viewport.scale * 100)}%
      </div>
    </div>
  );
};