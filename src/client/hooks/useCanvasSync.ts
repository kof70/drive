import { useEffect } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { useWebSocketEvent } from './useWebSocket';
import { CanvasElement } from '../../shared/types';

/**
 * Hook pour synchroniser automatiquement le canvas avec le serveur WebSocket
 * Gère la synchronisation bidirectionnelle et la résolution des conflits
 */
export function useCanvasSync() {
  const { 
    addElement, 
    updateElement, 
    removeElement, 
    syncCanvasState,
    isInitialized,
    setInitialized
  } = useCanvasStore();

  // Synchronisation de l'état complet du canvas (à la connexion/reconnexion)
  useWebSocketEvent('canvas-state-sync', (elements: CanvasElement[]) => {
    console.log('📥 Réception de l\'état complet du canvas:', elements.length, 'éléments');
    syncCanvasState(elements);
  });

  // Réception d'une mise à jour d'élément depuis un autre client
  useWebSocketEvent('canvas-update', (element: CanvasElement) => {
    console.log('📥 Mise à jour d\'élément reçue:', element.id);
    // broadcast = false pour éviter une boucle infinie
    updateElement(element.id, element, false);
  });

  // Réception d'un nouvel élément depuis un autre client
  useWebSocketEvent('canvas-element-add', (element: CanvasElement) => {
    console.log('📥 Nouvel élément reçu:', element.id);
    // broadcast = false pour éviter une boucle infinie
    addElement(element, false);
  });

  // Réception d'une suppression d'élément depuis un autre client
  useWebSocketEvent('canvas-element-remove', (elementId: string) => {
    console.log('📥 Suppression d\'élément reçue:', elementId);
    // broadcast = false pour éviter une boucle infinie
    removeElement(elementId, false);
  });

  // Marquer comme initialisé après la première synchronisation
  useEffect(() => {
    if (!isInitialized) {
      // Attendre un peu pour recevoir l'état initial du serveur
      const timer = setTimeout(() => {
        setInitialized(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isInitialized, setInitialized]);

  return {
    isInitialized
  };
}
