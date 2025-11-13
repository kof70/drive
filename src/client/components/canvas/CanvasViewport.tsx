import React, { RefObject } from 'react';
import { ViewportState } from './CanvasContainer';
import { CanvasGrid } from './CanvasGrid';
import { CanvasElements } from './CanvasElements';
import { UserCursors } from './UserCursors';

export interface CanvasViewportProps {
  viewport: ViewportState;
  containerRef: RefObject<HTMLDivElement>;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  viewport,
  containerRef
}) => {
  return (
    <div
      className="absolute inset-0"
      style={{
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
        transformOrigin: '0 0'
      }}
    >
      {/* Grille de fond */}
      <CanvasGrid viewport={viewport} />
      
      {/* Éléments du canvas */}
      <CanvasElements viewport={viewport} />
      
      {/* Curseurs des autres utilisateurs */}
      <UserCursors viewport={viewport} />
    </div>
  );
};