// Types partagés entre le serveur et le client

export interface ServerConfig {
  port: number;
  host: string;
  storagePath: string;
  maxFileSize: number;
  enableMDNS: boolean;
}

export type CanvasElementType =
  | "file"
  | "note"
  | "folder"
  | "image"
  | "rectangleGroup";

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content:
    | string
    | FileReference
    | {
        name?: string;
        createdAt?: Date;
        elements?: string[];
      };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
  style: {
    backgroundColor?: string;
    borderColor?: string;
    fontSize?: number;
  };
}

export interface FileReference {
  filename: string;
  originalPath: string;
  storedPath: string;
  mimeType: string;
  size: number;
  checksum: string;
}

export interface ClipboardData {
  id: string;
  content: string;
  type: "text" | "html" | "image";
  timestamp: Date;
  deviceId: string;
}

export interface UserSession {
  id: string;
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  connectedAt: Date;
  cursor?: CursorPosition;
}

export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
}

export interface WebSocketEvents {
  "canvas-update": (data: CanvasElement) => void;
  "clipboard-sync": (content: ClipboardData) => void;
  "file-upload": (file: FileMetadata) => void;
  "user-cursor": (position: CursorPosition) => void;
  "user-connected": (session: UserSession) => void;
  "user-disconnected": (sessionId: string) => void;
}

export interface FileMetadata {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export enum ErrorCodes {
  NETWORK_DISCONNECTED = "NET_001",
  FILE_TOO_LARGE = "FILE_001",
  STORAGE_FULL = "STORAGE_001",
  SYNC_CONFLICT = "SYNC_001",
  PERMISSION_DENIED = "AUTH_001",
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCodes;
    message: string;
  };
}
