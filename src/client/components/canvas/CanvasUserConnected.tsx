import { createAvatar } from "@dicebear/core";
import * as React from "react";
import { dylan } from "@dicebear/collection";

import { useWebSocketContext } from "@/client/providers/WebSocketProvider";

interface CanvasUserConnectedProps {
  className?: string;
}

const UserConnectedAvatar: React.FC<{ id: string; className?: string }> = ({
  id,
}) => {
  const avatar = createAvatar(dylan, {
    seed: id,
  });

  const url = avatar.toDataUri();
  return (
    <img
      title={`user-${id}`}
      className="rounded-full ring-1 bg-secondary"
      src={url}
      width={40}
      height={40}
      alt="Avatar 01"
    />
  );
};

const CanvasUserConnected: React.FC<CanvasUserConnectedProps> = () => {
  const { connectedUsers } = useWebSocketContext();
  return (
    <div className="absolute top-4 right-4 bg-background rounded-full shadow-xl h-14 flex items-center gap-2  border p-3 ">
      <div className="flex -space-x-3">
        {connectedUsers.map((user) => (
          <UserConnectedAvatar key={user.id} id={user.id} />
        ))}
      </div>
    </div>
  );
};

export default CanvasUserConnected;
