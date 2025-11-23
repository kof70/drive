import { WorkspaceLayout } from "./components/layout/WorkspaceLayout";
import { NotificationManager } from "./components/shared/NotificationManager";
import { WebSocketProvider } from "./providers/WebSocketProvider";

function App() {
  return (
    <WebSocketProvider>
      <WorkspaceLayout />
      <NotificationManager />
    </WebSocketProvider>
  );
}

export default App;
