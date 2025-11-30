import React from "react";
import { ViewportState } from "./CanvasContainer";

export interface CanvasGridProps {
  viewport: ViewportState;
  gridSize?: number;
  showGrid?: boolean;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({
  viewport,
  gridSize = 20,
  showGrid = true,
}) => {
  if (!showGrid || viewport.scale < 0.5) {
    return null;
  }

  // Calculate the visible grid dimensions
  const scaledGridSize = gridSize * viewport.scale;
  // Fix: Use Math.floor to avoid negative modulo issues and ensure correct offset
  const offsetX =
    (((viewport.x % gridSize) + gridSize) % gridSize) * viewport.scale;
  const offsetY =
    (((viewport.y % gridSize) + gridSize) % gridSize) * viewport.scale;

  // Create the SVG pattern for the grid
  const patternId = "canvas-grid";

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="absolute"
        width={50000000}
        height={50000000}
        style={{
          left: "-20000px",
          top: "-20000px",
        }}
      >
        <defs>
          <pattern
            id={patternId}
            x={0}
            y={0}
            width={scaledGridSize}
            height={scaledGridSize}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={scaledGridSize / 2}
              cy={scaledGridSize / 2}
              r={0.5}
              fill="black"
              opacity={Math.min(1, viewport.scale)}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};
