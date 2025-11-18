import React from "react";
import { ViewportState } from "./CanvasContainer";
import { Button, buttonVariants } from "../ui/button";
import { Minus, PlusIcon } from "lucide-react";
import { ButtonGroup } from "../ui/group-button";
import { cn } from "@/client/utils";

export interface CanvasToolbarProps {
  viewport: ViewportState;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  viewport,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Contrôles de zoom */}
        <ButtonGroup className="flex items-center">
          <Button
            size={"icon-sm"}
            onClick={onZoomOut}
            className="btn btn-outline"
            title="Zoom arrière (Ctrl + -)"
            disabled={viewport.scale <= 0.1}
            variant={"outline"}
          >
            <Minus />
          </Button>

          <div
            className={cn(
              buttonVariants({
                variant: "secondary",
                size: "sm",
                className: "border-y shadow-xs",
              }),
            )}
          >
            {Math.round(viewport.scale * 100)}%
          </div>

          <Button
            size={"icon-sm"}
            onClick={onZoomIn}
            className="btn btn-outline"
            title="Zoom avant (Ctrl + +)"
            disabled={viewport.scale >= 3}
            variant={"outline"}
          >
            <PlusIcon />
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button
            onClick={onResetZoom}
            className="btn btn-outline"
            title="Zoom 100% (Ctrl + 0)"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </Button>

          <Button
            onClick={onFitToScreen}
            className="btn btn-outline"
            title="Ajuster à l'écran"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </Button>
        </ButtonGroup>

        {/* Informations sur la position */}
        <div className="text-sm text-gray-500">
          x: {Math.round(viewport.x)}, y: {Math.round(viewport.y)}
        </div>

        {/* Actions rapides */}
        <div className="flex items-center space-x-2">
          <button className="btn btn-outline" title="Sélectionner tout">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <button className="btn btn-outline" title="Supprimer la sélection">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-200"></div>

          <button className="btn btn-outline" title="Annuler (Ctrl + Z)">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </button>

          <button className="btn btn-outline" title="Refaire (Ctrl + Y)">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
