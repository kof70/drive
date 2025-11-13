import React from 'react';
import { ViewportState } from './CanvasContainer';
import { useWebSocketContext } from '../../providers/WebSocketProvider';

export interface UserCursorsProps {
  viewport: ViewportState;
}

// Couleurs pour les curseurs des utilisateurs
const CURSOR_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export const UserCursors: React.FC<UserCursorsProps> = ({ viewport }) => {
  const { connectedUsers, socketId } = useWebSocketContext();

  // Filtrer l'utilisateur actuel et ne garder que ceux qui ont une position de curseur
  const otherUsersWithCursors = connectedUsers.filter(
    user => user.id !== socketId && user.cursor
  );

  if (otherUsersWithCursors.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {otherUsersWithCursors.map((user, index) => {
        if (!user.cursor) return null;

        const color = CURSOR_COLORS[index % CURSOR_COLORS.length];
        
        return (
          <UserCursor
            key={user.id}
            user={user}
            color={color}
          />
        );
      })}
    </div>
  );
};

interface UserCursorProps {
  user: any; // UserSession avec cursor
  color: string;
}

const UserCursor: React.FC<UserCursorProps> = ({ user, color }) => {
  if (!user.cursor) return null;

  return (
    <div
      className="user-cursor"
      style={{
        left: user.cursor.x,
        top: user.cursor.y,
        color: color
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