import { create } from "zustand";
import { CanvasElement } from "../../shared/types";
import { wsManager } from "../services/websocket-manager";

interface CanvasStore {
  elements: CanvasElement[];
  selectedElementIds: string[];
  isInitialized: boolean;

  // Actions
  addElement: (element: CanvasElement, broadcast?: boolean) => void;
  updateElement: (
    id: string,
    updates: Partial<CanvasElement>,
    broadcast?: boolean,
  ) => void;
  removeElement: (id: string, broadcast?: boolean) => void;
  selectElement: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  moveElement: (
    id: string,
    position: { x: number; y: number },
    broadcast?: boolean,
  ) => void;

  // Synchronisation
  syncCanvasState: (elements: CanvasElement[]) => void;
  setInitialized: (initialized: boolean) => void;

  // Getters
  getElementById: (id: string) => CanvasElement | undefined;
  getSelectedElements: () => CanvasElement[];
}

// Données de test initiales
const initialElements: CanvasElement[] = [
  {
    id: "element-1",
    type: "note",
    position: { x: 0, y: 0 },
    size: { width: 200, height: 150 },
    content: "Bienvenue dans votre espace collaboratif !",
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "user-1",
    },
    style: {
      backgroundColor: "#fef3c7",
      borderColor: "#f59e0b",
    },
  },
  {
    id: "element-2",
    type: "note",
    position: { x: 350, y: 200 },
    size: { width: 180, height: 120 },
    content:
      "Vous pouvez créer des notes, glisser des fichiers et collaborer en temps réel.",
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "user-1",
    },
    style: {
      backgroundColor: "#dbeafe",
      borderColor: "#3b82f6",
    },
  },
  {
    id: "element-3",
    type: "folder",
    position: { x: 200, y: 350 },
    size: { width: 150, height: 100 },
    content: "Documents partagés",
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "user-1",
    },
    style: {
      backgroundColor: "#f3e8ff",
      borderColor: "#8b5cf6",
    },
  },
];

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  elements: initialElements,
  selectedElementIds: [],
  isInitialized: false,

  addElement: (element, broadcast = true) => {
    // Positionne le nouvel élément au centre du canvas (x:0, y:0)
    const centeredElement = {
      ...element,
      position: { x: 0, y: 0 },
    };
    set((state) => ({
      elements: [...state.elements, centeredElement],
    }));

    // Émettre l'événement au serveur si broadcast est activé
    if (broadcast && wsManager.connected) {
      wsManager.send("canvas-element-add", centeredElement);
    }
  },

  updateElement: (id, updates, broadcast = true) => {
    let updatedElement: CanvasElement | undefined;

    set((state) => {
      const newElements = state.elements.map((element) => {
        if (element.id === id) {
          updatedElement = {
            ...element,
            ...updates,
            metadata: {
              ...element.metadata,
              ...updates.metadata,
              updatedAt: new Date(),
            },
          };
          return updatedElement;
        }
        return element;
      });

      return { elements: newElements };
    });

    // Émettre l'événement au serveur si broadcast est activé
    if (broadcast && updatedElement && wsManager.connected) {
      wsManager.send("canvas-update", updatedElement);
    }
  },

  removeElement: (id, broadcast = true) => {
    set((state) => ({
      elements: state.elements.filter((element) => element.id !== id),
      selectedElementIds: state.selectedElementIds.filter(
        (selectedId) => selectedId !== id,
      ),
    }));

    // Émettre l'événement au serveur si broadcast est activé
    if (broadcast && wsManager.connected) {
      wsManager.send("canvas-element-remove", id);
    }
  },

  selectElement: (id, multiSelect = false) => {
    set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedElementIds.includes(id);
        return {
          selectedElementIds: isSelected
            ? state.selectedElementIds.filter((selectedId) => selectedId !== id)
            : [...state.selectedElementIds, id],
        };
      } else {
        return {
          selectedElementIds: [id],
        };
      }
    });
  },

  clearSelection: () => {
    set({ selectedElementIds: [] });
  },

  moveElement: (id, position, broadcast = true) => {
    console.log("moveElement called", id, position); // diagnostic log
    const { updateElement } = get();
    updateElement(id, { position }, broadcast);
  },

  syncCanvasState: (elements) => {
    console.log(
      `🔄 Synchronisation de l'état du canvas: ${elements.length} éléments`,
    );
    set({
      elements: elements,
      isInitialized: true,
    });
  },

  setInitialized: (initialized) => {
    set({ isInitialized: initialized });
  },

  getElementById: (id) => {
    return get().elements.find((element) => element.id === id);
  },

  getSelectedElements: () => {
    const { elements, selectedElementIds } = get();
    return elements.filter((element) =>
      selectedElementIds.includes(element.id),
    );
  },
}));
