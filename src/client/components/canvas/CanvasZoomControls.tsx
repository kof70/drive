import * as React from "react";
import { ViewportState } from "./CanvasContainer";
import { ButtonGroup } from "../ui/group-button";
import { Button, buttonVariants } from "../ui/button";
import { Minus, PlusIcon } from "lucide-react";
import { cn } from "@/client/utils";

interface CanvasZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  viewport: ViewportState;
}

export const CanvasZoomControls: React.FC<CanvasZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  viewport,
}) => {
  return (
    <ButtonGroup className="absolute bottom-4 right-4 ">
      <Button
        size={"icon-lg"}
        onClick={onZoomOut}
        title="Zoom arrière (Ctrl + -)"
        className="rounded-l-full"
        disabled={viewport.scale <= 0.1}
        variant={"outline"}
      >
        <Minus />
      </Button>

      <Button className="border-y" variant={"outline"} size={"lg"}>
        {Math.round(viewport.scale * 100)}%
      </Button>

      <Button
        size={"icon-lg"}
        onClick={onZoomIn}
        className="rounded-r-full"
        title="Zoom avant (Ctrl + +)"
        disabled={viewport.scale >= 3}
        variant={"outline"}
      >
        <PlusIcon />
      </Button>
    </ButtonGroup>
  );
};
