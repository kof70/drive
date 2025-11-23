/**
 * Convertit les coordonnées écran (clientX, clientY) en coordonnées canvas
 * Prend en compte le containerRef, offsetX, offsetY, viewport
 */
export function getCanvasCoordinates(
  clientX: number,
  clientY: number,
  containerRef: React.RefObject<HTMLElement | null>,
  offsetX: number,
  offsetY: number,
  viewport: { x: number; y: number; scale: number },
) {
  if (!containerRef.current) return { x: 0, y: 0 };
  const rect = containerRef.current.getBoundingClientRect();
  return {
    x: (clientX - rect.left - offsetX - viewport.x) / viewport.scale,
    y: (clientY - rect.top - offsetY - viewport.y) / viewport.scale,
  };
}
