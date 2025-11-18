import { WorkspaceLayout } from "./components/layout/WorkspaceLayout";
import { WorkspaceLayout2 } from "./components/layout/WorkspaceLayout2";
import { NotificationManager } from "./components/shared/NotificationManager";
import { WebSocketProvider } from "./providers/WebSocketProvider";

function App() {
  // return (
  //   <WebSocketProvider>
  //     <WorkspaceLayout />
  //     <NotificationManager />
  //   </WebSocketProvider>
  // );
  return (
    <WebSocketProvider>
      <WorkspaceLayout2 />
      <NotificationManager />
    </WebSocketProvider>
  );
}

export default App;
