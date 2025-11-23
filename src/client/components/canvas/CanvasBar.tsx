import { useWebSocketContext } from "@/client/providers/WebSocketProvider";
import { useCanvasStore } from "@/client/stores/canvasStore";
import { useNotificationStore } from "@/client/stores/notificationStore";
import { CanvasElement } from "@/shared/types";
import { PiSelectionAll, PiTrash } from "react-icons/pi";
import {
  RiFolderAddLine,
  RiStickyNoteAddLine,
  RiUpload2Line,
} from "react-icons/ri";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { noteColors } from "@/client/utils/constants";

interface CanvasBarProps {
  onResetZoom: () => void;
}
export const CanvasBar: React.FC<CanvasBarProps> = ({ onResetZoom }) => {
  const { emit } = useWebSocketContext();
  const { addElement, selectedElementIds, removeElement, clearSelection } =
    useCanvasStore();
  const { addNotification } = useNotificationStore();
  const createNewElement = (type: "note" | "folder") => {
    const newElement: CanvasElement = {
      id: `${type}-${Date.now()}`,
      type,
      position: {
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      },
      size: { width: 200, height: 150 },
      content: type === "note" ? "Nouvelle note..." : "Nouveau dossier",
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "current-user",
      },
      style: {
        backgroundColor: type === "note" ? noteColors[4].bg : noteColors[5].bg,
      },
    };

    addElement(newElement);
    emit("canvas-update", newElement);

    addNotification({
      type: "success",
      title: `${type === "note" ? "Note" : "Dossier"} créé`,
      message: "Nouvel élément ajouté au canvas",
      duration: 3000,
    });
  };

  const handleDelete = () => {
    if (selectedElementIds.length === 0) return;
    selectedElementIds.forEach((id) => removeElement(id));
    clearSelection();
    addNotification({
      type: "success",
      title: "Élément(s) supprimé(s)",
      message: "Les éléments sélectionnés ont été supprimés.",
      duration: 3000,
    });
  };
  return (
    <div className="absolute bottom-4 bg-background rounded-full shadow-xl h-14 flex items-center gap-2  border p-3 ">
      <Button
        title="Ajouter une note"
        onClick={() => createNewElement("note")}
        size={"icon-lg"}
        variant={"outline"}
        className="rounded-full"
      >
        <RiStickyNoteAddLine />
      </Button>
      <Button
        title="Ajouter un dossier"
        onClick={() => createNewElement("folder")}
        size={"icon-lg"}
        variant={"outline"}
        className="rounded-full"
      >
        <RiFolderAddLine />
      </Button>
      <Button
        title="Téléverser un fichier"
        variant={"outline"}
        size={"lg"}
        className="rounded-full"
      >
        <RiUpload2Line />
        Televerser
      </Button>
      <Separator orientation="vertical" className="h-full" />
      <Button
        onClick={onResetZoom}
        size={"icon-lg"}
        variant={"outline"}
        className="rounded-full"
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
        title="Sélectionner tout"
        size={"icon-lg"}
        variant={"outline"}
        className="rounded-full"
      >
        <PiSelectionAll />
      </Button>
      <Button
        title="Supprimer la sélection"
        size={"icon-lg"}
        onClick={handleDelete}
        disabled={selectedElementIds.length === 0}
        variant={selectedElementIds.length === 0 ? "outline" : "destructive"}
        className="rounded-full"
      >
        <PiTrash />
      </Button>
      <Button
        title="Zoom arrière (Ctrl + -)"
        size={"icon-lg"}
        variant={"outline"}
        className="rounded-full"
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
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      </Button>
      <Button
        title="Zoom avant (Ctrl + +)"
        size={"icon-lg"}
        variant={"outline"}
        className="rounded-full"
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
            d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6"
          />
        </svg>
      </Button>
    </div>
  );
};
