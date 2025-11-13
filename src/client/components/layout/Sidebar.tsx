import React, { useState } from 'react';
import { useWebSocketContext } from '../../providers/WebSocketProvider';
import { useCanvasStore } from '../../stores/canvasStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { CanvasElement } from '../../../shared/types';

export const Sidebar: React.FC = () => {
  const { connectedUsers, emit } = useWebSocketContext();
  const { addElement } = useCanvasStore();
  const { addNotification } = useNotificationStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const createNewElement = (type: 'note' | 'folder') => {
    const newElement: CanvasElement = {
      id: `${type}-${Date.now()}`,
      type,
      position: { 
        x: 100 + Math.random() * 200, 
        y: 100 + Math.random() * 200 
      },
      size: { width: 200, height: 150 },
      content: type === 'note' ? 'Nouvelle note...' : 'Nouveau dossier',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user'
      },
      style: {
        backgroundColor: type === 'note' ? '#fef3c7' : '#f3e8ff',
        borderColor: type === 'note' ? '#f59e0b' : '#8b5cf6'
      }
    };

    addElement(newElement);
    emit('canvas-update', newElement);
    
    addNotification({
      type: 'success',
      title: `${type === 'note' ? 'Note' : 'Dossier'} créé`,
      message: 'Nouvel élément ajouté au canvas',
      duration: 3000
    });
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-gray-50 border-r border-gray-200 flex flex-col">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-3 hover:bg-gray-100 border-b border-gray-200"
          title="Développer la sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header de la sidebar */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-medium text-gray-900">Outils</h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-gray-200 rounded"
          title="Réduire la sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Outils de création */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Créer</h3>
        <div className="space-y-2">
          <button 
            onClick={() => createNewElement('note')}
            className="w-full btn btn-outline text-left"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Note
          </button>
          <button 
            onClick={() => createNewElement('folder')}
            className="w-full btn btn-outline text-left"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
            Dossier
          </button>
          <label className="w-full btn btn-outline text-left cursor-pointer">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Image
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  // TODO: Gérer l'upload d'images
                  console.log('Images sélectionnées:', e.target.files);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Utilisateurs connectés */}
      <div className="p-4 flex-1">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Utilisateurs connectés ({connectedUsers.length})
        </h3>
        <div className="space-y-2">
          {connectedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-2 p-2 rounded bg-white border border-gray-200"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.deviceName}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.ipAddress}
                </div>
              </div>
            </div>
          ))}
          {connectedUsers.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              Aucun utilisateur connecté
            </div>
          )}
        </div>
      </div>

      {/* Presse-papiers */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Presse-papiers</h3>
        <div className="text-xs text-gray-500">
          Synchronisation automatique activée
        </div>
      </div>
    </aside>
  );
};