import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className = '',
  showDetails = false
}) => {
  const { 
    connected, 
    connecting, 
    error, 
    connectedUsers, 
    reconnectionAttempt,
    connect 
  } = useWebSocket();

  const getStatusColor = () => {
    if (connected) return 'text-green-600';
    if (connecting) return 'text-yellow-600';
    if (error) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    if (connected) return '🟢';
    if (connecting) return '🟡';
    if (error) return '🔴';
    return '⚪';
  };

  const getStatusText = () => {
    if (connected) return 'Connecté';
    if (connecting) {
      return reconnectionAttempt > 0 
        ? `Reconnexion... (${reconnectionAttempt})`
        : 'Connexion...';
    }
    if (error) return 'Erreur de connexion';
    return 'Déconnecté';
  };

  const handleRetry = () => {
    if (!connecting && !connected) {
      connect();
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-lg">{getStatusIcon()}</span>
      <span className={`font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      
      {showDetails && (
        <>
          {connected && (
            <span className="text-sm text-gray-500">
              ({connectedUsers.length} utilisateur{connectedUsers.length !== 1 ? 's' : ''})
            </span>
          )}
          
          {error && !connecting && (
            <button
              onClick={handleRetry}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Réessayer
            </button>
          )}
        </>
      )}
      
      {error && showDetails && (
        <div className="text-xs text-red-500 mt-1">
          {error.message}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;