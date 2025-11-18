import { useEffect, useRef } from "react";

/**
 * Hook pour gérer les listeners globaux de drag live (mousemove/touchmove + mouseup/touchend).
 * Garantit que les handlers les plus récents sont utilisés grâce aux refs.
 *
 * @param handleDragMove Fonction appelée à chaque mouvement (mousemove/touchmove)
 * @param handleDragEnd Fonction appelée à la fin du drag (mouseup/touchend)
 */
export function useGlobalDragListener(
  handleDragMove: (event: MouseEvent | TouchEvent) => void,
  handleDragEnd: (event: MouseEvent | TouchEvent) => void
) {
  const moveRef = useRef(handleDragMove);
  const endRef = useRef(handleDragEnd);

  // Met à jour les refs à chaque changement de handler
  useEffect(() => {
    moveRef.current = handleDragMove;
    endRef.current = handleDragEnd;
  }, [handleDragMove, handleDragEnd]);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      moveRef.current && moveRef.current(e);
    }
    function onMouseUp(e: MouseEvent) {
      endRef.current && endRef.current(e);
    }
    function onTouchMove(e: TouchEvent) {
      moveRef.current && moveRef.current(e);
    }
    function onTouchEnd(e: TouchEvent) {
      endRef.current && endRef.current(e);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);
}
