import React from 'react';
import { ViewportState } from './CanvasContainer';

export interface CanvasGridProps {
  viewport: ViewportState;
  gridSize?: number;
  showGrid?: boolean;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({
  viewport,
  gridSize = 20,
  showGrid = true
}) => {
  if (!showGrid || viewport.scale < 0.5) {
    return null;
  }

  // Calculer les dimensions de la grille visible
  const scaledGridSize = gridSize * viewport.scale;
  const offsetX = viewport.x % scaledGridSize;
  const offsetY = viewport.y % scaledGridSize;

  // Créer le pattern SVG pour la grille
  const patternId = 'canvas-grid';
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translate(${-viewport.x}px, ${-viewport.y}px) scale(${1 / viewport.scale})`,
          transformOrigin: '0 0'
        }}
      >
        <defs>
          <pattern
            id={patternId}
            x={offsetX}
            y={offsetY}
            width={scaledGridSize}
            height={scaledGridSize}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={scaledGridSize / 2}
              cy={scaledGridSize / 2}
              r={0.5}
              fill="#e2e8f0"
              opacity={Math.min(1, viewport.scale)}
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${patternId})`}
        />
      </svg>
    </div>
  );
};