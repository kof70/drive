import React from 'react';
import { WorkspaceLayout } from './components/layout/WorkspaceLayout';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { NotificationManager } from './components/ui/NotificationManager';

function App() {
  return (
    <WebSocketProvider>
      <WorkspaceLayout />
      <NotificationManager />
    </WebSocketProvider>
  );
}

export default App;