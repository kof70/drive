import React from "react";
import { CanvasElement } from "../../../../shared/types";
import {
  ElementRendererProps,
  ElementRendererComponent,
} from "./BaseElementRenderer";
import { NoteRenderer } from "./NoteRenderer";
import { FolderRenderer } from "./FolderRenderer";
import { FileRenderer } from "./FileRenderer";
import { ImageRenderer } from "./ImageRenderer";
import { RepereRenderer } from "../RepereRenderer";

// Registry des renderers par type d'élément
const rendererRegistry: Record<
  CanvasElement["type"],
  ElementRendererComponent
> = {
  note: NoteRenderer,
  folder: FolderRenderer,
  file: FileRenderer,
  image: ImageRenderer,
  rectangleGroup: RepereRenderer,
};

export interface ElementRendererFactoryProps extends ElementRendererProps {
  element: CanvasElement;
}

export const ElementRendererFactory: React.FC<ElementRendererFactoryProps> = (
  props,
) => {
  const { element } = props;

  // Sélectionner le renderer approprié
  const RendererComponent = rendererRegistry[element.type];

  if (!RendererComponent) {
    console.warn(`No renderer found for element type: ${element.type}`);
    // Fallback vers le renderer de note
    return <NoteRenderer {...props} />;
  }

  // Passe tous les props nécessaires (dont style, drag, etc.)
  return <RendererComponent {...props} />;
};

// Hook pour enregistrer des renderers personnalisés
export const useElementRenderer = () => {
  const registerRenderer = (
    type: CanvasElement["type"],
    renderer: ElementRendererComponent,
  ) => {
    rendererRegistry[type] = renderer;
  };

  const getRenderer = (
    type: CanvasElement["type"],
  ): ElementRendererComponent | undefined => {
    return rendererRegistry[type];
  };

  const getAvailableTypes = (): CanvasElement["type"][] => {
    return Object.keys(rendererRegistry) as CanvasElement["type"][];
  };

  return {
    registerRenderer,
    getRenderer,
    getAvailableTypes,
  };
};
