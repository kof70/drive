import React from "react";
import { CanvasContainer } from "../canvas/CanvasContainer";
import { SidebarProvider } from "../ui/sidebar";
import { Header } from "./Header";

export const WorkspaceLayout: React.FC = () => {
  return (
    <SidebarProvider>
      {/* Sidebar avec outils et utilisateurs connectés */}
      {/*<AppSidebar />*/}
      <main className="flex-1 w-full flex flex-col">
        {/* Zone canvas principale */}
        <main className="h-[calc(100vh - 60px)] flex-1 w-full">
          <CanvasContainer />
        </main>
      </main>
    </SidebarProvider>
  );
};
