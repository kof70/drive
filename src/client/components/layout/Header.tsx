import React from 'react';
import { ConnectionStatus } from '../ConnectionStatus';
import { useWebSocketContext } from '../../providers/WebSocketProvider';

export const Header: React.FC = () => {
  const { connectedUsers } = useWebSocketContext();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo et titre */}
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold text-gray-900">
            Local Collaborative Workspace
          </h1>
        </div>

        {/* Statut de connexion et utilisateurs */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {connectedUsers.length} utilisateur{connectedUsers.length !== 1 ? 's' : ''} connecté{connectedUsers.length !== 1 ? 's' : ''}
          </div>
          <ConnectionStatus showDetails={true} />
        </div>
      </div>
    </header>
  );
};