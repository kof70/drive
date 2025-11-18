import React from "react";
import { ViewportState } from "./CanvasContainer";
import { useWebSocketContext } from "../../providers/WebSocketProvider";

export interface UserCursorsProps {
  viewport: ViewportState;
}

// Couleurs pour les curseurs des utilisateurs
const CURSOR_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

export const UserCursors: React.FC<UserCursorsProps> = ({ viewport }) => {
  const { connectedUsers, socketId } = useWebSocketContext();

  // Filtrer l'utilisateur actuel et ne garder que ceux qui ont une position de curseur
  const otherUsersWithCursors = connectedUsers.filter(
    (user) => user.id !== socketId && user.cursor,
  );

  if (otherUsersWithCursors.length === 0) {
    return null;
  }

  // Calculer le centre du conteneur et l'état du viewport
  let offsetX = 0;
  let offsetY = 0;
  if (viewport && typeof window !== "undefined") {
    const container = document.querySelector(".canvas-container");
    if (container) {
      const { width, height } = container.getBoundingClientRect();
      offsetX = width / 2;
      offsetY = height / 2;
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {otherUsersWithCursors.map((user, index) => {
        if (!user.cursor) return null;

        const color = CURSOR_COLORS[index % CURSOR_COLORS.length];

        // Appliquer la transformation inverse pour afficher le curseur à la bonne position
        const left = offsetX + viewport.x + user.cursor.x * viewport.scale;
        const top = offsetY + viewport.y + user.cursor.y * viewport.scale;

        return (
          <UserCursor
            key={user.id}
            user={user}
            color={color}
            left={left}
            top={top}
          />
        );
      })}
    </div>
  );
};

interface UserCursorProps {
  user: any; // UserSession avec cursor
  color: string;
  left: number;
  top: number;
}

const UserCursor: React.FC<UserCursorProps> = ({ user, color, left, top }) => {
  if (!user.cursor) return null;

  return (
    <div
      className="user-cursor"
      style={{
        position: "absolute",
        left,
        top,
        color: color,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {/* Curseur en forme de flèche */}
      <div className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="drop-shadow-sm"
        >
          <path
            d="M2 2L14 8L8 9L6 14L2 2Z"
            fill={color}
            stroke="white"
            strokeWidth="1"
          />
        </svg>

        {/* Nom de l'utilisateur */}
        <div
          className="absolute top-4 left-2 px-2 py-1 text-xs text-white rounded shadow-md whitespace-nowrap"
          style={{ backgroundColor: color }}
        >
          {user.deviceName}
        </div>
      </div>
    </div>
  );
};
