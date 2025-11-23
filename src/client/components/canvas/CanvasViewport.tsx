import React, { RefObject, useEffect } from "react";
import { ViewportState } from "./CanvasContainer";
import { CanvasGrid } from "./CanvasGrid";
import { CanvasElements } from "./CanvasElements";
import { UserCursors } from "./UserCursors";
import { useWebSocketContext } from "../../providers/WebSocketProvider";
import { getCanvasCoordinates } from "../../utils/canvas-util";

export interface CanvasViewportProps {
  viewport: ViewportState;
  containerRef: RefObject<HTMLDivElement | null>;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  viewport,
  containerRef,
}) => {
  // Calculer le centre du conteneur
  let offsetX = 0;
  let offsetY = 0;
  if (containerRef.current) {
    const { width, height } = containerRef.current.getBoundingClientRect();
    offsetX = width / 2;
    offsetY = height / 2;
  }

  // Envoi de la position du curseur utilisateur au backend (coordonnées canvas)
  const { emit } = useWebSocketContext();
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      } else {
        return;
      }
      const { x, y } = getCanvasCoordinates(
        clientX,
        clientY,
        containerRef,
        offsetX,
        offsetY,
        viewport,
      );
      emit("user-cursor", { x, y });
    };
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
    };
  }, [emit, containerRef, offsetX, offsetY, viewport]);

  return (
    <div
      className="absolute inset-0"
      style={{
        transform: `translate(${offsetX + viewport.x}px, ${offsetY + viewport.y}px) scale(${viewport.scale})`,
        transformOrigin: "0 0",
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
