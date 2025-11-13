import React, { useState } from 'react';
import { BaseElementRenderer, ElementRendererProps } from './BaseElementRenderer';

export const FolderRenderer: React.FC<ElementRendererProps> = (props) => {
  const { element } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Simuler des fichiers dans le dossier
  const mockFiles = [
    { name: 'document.pdf', size: '2.3 MB', type: 'pdf' },
    { name: 'image.jpg', size: '1.8 MB', type: 'image' },
    { name: 'notes.txt', size: '0.5 KB', type: 'text' }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 18h12V6l-4-4H4v16zm8-14l2 2h-2V4z"/>
          </svg>
        );
      case 'image':
        return (
          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const handleToggleExpand = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <BaseElementRenderer {...props}>
      {/* Header avec icône et nom */}
      <div className="flex items-center space-x-2 p-2 border-b border-gray-200 bg-opacity-50 bg-gray-50">
        <button
          onClick={handleToggleExpand}
          className="flex items-center space-x-1 hover:bg-gray-200 rounded p-1 transition-colors"
        >
          <svg 
            className={`w-3 h-3 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          </svg>
        </button>
        <div className="text-xs font-medium text-gray-700 truncate flex-1">
          {typeof element.content === 'string' ? element.content : 'Dossier'}
        </div>
        <div className="text-xs text-gray-500">
          {mockFiles.length}
        </div>
      </div>

      {/* Contenu du dossier */}
      <div className="flex-1 overflow-hidden">
        {isExpanded ? (
          <div className="p-2 space-y-1 max-h-32 overflow-y-auto">
            {mockFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded text-xs"
              >
                {getFileIcon(file.type)}
                <span className="flex-1 truncate text-gray-700">{file.name}</span>
                <span className="text-gray-500 text-xs">{file.size}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              <div className="text-xs text-gray-500">
                Cliquez pour ouvrir
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1 border-t border-gray-200 bg-gray-50 bg-opacity-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {new Date(element.metadata.updatedAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit'
            })}
          </span>
          <span>
            {mockFiles.length} élément{mockFiles.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </BaseElementRenderer>
  );
};