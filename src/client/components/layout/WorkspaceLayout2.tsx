import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { CanvasContainer } from "../canvas/CanvasContainer";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../shared/AppSideBar";

export const WorkspaceLayout2: React.FC = () => {
  return (
    <SidebarProvider>
      {/* Sidebar avec outils et utilisateurs connectés */}
      <AppSidebar />
      <main className="flex-1 w-full flex flex-col">
        {/* Header avec statut de connexion et outils */}
        <Header />
        {/*<SidebarTrigger />*/}
        {/* Zone canvas principale */}
        <main className="h-[calc(100vh - 60px)] flex-1 w-full">
          <CanvasContainer />
        </main>
      </main>
    </SidebarProvider>
  );
};
