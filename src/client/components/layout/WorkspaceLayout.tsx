import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { CanvasContainer } from "../canvas/CanvasContainer";

export const WorkspaceLayout: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Header avec statut de connexion et outils */}
      <Header />

      {/* Zone principale avec sidebar et canvas */}
      <div className="flex-1 flex">
        {/* Sidebar avec outils et utilisateurs connectés */}
        <Sidebar />

        {/* Zone canvas principale */}
        <main className="flex-1 flex flex-col">
          <CanvasContainer />
        </main>
      </div>
    </div>
  );
};
